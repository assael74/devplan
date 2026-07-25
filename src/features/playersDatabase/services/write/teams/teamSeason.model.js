// features/playersDatabase/services/write/teams/teamSeason.model.js

import { buildSeasonKey, clean, toNumberOrZero } from '../leagues/leagueDoc.js'
import {
  buildPlayerMatchValues,
  normalizePlayerIdentity,
  normalizePlayerNameValue,
  normalizePlayerIdPart,
} from '../../../model/playerIdentity.model.js'
import { normalizePlayerStats } from '../../../model/playerStats.model.js'
import {
  isSameSeason,
  normalizeSeasonIdentity,
} from '../../../model/season.model.js'
import { normalizeTeamStats } from '../../../model/teamStats.model.js'
import { pickFirstValue } from '../../../model/value.model.js'
import {
  buildPlayerDocumentId,
  hasPlayerScoutProfiles,
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
  const sourceId = identity.externalPlayerId || normalizeIdPart(identity.normalizedName)

  return ['player', birthYear, sourceId]
    .map(normalizeIdPart)
    .filter(Boolean)
    .join('__')
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

  return {
    playerId: buildInternalPlayerId({ player, season }),
    playerDocumentId: hasPlayerScoutProfiles(player)
      ? buildPlayerDocumentId(player)
      : identity.playerDocumentId,
    externalPlayerId: identity.externalPlayerId,
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
    playerStats: {
      ...playerStats,
      teamRank: player.playerStats?.teamRank ?? player.teamRank ?? null,
      teamGoalsFor: toNumberOrZero(
        player.playerStats?.teamGoalsFor ?? player.teamGoalsFor
      ),
      teamGoalsAgainst: toNumberOrZero(
        player.playerStats?.teamGoalsAgainst ?? player.teamGoalsAgainst
      ),
      teamAttackPerformance:
        player.playerStats?.teamAttackPerformance ??
        player.teamAttackPerformance ??
        null,
      teamDefensePerformance:
        player.playerStats?.teamDefensePerformance ??
        player.teamDefensePerformance ??
        null,
    },
    scoutProfiles: normalizePlayerScoutProfiles(player),
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

const mergeExistingTeamPlayerStats = ({
  existingPlayer = {},
  statsPlayer = {},
} = {}) => ({
  ...existingPlayer,
  playerId: clean(existingPlayer.playerId || statsPlayer.playerId),
  playerDocumentId: clean(statsPlayer.playerDocumentId || existingPlayer.playerDocumentId),
  externalPlayerId: clean(statsPlayer.externalPlayerId || existingPlayer.externalPlayerId),
  fullName: clean(existingPlayer.fullName || statsPlayer.fullName),
  normalizedName: normalizePlayerName(existingPlayer.normalizedName || existingPlayer.fullName || statsPlayer.fullName),
  aliases: mergePlayerAliases({ existingPlayer, statsPlayer }),
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
  playerStats: {
    ...(existingPlayer.playerStats || {}),
    ...(statsPlayer.playerStats || {}),
  },
  scoutProfiles: Array.isArray(statsPlayer.scoutProfiles) ? statsPlayer.scoutProfiles : [],
  updatedAt: new Date().toISOString(),
})

export const mergeTeamPlayerStats = ({
  existingPlayers = [],
  players = [],
} = {}) => {
  const nextPlayers = (Array.isArray(existingPlayers) ? existingPlayers : []).map(player => ({
    ...normalizeTeamPlayer(player),
    ...player,
    aliases: normalizeAliases(player.aliases),
  }))
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
      ? { ...row, ...seasonDoc }
      : row
  ))
}

