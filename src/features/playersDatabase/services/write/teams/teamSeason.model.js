// features/playersDatabase/services/write/teams/teamSeason.model.js

import {
  buildSeasonKey,
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
import {
  buildPlayerDocumentId,
  hasPlayerScoutProfiles,
  normalizePlayerScoutCombinations,
  normalizePlayerScoutProfiles,
} from '../players/index.js'

const normalizePlayerName = normalizePlayerNameValue
const normalizeIdPart = normalizePlayerIdPart

const buildInternalPlayerId = ({
  player = {},
  season = {},
} = {}) => {
  const identity = normalizePlayerIdentity(player)
  if (identity.playerId) return identity.playerId

  const birthYear = clean(pickFirstValue(player.birthYear, season.birthYear))
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
  const birthYear = clean(pickFirstValue(player.birthYear, season.birthYear))
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

export const findExistingPlayerIndex = ({
  lookup,
  player,
} = {}) => {
  const keys = getPlayerMergeKeys(player)

  for (const key of keys) {
    if (lookup.has(key)) return lookup.get(key)
  }

  return -1
}

const shouldAppendStatsPlayer = player => Boolean(
  clean(player.playerId || player.externalPlayerId || player.fullName)
)

const mergePlayerAliases = ({
  existingPlayer = {},
  statsPlayer = {},
} = {}) => {
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


const mergeScoutProfiles = ({
  existingProfiles = [],
  nextProfiles = [],
} = {}) => {
  const profiles = new Map()

  ;(Array.isArray(existingProfiles) ? existingProfiles : []).forEach(profile => {
    const profileId = clean(profile?.profileId)
    if (!profileId) return
    profiles.set(profileId, profile)
  })

  ;(Array.isArray(nextProfiles) ? nextProfiles : []).forEach(profile => {
    const profileId = clean(profile?.profileId)
    if (!profileId) return
    profiles.set(profileId, profile)
  })

  return [...profiles.values()]
}

const mergeScoutCombinations = ({
  existingCombinations = [],
  nextCombinations = [],
} = {}) => {
  const combinations = new Map()

  ;(Array.isArray(existingCombinations) ? existingCombinations : []).forEach(combination => {
    const combinationId = clean(combination?.id || combination?.combinationId)
    if (!combinationId) return
    combinations.set(combinationId, combination)
  })

  ;(Array.isArray(nextCombinations) ? nextCombinations : []).forEach(combination => {
    const combinationId = clean(combination?.id || combination?.combinationId)
    if (!combinationId) return
    combinations.set(combinationId, combination)
  })

  return [...combinations.values()]
}

const resolveMergedScoutCombinations = ({
  existingPlayer = {},
  statsPlayer = {},
  scoutSyncMode = 'replace',
} = {}) => {
  const rosterStatus = clean(statsPlayer.rosterStatus || existingPlayer.rosterStatus)
  const nextCombinations = Array.isArray(statsPlayer.scoutCombinations)
    ? statsPlayer.scoutCombinations
    : []

  if (rosterStatus === 'transferredOut') return []
  if (scoutSyncMode !== 'preserve') return nextCombinations

  return mergeScoutCombinations({
    existingCombinations: existingPlayer.scoutCombinations,
    nextCombinations,
  })
}

const resolveMergedScoutProfiles = ({
  existingPlayer = {},
  statsPlayer = {},
  scoutSyncMode = 'replace',
} = {}) => {
  const rosterStatus = clean(statsPlayer.rosterStatus || existingPlayer.rosterStatus)
  const nextProfiles = Array.isArray(statsPlayer.scoutProfiles)
    ? statsPlayer.scoutProfiles
    : []

  if (rosterStatus === 'transferredOut') return []
  if (scoutSyncMode !== 'preserve') return nextProfiles

  return mergeScoutProfiles({
    existingProfiles: existingPlayer.scoutProfiles,
    nextProfiles,
  })
}

const mergeExistingTeamPlayerStats = ({
  existingPlayer = {},
  statsPlayer = {},
  scoutSyncMode = 'replace',
} = {}) => ({
  ...existingPlayer,
  playerId: clean(existingPlayer.playerId || statsPlayer.playerId),
  playerDocumentId: clean(statsPlayer.playerDocumentId || existingPlayer.playerDocumentId),
  externalPlayerId: clean(statsPlayer.externalPlayerId || existingPlayer.externalPlayerId),
  identityKey: clean(statsPlayer.identityKey || existingPlayer.identityKey),
  fullName: clean(existingPlayer.fullName || statsPlayer.fullName),
  normalizedName: normalizePlayerName(existingPlayer.normalizedName || existingPlayer.fullName || statsPlayer.fullName),
  aliases: mergePlayerAliases({
    existingPlayer,
    statsPlayer,
  }),
  playerUrl: clean(statsPlayer.playerUrl || existingPlayer.playerUrl),
  notes: clean(existingPlayer.notes || statsPlayer.notes),
  rosterStatus: clean(statsPlayer.rosterStatus || existingPlayer.rosterStatus) || 'regular',
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
  scoutProfiles: resolveMergedScoutProfiles({
    existingPlayer,
    statsPlayer,
    scoutSyncMode,
  }),
  scoutCombinations: resolveMergedScoutCombinations({
    existingPlayer,
    statsPlayer,
    scoutSyncMode,
  }),
  updatedAt: new Date().toISOString(),
})

const resetTeamPlayerStats = ({
  player = {},
  team = {},
  season = {},
  scoutSyncMode = 'replace',
} = {}) => {
  const resetPlayer = {
    ...player,
    statsStatus: PLAYER_STATS_STATUS.LOADED,
    playerStats: normalizePlayerStats({}),
    scoutSignals: undefined,
    scoutProfiles: undefined,
    scoutCombinations: undefined,
    bestScoutSignal: undefined,
  }
  const calculatedPlayer = buildPlayerScoutState({
    player: resetPlayer,
    team,
    season,
    perspective: 'players_database_stats_reset',
  })

  return {
    ...calculatedPlayer,
    scoutProfiles: scoutSyncMode === 'preserve'
      ? mergeScoutProfiles({
          existingProfiles: normalizePlayerScoutProfiles(player),
          nextProfiles: calculatedPlayer.scoutProfiles,
        })
      : calculatedPlayer.scoutProfiles,
    scoutCombinations: scoutSyncMode === 'preserve'
      ? mergeScoutCombinations({
          existingCombinations: normalizePlayerScoutCombinations(player),
          nextCombinations: calculatedPlayer.scoutCombinations,
        })
      : calculatedPlayer.scoutCombinations,
    updatedAt: new Date().toISOString(),
  }
}

export const mergeTeamPlayerStats = ({
  existingPlayers = [],
  players = [],
  team = {},
  season = {},
  scoutSyncMode = 'replace',
} = {}) => {
  const nextPlayers = (Array.isArray(existingPlayers) ? existingPlayers : []).map(player => (
    resetTeamPlayerStats({
      player: {
        ...normalizeTeamPlayer(player),
        ...player,
        aliases: normalizeAliases(player.aliases),
      },
      team,
      season,
      scoutSyncMode,
    })
  ))
  const lookup = buildPlayerLookup(nextPlayers)
  const appendedKeys = new Set()

  ;(Array.isArray(players) ? players : []).forEach(player => {
    const statsPlayer = {
      ...normalizeTeamPlayer(player),
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
      nextPlayers[existingIndex] = mergeExistingTeamPlayerStats({
        existingPlayer: nextPlayers[existingIndex],
        statsPlayer,
        scoutSyncMode,
      })
      getPlayerMergeKeys(nextPlayers[existingIndex]).forEach(key => lookup.set(key, existingIndex))
      return
    }

    const appendKey = getPlayerMergeKey(statsPlayer)
    if (!appendKey || appendedKeys.has(appendKey) || !shouldAppendStatsPlayer(statsPlayer)) return

    appendedKeys.add(appendKey)
    nextPlayers.push(statsPlayer)
    getPlayerMergeKeys(statsPlayer).forEach(key => lookup.set(key, nextPlayers.length - 1))
  })

  return nextPlayers
}

export const buildTeamSeasonDoc = ({
  season = {},
  team = {},
  players = [],
} = {}) => {
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

export const upsertSeasonRows = ({
  rows = [],
  season = {},
  seasonDoc = {},
} = {}) => {
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

