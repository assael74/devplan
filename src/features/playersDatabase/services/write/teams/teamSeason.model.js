// src/features/playersDatabase/services/write/teams/teamSeason.model.js

import {
  clean,
  toNumberOrZero,
} from '../leagues/leagueDoc.js'
import {
  buildPlayerIdentityKey,
  buildPlayerMatchValues,
  isValidExternalPlayerId,
  normalizePlayerIdentity,
  normalizePlayerNameValue,
  normalizePlayerIdPart,
  resolvePlayerIdentityBirthYear,
} from '../../../model/playerIdentity.model.js'
import {
  normalizePlayerStats,
  normalizePlayerStatsStatus,
  PLAYER_STATS_STATUS,
} from '../../../model/playerStats.model.js'
import {
  isSameSeason,
  normalizeSeasonIdentity,
} from '../../../model/season.model.js'
import { normalizeTeamStats } from '../../../model/teamStats.model.js'
import {
  pickFirstValue,
  pickDefinedValue,
} from '../../../model/value.model.js'
import { buildPlayerScoutState } from '../../../domain/orchestration/buildPlayerScoutState.js'
import { PLAYER_SCOUT_ACTIVE_ENGINE } from '../../../domain/orchestration/buildDbPlayerScoutResult.js'
import {
  buildPlayerScoutStatsLoadMeasurement,
  buildPlayerScoutStatsLoadMeasurements,
  normalizePlayerScoutStatsLoadMeasurements,
} from '../../../model/playerScoutMeasurement.model.js'
import {
  buildPlayerDocumentId,
  hasPlayerScoutProfiles,
  normalizePlayerScoutCombinations,
  normalizePlayerScoutProfiles,
  normalizePlayerScoutStory,
} from '../players/index.js'

const normalizePlayerName = normalizePlayerNameValue
const normalizeIdPart = normalizePlayerIdPart

const buildInternalPlayerId = ({ player = {}, season = {} } = {}) => {
  const identity = normalizePlayerIdentity(player)
  if (identity.playerId) return identity.playerId

  const birthYear = clean(resolvePlayerIdentityBirthYear({
    player,
    season,
  }) || pickFirstValue(player.birthYear, season.birthYear))
  const externalPlayerId = isValidExternalPlayerId({
    externalPlayerId: identity.externalPlayerId,
    birthYear,
  }) ? identity.externalPlayerId : ''

  if (externalPlayerId) {
    return ['player', birthYear, externalPlayerId]
      .map(normalizeIdPart)
      .filter(Boolean)
      .join('__')
  }

  return ''
}

const normalizeAliases = aliases =>
  (Array.isArray(aliases) ? aliases : [])
    .map(clean)
    .filter(Boolean)

const uniqueCleanValues = values =>
  [...new Set((Array.isArray(values) ? values : [])
    .map(clean)
    .filter(Boolean))]

export const normalizeTeamPlayer = (player, season = {}) => {
  const identity = normalizePlayerIdentity(player)
  const playerStats = normalizePlayerStats(player)
  const identityBirthYear = resolvePlayerIdentityBirthYear({
    player,
    season,
  })
  const birthYear = clean(identityBirthYear || pickFirstValue(player.birthYear, season.birthYear))
  const externalPlayerId = isValidExternalPlayerId({
    externalPlayerId: identity.externalPlayerId,
    birthYear,
  }) ? identity.externalPlayerId : ''
  const identityKey = clean(player.identityKey) || buildPlayerIdentityKey({
    birthYear,
    normalizedName: identity.normalizedName,
  })

  return {
    playerId: buildInternalPlayerId({
      player,
      season,
    }),
    playerDocumentId: hasPlayerScoutProfiles(player)
      ? buildPlayerDocumentId(player)
      : identity.playerDocumentId,
    externalPlayerId,
    identityKey,
    fullName: identity.fullName,
    normalizedName: identity.normalizedName,
    aliases: normalizeAliases(player.aliases),
    playerUrl: clean(player.playerUrl),
    notes: clean(player.notes),
    rosterStatus: clean(player.rosterStatus) || 'regular',
    manualTransferDirection: clean(player.manualTransferDirection),
    isYoungerAgeGroup: Boolean(
      player.isYoungerAgeGroup ||
      clean(player.rosterStatus) === 'youngerAgeGroup'
    ),
    primaryPosition: clean(player.primaryPosition),
    positionLayer: clean(player.positionLayer),
    numShirt: clean(player.numShirt),
    statsStatus: normalizePlayerStatsStatus(player.statsStatus),
    playerStats: {
      ...playerStats,
      teamRank: pickDefinedValue(player.playerStats?.teamRank, player.teamRank, null),
      teamGoalsFor: toNumberOrZero(
        pickDefinedValue(player.playerStats?.teamGoalsFor, player.teamGoalsFor)
      ),
      teamGoalsAgainst: toNumberOrZero(
        pickDefinedValue(player.playerStats?.teamGoalsAgainst, player.teamGoalsAgainst)
      ),
      teamAttackPerformance:
        pickDefinedValue(
          player.playerStats?.teamAttackPerformance,
          player.teamAttackPerformance,
          null,
        ),
      teamDefensePerformance:
        pickDefinedValue(
          player.playerStats?.teamDefensePerformance,
          player.teamDefensePerformance,
          null,
        ),
    },
    scoutProfiles: normalizePlayerScoutProfiles(player),
    scoutCombinations: normalizePlayerScoutCombinations(player),
    ...normalizePlayerScoutStory(player),
    scoutStatsLoadMeasurements: normalizePlayerScoutStatsLoadMeasurements(
      player.scoutStatsLoadMeasurements
    ),
    updatedAt: new Date().toISOString(),
  }
}

const getPlayerMergeKeys = player => uniqueCleanValues(
  buildPlayerMatchValues(player)
).map(value => value.toLowerCase())

export const getPlayerMergeKey = player => getPlayerMergeKeys(player)[0] || ''

export const buildPlayerLookup = players => {
  const lookup = new Map()

  ;(Array.isArray(players) ? players : []).forEach((player, index) => {
    getPlayerMergeKeys(player).forEach(key => {
      if (!lookup.has(key)) lookup.set(key, index)
    })
  })

  return lookup
}

export const findExistingPlayerIndex = ({ lookup, player } = {}) => {
  const keys = getPlayerMergeKeys(player)

  for (const key of keys) {
    if (lookup.has(key)) return lookup.get(key)
  }

  return -1
}

const shouldAppendStatsPlayer = player => Boolean(
  clean(player.playerId || player.externalPlayerId || player.fullName)
)

const mergePlayerAliases = ({ existingPlayer = {}, statsPlayer = {} } = {}) => {
  const existingName = normalizePlayerName(existingPlayer.fullName)
  const statsName = clean(statsPlayer.fullName)
  const statsNameKey = normalizePlayerName(statsName)
  const aliasCandidates = [
    ...(Array.isArray(existingPlayer.aliases) ? existingPlayer.aliases : []),
    ...(Array.isArray(statsPlayer.aliases) ? statsPlayer.aliases : []),
    statsNameKey && statsNameKey !== existingName ? statsName : '',
  ]

  return uniqueCleanValues(aliasCandidates)
}


const mergeExistingTeamPlayerStats = ({ existingPlayer = {}, statsPlayer = {} } = {}) => ({
  ...existingPlayer,
  playerId: clean(existingPlayer.playerId || statsPlayer.playerId),
  playerDocumentId: clean(statsPlayer.playerDocumentId || existingPlayer.playerDocumentId),
  externalPlayerId: clean(statsPlayer.externalPlayerId || existingPlayer.externalPlayerId),
  identityKey: clean(statsPlayer.identityKey || existingPlayer.identityKey),
  fullName: clean(existingPlayer.fullName || statsPlayer.fullName),
  normalizedName: normalizePlayerName(
    existingPlayer.normalizedName ||
    existingPlayer.fullName ||
    statsPlayer.fullName
  ),
  aliases: mergePlayerAliases({
    existingPlayer,
    statsPlayer,
  }),
  playerUrl: clean(statsPlayer.playerUrl || existingPlayer.playerUrl),
  notes: clean(existingPlayer.notes || statsPlayer.notes),
  rosterStatus: clean(statsPlayer.rosterStatus || existingPlayer.rosterStatus) || 'regular',
  manualTransferDirection: clean(
    statsPlayer.manualTransferDirection ||
    existingPlayer.manualTransferDirection
  ),
  isYoungerAgeGroup: Boolean(
    statsPlayer.isYoungerAgeGroup ||
    existingPlayer.isYoungerAgeGroup ||
    clean(statsPlayer.rosterStatus) === 'youngerAgeGroup'
  ),
  primaryPosition: clean(existingPlayer.primaryPosition || statsPlayer.primaryPosition),
  positionLayer: clean(existingPlayer.positionLayer || statsPlayer.positionLayer),
  numShirt: clean(existingPlayer.numShirt || statsPlayer.numShirt),
  statsStatus: PLAYER_STATS_STATUS.LOADED,
  playerStats: normalizePlayerStats(statsPlayer),
})

const buildScoutCalculationMeasurements = ({ existingMeasurements = {}, player = {}, team = {} } = {}) => {
  const incomingMeasurement = buildPlayerScoutStatsLoadMeasurement({
    player: {
      ...player,
      scoutEngineVersion: PLAYER_SCOUT_ACTIVE_ENGINE,
    },
    team,
  })
  const currentMeasurement = existingMeasurements.current
  const unchanged = Boolean(
    currentMeasurement?.snapshotKey &&
    currentMeasurement.snapshotKey === incomingMeasurement.snapshotKey &&
    currentMeasurement.engineVersion === incomingMeasurement.engineVersion
  )

  if (unchanged) return existingMeasurements

  return {
    previous: currentMeasurement,
    current: currentMeasurement,
  }
}

const buildFullStatsScoutPlayer = ({ player = {}, existingPlayer = null, team = {}, season = {} } = {}) => {
  const existingMeasurements = normalizePlayerScoutStatsLoadMeasurements(
    existingPlayer?.scoutStatsLoadMeasurements
  )
  const calculationMeasurements = buildScoutCalculationMeasurements({
    existingMeasurements,
    player,
    team,
  })
  const calculatedPlayer = buildPlayerScoutState({
    player: {
      ...player,
      scoutStatsLoadMeasurements: calculationMeasurements,
      scoutSignals: undefined,
      scoutProfiles: undefined,
      scoutCombinations: undefined,
      bestScoutSignal: undefined,
    },
    team,
    season,
    perspective: 'players_database_stats_write',
  })
  const scoutStatsLoadMeasurements = buildPlayerScoutStatsLoadMeasurements({
    existingMeasurements,
    player: calculatedPlayer,
    team,
  })

  return {
    ...calculatedPlayer,
    bestScoutSignal: null,
    scoutStatsLoadMeasurements,
    updatedAt: new Date().toISOString(),
  }
}

const resetTeamPlayerStats = ({ player = {}, team = {}, season = {} } = {}) => (
  buildFullStatsScoutPlayer({
    player: {
      ...player,
      statsStatus: PLAYER_STATS_STATUS.LOADED,
      playerStats: normalizePlayerStats({}),
    },
    existingPlayer: player,
    team,
    season,
  })
)

export const mergeTeamPlayerStats = ({ existingPlayers = [], players = [], team = {}, season = {} } = {}) => {
  const sourcePlayers = (Array.isArray(existingPlayers) ? existingPlayers : []).map(player => ({
    ...normalizeTeamPlayer(player, season),
    ...player,
    aliases: normalizeAliases(player.aliases),
    scoutStatsLoadMeasurements: normalizePlayerScoutStatsLoadMeasurements(
      player.scoutStatsLoadMeasurements
    ),
  }))
  const nextPlayers = [...sourcePlayers]
  const lookup = buildPlayerLookup(sourcePlayers)
  const updatedIndexes = new Set()
  const appendedKeys = new Set()

  ;(Array.isArray(players) ? players : []).forEach(player => {
    const statsPlayer = {
      ...normalizeTeamPlayer(player, season),
      aliases: uniqueCleanValues([
        ...(Array.isArray(player.aliases) ? player.aliases : []),
        player.originalFullName,
      ]),
    }
    const existingIndex = findExistingPlayerIndex({
      lookup,
      player: {
        ...statsPlayer,
        matchedPlayerId: player.matchedPlayerId,
        matchedPlayerName: player.matchedPlayerName,
        originalFullName: player.originalFullName,
        aliases: [
          ...(Array.isArray(player.aliases) ? player.aliases : []),
          ...(Array.isArray(statsPlayer.aliases) ? statsPlayer.aliases : []),
        ],
      },
    })

    if (existingIndex !== -1) {
      const existingPlayer = sourcePlayers[existingIndex]
      const mergedPlayer = mergeExistingTeamPlayerStats({
        existingPlayer,
        statsPlayer,
      })
      nextPlayers[existingIndex] = buildFullStatsScoutPlayer({
        player: mergedPlayer,
        existingPlayer,
        team,
        season,
      })
      updatedIndexes.add(existingIndex)
      getPlayerMergeKeys(nextPlayers[existingIndex]).forEach(key => lookup.set(key, existingIndex))
      return
    }

    const appendKey = getPlayerMergeKey(statsPlayer)
    if (!appendKey || appendedKeys.has(appendKey) || !shouldAppendStatsPlayer(statsPlayer)) return

    appendedKeys.add(appendKey)
    const calculatedPlayer = buildFullStatsScoutPlayer({
      player: {
        ...statsPlayer,
        statsStatus: PLAYER_STATS_STATUS.LOADED,
      },
      team,
      season,
    })
    nextPlayers.push(calculatedPlayer)
    const nextIndex = nextPlayers.length - 1
    getPlayerMergeKeys(calculatedPlayer).forEach(key => lookup.set(key, nextIndex))
  })

  sourcePlayers.forEach((player, index) => {
    if (updatedIndexes.has(index)) return

    nextPlayers[index] = resetTeamPlayerStats({
      player,
      team,
      season,
    })
  })

  return nextPlayers
}

export const buildTeamSeasonDoc = ({ season = {}, team = {}, players = [] } = {}) => {
  const { seasonId, seasonKey } = normalizeSeasonIdentity({ season })

  return {
    seasonId,
    seasonKey,
    leagueId: clean(season.leagueId || team.leagueId),
    ageGroupId: clean(season.ageGroupId || team.ageGroupId),
    birthYear: toNumberOrZero(season.birthYear),
    leagueTotalRound: toNumberOrZero(season.leagueTotalRound),
    seasonStatus: clean(season.seasonStatus) === 'completed'
      ? 'completed'
      : 'active',
    teamUrl: clean(team.teamUrl),
    teamPlayers: (Array.isArray(players) ? players : []).map(player => normalizeTeamPlayer(player, season)),
    scoutProfiles: [],
    teamStats: {
      ...(() => {
        const teamStats = normalizeTeamStats(team)

        return {
          points: teamStats.points,
          goalsFor: teamStats.goalsFor,
          goalsAgainst: teamStats.goalsAgainst,
          teamGamePlayed: teamStats.gamesPlayed,
        }
      })(),
    },
    updatedAt: new Date().toISOString(),
  }
}

export const upsertSeasonRows = ({ rows = [], season = {}, seasonDoc = {} } = {}) => {
  const safeRows = Array.isArray(rows) ? rows : []
  const seasonIndex = safeRows.findIndex(row => isSameSeason(row, season))

  if (seasonIndex === -1) return [...safeRows, seasonDoc]

  return safeRows.map((row, index) => (
    index === seasonIndex
      ? {
        ...row,
        ...seasonDoc,
      }
      : row
  ))
}
