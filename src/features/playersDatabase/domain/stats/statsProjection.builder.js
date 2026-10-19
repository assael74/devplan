// src/features/playersDatabase/domain/stats/statsProjection.builder.js

import {
  buildPlayerSearchIndexDocumentId,
  buildPlayerSeasonDocumentId,
} from '../identity/index.js'
import {
  buildCenterTeamStateProjection,
  buildClubsCenterTransfersProjection,
  buildClubsCenterTeamProjection,
} from '../league/index.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()
const object = value => (value && typeof value === 'object' && !Array.isArray(value) ? value : {})
const array = value => (Array.isArray(value) ? value : [])
const numberOrNull = value => {
  if (value === null || value === undefined || value === '') return null
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : null
}

const rosterProjection = rosterPlayer => ({
  rosterStatus: clean(rosterPlayer.rosterStatus),
  isYoungerAgeGroup: rosterPlayer.isYoungerAgeGroup === true,
  isOlderAgeGroup: rosterPlayer.isOlderAgeGroup === true,
  numShirt: rosterPlayer.numShirt === null || rosterPlayer.numShirt === undefined || rosterPlayer.numShirt === ''
    ? null
    : Number(rosterPlayer.numShirt),
})

const movementProjection = ({ teamSeason, playerId }) => {
  const result = {}
  const movement = object(teamSeason.movement)
  Object.values(object(movement.transfersInById)).forEach(row => {
    if (clean(row.playerId) !== playerId || !clean(row.movementId)) return
    const projection = { ...row }
    delete projection.playerId
    result[row.movementId] = { ...projection, direction: 'in' }
  })
  Object.values(object(movement.transfersOutById)).forEach(row => {
    if (clean(row.playerId) !== playerId || !clean(row.movementId)) return
    const projection = { ...row }
    delete projection.playerId
    result[row.movementId] = { ...projection, direction: 'out' }
  })
  return result
}

export const buildPlayerSeasonProjection = ({
  playerId,
  playerRoot = null,
  teamSeason,
  league,
  seasonId,
  updatedAt,
} = {}) => {
  const identity = object(teamSeason.identity)
  const rosterPlayer = object(object(object(teamSeason.roster).playersById)[playerId])
  const statsPlayer = object(object(object(teamSeason.stats).playersById)[playerId])
  const scoutPlayer = object(object(object(teamSeason.scouting).playersById)[playerId])
  const manualPlayer = object(object(object(teamSeason.manual).playersById)[playerId])
  const playerSeasonDocumentId = buildPlayerSeasonDocumentId({ playerId, seasonId })
  const scoutingProjection = { ...scoutPlayer }
  delete scoutingProjection.primaryPosition
  delete scoutingProjection.positionLayer

  return {
    playerSeasonDocumentId,
    identity: {
      playerSeasonDocumentId,
      playerId,
      seasonId,
      seasonKey: clean(identity.seasonKey),
      seasonStatus: clean(identity.seasonStatus),
    },
    teamId: clean(identity.teamId),
    team: {
      teamSeasonDocumentId: clean(identity.teamSeasonDocumentId),
      clubId: clean(identity.clubId),
      leagueId: clean(identity.leagueId),
      ageGroupId: clean(identity.ageGroupId),
      teamSlot: numberOrNull(identity.teamSlot),
      roster: rosterProjection(rosterPlayer),
      stats: {
        statsStatus: clean(statsPlayer.statsStatus),
        playerStats: { ...object(statsPlayer.playerStats) },
        lineClassification: { ...object(statsPlayer.lineClassification) },
      },
      scouting: scoutingProjection,
      manual: {
        playerUrl: clean(manualPlayer.playerUrl),
        goalDistribution: { ...object(manualPlayer.goalDistribution) },
      },
      movementsById: movementProjection({ teamSeason, playerId }),
      updatedAt: updatedAt || null,
    },
    playerRoot,
    league,
  }
}

const scoutProfileIds = scout => Array.from(new Set([
  clean(scout.primary && scout.primary.profileId),
  clean(scout.secondary && scout.secondary.profileId),
  ...array(scout.professionalProfileIds).map(clean),
  ...array(scout.preliminaryProfileIds).map(clean),
].filter(Boolean)))

export const buildPlayerSearchIndexProjection = ({
  playerId,
  playerRoot = null,
  teamSeason,
  league,
  clubDirectoryEntry,
  clubProfile,
  seasonId,
  updatedAt,
} = {}) => {
  const identity = object(teamSeason.identity)
  const rosterPlayer = object(object(object(teamSeason.roster).playersById)[playerId])
  const statsPlayer = object(object(object(teamSeason.stats).playersById)[playerId])
  const scoutPlayer = object(object(object(teamSeason.scouting).playersById)[playerId])
  const manualPlayer = object(object(object(teamSeason.manual).playersById)[playerId])
  const playerIdentity = object(playerRoot && playerRoot.identity)
  const playerSeasonDocumentId = buildPlayerSeasonDocumentId({ playerId, seasonId })
  const documentId = buildPlayerSearchIndexDocumentId({
    playerId,
    teamSeasonDocumentId: identity.teamSeasonDocumentId,
  })
  const profileIds = scoutProfileIds(scoutPlayer)
  const primaryProfileId = clean(scoutPlayer.primary && scoutPlayer.primary.profileId)
  const combinationIds = array(scoutPlayer.combinationIds).map(clean).filter(Boolean)
  const competitionSnapshot = object(teamSeason.competitionSnapshot)
  const clubSnapshot = clubDirectoryEntry || clubProfile || null

  return {
    documentId,
    seasonId,
    birthYear: numberOrNull(identity.birthYear),
    leagueId: clean(identity.leagueId),
    leagueLevel: numberOrNull(league.level),
    playerId,
    expectedLevelDelta: null,
    scoutEffectiveImmediacyStatus: clean(scoutPlayer.scoutEffectiveImmediacyStatus),
    scoutProfileIds: profileIds,
    scoutCombinationIds: combinationIds,
    scoutProfileSearchIds: Array.from(new Set([...profileIds, ...combinationIds])),
    references: {
      playerSeasonDocumentId,
      teamSeasonDocumentId: clean(identity.teamSeasonDocumentId),
    },
    identity: {
      externalPlayerId: clean(rosterPlayer.externalPlayerId || playerIdentity.externalPlayerId),
      displayName: clean(rosterPlayer.fullName || playerIdentity.fullName),
      normalizedDisplayName: clean(rosterPlayer.normalizedName || playerIdentity.normalizedName),
      aliases: array(rosterPlayer.aliases).length ? [...rosterPlayer.aliases] : [...array(playerIdentity.aliases)],
    },
    season: {
      seasonKey: clean(identity.seasonKey),
      seasonStatus: clean(identity.seasonStatus),
    },
    team: {
      teamId: clean(identity.teamId),
      clubId: clean(identity.clubId),
      clubLevel: numberOrNull(
        competitionSnapshot.clubLevel === undefined
          ? clubSnapshot && clubSnapshot.clubLevel
          : competitionSnapshot.clubLevel
      ),
      clubStrengthLevel: numberOrNull(
        competitionSnapshot.clubStrengthLevel === undefined
          ? clubSnapshot && clubSnapshot.clubStrengthLevel
          : competitionSnapshot.clubStrengthLevel
      ),
      teamSlot: numberOrNull(identity.teamSlot),
      ageGroupId: clean(identity.ageGroupId),
      ageGroupLabel: clean(league.ageGroupLabel),
      region: clean(league.region),
    },
    player: {
      playerUrl: clean(manualPlayer.playerUrl),
      primaryPosition: clean(playerRoot && playerRoot.primaryPosition),
      positionLayer: clean(playerRoot && playerRoot.positionLayer),
      numShirt: rosterPlayer.numShirt === null || rosterPlayer.numShirt === undefined ? '' : String(rosterPlayer.numShirt),
      rosterStatus: clean(rosterPlayer.rosterStatus),
      statsStatus: clean(statsPlayer.statsStatus),
      isYoungerAgeGroup: rosterPlayer.isYoungerAgeGroup === true,
      isOlderAgeGroup: rosterPlayer.isOlderAgeGroup === true,
      notes: clean(playerRoot && playerRoot.notes),
    },
    stats: {
      actual: {
        games: numberOrNull(statsPlayer.playerStats && statsPlayer.playerStats.games),
        goals: numberOrNull(statsPlayer.playerStats && statsPlayer.playerStats.goals),
        yellowCards: numberOrNull(statsPlayer.playerStats && statsPlayer.playerStats.yellowCards),
        minutes: numberOrNull(statsPlayer.playerStats && statsPlayer.playerStats.minutes),
        starts: numberOrNull(statsPlayer.playerStats && statsPlayer.playerStats.starts),
        substituteIn: numberOrNull(statsPlayer.playerStats && statsPlayer.playerStats.substituteIn),
        substitutedOut: numberOrNull(statsPlayer.playerStats && statsPlayer.playerStats.substitutedOut),
      },
      projected: {
        ...object(object(scoutPlayer.evidence).projected),
      },
    },
    scout: {
      primary: { ...object(scoutPlayer.primary) },
      secondary: { ...object(scoutPlayer.secondary) },
      playerInterestLevel: clean(scoutPlayer.scoutPlayerInterestLevel),
    },
    scoutEvidence: {
      ...object(scoutPlayer.evidence),
      profileResult: {
        primaryProfileId,
        secondaryProfileId: clean(scoutPlayer.secondary && scoutPlayer.secondary.profileId),
        profileIds,
        combinationIds,
      },
      primary: {
        teamGateMode: clean(scoutPlayer.primary && scoutPlayer.primary.teamGateMode),
      },
    },
    updatedAt: updatedAt || null,
  }
}

export const buildStatsCenterProjections = ({
  teamSeason,
  league,
  clubDirectoryEntry,
  clubProfile,
  seasonId,
  previousLeaguesCenterTeam = null,
  previousClubsCenterTeam = null,
  updatedAt = null,
} = {}) => {
  const identity = object(teamSeason.identity)
  const season = object(object(league.seasonsById)[seasonId])
  const teamId = clean(identity.teamId)
  const teamRow = object(object(object(season.table).teamsById)[teamId])
  const centerState = buildCenterTeamStateProjection({
    teamSeason,
    seasonStatus: identity.seasonStatus,
    previousTeamProjection: previousLeaguesCenterTeam,
  })
  const leaguesCenterTeam = {
    clubId: clean(identity.clubId),
    teamSlot: numberOrNull(identity.teamSlot),
    ...centerState,
  }
  const clubsCenterTeam = buildClubsCenterTeamProjection({
    league,
    season,
    seasonId,
    teamId,
    teamRow,
    teamSeason,
    previousTeamProjection: previousClubsCenterTeam,
    updatedAt,
  })

  const clubSnapshot = clubDirectoryEntry || clubProfile || null
  const clubProjection = {
    displayName: clean(clubSnapshot && clubSnapshot.names && (clubSnapshot.names.display || clubSnapshot.names.official)),
    shortName: clean(clubSnapshot && clubSnapshot.names && clubSnapshot.names.short),
    clubLevel: numberOrNull(object(teamSeason.competitionSnapshot).clubLevel),
    clubStrengthLevel: numberOrNull(object(teamSeason.competitionSnapshot).clubStrengthLevel),
  }

  return {
    leaguesCenterTeam,
    clubsCenterTeam,
    clubDirectoryProjection: clubProjection,
    clubProfileProjection: clubProjection,
  }
}

export const buildStatsCounterpartClubsCenterProjections = ({
  counterpartPatches = [],
  existingCounterpartTeamSeasonsById = {},
  seasonId = '',
  updatedAt = null,
} = {}) => array(counterpartPatches).map(patch => {
  const documentId = clean(patch && patch.documentId)
  const existingTeamSeason = object(object(existingCounterpartTeamSeasonsById)[documentId])
  const identity = object(existingTeamSeason.identity)
  const teamId = clean(identity.teamId)
  const clubId = clean(identity.clubId)
  const counterpartSeasonId = clean(identity.seasonId || seasonId)

  if (!documentId || !teamId || !clubId || counterpartSeasonId !== clean(seasonId)) {
    throw new Error(`Invalid Stats counterpart ClubsCenter projection source: ${documentId || 'missing'}`)
  }

  const projectedTeamSeason = {
    ...existingTeamSeason,
    movement: object(patch && patch.movement),
  }

  return {
    documentId,
    seasonId: counterpartSeasonId,
    clubId,
    teamId,
    team: {
      transfers: buildClubsCenterTransfersProjection(projectedTeamSeason),
      updatedAt: updatedAt || null,
    },
    updatedAt: updatedAt || null,
  }
})
