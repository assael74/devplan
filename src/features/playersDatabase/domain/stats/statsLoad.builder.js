// src/features/playersDatabase/domain/stats/statsLoad.builder.js

import { buildScoutProfilesSummary } from '../../model/scout/scoutProfilesSummary.model.js'
import { buildPlayerLineClassificationState } from '../orchestration/buildPlayerLineClassificationState.js'
import { buildPlayerScoutState } from '../orchestration/buildPlayerScoutState.js'
import { buildTeamPlayerScoutProjection } from '../projections/playerScout.projection.js'
import { buildRosterMovementPlan } from '../roster/index.js'
import { buildPlayerRootDocument } from '../playerRoot.builder.js'
import {
  buildPlayerId,
  buildPlayerSeasonDocumentId,
  buildTeamSeasonDocumentId,
  requireSeasonId,
} from '../identity/index.js'
import {
  buildPlayerSearchIndexProjection,
  buildPlayerSeasonProjection,
  buildStatsCenterProjections,
  buildStatsCounterpartClubsCenterProjections,
} from './statsProjection.builder.js'
import {
  buildStatsLeagueContext,
  validateStatsRowsAgainstLeague,
} from './validation.js'
import { buildTeamBalanceFromTeamSeason } from './teamBalance.builder.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()
const object = value => (value && typeof value === 'object' && !Array.isArray(value) ? value : {})
const array = value => (Array.isArray(value) ? value : [])
const clone = value => JSON.parse(JSON.stringify(value))
const numberOrNull = value => {
  if (value === null || value === undefined || value === '') return null
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : null
}

const EMPTY_PROJECTED = Object.freeze({ games: null, goals: null, minutes: null, starts: null })

const requireObject = (value, code, message) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    const error = new Error(message)
    error.code = code
    throw error
  }
  return value
}

const requireCanonical = ({ leagueId, teamId, seasonId, teamRoot, teamSeason, league }) => {
  requireObject(teamRoot, 'STATS_TEAM_ROOT_NOT_FOUND', 'Canonical Team Root is required for Stats Load')
  requireObject(teamSeason, 'STATS_TEAM_SEASON_NOT_FOUND', 'Canonical Team Season is required for Stats Load')
  requireObject(league, 'STATS_LEAGUE_NOT_FOUND', 'Canonical League is required for Stats Load')

  const expectedTeamSeasonDocumentId = buildTeamSeasonDocumentId({ teamId, seasonId })
  const teamRootIdentity = object(teamRoot.identity)
  const teamRootId = clean(teamRoot.id || teamRootIdentity.teamId)
  const teamSeasonId = clean(
    teamSeason.id || (teamSeason.identity && teamSeason.identity.teamSeasonDocumentId)
  )
  if (teamRootId !== teamId) {
    const error = new Error('Team Root identity mismatch')
    error.code = 'STATS_TEAM_ROOT_IDENTITY_MISMATCH'
    throw error
  }
  if (teamSeasonId !== expectedTeamSeasonDocumentId) {
    const error = new Error('Team Season identity mismatch')
    error.code = 'STATS_TEAM_SEASON_IDENTITY_MISMATCH'
    throw error
  }

  const identity = object(teamSeason.identity)
  if (clean(identity.teamId) !== teamId || clean(identity.seasonId) !== seasonId) {
    const error = new Error('Team Season canonical identity mismatch')
    error.code = 'STATS_TEAM_SEASON_IDENTITY_MISMATCH'
    throw error
  }
  if (
    clean(teamRootIdentity.teamId) !== teamId ||
    clean(teamRootIdentity.clubId) !== clean(identity.clubId) ||
    Number(teamRootIdentity.birthYear) !== Number(identity.birthYear) ||
    Number(teamRootIdentity.teamSlot) !== Number(identity.teamSlot)
  ) {
    const error = new Error('Team Root canonical identity mismatch')
    error.code = 'STATS_TEAM_ROOT_IDENTITY_MISMATCH'
    throw error
  }
  const resolvedLeagueId = clean(leagueId)
  const canonicalLeagueId = clean(league.leagueId || league.id)
  if (!resolvedLeagueId || canonicalLeagueId !== resolvedLeagueId || clean(identity.leagueId) !== resolvedLeagueId) {
    const error = new Error('League identity does not match Team Season')
    error.code = 'STATS_LEAGUE_IDENTITY_MISMATCH'
    throw error
  }
  const leagueSeason = object(object(league.seasonsById)[seasonId])
  const leagueTeam = object(object(object(leagueSeason.table).teamsById)[teamId])
  if (!clean(leagueTeam.clubId) || clean(leagueTeam.clubId) !== clean(identity.clubId)) {
    const error = new Error('League team clubId does not match Team Season')
    error.code = 'STATS_LEAGUE_TEAM_CLUB_MISMATCH'
    throw error
  }
}

const buildIncomingPlayerId = ({ row, fallbackBirthYear }) => {
  const explicitPlayerId = clean(row.playerId)
  const externalPlayerId = clean(row.externalPlayerId)
  const birthYear = Number(row.birthYear || fallbackBirthYear)
  const derivedPlayerId = buildPlayerId({ birthYear, externalPlayerId })
  if (explicitPlayerId && derivedPlayerId && explicitPlayerId !== derivedPlayerId) {
    const error = new Error('Stats participant playerId does not match canonical identity')
    error.code = 'STATS_PLAYER_ID_MISMATCH'
    error.playerId = explicitPlayerId
    throw error
  }
  return explicitPlayerId || derivedPlayerId
}

const buildStatsPlayerState = ({ row, leagueContext, updatedAt }) => ({
  statsStatus: 'loaded',
  playerStats: {
    games: Number(row.games),
    goals: Number(row.goals),
    yellowCards: Number(row.yellowCards),
    minutes: Number(row.minutes),
    starts: Number(row.starts),
    substituteIn: Number(row.substituteIn),
    substitutedOut: Number(row.substitutedOut),
    teamMinutes: leagueContext.teamMinutes,
    teamGamePlayed: leagueContext.teamGamePlayed,
  },
  lineClassification: { line: '' },
  updatedAt: updatedAt || null,
})

const buildRemovedStatsPlayerState = ({ leagueContext, updatedAt }) => ({
  statsStatus: 'missing',
  playerStats: {
    games: null,
    goals: null,
    yellowCards: null,
    minutes: null,
    starts: null,
    substituteIn: null,
    substitutedOut: null,
    teamMinutes: leagueContext.teamMinutes,
    teamGamePlayed: leagueContext.teamGamePlayed,
  },
  lineClassification: { line: '' },
  updatedAt: updatedAt || null,
})

const findProfile = ({ scoutState, profileId }) => array(scoutState.scoutProfiles || scoutState.scoutSignals)
  .find(profile => clean(profile.profileId || profile.id) === profileId) || null

const buildScoutingState = ({
  playerId,
  rosterPlayer,
  statsPlayer,
  playerRoot,
  league,
  leagueContext,
  teamSeason,
  updatedAt,
}) => {
  if (clean(statsPlayer.statsStatus) !== 'loaded') return null

  const root = object(playerRoot)
  const teamIdentity = object(teamSeason.identity)
  const competitionSnapshot = object(teamSeason.competitionSnapshot)
  const leagueTeam = object(leagueContext.team)
  const teamPerformance = object(leagueTeam.performance)
  const teamOffense = object(teamPerformance.offense || leagueTeam.offense)
  const teamDefense = object(teamPerformance.defense || leagueTeam.defense)
  const calculationStats = {
    ...statsPlayer.playerStats,
    teamGames: leagueContext.teamGamePlayed,
  }
  const player = {
    ...rosterPlayer,
    ...calculationStats,
    playerId,
    playerStats: calculationStats,
    statsStatus: 'loaded',
    rosterStatus: clean(rosterPlayer.rosterStatus),
    primaryPosition: clean(root.primaryPosition),
    positionLayer: clean(root.positionLayer),
  }
  const lineClassification = buildPlayerLineClassificationState({
    player,
    team: { teamGamePlayed: leagueContext.teamGamePlayed },
    season: {
      seasonStatus: leagueContext.seasonStatus,
      leagueTotalRound: leagueContext.season.leagueTotalRound,
    },
  })
  const teamContext = {
    teamId: teamIdentity.teamId,
    clubId: teamIdentity.clubId,
    leagueId: teamIdentity.leagueId,
    leagueLevel: numberOrNull(league.level),
    ageGroupId: clean(teamIdentity.ageGroupId),
    birthYear: numberOrNull(teamIdentity.birthYear),
    birthTeamSlot: numberOrNull(teamIdentity.teamSlot),
    clubLevel: numberOrNull(competitionSnapshot.clubLevel),
    clubStrengthLevel: numberOrNull(competitionSnapshot.clubStrengthLevel),
    teamGamePlayed: leagueContext.teamGamePlayed,
    tableRank: numberOrNull(leagueTeam.officialTable && leagueTeam.officialTable.rank),
    goalsFor: leagueContext.goalsFor,
    goalsAgainst: leagueContext.goalsAgainst,
    performance: teamPerformance,
    offense: teamOffense,
    defense: teamDefense,
  }
  const seasonContext = {
    seasonId: teamIdentity.seasonId,
    seasonKey: teamIdentity.seasonKey,
    seasonStatus: teamIdentity.seasonStatus,
    ageGroupId: clean(teamIdentity.ageGroupId),
    birthYear: numberOrNull(teamIdentity.birthYear),
    gameDurationMinutes: leagueContext.gameDurationMinutes,
    leagueTotalRound: numberOrNull(leagueContext.season.leagueTotalRound),
    leagueLevel: numberOrNull(league.level),
  }
  const scoutState = buildPlayerScoutState({
    player: { ...player, lineClassification },
    team: teamContext,
    season: seasonContext,
  })
  const compact = buildTeamPlayerScoutProjection(scoutState)
  const primaryProfileId = clean(compact.primaryScoutProfileId)
  const professionalProfileIds = array(compact.professionalScoutProfileIds).map(clean).filter(Boolean)
  const preliminaryProfileIds = array(compact.preliminaryScoutProfileIds).map(clean).filter(Boolean)
  const primaryProfile = findProfile({ scoutState, profileId: primaryProfileId })
  const hierarchy = object(scoutState.scoutProfileHierarchy)
  const orderedProfileIds = array(hierarchy.orderedProfileIds).map(clean).filter(Boolean)
  const secondaryProfileId = orderedProfileIds.find(id => id && id !== primaryProfileId) || ''
  const secondaryProfile = findProfile({ scoutState, profileId: secondaryProfileId })
  const evidenceIndicators = array(scoutState.scoutEvidence)
  const progression = object(scoutState.scoutProfileProgression)
  const nearest = progression.nearestProfile || array(progression.distances)[0] || null
  const profileDepthsById = Object.fromEntries(
    array(scoutState.scoutProfiles || scoutState.scoutSignals)
      .map(profile => [
        clean(profile && (profile.profileId || profile.id)),
        numberOrNull(profile && profile.profileStrength && profile.profileStrength.depthPct),
      ])
      .filter(([profileId]) => Boolean(profileId))
  )

  statsPlayer.lineClassification = {
    line: clean(lineClassification && lineClassification.line),
  }

  return {
    primaryPosition: clean(root.primaryPosition),
    positionLayer: clean(root.positionLayer),
    primary: {
      profileId: primaryProfileId,
      strengthDepthPct: numberOrNull(compact.primaryScoutProfileStrengthDepthPct),
      score: numberOrNull(primaryProfile && (primaryProfile.score || primaryProfile.profileScore)),
      reliabilityLevel: clean(primaryProfile && primaryProfile.reliabilityLevel),
      warnings: array(primaryProfile && primaryProfile.warnings),
      teamGateMode: clean(primaryProfile && primaryProfile.scoutContext && primaryProfile.scoutContext.teamGate && primaryProfile.scoutContext.teamGate.mode),
    },
    secondary: {
      profileId: secondaryProfileId,
      strengthDepthPct: numberOrNull(secondaryProfile && secondaryProfile.profileStrength && secondaryProfile.profileStrength.depthPct),
      score: numberOrNull(secondaryProfile && (secondaryProfile.score || secondaryProfile.profileScore)),
      reliabilityLevel: clean(secondaryProfile && secondaryProfile.reliabilityLevel),
      warnings: array(secondaryProfile && secondaryProfile.warnings),
    },
    professionalProfileIds,
    preliminaryProfileIds,
    profileDepthsById,
    combinationIds: array(scoutState.scoutCombinations || scoutState.scoutCombinationIds || scoutState.combinationIds)
      .map(combination => clean(combination && (combination.id || combination.combinationId || combination)))
      .filter(Boolean),
    scoutEffectiveImmediacyStatus: clean(compact.scoutEffectiveImmediacyStatus),
    scoutPlayerInterestLevel: clean(compact.scoutPlayerInterestLevel),
    evidence: {
      capturedAt: updatedAt || null,
      statsSnapshotKey: '',
      engineVersion: clean(compact.scoutEngineVersion || scoutState.scoutEngineVersion),
      indicators: evidenceIndicators,
      actual: {
        games: statsPlayer.playerStats.games,
        goals: statsPlayer.playerStats.goals,
        yellowCards: statsPlayer.playerStats.yellowCards,
        minutes: statsPlayer.playerStats.minutes,
        starts: statsPlayer.playerStats.starts,
        substituteIn: statsPlayer.playerStats.substituteIn,
        substitutedOut: statsPlayer.playerStats.substitutedOut,
      },
      projected: {
        ...EMPTY_PROJECTED,
        games: null,
        goals: null,
        minutes: null,
        starts: null,
      },
      calculationContext: {
        seasonStatus: leagueContext.seasonStatus,
        gameDurationMinutes: leagueContext.gameDurationMinutes,
        leagueTotalRound: numberOrNull(leagueContext.season.leagueTotalRound),
        teamGamePlayed: leagueContext.teamGamePlayed,
        remainingTeamGames: Math.max(0, Number(leagueContext.season.leagueTotalRound) - Number(leagueContext.teamGamePlayed)) || 0,
        teamMinutesPlayed: leagueContext.teamMinutes,
        minutesShareRate: leagueContext.teamMinutes > 0
          ? statsPlayer.playerStats.minutes / leagueContext.teamMinutes
          : null,
        normalizationStatus: '',
        normalizationVersion: null,
        clubLevel: numberOrNull(teamSeason.competitionSnapshot && teamSeason.competitionSnapshot.clubLevel),
        clubStrengthLevel: numberOrNull(teamSeason.competitionSnapshot && teamSeason.competitionSnapshot.clubStrengthLevel),
        leagueLevel: numberOrNull(league.level),
        teamTableRank: numberOrNull(leagueContext.team.officialTable && leagueContext.team.officialTable.rank),
        teamGoalsFor: leagueContext.goalsFor,
        teamGoalsAgainst: leagueContext.goalsAgainst,
      },
      progression: {
        profileId: clean(nearest && nearest.profileId),
        distancePct: numberOrNull(nearest && (nearest.distancePct || nearest.distance)),
        trend: clean(nearest && nearest.trend),
      },
    },
    updatedAt: updatedAt || null,
  }
}

export const buildStatsPlayerPreviewState = ({
  player = {},
  teamSeason = {},
  leagueContext = {},
  leagueLevel = null,
  leagueTotalRound = null,
} = {}) => {
  const identity = object(teamSeason.identity)
  const teamGamePlayed = numberOrNull(leagueContext.teamGamePlayed)
  const gameDurationMinutes = numberOrNull(leagueContext.gameDurationMinutes)
  const teamMinutes = numberOrNull(leagueContext.teamMinutes)

  if (
    !clean(identity.teamId) ||
    !clean(identity.seasonId) ||
    teamGamePlayed === null ||
    gameDurationMinutes === null ||
    teamMinutes === null ||
    teamMinutes <= 0
  ) {
    return null
  }

  const statsPlayer = buildStatsPlayerState({
    row: player,
    leagueContext: {
      ...leagueContext,
      teamGamePlayed,
      gameDurationMinutes,
      teamMinutes,
    },
    updatedAt: null,
  })
  const scouting = buildScoutingState({
    playerId: clean(player.playerId || player.externalPlayerId || player.id || player.fullName),
    rosterPlayer: player,
    statsPlayer,
    playerRoot: player,
    league: { level: leagueLevel },
    leagueContext: {
      ...leagueContext,
      teamGamePlayed,
      gameDurationMinutes,
      teamMinutes,
      team: {
        ...object(leagueContext.team),
        officialTable: {
          rank: leagueContext.tableRank,
        },
      },
      season: {
        leagueTotalRound,
      },
    },
    teamSeason,
    updatedAt: null,
  })

  return {
    lineClassification: statsPlayer.lineClassification,
    scouting,
  }
}

const buildPlayerRootPlan = ({
  playerId,
  rosterPlayer,
  existingRoot,
  scoutingPlayer,
  seasonId,
  seasonKey,
  seasonStatus,
  updatedAt
}) => {
  const hasScoutLifecycle = Boolean(
    clean(scoutingPlayer && scoutingPlayer.primary && scoutingPlayer.primary.profileId) ||
    clean(scoutingPlayer && scoutingPlayer.scoutEffectiveImmediacyStatus) ||
    clean(scoutingPlayer && scoutingPlayer.scoutPlayerInterestLevel)
  )
  if (!existingRoot && !hasScoutLifecycle) return null

  const playerSeasonDocumentId = buildPlayerSeasonDocumentId({ playerId, seasonId })
  const seasonRef = {
    seasonKey,
    playerSeasonDocumentId,
    seasonStatus,
  }

  if (existingRoot) {
    return {
      playerId,
      action: 'update',
      seasonId,
      seasonRef,
      updatedAt: updatedAt || null,
    }
  }

  return {
    playerId,
    action: 'create',
    document: buildPlayerRootDocument({
      playerId,
      rosterPlayer,
      seasonRefsById: { [seasonId]: seasonRef },
      updatedAt,
    }),
  }
}

export const buildStatsLoadApprovedState = ({
  leagueId = '',
  teamId = '',
  seasonId = '',
  incomingPlayers = [],
  reloadDecisions = {},
  updatedAt = null,
  sources = {},
} = {}) => {
  const resolvedSeasonId = requireSeasonId(seasonId)
  const resolvedTeamId = clean(teamId)
  if (!resolvedTeamId) throw new Error('Missing teamId for Stats Load')

  const teamRoot = sources.teamRoot || null
  const existingTeamSeason = sources.teamSeason || null
  const league = sources.league || null
  const clubDirectoryEntry = sources.clubDirectoryEntry || null
  requireCanonical({
    leagueId,
    teamId: resolvedTeamId,
    seasonId: resolvedSeasonId,
    teamRoot,
    teamSeason: existingTeamSeason,
    league,
  })

  const leagueContext = buildStatsLeagueContext({
    league,
    seasonId: resolvedSeasonId,
    teamId: resolvedTeamId,
  })
  const canonicalIdentity = object(existingTeamSeason.identity)
  if (clean(canonicalIdentity.seasonStatus) !== leagueContext.seasonStatus) {
    const error = new Error('Team Season seasonStatus does not match canonical League')
    error.code = 'STATS_SEASON_STATUS_MISMATCH'
    throw error
  }

  const existingRosterPlayersById = object(object(existingTeamSeason.roster).playersById)
  const rosterPlayersById = { ...existingRosterPlayersById }
  const participantDecisions = []
  const normalizedIncoming = array(incomingPlayers).map(row => {
    const playerId = buildIncomingPlayerId({
      row,
      fallbackBirthYear: canonicalIdentity.birthYear,
    })
    const rosterPlayer = rosterPlayersById[playerId]
    if (rosterPlayer) return { ...row, playerId }

    const decision = clean(row.statsMovementDecision || row.rosterStatus)
    if (!['joined', 'left', 'youngerAgeGroup'].includes(decision)) {
      const error = new Error(`Stats participant ${playerId} requires an explicit Roster Movement decision`)
      error.code = 'STATS_ROSTER_MOVEMENT_DECISION_REQUIRED'
      error.playerId = playerId
      throw error
    }

    rosterPlayersById[playerId] = {
      playerId,
      externalPlayerId: clean(row.externalPlayerId),
      identityKey: clean(row.identityKey) || `external:${clean(row.externalPlayerId)}`,
      fullName: clean(row.fullName || row.displayName || row.name),
      normalizedName: clean(row.normalizedName),
      aliases: array(row.aliases),
      rosterStatus: decision === 'joined' ? 'regular' : decision,
      isYoungerAgeGroup: decision === 'youngerAgeGroup',
      isOlderAgeGroup: Boolean(row.isOlderAgeGroup),
      numShirt: row.numShirt === null || row.numShirt === undefined || row.numShirt === '' ? null : Number(row.numShirt),
      updatedAt: updatedAt || null,
    }
    participantDecisions.push({
      ...row,
      playerId,
      decision,
      team: row.statsMovementTeam || null,
    })
    return { ...row, playerId }
  })

  const rosterMovementPlan = buildRosterMovementPlan({
    mode: 'PATCH',
    teamId: resolvedTeamId,
    teamSeasonDocumentId: buildTeamSeasonDocumentId({ teamId: resolvedTeamId, seasonId: resolvedSeasonId }),
    clubId: clean(canonicalIdentity.clubId),
    teamSlot: canonicalIdentity.teamSlot,
    clubLevel: numberOrNull(object(existingTeamSeason.competitionSnapshot).clubLevel),
    seasonId: resolvedSeasonId,
    playersById: rosterPlayersById,
    existingPlayersById: existingRosterPlayersById,
    existingMovement: existingTeamSeason.movement,
    participantDecisions,
    existingCounterpartTeamSeasonsById: object(sources.existingCounterpartTeamSeasonsById),
    updatedAt,
  })

  validateStatsRowsAgainstLeague({
    players: normalizedIncoming,
    leagueContext,
    ageGroupId: canonicalIdentity.ageGroupId,
  })

  const existingStatsPlayers = object(object(existingTeamSeason.stats).playersById)
  const nextStatsPlayers = { ...clone(existingStatsPlayers) }
  const incomingIds = new Set()
  normalizedIncoming.forEach(row => {
    incomingIds.add(row.playerId)
    nextStatsPlayers[row.playerId] = buildStatsPlayerState({ row, leagueContext, updatedAt })
  })

  Object.entries(existingStatsPlayers).forEach(([playerId, previous]) => {
    if (incomingIds.has(playerId) || clean(previous && previous.statsStatus) !== 'loaded') return
    const decision = clean(object(reloadDecisions)[playerId])
    if (!['preserveStats', 'removeStats'].includes(decision)) {
      const error = new Error(`Reload decision is required for ${playerId}`)
      error.code = 'STATS_RELOAD_DECISION_REQUIRED'
      error.playerId = playerId
      throw error
    }
    if (decision === 'removeStats') {
      nextStatsPlayers[playerId] = buildRemovedStatsPlayerState({ leagueContext, updatedAt })
    }
  })

  const playerRootsById = object(sources.playerRootsById)
  const nextScoutingPlayers = {}
  Object.entries(rosterPlayersById).forEach(([playerId, rosterPlayer]) => {
    const statsPlayer = nextStatsPlayers[playerId]
    if (!statsPlayer || clean(statsPlayer.statsStatus) !== 'loaded') return
    const scouting = buildScoutingState({
      playerId,
      rosterPlayer,
      statsPlayer,
      playerRoot: playerRootsById[playerId] || null,
      league,
      leagueContext,
      teamSeason: existingTeamSeason,
      updatedAt,
    })
    if (scouting) nextScoutingPlayers[playerId] = scouting
  })

  const teamBalance = buildTeamBalanceFromTeamSeason({
    teamSeason: existingTeamSeason,
    statsPlayersById: nextStatsPlayers,
    scoutingPlayersById: nextScoutingPlayers,
    leagueContext,
    updatedAt,
  })
  const scoutedRows = Object.entries(rosterPlayersById)
    .map(([playerId, rosterPlayer]) => ({
      ...rosterPlayer,
      professionalScoutProfileIds: array(nextScoutingPlayers[playerId] && nextScoutingPlayers[playerId].professionalProfileIds),
    }))
  const scoutProfilesSummary = buildScoutProfilesSummary(scoutedRows)
  const teamTaskSignals = {
    offense: Boolean(teamBalance && teamBalance.teamTaskSignals && teamBalance.teamTaskSignals.offense),
    defense: Boolean(teamBalance && teamBalance.teamTaskSignals && teamBalance.teamTaskSignals.defense),
    updatedAt: updatedAt || null,
  }
  const scoutAvailability = object(teamBalance && teamBalance.scoutInterpretation)
  const teamTaskAvailability = {
    availability: clean(scoutAvailability.availability) || (leagueContext.teamGamePlayed < 8 ? 'unavailable' : 'available'),
    reason: clean(scoutAvailability.availabilityReason) || (leagueContext.teamGamePlayed < 8 ? 'season_sample_insufficient' : ''),
  }

  const playerUrlsById = {}
  const manual = clone(object(existingTeamSeason.manual))
  normalizedIncoming.forEach(row => {
    const playerUrl = clean(row.playerUrl)
    if (!playerUrl) return
    playerUrlsById[row.playerId] = playerUrl
    manual.playersById = { ...object(manual.playersById) }
    manual.playersById[row.playerId] = {
      ...object(manual.playersById[row.playerId]),
      playerUrl,
      updatedAt: updatedAt || null,
    }
  })
  const teamSeason = {
    ...existingTeamSeason,
    manual,
    roster: {
      ...object(existingTeamSeason.roster),
      playersById: rosterPlayersById,
      updatedAt: participantDecisions.length ? updatedAt || null : object(existingTeamSeason.roster).updatedAt || null,
    },
    movement: participantDecisions.length ? rosterMovementPlan.movement : existingTeamSeason.movement,
    stats: {
      playersById: nextStatsPlayers,
      teamBalance,
      statsLoadState: {
        status: 'loaded',
        updatedAt: updatedAt || null,
      },
      updatedAt: updatedAt || null,
    },
    scouting: {
      playersById: nextScoutingPlayers,
      scoutProfilesSummary,
      updatedAt: updatedAt || null,
    },
    teamTaskSignals,
    teamTaskAvailability,
    timestamps: {
      ...object(existingTeamSeason.timestamps),
      updatedAt: updatedAt || null,
    },
  }

  const playersWithScoutProfileCount = Object.values(nextScoutingPlayers)
    .filter(player => array(player.professionalProfileIds).length > 0).length
  const leagueTeamPatch = {
    stats: {
      hasStats: Object.values(nextStatsPlayers).some(player => clean(player.statsStatus) === 'loaded'),
      statsComplete: true,
      loadedAt: teamSeason.stats.statsLoadState.updatedAt || null,
    },
    scouting: {
      playersWithScoutProfileCount,
      teamTaskSignals,
    },
    updatedAt: updatedAt || null,
  }

  const playerRootPlans = Object.entries(rosterPlayersById)
    .map(([playerId, rosterPlayer]) => buildPlayerRootPlan({
      playerId,
      rosterPlayer,
      existingRoot: playerRootsById[playerId] || null,
      scoutingPlayer: nextScoutingPlayers[playerId] || null,
      seasonId: resolvedSeasonId,
      seasonKey: clean(canonicalIdentity.seasonKey),
      seasonStatus: leagueContext.seasonStatus,
      updatedAt,
    }))
    .filter(Boolean)

  const effectivePlayerRootsById = { ...playerRootsById }
  playerRootPlans.filter(plan => plan.action === 'create').forEach(plan => {
    effectivePlayerRootsById[plan.playerId] = plan.document
  })

  const playerSeasonPlans = Object.keys(rosterPlayersById).map(playerId => ({
    playerId,
    documentId: buildPlayerSeasonDocumentId({ playerId, seasonId: resolvedSeasonId }),
    exists: Boolean(object(sources.playerSeasonsById)[playerId]),
    teamExists: Boolean(
      object(object(object(sources.playerSeasonsById)[playerId]).teamsById)[resolvedTeamId]
    ),
    projection: buildPlayerSeasonProjection({
      playerId,
      playerRoot: effectivePlayerRootsById[playerId] || null,
      teamSeason,
      league,
      seasonId: resolvedSeasonId,
      updatedAt,
    }),
  }))

  const playerSearchIndexPlans = Object.keys(rosterPlayersById).map(playerId => ({
    playerId,
    projection: buildPlayerSearchIndexProjection({
      playerId,
      playerRoot: effectivePlayerRootsById[playerId] || null,
      teamSeason,
      league,
      clubDirectoryEntry,
      seasonId: resolvedSeasonId,
      updatedAt,
    }),
  }))

  const center = buildStatsCenterProjections({
    teamSeason,
    league,
    clubDirectoryEntry,
    seasonId: resolvedSeasonId,
    previousLeaguesCenterTeam: sources.previousLeaguesCenterTeam || null,
    previousClubsCenterTeam: sources.previousClubsCenterTeam || null,
    updatedAt,
  })
  const counterpartClubsCenterProjections = buildStatsCounterpartClubsCenterProjections({
    counterpartPatches: rosterMovementPlan.counterparts,
    existingCounterpartTeamSeasonsById: object(sources.existingCounterpartTeamSeasonsById),
    seasonId: resolvedSeasonId,
    updatedAt,
  })

  return {
    actionType: 'statsLoad',
    teamId: resolvedTeamId,
    seasonId: resolvedSeasonId,
    leagueId: clean(canonicalIdentity.leagueId),
    clubId: clean(canonicalIdentity.clubId),
    teamSeasonDocumentId: buildTeamSeasonDocumentId({ teamId: resolvedTeamId, seasonId: resolvedSeasonId }),
    updatedAt: updatedAt || null,
    validation: {
      leagueContext: {
        teamGamePlayed: leagueContext.teamGamePlayed,
        goalsFor: leagueContext.goalsFor,
        goalsAgainst: leagueContext.goalsAgainst,
        gameDurationMinutes: leagueContext.gameDurationMinutes,
        teamMinutes: leagueContext.teamMinutes,
        seasonStatus: leagueContext.seasonStatus,
      },
    },
    canonicalTeamSeason: teamSeason,
    playerUrlsById,
    rosterParticipationPatch: participantDecisions.length ? {
      teamSeasonDocumentId: buildTeamSeasonDocumentId({ teamId: resolvedTeamId, seasonId: resolvedSeasonId }),
      roster: teamSeason.roster,
      movement: teamSeason.movement,
      updatedAt: updatedAt || null,
    } : null,
    counterpartPatches: rosterMovementPlan.counterparts,
    counterpartClubsCenterProjections,
    playerRootPlans,
    playerSeasonPlans,
    playerSearchIndexPlans,
    leagueProjection: {
      leagueId: clean(canonicalIdentity.leagueId),
      seasonId: resolvedSeasonId,
      teamId: resolvedTeamId,
      patch: leagueTeamPatch,
    },
    leaguesCenterProjection: {
      leagueId: clean(canonicalIdentity.leagueId),
      seasonId: resolvedSeasonId,
      teamId: resolvedTeamId,
      team: center.leaguesCenterTeam,
      updatedAt: updatedAt || null,
    },
    clubsCenterProjection: {
      seasonId: resolvedSeasonId,
      leagueId: clean(canonicalIdentity.leagueId),
      clubId: clean(canonicalIdentity.clubId),
      teamId: resolvedTeamId,
      clubDirectoryEntry: center.clubDirectoryProjection,
      team: center.clubsCenterTeam,
      updatedAt: updatedAt || null,
    },
    sourceSummary: {
      seasonKey: clean(canonicalIdentity.seasonKey),
      seasonStatus: leagueContext.seasonStatus,
      incomingPlayersCount: normalizedIncoming.length,
      rosterPlayersCount: Object.keys(rosterPlayersById).length,
    },
  }
}

export const buildStatsProjectionRepairApprovedState = ({
  leagueId = '',
  teamId = '',
  seasonId = '',
  updatedAt = null,
  sources = {},
} = {}) => {
  const resolvedSeasonId = requireSeasonId(seasonId)
  const resolvedTeamId = clean(teamId)
  const resolvedLeagueId = clean(leagueId)
  const teamRoot = sources.teamRoot || null
  const teamSeason = sources.teamSeason || null
  const league = sources.league || null
  const clubDirectoryEntry = sources.clubDirectoryEntry || null

  requireCanonical({
    leagueId: resolvedLeagueId,
    teamId: resolvedTeamId,
    seasonId: resolvedSeasonId,
    teamRoot,
    teamSeason,
    league,
  })

  const identity = object(teamSeason.identity)
  const leagueContext = buildStatsLeagueContext({
    league,
    seasonId: resolvedSeasonId,
    teamId: resolvedTeamId,
  })
  if (clean(identity.seasonStatus) !== leagueContext.seasonStatus) {
    throw new Error('Team Season seasonStatus does not match canonical League')
  }

  const rosterPlayersById = object(object(teamSeason.roster).playersById)
  const statsPlayersById = object(object(teamSeason.stats).playersById)
  const scoutingPlayersById = object(object(teamSeason.scouting).playersById)
  const playerRootsById = object(sources.playerRootsById)
  const playerIds = Array.from(new Set([
    ...Object.keys(rosterPlayersById),
    ...Object.keys(statsPlayersById),
    ...Object.keys(scoutingPlayersById),
  ]))

  const playerRootPlans = playerIds.map(playerId => buildPlayerRootPlan({
    playerId,
    rosterPlayer: object(rosterPlayersById[playerId]),
    existingRoot: playerRootsById[playerId] || null,
    scoutingPlayer: scoutingPlayersById[playerId] || null,
    seasonId: resolvedSeasonId,
    seasonKey: clean(identity.seasonKey),
    seasonStatus: leagueContext.seasonStatus,
    updatedAt,
  })).filter(Boolean)

  const effectivePlayerRootsById = { ...playerRootsById }
  playerRootPlans.filter(plan => plan.action === 'create').forEach(plan => {
    effectivePlayerRootsById[plan.playerId] = plan.document
  })

  const playerSeasonPlans = playerIds.map(playerId => ({
    playerId,
    documentId: buildPlayerSeasonDocumentId({ playerId, seasonId: resolvedSeasonId }),
    exists: Boolean(object(sources.playerSeasonsById)[playerId]),
    teamExists: Boolean(
      object(object(object(sources.playerSeasonsById)[playerId]).teamsById)[resolvedTeamId]
    ),
    projection: buildPlayerSeasonProjection({
      playerId,
      playerRoot: effectivePlayerRootsById[playerId] || null,
      teamSeason,
      league,
      seasonId: resolvedSeasonId,
      updatedAt,
    }),
  }))
  const playerSearchIndexPlans = playerIds.map(playerId => ({
    playerId,
    projection: buildPlayerSearchIndexProjection({
      playerId,
      playerRoot: effectivePlayerRootsById[playerId] || null,
      teamSeason,
      league,
      clubDirectoryEntry,
      seasonId: resolvedSeasonId,
      updatedAt,
    }),
  }))
  const center = buildStatsCenterProjections({
    teamSeason,
    league,
    clubDirectoryEntry,
    seasonId: resolvedSeasonId,
    previousLeaguesCenterTeam: sources.previousLeaguesCenterTeam || null,
    previousClubsCenterTeam: sources.previousClubsCenterTeam || null,
    updatedAt,
  })
  const loadedStatsPlayers = Object.values(statsPlayersById)
    .filter(player => clean(player && player.statsStatus) === 'loaded')
  const playersWithScoutProfileCount = Object.values(scoutingPlayersById)
    .filter(player => array(player && player.professionalProfileIds).length > 0).length

  return {
    actionType: 'statsLoad',
    teamId: resolvedTeamId,
    seasonId: resolvedSeasonId,
    leagueId: resolvedLeagueId,
    clubId: clean(identity.clubId),
    teamSeasonDocumentId: clean(identity.teamSeasonDocumentId),
    updatedAt: updatedAt || null,
    playerRootPlans,
    playerSeasonPlans,
    playerSearchIndexPlans,
    leagueProjection: {
      leagueId: resolvedLeagueId,
      seasonId: resolvedSeasonId,
      teamId: resolvedTeamId,
      patch: {
        stats: {
          hasStats: loadedStatsPlayers.length > 0,
          statsComplete: clean(object(object(teamSeason.stats).statsLoadState).status) === 'loaded',
          loadedAt: clean(object(object(teamSeason.stats).statsLoadState).status) === 'loaded'
            ? object(object(teamSeason.stats).statsLoadState).updatedAt || null
            : null,
        },
        scouting: {
          playersWithScoutProfileCount,
          teamTaskSignals: { ...object(teamSeason.teamTaskSignals) },
        },
        updatedAt: updatedAt || null,
      },
    },
    leaguesCenterProjection: {
      leagueId: resolvedLeagueId,
      seasonId: resolvedSeasonId,
      teamId: resolvedTeamId,
      team: center.leaguesCenterTeam,
      updatedAt: updatedAt || null,
    },
    clubsCenterProjection: {
      seasonId: resolvedSeasonId,
      leagueId: resolvedLeagueId,
      clubId: clean(identity.clubId),
      teamId: resolvedTeamId,
      clubDirectoryEntry: center.clubDirectoryProjection,
      team: center.clubsCenterTeam,
      updatedAt: updatedAt || null,
    },
  }
}
