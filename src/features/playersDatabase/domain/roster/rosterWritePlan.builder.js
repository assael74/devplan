// src/features/playersDatabase/domain/roster/rosterWritePlan.builder.js

import {
  buildPlayerId,
  buildPlayerSearchIndexDocumentId,
  buildPlayerSeasonDocumentId,
  buildTeamId,
  buildTeamSeasonDocumentId,
  requireSeasonId,
} from '../identity/index.js'
import {
  buildCenterTeamStateProjection,
  buildClubsCenterTeamProjection,
} from '../league/index.js'
import { resolveMovementDirection } from '../movement/index.js'
import { arrivalSourceDocumentId, buildArrivalHistory } from '../movement/arrivalHistory.projection.js'
import { normalizePlayerNameValue } from '../../model/player/playerIdentity.model.js'
import { createEmptyTeamNotes, hasTeamNoteData } from '../../model/team/teamNotes.model.js'
import { previousRosterSeasonRef } from './rosterHistory.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()
const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {}
const map = value => object(value)
const list = value => Array.isArray(value) ? value : []
const unique = values => Array.from(new Set(values.map(clean).filter(Boolean)))
const numberOrNull = value => {
  if (value === null || value === undefined || value === '') return null
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : null
}

const ROSTER_MODES = new Set(['AUTHORITATIVE_SNAPSHOT', 'PATCH'])
const ROSTER_STATUSES = new Set(['regular', 'left', 'youngerAgeGroup'])

const resolveExternalTeamId = ({ team = {}, competitionSnapshot = {} } = {}) => {
  const explicitId = clean(team.externalTeamId)
  if (explicitId) return explicitId

  const teamUrl = clean(team.teamUrl || competitionSnapshot.teamUrl)
  const match = teamUrl.match(/[?&]team_id=([^&#]+)/i)
  return match ? clean(match[1]) : ''
}

const requireLeague = ({ league, leagueId, seasonId, teamId }) => {
  const source = object(league)
  if (clean(source.leagueId) !== leagueId) throw new Error('Canonical League identity mismatch')
  const season = object(map(source.seasonsById)[seasonId])
  if (!Object.keys(season).length) throw new Error('Canonical League season was not found')
  const teamRow = object(map(season.table && season.table.teamsById)[teamId])
  if (!Object.keys(teamRow).length) throw new Error('Team row was not found in canonical League season')
  return { season, teamRow }
}

const resolvePlayer = ({ player, birthYear, updatedAt, ignoreNumShirt = false }) => {
  const source = object(player)
  const externalPlayerId = clean(source.externalPlayerId)
  const expectedPlayerId = buildPlayerId({ birthYear, externalPlayerId })
  const playerId = clean(source.playerId) || expectedPlayerId
  if (playerId !== expectedPlayerId) throw new Error('Roster player identity mismatch')

  const rosterStatus = clean(source.rosterStatus) || 'regular'
  if (!ROSTER_STATUSES.has(rosterStatus)) throw new Error('Invalid rosterStatus')

  const fullName = clean(source.fullName || source.displayName || source.name)

  return {
    playerId,
    externalPlayerId,
    identityKey: clean(source.identityKey) || `external:${externalPlayerId}`,
    fullName,
    normalizedName: normalizePlayerNameValue(source.normalizedName || fullName),
    aliases: unique(list(source.aliases)),
    rosterStatus,
    isYoungerAgeGroup: Boolean(source.isYoungerAgeGroup || rosterStatus === 'youngerAgeGroup'),
    isOlderAgeGroup: Boolean(source.isOlderAgeGroup),
    numShirt: ignoreNumShirt || source.numShirt === null || source.numShirt === undefined || source.numShirt === ''
      ? null
      : Number.isFinite(Number(source.numShirt)) ? Number(source.numShirt) : null,
    updatedAt: source.updatedAt || updatedAt || null,
  }
}

const resolvePlayers = ({ players, birthYear, existingPlayersById, mode, updatedAt }) => {
  const incoming = {}
  list(players).forEach(player => {
    const resolved = resolvePlayer({ player, birthYear, updatedAt, ignoreNumShirt: true })
    if (incoming[resolved.playerId]) throw new Error(`Duplicate roster player ${resolved.playerId}`)
    incoming[resolved.playerId] = resolved
  })

  if (mode === 'AUTHORITATIVE_SNAPSHOT') return incoming

  return {
    ...map(existingPlayersById),
    ...incoming,
  }
}

const resolveRosterImport = value => {
  const source = object(value)
  const mode = clean(source.mode) || 'AUTHORITATIVE_SNAPSHOT'
  if (!ROSTER_MODES.has(mode)) throw new Error('Invalid roster import mode')
  const sourceSnapshotKey = clean(source.sourceSnapshotKey)
  if (!sourceSnapshotKey) throw new Error('Missing roster sourceSnapshotKey')
  const contentHash = clean(source.contentHash)
  if (!contentHash) throw new Error('Missing roster contentHash')
  return {
    mode,
    sourceSnapshotKey,
    contentHash,
    effectiveAt: source.effectiveAt || null,
  }
}

const requireMovementFact = ({ fact, direction, teamId, teamSeasonDocumentId, clubId, updatedAt }) => {
  const source = object(fact)
  const movementId = clean(source.movementId)
  const playerId = clean(source.playerId)
  if (!movementId || !playerId) throw new Error('Invalid movement fact')

  const fromTeamId = clean(source.fromTeamId)
  const toTeamId = clean(source.toTeamId)
  const fromTeamSeasonDocumentId = clean(source.fromTeamSeasonDocumentId)
  const toTeamSeasonDocumentId = clean(source.toTeamSeasonDocumentId)
  const fromClubId = clean(source.fromClubId)
  const toClubId = clean(source.toClubId)

  if (direction === 'in') {
    if (toTeamId !== teamId || toTeamSeasonDocumentId !== teamSeasonDocumentId || toClubId !== clubId) {
      throw new Error('Incoming movement target mismatch')
    }
  } else if (fromTeamId !== teamId || fromTeamSeasonDocumentId !== teamSeasonDocumentId || fromClubId !== clubId) {
    throw new Error('Outgoing movement source mismatch')
  }

  const scope = clean(source.scope)
  const levelDirection = clean(source.levelDirection)
  if (!['external', 'internal'].includes(scope)) throw new Error('Invalid movement scope')
  if (!['up', 'lateral', 'down', 'unknown'].includes(levelDirection)) {
    throw new Error('Invalid movement levelDirection')
  }

  return {
    movementId,
    playerId,
    fromTeamId,
    fromTeamSeasonDocumentId,
    fromClubId,
    toTeamId,
    toTeamSeasonDocumentId,
    toClubId,
    scope,
    levelDirection,
    timing: clean(source.timing),
    effectiveAt: source.effectiveAt || null,
    updatedAt: source.updatedAt || updatedAt || null,
  }
}

const resolvePending = ({ pendingById, identityPlayersById, updatedAt }) => {
  const result = {}
  Object.entries(map(pendingById)).forEach(([key, value]) => {
    const source = object(value)
    const playerId = clean(source.playerId || key)
    const identityPlayer = object(identityPlayersById[playerId])
    if (!playerId || !Object.keys(identityPlayer).length) {
      throw new Error('Pending roster entry requires a known canonical playerId')
    }
    result[playerId] = {
      playerId,
      externalPlayerId: clean(source.externalPlayerId || identityPlayer.externalPlayerId),
      identityKey: clean(source.identityKey || identityPlayer.identityKey),
      fullName: clean(source.fullName || identityPlayer.fullName),
      previousSeasonId: clean(source.previousSeasonId),
      previousTeamId: clean(source.previousTeamId),
      previousTeamSeasonDocumentId: clean(source.previousTeamSeasonDocumentId),
      identitySnapshot: object(source.identitySnapshot),
      updatedAt: source.updatedAt || updatedAt || null,
    }
  })
  return result
}

const resolveMovement = ({
  movement,
  existingMovement,
  mode,
  teamId,
  teamSeasonDocumentId,
  clubId,
  identityPlayersById,
  updatedAt,
}) => {
  const source = object(movement)
  const current = object(existingMovement)
  const preservePending = mode === 'PATCH'
  const transfersInById = { ...map(current.transfersInById) }
  const transfersOutById = { ...map(current.transfersOutById) }
  const arrivalHistoryById = {
    ...map(current.arrivalHistoryById),
    ...map(source.arrivalHistoryById),
  }

  Object.entries(map(source.transfersInById)).forEach(([key, fact]) => {
    const resolved = requireMovementFact({ fact, direction: 'in', teamId, teamSeasonDocumentId, clubId, updatedAt })
    if (key && key !== resolved.movementId) throw new Error('Movement map key mismatch')
    if (!identityPlayersById[resolved.playerId]) throw new Error('Movement fact requires a known canonical playerId')
    if (transfersInById[resolved.movementId] && !sameMovementFact(transfersInById[resolved.movementId], resolved)) {
      throw new Error('Conflicting canonical incoming Movement fact')
    }
    transfersInById[resolved.movementId] = resolved
  })
  Object.entries(map(source.transfersOutById)).forEach(([key, fact]) => {
    const resolved = requireMovementFact({ fact, direction: 'out', teamId, teamSeasonDocumentId, clubId, updatedAt })
    if (key && key !== resolved.movementId) throw new Error('Movement map key mismatch')
    if (!identityPlayersById[resolved.playerId]) throw new Error('Movement fact requires a known canonical playerId')
    if (transfersOutById[resolved.movementId] && !sameMovementFact(transfersOutById[resolved.movementId], resolved)) {
      throw new Error('Conflicting outgoing Movement counterpart fact')
    }
    transfersOutById[resolved.movementId] = resolved
  })

  const pendingById = {
    ...(preservePending ? map(current.pendingById) : {}),
    ...resolvePending({ pendingById: source.pendingById, identityPlayersById, updatedAt }),
  }

  return {
    transfersInById,
    transfersOutById,
    arrivalHistoryById,
    pendingById,
    updatedAt: updatedAt || source.updatedAt || null,
  }
}

const requireRemovedPlayerResolutions = ({ removedPlayerIds, movement }) => {
  removedPlayerIds.forEach(playerId => {
    if (movement.pendingById[playerId]) return
    if (Object.values(map(movement.transfersOutById)).some(fact => clean(fact && fact.playerId) === playerId)) return
    const error = new Error(`Removed roster player ${playerId} requires an explicit pending or retained left decision`)
    error.code = 'ROSTER_REMOVED_PLAYER_DECISION_REQUIRED'
    error.playerId = playerId
    throw error
  })
}

const emptyStats = () => ({
  playersById: {},
  teamBalance: {},
  statsLoadState: { status: 'missing', updatedAt: null, teamGamePlayedAtLoad: null },
  updatedAt: null,
})

const emptyScouting = () => ({ playersById: {}, scoutProfilesSummary: {}, updatedAt: null })
const emptyManual = () => ({ playersById: {}, updatedAt: null })

const buildRosterManual = ({ players, birthYear, playersById, existingManual, updatedAt }) => {
  const current = object(existingManual)
  const currentPlayersById = map(current.playersById)
  const incomingUrlsById = {}

  list(players).forEach(player => {
    const source = object(player)
    const playerId = clean(source.playerId) || buildPlayerId({
      birthYear,
      externalPlayerId: clean(source.externalPlayerId),
    })
    incomingUrlsById[playerId] = clean(source.playerUrl)
  })

  let changed = Object.keys(currentPlayersById)
    .some(playerId => !playersById[playerId])
  const manualPlayersById = {}

  Object.keys(playersById).forEach(playerId => {
    const existingPlayer = object(currentPlayersById[playerId])
    const incomingPlayerUrl = clean(incomingUrlsById[playerId])
    const existingPlayerUrl = clean(existingPlayer.playerUrl)

    if (!incomingPlayerUrl) {
      if (Object.keys(existingPlayer).length) manualPlayersById[playerId] = existingPlayer
      return
    }

    if (incomingPlayerUrl === existingPlayerUrl) {
      manualPlayersById[playerId] = existingPlayer
      return
    }

    changed = true
    manualPlayersById[playerId] = {
      ...existingPlayer,
      playerUrl: incomingPlayerUrl,
      goalDistribution: object(existingPlayer.goalDistribution),
      updatedAt: updatedAt || null,
    }
  })

  return {
    playersById: manualPlayersById,
    updatedAt: changed ? updatedAt || null : current.updatedAt || null,
  }
}

const buildCompetitionSnapshot = ({ teamRow, clubProfile, updatedAt }) => ({
  teamUrl: clean(teamRow.teamUrl),
  clubLevel: clubProfile.clubLevel === null || clubProfile.clubLevel === undefined ? null : Number(clubProfile.clubLevel),
  clubStrengthLevel: clubProfile.clubStrengthLevel === null || clubProfile.clubStrengthLevel === undefined
    ? null
    : Number(clubProfile.clubStrengthLevel),
  officialTable: {
    rank: teamRow.officialTable && teamRow.officialTable.rank !== undefined ? teamRow.officialTable.rank : null,
    points: teamRow.officialTable && teamRow.officialTable.points !== undefined ? teamRow.officialTable.points : null,
    goalsFor: teamRow.officialTable && teamRow.officialTable.goalsFor !== undefined ? teamRow.officialTable.goalsFor : null,
    goalsAgainst: teamRow.officialTable && teamRow.officialTable.goalsAgainst !== undefined ? teamRow.officialTable.goalsAgainst : null,
    teamGamePlayed: teamRow.officialTable && teamRow.officialTable.teamGamePlayed !== undefined
      ? teamRow.officialTable.teamGamePlayed
      : null,
  },
  updatedAt: updatedAt || null,
})

export const buildTeamRoot = ({ team, season, leagueId, existingTeamRoot, teamId, teamSeasonDocumentId, createdAt, updatedAt }) => {
  const current = object(existingTeamRoot)
  const currentIdentity = object(current.identity)
  if (Object.keys(current).length) {
    if (
      clean(currentIdentity.teamId || current.id) !== teamId ||
      clean(currentIdentity.clubId) !== clean(team.clubId) ||
      Number(currentIdentity.birthYear) !== Number(team.birthYear) ||
      Number(currentIdentity.teamSlot) !== Number(team.teamSlot)
    ) {
      throw new Error('Existing Team Root identity mismatch')
    }
  }
  const seasonRefsById = {
    ...map(current.seasonRefsById),
    [season.seasonId]: {
      seasonKey: season.seasonKey,
      teamSeasonDocumentId,
      leagueId,
      ageGroupId: clean(season.ageGroupId),
      seasonStatus: clean(season.seasonStatus),
    },
  }
  return {
    identity: {
      teamId,
      clubId: clean(team.clubId),
      birthYear: Number(team.birthYear),
      teamSlot: Number(team.teamSlot),
    },
    notes: current.notes === undefined ? createEmptyTeamNotes() : current.notes,
    seasonRefsById,
    timestamps: {
      createdAt: current.timestamps && current.timestamps.createdAt
        ? current.timestamps.createdAt
        : createdAt || updatedAt || null,
      updatedAt: updatedAt || null,
    },
  }
}

const buildTeamSeason = ({
  team,
  season,
  leagueId,
  teamId,
  teamSeasonDocumentId,
  existingTeamSeason,
  playersById,
  rosterImport,
  movement,
  manual,
  competitionSnapshot,
  createdAt,
  updatedAt,
}) => {
  const current = object(existingTeamSeason)
  const identity = {
    teamSeasonDocumentId,
    teamId,
    seasonId: season.seasonId,
    seasonKey: season.seasonKey,
    seasonStatus: clean(season.seasonStatus),
    clubId: clean(team.clubId),
    birthYear: Number(team.birthYear),
    teamSlot: Number(team.teamSlot),
    externalTeamId: resolveExternalTeamId({ team, competitionSnapshot }),
    leagueId,
    ageGroupId: clean(season.ageGroupId),
  }
  if (current.identity && Object.keys(object(current.identity)).length) {
    const currentIdentity = object(current.identity)
    if (
      clean(currentIdentity.teamSeasonDocumentId) !== teamSeasonDocumentId ||
      clean(currentIdentity.teamId) !== teamId ||
      clean(currentIdentity.seasonId) !== clean(season.seasonId) ||
      clean(currentIdentity.clubId) !== clean(team.clubId) ||
      clean(currentIdentity.leagueId) !== leagueId
    ) {
      throw new Error('Existing Team Season identity mismatch')
    }
  }

  return {
    identity,
    competitionSnapshot: Object.keys(object(current.competitionSnapshot)).length
      ? current.competitionSnapshot
      : competitionSnapshot,
    roster: {
      playersById,
      pendingById: movement.pendingById,
      rosterImport,
      updatedAt: updatedAt || null,
    },
    stats: Object.keys(object(current.stats)).length ? current.stats : emptyStats(),
    movement: {
      transfersInById: movement.transfersInById,
      transfersOutById: movement.transfersOutById,
      arrivalHistoryById: movement.arrivalHistoryById,
      updatedAt: updatedAt || movement.updatedAt || null,
    },
    scouting: Object.keys(object(current.scouting)).length ? current.scouting : emptyScouting(),
    manual: Object.keys(object(manual)).length ? manual : emptyManual(),
    timestamps: {
      createdAt: current.timestamps && current.timestamps.createdAt
        ? current.timestamps.createdAt
        : createdAt || updatedAt || null,
      updatedAt: updatedAt || null,
    },
  }
}

const playerTeamContext = ({ teamSeason, playerId, updatedAt }) => {
  const rosterPlayer = object(teamSeason.roster.playersById[playerId])
  const statsPlayer = object(teamSeason.stats && teamSeason.stats.playersById && teamSeason.stats.playersById[playerId])
  const scoutPlayer = object(teamSeason.scouting && teamSeason.scouting.playersById && teamSeason.scouting.playersById[playerId])
  const manualPlayer = object(teamSeason.manual && teamSeason.manual.playersById && teamSeason.manual.playersById[playerId])
  const scoutingProjection = { ...scoutPlayer }
  delete scoutingProjection.primaryPosition
  delete scoutingProjection.positionLayer
  const movementsById = {}
  Object.values(map(teamSeason.movement && teamSeason.movement.transfersInById)).forEach(fact => {
    if (clean(fact.playerId) !== playerId) return
    movementsById[fact.movementId] = { ...fact, direction: 'in' }
    delete movementsById[fact.movementId].playerId
  })
  Object.values(map(teamSeason.movement && teamSeason.movement.transfersOutById)).forEach(fact => {
    if (clean(fact.playerId) !== playerId) return
    movementsById[fact.movementId] = { ...fact, direction: 'out' }
    delete movementsById[fact.movementId].playerId
  })

  return {
    teamSeasonDocumentId: teamSeason.identity.teamSeasonDocumentId,
    clubId: teamSeason.identity.clubId,
    leagueId: teamSeason.identity.leagueId,
    ageGroupId: teamSeason.identity.ageGroupId,
    teamSlot: teamSeason.identity.teamSlot,
    roster: {
      rosterStatus: rosterPlayer.rosterStatus,
      isYoungerAgeGroup: Boolean(rosterPlayer.isYoungerAgeGroup),
      isOlderAgeGroup: Boolean(rosterPlayer.isOlderAgeGroup),
      numShirt: rosterPlayer.numShirt === undefined ? null : rosterPlayer.numShirt,
    },
    stats: {
      statsStatus: clean(statsPlayer.statsStatus),
      playerStats: object(statsPlayer.playerStats),
      lineClassification: object(statsPlayer.lineClassification),
    },
    scouting: scoutingProjection,
    manual: {
      playerUrl: clean(manualPlayer.playerUrl),
      goalDistribution: object(manualPlayer.goalDistribution),
    },
    movementsById,
    updatedAt: updatedAt || null,
  }
}

const buildPlayerSeasonWrites = ({ teamSeason, existingPlayerSeasonsById, removedPlayerIds = [], updatedAt }) => {
  const currentWrites = Object.keys(teamSeason.roster.playersById).map(playerId => {
    const documentId = buildPlayerSeasonDocumentId({ playerId, seasonId: teamSeason.identity.seasonId })
    const current = object(map(existingPlayerSeasonsById)[playerId])
    const currentIdentity = object(current.identity)
    if (currentIdentity.playerId && clean(currentIdentity.playerId) !== playerId) {
      throw new Error('Existing Player Season identity mismatch')
    }
    return {
      playerId,
      teamId: teamSeason.identity.teamId,
      documentId,
      operation: 'UPSERT_TEAM',
      exists: Object.keys(current).length > 0,
      document: {
        identity: {
          playerSeasonDocumentId: documentId,
          playerId,
          seasonId: teamSeason.identity.seasonId,
          seasonKey: teamSeason.identity.seasonKey,
          seasonStatus: teamSeason.identity.seasonStatus,
        },
        teamsById: {
          ...map(current.teamsById),
          [teamSeason.identity.teamId]: playerTeamContext({ teamSeason, playerId, updatedAt }),
        },
        timestamps: {
          createdAt: current.timestamps && current.timestamps.createdAt ? current.timestamps.createdAt : updatedAt || null,
          updatedAt: updatedAt || null,
        },
      },
    }
  })

  const removalWrites = removedPlayerIds.flatMap(playerId => {
    const current = object(map(existingPlayerSeasonsById)[playerId])
    if (!Object.keys(current).length) return []
    const teamsById = { ...map(current.teamsById) }
    delete teamsById[teamSeason.identity.teamId]
    const documentId = buildPlayerSeasonDocumentId({ playerId, seasonId: teamSeason.identity.seasonId })
    if (!Object.keys(teamsById).length) {
      return [{ playerId, documentId, operation: 'DELETE', document: null }]
    }
    return [{
      playerId,
      teamId: teamSeason.identity.teamId,
      documentId,
      operation: 'REMOVE_TEAM',
      document: null,
      updatedAt: updatedAt || null,
    }]
  })

  return [...currentWrites, ...removalWrites]
}

const buildSearchIndexDocument = ({ player, playerRoot, playerSeasonDocumentId, teamSeason, league, season, teamRow, updatedAt }) => {
  const playerId = player.playerId
  const scout = object(teamSeason.scouting && teamSeason.scouting.playersById && teamSeason.scouting.playersById[playerId])
  const stats = object(teamSeason.stats && teamSeason.stats.playersById && teamSeason.stats.playersById[playerId])
  const manual = object(teamSeason.manual && teamSeason.manual.playersById && teamSeason.manual.playersById[playerId])
  const root = object(playerRoot)
  const primary = object(scout.primary)
  const secondary = object(scout.secondary)
  const evidence = object(scout.evidence)
  const profileIds = unique([
    ...list(scout.professionalProfileIds),
    ...list(scout.preliminaryProfileIds),
    primary.profileId,
    secondary.profileId,
  ])
  const combinations = unique(list(scout.combinationIds))

  return {
    seasonId: teamSeason.identity.seasonId,
    birthYear: teamSeason.identity.birthYear,
    leagueId: teamSeason.identity.leagueId,
    leagueLevel: league.level === undefined ? null : league.level,
    playerId,
    expectedLevelDelta: null,
    scoutEffectiveImmediacyStatus: clean(scout.scoutEffectiveImmediacyStatus),
    scoutProfileIds: profileIds,
    scoutCombinationIds: combinations,
    scoutProfileSearchIds: unique([...profileIds, ...combinations]),
    references: {
      playerSeasonDocumentId,
      teamSeasonDocumentId: teamSeason.identity.teamSeasonDocumentId,
    },
    identity: {
      externalPlayerId: player.externalPlayerId,
      displayName: player.fullName,
      normalizedDisplayName: player.normalizedName,
      aliases: player.aliases,
    },
    season: {
      seasonKey: teamSeason.identity.seasonKey,
      seasonStatus: teamSeason.identity.seasonStatus,
    },
    team: {
      teamId: teamSeason.identity.teamId,
      clubId: teamSeason.identity.clubId,
      clubLevel: teamSeason.competitionSnapshot.clubLevel,
      clubStrengthLevel: teamSeason.competitionSnapshot.clubStrengthLevel,
      teamSlot: teamSeason.identity.teamSlot,
      ageGroupId: teamSeason.identity.ageGroupId,
      ageGroupLabel: clean(league.ageGroupLabel),
      region: clean(league.region),
    },
    player: {
      playerUrl: clean(manual.playerUrl),
      primaryPosition: clean(root.primaryPosition),
      positionLayer: clean(root.positionLayer),
      numShirt: player.numShirt === null || player.numShirt === undefined ? '' : String(player.numShirt),
      rosterStatus: player.rosterStatus,
      statsStatus: clean(stats.statsStatus),
      isYoungerAgeGroup: Boolean(player.isYoungerAgeGroup),
      isOlderAgeGroup: Boolean(player.isOlderAgeGroup),
      notes: clean(root.notes),
    },
    stats: {
      actual: {
        games: numberOrNull(stats.playerStats && stats.playerStats.games),
        goals: numberOrNull(stats.playerStats && stats.playerStats.goals),
        yellowCards: numberOrNull(stats.playerStats && stats.playerStats.yellowCards),
        minutes: numberOrNull(stats.playerStats && stats.playerStats.minutes),
        starts: numberOrNull(stats.playerStats && stats.playerStats.starts),
        substituteIn: numberOrNull(stats.playerStats && stats.playerStats.substituteIn),
        substitutedOut: numberOrNull(stats.playerStats && stats.playerStats.substitutedOut),
      },
      projected: {
        games: numberOrNull(evidence.projected && evidence.projected.games),
        goals: numberOrNull(evidence.projected && evidence.projected.goals),
        minutes: numberOrNull(evidence.projected && evidence.projected.minutes),
        starts: numberOrNull(evidence.projected && evidence.projected.starts),
      },
    },
    scout: {
      primary: {
        profileId: clean(primary.profileId),
        strengthDepthPct: primary.strengthDepthPct === undefined ? null : primary.strengthDepthPct,
        score: primary.score === undefined ? null : primary.score,
        reliabilityLevel: clean(primary.reliabilityLevel),
        warnings: list(primary.warnings),
      },
      secondary: {
        profileId: clean(secondary.profileId),
        strengthDepthPct: secondary.strengthDepthPct === undefined ? null : secondary.strengthDepthPct,
        score: secondary.score === undefined ? null : secondary.score,
        reliabilityLevel: clean(secondary.reliabilityLevel),
        warnings: list(secondary.warnings),
      },
      playerInterestLevel: clean(scout.scoutPlayerInterestLevel),
    },
    scoutEvidence: {
      ...evidence,
      profileResult: {
        primaryProfileId: clean(primary.profileId),
        secondaryProfileId: clean(secondary.profileId),
        profileIds,
        combinationIds: combinations,
      },
      primary: {
        teamGateMode: clean(primary.teamGateMode),
      },
    },
    updatedAt: updatedAt || null,
  }
}

const buildSearchIndexWrites = ({ teamSeason, playerRootsById, league, season, teamRow, updatedAt }) => Object.values(teamSeason.roster.playersById).map(player => {
  const playerSeasonDocumentId = buildPlayerSeasonDocumentId({
    playerId: player.playerId,
    seasonId: teamSeason.identity.seasonId,
  })
  return {
    playerId: player.playerId,
    documentId: buildPlayerSearchIndexDocumentId({
      playerId: player.playerId,
      teamSeasonDocumentId: teamSeason.identity.teamSeasonDocumentId,
    }),
    operation: 'SET',
    document: buildSearchIndexDocument({
      player,
      playerRoot: map(playerRootsById)[player.playerId],
      playerSeasonDocumentId,
      teamSeason,
      league,
      season,
      teamRow,
      updatedAt,
    }),
  }
})

const buildLeagueProjection = ({
  leagueId,
  seasonId,
  teamId,
  playersById,
  loadedAt,
  updatedAt,
}) => ({
  leagueId,
  seasonId,
  teamId,
  roster: {
    playersCount: Object.values(playersById).filter(player => player.rosterStatus === 'regular').length,
    hasPlayers: Object.values(playersById).some(player => player.rosterStatus === 'regular'),
    loadedAt: loadedAt || null,
  },
  updatedAt: updatedAt || null,
})

const buildLeaguesCenterProjection = ({
  league,
  season,
  teamId,
  teamRow,
  teamSeason,
  previousTeamProjection,
  updatedAt,
}) => ({
  writeRequired: true,
  leagueId: league.leagueId,
  seasonId: teamSeason.identity.seasonId,
  teamId,
  team: {
    clubId: teamSeason.identity.clubId,
    teamSlot: teamSeason.identity.teamSlot,
    showInvestigationIndicator: typeof teamRow?.showInvestigationIndicator === 'boolean'
      ? teamRow.showInvestigationIndicator
      : previousTeamProjection?.showInvestigationIndicator === true,
    ...buildCenterTeamStateProjection({
      teamSeason,
      seasonStatus: season.seasonStatus,
      previousTeamProjection,
    }),
  },
  updatedAt: updatedAt || null,
})

const buildClubsCenterProjection = ({ league, season, teamId, teamRow, teamSeason, clubProfile, previousTeamProjection, updatedAt }) => ({
  writeRequired: true,
  seasonId: teamSeason.identity.seasonId,
  seasonKey: clean(season.seasonKey),
  leagueId: league.leagueId,
  leagueOperation: 'UPSERT',
  league: {
    displayName: clean(league.names && (league.names.display || league.names.official || league.names.short || league.names.source)),
    ageGroupLabel: clean(league.ageGroupLabel),
    leagueLevel: league.level === undefined ? null : league.level,
    seasonStatus: clean(season.seasonStatus),
    tableImportedAt: season.tableImportedAt || null,
  },
  clubWrites: [{
    clubId: teamSeason.identity.clubId,
    clubProfile: {
      displayName: clean(clubProfile.names && clubProfile.names.display),
      shortName: clean(clubProfile.names && clubProfile.names.short),
      clubLevel: clubProfile.clubLevel === undefined ? null : clubProfile.clubLevel,
      clubStrengthLevel: clubProfile.clubStrengthLevel === undefined ? null : clubProfile.clubStrengthLevel,
    },
    upsertTeamsById: {
      [teamId]: buildClubsCenterTeamProjection({
        league,
        season,
        seasonId: teamSeason.identity.seasonId,
        teamId,
        teamRow,
        teamSeason,
        previousTeamProjection,
        updatedAt,
      }),
    },
    deleteTeamIds: [],
  }],
  updatedAt: updatedAt || null,
})

const buildCounterpartClubsCenterProjections = ({
  counterparts,
  existingCounterpartTeamSeasonsById,
  counterpartProjectionSourcesByDocumentId,
  seasonId,
  updatedAt,
}) => list(counterparts).map(counterpart => {
  const documentId = clean(counterpart && counterpart.documentId)
  const existingTeamSeason = object(map(existingCounterpartTeamSeasonsById)[documentId])
  const identity = object(existingTeamSeason.identity)
  const sources = object(map(counterpartProjectionSourcesByDocumentId)[documentId])
  const league = object(sources.league)
  const season = object(sources.season)
  const teamRow = object(sources.teamRow)
  const clubProfile = object(sources.clubProfile)
  const teamId = clean(identity.teamId)

  if (
    !documentId
    || !teamId
    || clean(identity.teamSeasonDocumentId) !== documentId
    || clean(identity.seasonId) !== seasonId
    || clean(league.leagueId) !== clean(identity.leagueId)
    || clean(clubProfile.clubId) !== clean(identity.clubId)
    || !Object.keys(season).length
    || !Object.keys(teamRow).length
  ) {
    throw new Error('Invalid canonical source for counterpart ClubsCenter projection')
  }

  return buildClubsCenterProjection({
    league,
    season,
    teamId,
    teamRow,
    teamSeason: {
      ...existingTeamSeason,
      movement: counterpart.movement,
    },
    clubProfile,
    previousTeamProjection: sources.previousTeamProjection || null,
    updatedAt,
  })
})

const MOVEMENT_FACT_FIELDS = Object.freeze([
  'movementId',
  'playerId',
  'fromTeamId',
  'fromTeamSeasonDocumentId',
  'fromClubId',
  'toTeamId',
  'toTeamSeasonDocumentId',
  'toClubId',
  'scope',
  'levelDirection',
  'timing',
  'effectiveAt',
])

const sameMovementFact = (left, right) => MOVEMENT_FACT_FIELDS.every(field => {
  const leftValue = left && left[field]
  const rightValue = right && right[field]
  if (field === 'effectiveAt') return JSON.stringify(leftValue || null) === JSON.stringify(rightValue || null)
  return clean(leftValue) === clean(rightValue)
})

const resolveApprovedCounterpartFact = ({ request, movement, documentId }) => {
  const source = object(request)
  const requestedFact = object(source.fact)
  const movementId = clean(requestedFact.movementId)
  const side = clean(source.side)
  if (!movementId) throw new Error('Missing counterpart movement id')

  let approvedFact = null
  let expectedDocumentId = ''
  if (side === 'transfersOutById') {
    approvedFact = object(movement.transfersInById)[movementId]
    expectedDocumentId = clean(approvedFact && approvedFact.fromTeamSeasonDocumentId)
  } else if (side === 'transfersInById') {
    approvedFact = object(movement.transfersOutById)[movementId]
    expectedDocumentId = clean(approvedFact && approvedFact.toTeamSeasonDocumentId)
  } else {
    throw new Error('Invalid counterpart movement side')
  }

  if (!approvedFact || expectedDocumentId !== documentId || !sameMovementFact(approvedFact, requestedFact)) {
    throw new Error('Counterpart movement does not match approved local Movement state')
  }
  return { approvedFact, movementId, side }
}

const buildCounterpartWrites = ({
  counterpartRequests,
  existingCounterpartTeamSeasonsById,
  movement,
  updatedAt,
}) => {
  const writesByDocumentId = new Map()

  list(counterpartRequests).forEach(request => {
    const source = object(request)
    const documentId = clean(source.teamSeasonDocumentId)
    if (!documentId) throw new Error('Missing counterpart Team Season id')
    const { approvedFact, movementId, side } = resolveApprovedCounterpartFact({
      request,
      movement,
      documentId,
    })
    const existing = object(map(existingCounterpartTeamSeasonsById)[documentId])
    if (!Object.keys(existing).length) return
    const existingIdentity = object(existing.identity)
    if (clean(existingIdentity.teamSeasonDocumentId) !== documentId) {
      throw new Error('Counterpart Team Season identity mismatch')
    }

    if (!writesByDocumentId.has(documentId)) {
      writesByDocumentId.set(documentId, {
        documentId,
        movement: {
          ...object(existing.movement),
          transfersInById: { ...map(existing.movement && existing.movement.transfersInById) },
          transfersOutById: { ...map(existing.movement && existing.movement.transfersOutById) },
          updatedAt: updatedAt || null,
        },
      })
    }
    writesByDocumentId.get(documentId).movement[side][movementId] = approvedFact
    if (side === 'transfersInById' && source.history) {
      writesByDocumentId.get(documentId).movement.arrivalHistoryById = {
        ...map(writesByDocumentId.get(documentId).movement.arrivalHistoryById),
        [movementId]: source.history,
      }
    }
  })

  return [...writesByDocumentId.values()]
}

const buildCanonicalCounterpartRequests = ({
  teamSeason,
  movement,
  sourceHistoryTeamSeasonsById = {},
  updatedAt,
}) => {
  const currentDocumentId = clean(
    teamSeason && teamSeason.identity && teamSeason.identity.teamSeasonDocumentId
  )
  const identity = object(teamSeason && teamSeason.identity)
  const sourceDocumentId = arrivalSourceDocumentId({ teamId: identity.teamId, seasonId: identity.seasonId })
  const requests = []

  Object.values(map(movement && movement.transfersInById)).forEach(fact => {
    const documentId = clean(fact && fact.fromTeamSeasonDocumentId)
    if (!documentId || documentId === currentDocumentId) return
    requests.push({
      teamSeasonDocumentId: documentId,
      side: 'transfersOutById',
      fact,
    })
  })
  Object.values(map(movement && movement.transfersOutById)).forEach(fact => {
    const documentId = clean(fact && fact.toTeamSeasonDocumentId)
    if (!documentId || documentId === currentDocumentId) return
    requests.push({
      teamSeasonDocumentId: documentId,
      side: 'transfersInById',
      fact,
      history: buildArrivalHistory({
        movementId: fact.movementId,
        playerId: fact.playerId,
        fromTeamId: fact.fromTeamId,
        seasonId: identity.seasonId,
        sourceTeamSeason: map(sourceHistoryTeamSeasonsById)[sourceDocumentId],
        updatedAt,
      }),
    })
  })

  return requests
}


const buildDecisionMovementId = ({ playerId, fromTeamSeasonDocumentId, toTeamSeasonDocumentId }) => [
  'movement',
  clean(playerId),
  clean(fromTeamSeasonDocumentId),
  clean(toTeamSeasonDocumentId),
].filter(Boolean).join('__')

export const normalizeDecisionTeam = ({ value, seasonId }) => {
  const source = object(value)
  const teamId = clean(source.teamId || source.birthTeamDocumentId || source.birthTeamId)
  const clubId = clean(source.clubId)
  const teamSlot = Number(source.teamSlot || source.birthTeamSlot)
  const clubLevel = numberOrNull(source.clubLevel)
  if (!teamId || !clubId || !Number.isInteger(teamSlot) || teamSlot < 1) return null
  return {
    teamId,
    clubId,
    teamSlot,
    clubLevel,
    teamSeasonDocumentId: clean(source.teamSeasonDocumentId) || buildTeamSeasonDocumentId({ teamId, seasonId }),
  }
}

const buildParticipantMovementInput = ({
  participantDecisions,
  teamId,
  teamSeasonDocumentId,
  clubId,
  teamSlot,
  clubLevel,
  seasonId,
  sourceHistoryTeamSeasonsById,
  updatedAt,
}) => {
  const transfersInById = {}
  const transfersOutById = {}
  const arrivalHistoryById = {}
  const pendingById = {}
  const counterpartRequests = []

  list(participantDecisions).forEach(row => {
    const source = object(row)
    const playerId = clean(source.playerId)
    const decision = clean(source.decision || source.statsMovementDecision || source.rosterStatus)
    if (!playerId || !decision || decision === 'youngerAgeGroup') return
    if (decision === 'unknown') {
      pendingById[playerId] = {
        playerId,
        externalPlayerId: clean(source.externalPlayerId),
        identityKey: clean(source.identityKey),
        fullName: clean(source.fullName),
        previousSeasonId: clean(source.previousSeasonId),
        previousTeamId: clean(source.previousTeamId),
        previousTeamSeasonDocumentId: clean(source.previousTeamSeasonDocumentId),
        identitySnapshot: object(source.identitySnapshot),
        updatedAt: updatedAt || null,
      }
      return
    }
    if (!['joined', 'left'].includes(decision)) throw new Error('Invalid Roster participant Movement decision')

    const otherTeam = normalizeDecisionTeam({ value: source.team || source.statsMovementTeam, seasonId })
    if (!otherTeam) throw new Error(`יש לבחור קבוצת יעד תקינה לשחקן „${clean(source.fullName || source.name) || playerId}”`)
    const currentTeam = {
      teamId,
      teamSeasonDocumentId,
      clubId,
      teamSlot: Number(teamSlot),
      clubLevel: numberOrNull(clubLevel),
    }
    const fromTeam = decision === 'joined' ? otherTeam : currentTeam
    const toTeam = decision === 'joined' ? currentTeam : otherTeam
    const movementId = buildDecisionMovementId({
      playerId,
      fromTeamSeasonDocumentId: fromTeam.teamSeasonDocumentId,
      toTeamSeasonDocumentId: toTeam.teamSeasonDocumentId,
    })
    const fact = {
      movementId,
      playerId,
      fromTeamId: fromTeam.teamId,
      fromTeamSeasonDocumentId: fromTeam.teamSeasonDocumentId,
      fromClubId: fromTeam.clubId,
      toTeamId: toTeam.teamId,
      toTeamSeasonDocumentId: toTeam.teamSeasonDocumentId,
      toClubId: toTeam.clubId,
      scope: fromTeam.clubId === toTeam.clubId ? 'internal' : 'external',
      levelDirection: resolveMovementDirection({
        fromClubId: fromTeam.clubId,
        toClubId: toTeam.clubId,
        fromClubLevel: fromTeam.clubLevel,
        toClubLevel: toTeam.clubLevel,
        fromBirthTeamSlot: fromTeam.teamSlot,
        toBirthTeamSlot: toTeam.teamSlot,
      }),
      timing: 'UNKNOWN',
      effectiveAt: source.effectiveAt || null,
      updatedAt: updatedAt || null,
    }
    const sourceDocumentId = arrivalSourceDocumentId({ teamId: fromTeam.teamId, seasonId })
    const history = buildArrivalHistory({
      movementId,
      playerId,
      fromTeamId: fromTeam.teamId,
      seasonId,
      sourceTeamSeason: map(sourceHistoryTeamSeasonsById)[sourceDocumentId],
      updatedAt,
    })
    if (decision === 'joined') {
      transfersInById[movementId] = fact
      arrivalHistoryById[movementId] = history
      counterpartRequests.push({ teamSeasonDocumentId: fromTeam.teamSeasonDocumentId, side: 'transfersOutById', fact })
    } else {
      transfersOutById[movementId] = fact
      counterpartRequests.push({ teamSeasonDocumentId: toTeam.teamSeasonDocumentId, side: 'transfersInById', fact, history })
    }
  })

  return { movement: { transfersInById, transfersOutById, arrivalHistoryById, pendingById }, counterpartRequests }
}

export const buildRosterMovementPlan = ({
  movement = {},
  existingMovement = {},
  mode = 'AUTHORITATIVE_SNAPSHOT',
  teamId = '',
  teamSeasonDocumentId = '',
  clubId = '',
  playersById = {},
  existingPlayersById = {},
  previousPlayersById = {},
  removedPlayerIds = [],
  counterpartRequests = [],
  participantDecisions = [],
  seasonId = '',
  teamSlot = null,
  clubLevel = null,
  existingCounterpartTeamSeasonsById = {},
  sourceHistoryTeamSeasonsById = {},
  updatedAt = null,
} = {}) => {
  const identityPlayersById = {
    ...map(previousPlayersById),
    ...map(existingPlayersById),
    ...map(playersById),
  }
  const decisionInput = buildParticipantMovementInput({
    participantDecisions,
    teamId,
    teamSeasonDocumentId,
    clubId,
    teamSlot,
    clubLevel,
    seasonId,
    sourceHistoryTeamSeasonsById,
    updatedAt,
  })
  const requestedMovement = {
    transfersInById: { ...map(movement.transfersInById), ...map(decisionInput.movement.transfersInById) },
    transfersOutById: { ...map(movement.transfersOutById), ...map(decisionInput.movement.transfersOutById) },
    arrivalHistoryById: { ...map(movement.arrivalHistoryById), ...map(decisionInput.movement.arrivalHistoryById) },
    pendingById: { ...map(movement.pendingById), ...map(decisionInput.movement.pendingById) },
  }
  // Historical membership validates identity only; it never adds a current roster member.
  list(participantDecisions).forEach(row => {
    const id = clean(row.playerId)
    if (!id || !identityPlayersById[id]) {
      const error = new Error(`לא ניתן לאמת את השחקן „${clean(row.fullName || row.name) || id}” בסגל השמור. יש לבדוק את זהותו ולטעון את הסגל מחדש.`)
      error.code = 'ROSTER_MOVEMENT_PLAYER_NOT_FOUND'
      error.playerId = id
      throw error
    }
  })
  const approvedMovement = resolveMovement({
    movement: requestedMovement,
    existingMovement,
    mode,
    teamId,
    teamSeasonDocumentId,
    clubId,
    identityPlayersById,
    updatedAt,
  })
  requireRemovedPlayerResolutions({ removedPlayerIds, movement: approvedMovement })
  return {
    movement: approvedMovement,
    counterparts: buildCounterpartWrites({
      counterpartRequests: [...list(counterpartRequests), ...decisionInput.counterpartRequests],
      existingCounterpartTeamSeasonsById,
      movement: approvedMovement,
      updatedAt,
    }),
  }
}

export const buildRosterLoadWritePlan = ({
  team = {},
  season = {},
  league = {},
  clubProfile = {},
  players = [],
  rosterImport = {},
  movement = {},
  counterpartRequests = [],
  participantDecisions = [],
  existingTeamRoot = null,
  existingTeamSeason = null,
  previousTeamSeason = null,
  playerRootsById = {},
  existingPlayerSeasonsById = {},
  existingCounterpartTeamSeasonsById = {},
  sourceHistoryTeamSeasonsById = {},
  counterpartProjectionSourcesByDocumentId = {},
  previousLeaguesCenterTeamProjection = null,
  previousClubsCenterTeamProjection = null,
  createdAt = null,
  updatedAt = null,
} = {}) => {
  const seasonId = requireSeasonId(season.seasonId)
  if (clean(existingTeamSeason?.stats?.statsLoadState?.status) === 'loaded') {
    throw new Error('אי אפשר לטעון סגל מחדש לאחר טעינת סטטיסטיקה; יש לנקות סטטיסטיקה תחילה')
  }
  const clubId = clean(team.clubId)
  const birthYear = Number(team.birthYear || season.birthYear)
  const teamSlot = Number(team.teamSlot)
  const teamId = buildTeamId({ clubId, birthYear, teamSlot })
  const teamSeasonDocumentId = buildTeamSeasonDocumentId({ teamId, seasonId })
  const leagueId = clean(league.leagueId || season.leagueId)
  if (!leagueId) throw new Error('Missing League identity')
  if (clean(clubProfile.clubId) !== clubId) throw new Error('Missing or mismatched ClubProfile')
  const { season: canonicalSeason, teamRow } = requireLeague({ league, leagueId, seasonId, teamId })

  const resolvedRosterImport = {
    ...resolveRosterImport(rosterImport),
    loadedAt: updatedAt || null,
  }
  const existingPlayersById = object(existingTeamSeason && existingTeamSeason.roster && existingTeamSeason.roster.playersById)
  const previousPlayersById = {}
  if (previousTeamSeason) {
    const previousRef = previousRosterSeasonRef({ teamRoot: existingTeamRoot, seasonId })
    const identity = object(previousTeamSeason.identity)
    if (
      !previousRef ||
      identity.teamId !== teamId ||
      identity.seasonId !== previousRef.seasonId ||
      identity.teamSeasonDocumentId !== buildTeamSeasonDocumentId({ teamId, seasonId: previousRef.seasonId })
    ) {
      throw new Error('סגל העונה הקודמת אינו תואם לקבוצה שנבחרה')
    }
    Object.entries(map(previousTeamSeason.roster?.playersById)).forEach(([id, player]) => {
      if (!list(participantDecisions).some(row => clean(row.playerId) === id)) return
      let resolved
      try {
        resolved = resolvePlayer({ player, birthYear, updatedAt })
      } catch {
        throw new Error(`זהות השחקן „${clean(player.fullName || player.name) || id}” בסגל הקודם אינה תקינה`)
      }
      if (resolved.playerId !== id) throw new Error(`זהות השחקן „${resolved.fullName || id}” בסגל הקודם אינה תקינה`)
      previousPlayersById[id] = resolved
    })
  }
  const playersById = resolvePlayers({
    players,
    birthYear,
    existingPlayersById,
    mode: resolvedRosterImport.mode,
    updatedAt,
  })
  const removedPlayerIds = resolvedRosterImport.mode === 'AUTHORITATIVE_SNAPSHOT'
    ? Object.keys(existingPlayersById).filter(playerId => !playersById[playerId])
    : []
  const movementPlan = buildRosterMovementPlan({
    movement,
    existingMovement: existingTeamSeason && existingTeamSeason.movement,
    mode: resolvedRosterImport.mode,
    teamId,
    teamSeasonDocumentId,
    clubId,
    playersById,
    existingPlayersById,
    previousPlayersById,
    removedPlayerIds,
    counterpartRequests,
    participantDecisions,
    seasonId,
    teamSlot,
    clubLevel: clubProfile.clubLevel,
    existingCounterpartTeamSeasonsById,
    sourceHistoryTeamSeasonsById,
    updatedAt,
  })
  const manual = buildRosterManual({
    players,
    birthYear,
    playersById,
    existingManual: existingTeamSeason && existingTeamSeason.manual,
    updatedAt,
  })
  const competitionSnapshot = buildCompetitionSnapshot({ teamRow, clubProfile, updatedAt })
  const normalizedSeason = {
    ...canonicalSeason,
    seasonId,
    seasonKey: clean(canonicalSeason.seasonKey || season.seasonKey),
    seasonStatus: clean(canonicalSeason.seasonStatus || season.seasonStatus),
    ageGroupId: clean(league.ageGroupId || canonicalSeason.ageGroupId || season.ageGroupId),
  }
  const teamRoot = buildTeamRoot({
    team: { ...team, clubId, birthYear, teamSlot },
    season: normalizedSeason,
    leagueId,
    existingTeamRoot,
    teamId,
    teamSeasonDocumentId,
    createdAt,
    updatedAt,
  })
  const teamSeason = buildTeamSeason({
    team: { ...team, clubId, birthYear, teamSlot },
    season: normalizedSeason,
    leagueId,
    teamId,
    teamSeasonDocumentId,
    existingTeamSeason,
    playersById,
    rosterImport: resolvedRosterImport,
    movement: movementPlan.movement,
    manual,
    competitionSnapshot,
    createdAt,
    updatedAt,
  })
  const playerSeasons = buildPlayerSeasonWrites({
    teamSeason,
    existingPlayerSeasonsById,
    removedPlayerIds,
    updatedAt,
  })
  const playerSearchIndexes = buildSearchIndexWrites({
    teamSeason,
    playerRootsById,
    league,
    season: normalizedSeason,
    teamRow,
    updatedAt,
  })

  return {
    actionType: 'rosterLoad',
    teamId,
    teamSeasonDocumentId,
    leagueId,
    clubId,
    seasonId,
    canonical: {
      teamRootOperation: 'SET',
      teamRoot,
      teamSeasonOperation: 'SET',
      teamSeason,
    },
    counterparts: movementPlan.counterparts,
    counterpartClubsCenterProjections: buildCounterpartClubsCenterProjections({
      counterparts: movementPlan.counterparts,
      existingCounterpartTeamSeasonsById,
      counterpartProjectionSourcesByDocumentId,
      seasonId,
      updatedAt,
    }),
    playerSeasons,
    playerSearchIndexes: {
      upserts: playerSearchIndexes,
      deletes: removedPlayerIds.map(playerId => buildPlayerSearchIndexDocumentId({
        playerId,
        teamSeasonDocumentId,
      })),
    },
    leagueProjection: buildLeagueProjection({
      loadedAt: object(object(teamSeason.roster).rosterImport).loadedAt,
      leagueId,
      seasonId,
      teamId,
      playersById,
      updatedAt,
    }),
    leaguesCenterProjection: buildLeaguesCenterProjection({
      league,
      season: normalizedSeason,
      teamId,
      teamRow,
      teamSeason,
      previousTeamProjection: previousLeaguesCenterTeamProjection,
      updatedAt,
    }),
    clubsCenterProjection: buildClubsCenterProjection({
      league,
      season: normalizedSeason,
      teamId,
      teamRow,
      teamSeason,
      clubProfile,
      previousTeamProjection: previousClubsCenterTeamProjection,
      updatedAt,
    }),
  }
}

export const buildRosterProjectionRepairPlan = ({
  teamId,
  seasonId,
  leagueId,
  existingTeamSeason = null,
  league = null,
  clubProfile = null,
  playerRootsById = {},
  existingPlayerSeasonsById = {},
  existingPlayerSearchIndexes = [],
  existingCounterpartTeamSeasonsById = {},
  sourceHistoryTeamSeasonsById = {},
  counterpartProjectionSourcesByDocumentId = {},
  previousLeaguesCenterTeamProjection = null,
  previousClubsCenterTeamProjection = null,
  updatedAt = null,
} = {}) => {
  const resolvedSeasonId = requireSeasonId(seasonId)
  const resolvedTeamId = clean(teamId)
  const resolvedLeagueId = clean(leagueId)
  const teamSeason = object(existingTeamSeason)
  const identity = object(teamSeason.identity)

  if (!resolvedTeamId || !resolvedLeagueId || !Object.keys(teamSeason).length) {
    throw new Error('Canonical Team Season does not exist for Roster projection repair')
  }
  if (
    clean(identity.teamId) !== resolvedTeamId
    || clean(identity.seasonId) !== resolvedSeasonId
    || clean(identity.leagueId) !== resolvedLeagueId
  ) {
    throw new Error('Canonical Team Season identity does not match receipt target')
  }

  const canonicalLeague = object(league)
  const season = object(object(canonicalLeague.seasonsById)[resolvedSeasonId])
  const teamRow = object(object(season.table && season.table.teamsById)[resolvedTeamId])
  if (!Object.keys(season).length || !Object.keys(teamRow).length) {
    throw new Error('Canonical League team does not exist for Roster projection repair')
  }
  if (clean(clubProfile && clubProfile.clubId) !== clean(identity.clubId)) {
    throw new Error('Canonical ClubProfile does not match Roster receipt target')
  }

  const playersById = object(teamSeason.roster && teamSeason.roster.playersById)
  const movement = object(teamSeason.movement)
  const playerSeasons = buildPlayerSeasonWrites({
    teamSeason,
    existingPlayerSeasonsById,
    updatedAt,
  })
  const playerSearchIndexUpserts = buildSearchIndexWrites({
    teamSeason,
    playerRootsById,
    league: canonicalLeague,
    season,
    teamRow,
    updatedAt,
  })
  const expectedIndexIds = new Set(playerSearchIndexUpserts.map(row => row.documentId))
  const staleIndexIds = list(existingPlayerSearchIndexes)
    .map(row => clean(row && (row.id || row.documentId)))
    .filter(documentId => documentId && !expectedIndexIds.has(documentId))

  const counterparts = buildCounterpartWrites({
    counterpartRequests: buildCanonicalCounterpartRequests({
      teamSeason,
      movement,
      sourceHistoryTeamSeasonsById,
      updatedAt,
    }),
    existingCounterpartTeamSeasonsById,
    movement,
    updatedAt,
  })

  return {
    actionType: 'rosterLoad',
    teamId: resolvedTeamId,
    teamSeasonDocumentId: clean(identity.teamSeasonDocumentId),
    leagueId: resolvedLeagueId,
    clubId: clean(identity.clubId),
    seasonId: resolvedSeasonId,
    counterparts,
    counterpartClubsCenterProjections: buildCounterpartClubsCenterProjections({
      counterparts,
      existingCounterpartTeamSeasonsById,
      counterpartProjectionSourcesByDocumentId,
      seasonId: resolvedSeasonId,
      updatedAt,
    }),
    playerSeasons,
    playerSearchIndexes: {
      upserts: playerSearchIndexUpserts,
      deletes: staleIndexIds,
    },
    leagueProjection: buildLeagueProjection({
      loadedAt: object(object(teamSeason.roster).rosterImport).loadedAt,
      leagueId: resolvedLeagueId,
      seasonId: resolvedSeasonId,
      teamId: resolvedTeamId,
      playersById,
      updatedAt,
    }),
    leaguesCenterProjection: buildLeaguesCenterProjection({
      league: canonicalLeague,
      season,
      teamId: resolvedTeamId,
      teamRow,
      teamSeason,
      previousTeamProjection: previousLeaguesCenterTeamProjection,
      updatedAt,
    }),
    clubsCenterProjection: buildClubsCenterProjection({
      league: canonicalLeague,
      season,
      teamId: resolvedTeamId,
      teamRow,
      teamSeason,
      clubProfile,
      previousTeamProjection: previousClubsCenterTeamProjection,
      updatedAt,
    }),
  }
}

const statsAreAbsent = teamSeason => {
  const state = clean(teamSeason && teamSeason.stats && teamSeason.stats.statsLoadState && teamSeason.stats.statsLoadState.status)
  return !state || state === 'missing'
}

const buildClearedTeamRoot = ({ existingTeamRoot, seasonId, updatedAt }) => {
  const root = object(existingTeamRoot)
  if (!Object.keys(root).length) return { operation: 'NONE', document: null }
  const seasonRefsById = { ...map(root.seasonRefsById) }
  delete seasonRefsById[seasonId]
  const hasIndependentData = hasTeamNoteData(root.notes)
  if (!Object.keys(seasonRefsById).length && !hasIndependentData) {
    return { operation: 'DELETE', document: null }
  }
  return {
    operation: 'SET',
    document: {
      ...root,
      seasonRefsById,
      timestamps: {
        ...object(root.timestamps),
        updatedAt: updatedAt || null,
      },
    },
  }
}

const buildClearedPlayerSeasonWrites = ({ playerIds, existingPlayerSeasonsById, teamId, updatedAt }) => playerIds.flatMap(playerId => {
  const current = object(map(existingPlayerSeasonsById)[playerId])
  if (!Object.keys(current).length) return []
  const teamsById = { ...map(current.teamsById) }
  delete teamsById[teamId]
  if (!Object.keys(teamsById).length) {
    return [{
      playerId,
      documentId: clean(current.identity && current.identity.playerSeasonDocumentId) || clean(current.id),
      operation: 'DELETE',
      document: null,
    }]
  }
  return [{
    playerId,
    teamId,
    documentId: clean(current.identity && current.identity.playerSeasonDocumentId) || clean(current.id),
    operation: 'REMOVE_TEAM',
    document: null,
    updatedAt: updatedAt || null,
  }]
})

export const buildRosterClearWritePlan = ({
  teamId = '',
  seasonId = '',
  existingTeamRoot = null,
  existingTeamSeason = null,
  existingPlayerSeasonsById = {},
  existingPlayerSearchIndexes = [],
  league = {},
  clubProfile = {},
  previousLeaguesCenterTeamProjection = null,
  previousClubsCenterTeamProjection = null,
  updatedAt = null,
} = {}) => {
  const resolvedSeasonId = requireSeasonId(seasonId)
  const resolvedTeamId = clean(teamId)
  if (!resolvedTeamId) throw new Error('Missing teamId')
  const resolvedLeagueId = clean(league.leagueId || league.id)
  if (!resolvedLeagueId) throw new Error('Missing League identity')

  const teamSeasonIdentity = object(existingTeamSeason && existingTeamSeason.identity)
  if (Object.keys(teamSeasonIdentity).length && (
    clean(teamSeasonIdentity.teamSeasonDocumentId) !== buildTeamSeasonDocumentId({
      teamId: resolvedTeamId,
      seasonId: resolvedSeasonId,
    }) ||
    clean(teamSeasonIdentity.teamId) !== resolvedTeamId ||
    clean(teamSeasonIdentity.seasonId) !== resolvedSeasonId ||
    clean(teamSeasonIdentity.leagueId) !== resolvedLeagueId
  )) {
    throw new Error('Existing Team Season identity mismatch')
  }

  if (existingTeamSeason && !statsAreAbsent(existingTeamSeason)) {
    const error = new Error('יש למחוק תחילה את הסטטיסטיקה.')
    error.code = 'ROSTER_CLEAR_STATS_PRESENT'
    throw error
  }

  const existingMovement = object(existingTeamSeason && existingTeamSeason.movement)
  const movementCount = Object.keys(object(existingMovement.transfersInById)).length +
    Object.keys(object(existingMovement.transfersOutById)).length

  const season = object(map(league.seasonsById)[resolvedSeasonId])
  if (!Object.keys(season).length) throw new Error('Canonical League season was not found')
  const teamRow = object(map(season.table && season.table.teamsById)[resolvedTeamId])
  if (!Object.keys(teamRow).length) throw new Error('Team row was not found in canonical League season')
  const clubId = clean(teamRow.clubId)
  if (clean(clubProfile.clubId) !== clubId) throw new Error('Missing or mismatched ClubProfile')

  const playerIds = unique(existingTeamSeason
    ? Object.keys(object(existingTeamSeason.roster && existingTeamSeason.roster.playersById))
    : Object.keys(map(existingPlayerSeasonsById)))
  const rootResult = buildClearedTeamRoot({ existingTeamRoot, seasonId: resolvedSeasonId, updatedAt })
  const playerSeasons = buildClearedPlayerSeasonWrites({
    playerIds,
    existingPlayerSeasonsById,
    teamId: resolvedTeamId,
    updatedAt,
  })
  const birthYear = Number(teamRow.birthYear || season.birthYear)
  const teamSlot = Number(teamRow.teamSlot)
  const expectedTeamId = buildTeamId({ clubId, birthYear, teamSlot })
  if (expectedTeamId !== resolvedTeamId) throw new Error('Team identity mismatch')

  const emptyTeamSeason = null
  const leaguesCenterTeam = {
    clubId,
    teamSlot,
    showInvestigationIndicator: typeof teamRow.showInvestigationIndicator === 'boolean'
      ? teamRow.showInvestigationIndicator
      : previousLeaguesCenterTeamProjection?.showInvestigationIndicator === true,
    ...buildCenterTeamStateProjection({
      teamSeason: emptyTeamSeason,
      seasonStatus: season.seasonStatus,
      previousTeamProjection: previousLeaguesCenterTeamProjection,
    }),
  }
  const clubsCenterTeam = buildClubsCenterTeamProjection({
    league,
    season,
    seasonId: resolvedSeasonId,
    teamId: resolvedTeamId,
    teamRow,
    teamSeason: null,
    previousTeamProjection: previousClubsCenterTeamProjection,
    updatedAt,
  })

  return {
    actionType: 'rosterClear',
    teamId: resolvedTeamId,
    teamSeasonDocumentId: buildTeamSeasonDocumentId({ teamId: resolvedTeamId, seasonId: resolvedSeasonId }),
    leagueId: resolvedLeagueId,
    clubId,
    seasonId: resolvedSeasonId,
    impact: {
      players: playerIds.length,
      playerIndexes: list(existingPlayerSearchIndexes).length,
      transfers: movementCount,
    },
    canonical: {
      teamRootOperation: rootResult.operation,
      teamRoot: rootResult.document,
      teamSeasonOperation: existingTeamSeason ? 'DELETE' : 'NONE',
      teamSeason: null,
    },
    counterparts: [],
    counterpartClubsCenterProjections: [],
    playerSeasons,
    playerSearchIndexes: {
      upserts: [],
      deletes: list(existingPlayerSearchIndexes).map(row => clean(row.id || row.documentId)).filter(Boolean),
    },
    leagueProjection: {
      leagueId: resolvedLeagueId,
      seasonId: resolvedSeasonId,
      teamId: resolvedTeamId,
      roster: { playersCount: 0, hasPlayers: false, loadedAt: null },
      updatedAt: updatedAt || null,
    },
    leaguesCenterProjection: {
      writeRequired: true,
      leagueId: resolvedLeagueId,
      seasonId: resolvedSeasonId,
      teamId: resolvedTeamId,
      team: leaguesCenterTeam,
      updatedAt: updatedAt || null,
    },
    clubsCenterProjection: {
      writeRequired: true,
      seasonId: resolvedSeasonId,
      seasonKey: clean(season.seasonKey),
      leagueId: resolvedLeagueId,
      leagueOperation: 'UPSERT',
      league: {
        displayName: clean(league.names && (league.names.display || league.names.official || league.names.short || league.names.source)),
        ageGroupLabel: clean(league.ageGroupLabel),
        leagueLevel: league.level === undefined ? null : league.level,
        seasonStatus: clean(season.seasonStatus),
        tableImportedAt: season.tableImportedAt || null,
      },
      clubWrites: [{
        clubId,
        clubProfile: {
          displayName: clean(clubProfile.names && clubProfile.names.display),
          shortName: clean(clubProfile.names && clubProfile.names.short),
          clubLevel: clubProfile.clubLevel === undefined ? null : clubProfile.clubLevel,
          clubStrengthLevel: clubProfile.clubStrengthLevel === undefined ? null : clubProfile.clubStrengthLevel,
        },
        upsertTeamsById: { [resolvedTeamId]: clubsCenterTeam },
        deleteTeamIds: [],
      }],
      updatedAt: updatedAt || null,
    },
  }
}

export default buildRosterLoadWritePlan
