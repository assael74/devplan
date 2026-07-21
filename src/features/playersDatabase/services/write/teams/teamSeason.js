// features/playersDatabase/services/write/teams/teamSeason.js

import { runTransaction } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
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
import { resolveTeamLookupKey } from '../../../model/teamIdentity.model.js'
import { normalizeTeamStats } from '../../../model/teamStats.model.js'
import { pickFirstValue } from '../../../model/value.model.js'
import {
  buildPlayerDocumentId,
  hasPlayerScoutProfiles,
  normalizePlayerScoutProfiles,
} from '../players/index.js'
import { buildTeamBaseDoc, teamDocRef } from './teamDoc.js'

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

const normalizeTeamPlayer = (player, season = {}) => {
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

const getPlayerMergeKey = player => getPlayerMergeKeys(player)[0] || ''

const buildPlayerLookup = players => {
  const lookup = new Map()

  ;(Array.isArray(players) ? players : []).forEach((player, index) => {
    getPlayerMergeKeys(player).forEach(key => {
      if (!lookup.has(key)) lookup.set(key, index)
    })
  })

  return lookup
}

const findExistingPlayerIndex = ({
  lookup,
  player,
} = {}) => {
  const keys = getPlayerMergeKeys(player)

  for (const key of keys) {
    if (lookup.has(key)) return lookup.get(key)
  }

  return -1
}

const shouldAppendStatsPlayer = player => {
  const rosterStatus = clean(player.rosterStatus) || 'regular'

  return rosterStatus !== 'retired' && rosterStatus !== 'transferredOut'
}

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

const mergeTeamPlayerStats = ({
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

const buildTeamSeasonDoc = ({
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

const upsertSeasonRows = ({
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

export async function upsertTeamSeasonPlayers({
  season = {},
  team = {},
  target = 'current',
  players = [],
} = {}) {
  const teamId = resolveTeamLookupKey(team)
  const { seasonId, seasonKey } = normalizeSeasonIdentity({ season })
  if (!teamId) throw new Error('Missing birth team id')
  if (!seasonId) throw new Error('Missing season id')

  const ref = teamDocRef(teamId)

  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    const currentData = snapshot.exists() ? snapshot.data() || {} : {}
    const baseDoc = buildTeamBaseDoc({ ...team, teamDocumentId: teamId }, currentData)
    const seasonDoc = buildTeamSeasonDoc({
      season: { ...season, seasonId, seasonKey },
      team: { ...team, birthTeamDocumentId: teamId, teamDocumentId: teamId },
      players,
    })
    const isHistory = clean(target) === 'history'
    const nextData = isHistory
      ? {
          ...baseDoc,
          history: upsertSeasonRows({
            rows: baseDoc.history,
            season: { seasonId, seasonKey },
            seasonDoc,
          }),
        }
      : {
          ...baseDoc,
          current: upsertSeasonRows({
            rows: baseDoc.current,
            season: { seasonId, seasonKey },
            seasonDoc,
          }),
        }

    transaction.set(ref, nextData, { merge: true })

    return {
      birthTeamDocumentId: teamId,
      teamDocumentId: teamId,
      seasonId,
      seasonKey,
      target: isHistory ? 'history' : 'current',
      playersCount: seasonDoc.teamPlayers.length,
      createdTeam: !snapshot.exists(),
    }
  })
}

export async function updateTeamSeasonTeamUrl({
  season = {},
  team = {},
} = {}) {
  const birthTeamId = clean(
    team.birthTeamId ||
    team.teamId
  )
  const seasonId = clean(season.seasonId)
  const teamUrl = clean(team.teamUrl)

  if (!birthTeamId) throw new Error('Missing birth team id')
  if (!seasonId) throw new Error('Missing season id')

  const ref = teamDocRef(birthTeamId)

  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)

    if (!snapshot.exists()) {
      return {
        birthTeamId,
        teamDocumentId: birthTeamId,
        seasonId,
        teamUrl,
        updated: false,
        reason: 'teamDocMissing',
      }
    }

    const currentData = snapshot.data() || {}
    const currentValue = currentData.current
    const historyValue = currentData.history
    const currentRows = Array.isArray(currentValue)
      ? currentValue
      : currentValue
        ? [currentValue]
        : []
    const historyRows = Array.isArray(historyValue)
      ? historyValue
      : historyValue
        ? [historyValue]
        : []
    const currentIndex = currentRows.findIndex(row => clean(row?.seasonId) === seasonId)
    const historyIndex = historyRows.findIndex(row => clean(row?.seasonId) === seasonId)
    const sourceTarget = currentIndex >= 0
      ? 'current'
      : historyIndex >= 0
        ? 'history'
        : ''

    if (!sourceTarget) {
      return {
        birthTeamId,
        teamDocumentId: birthTeamId,
        seasonId,
        teamUrl,
        updated: false,
        reason: 'teamSeasonMissing',
      }
    }

    const fieldKey = sourceTarget
    const rows = sourceTarget === 'current' ? currentRows : historyRows
    const seasonIndex = sourceTarget === 'current' ? currentIndex : historyIndex
    const nextRows = rows.map((row, index) => (
      index === seasonIndex
        ? {
            ...row,
            teamUrl,
            updatedAt: new Date().toISOString(),
          }
        : row
    ))
    const originalValue = sourceTarget === 'current' ? currentValue : historyValue
    const nextValue = Array.isArray(originalValue)
      ? nextRows
      : nextRows[0] || originalValue

    transaction.set(
      ref,
      {
        [fieldKey]: nextValue,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    )

    return {
      birthTeamId,
      teamDocumentId: birthTeamId,
      seasonId,
      teamUrl,
      sourceTarget,
      updated: true,
    }
  })
}

export async function updateTeamSeasonPlayerUrl({
  season = {},
  team = {},
  player = {},
  playerUrl = '',
  target = 'current',
} = {}) {
  const teamId = resolveTeamLookupKey(team)
  const { seasonId, seasonKey } = normalizeSeasonIdentity({ season })
  if (!teamId) throw new Error('Missing birth team id')
  if (!seasonId) throw new Error('Missing season id')

  const ref = teamDocRef(teamId)
  const nextPlayerUrl = clean(player.playerUrl || playerUrl)
  const playerMatchValues = new Set(
    buildPlayerMatchValues(player)
      .map(value => clean(value).toLowerCase())
      .filter(Boolean)
  )

  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    const isHistory = clean(target) === 'history'
    const fieldKey = isHistory ? 'history' : 'current'

    if (!snapshot.exists()) {
      return {
        birthTeamDocumentId: teamId,
        teamDocumentId: teamId,
        seasonId,
        seasonKey,
        playerUrl: nextPlayerUrl,
        target: fieldKey,
        updated: false,
        reason: 'teamDocMissing',
      }
    }

    const currentData = snapshot.data() || {}
    const rows = Array.isArray(currentData[fieldKey]) ? currentData[fieldKey] : []
    const seasonIndex = rows.findIndex(row => isSameSeason(row, { seasonId, seasonKey }))

    if (seasonIndex === -1) {
      return {
        birthTeamDocumentId: teamId,
        teamDocumentId: teamId,
        seasonId,
        seasonKey,
        playerUrl: nextPlayerUrl,
        target: fieldKey,
        updated: false,
        reason: 'teamSeasonMissing',
      }
    }

    const seasonRow = rows[seasonIndex] || {}
    const teamPlayers = Array.isArray(seasonRow.teamPlayers)
      ? seasonRow.teamPlayers
      : []
    const playerIndex = teamPlayers.findIndex(row => (
      buildPlayerMatchValues(row)
        .map(value => clean(value).toLowerCase())
        .some(value => playerMatchValues.has(value))
    ))

    if (playerIndex === -1) {
      return {
        birthTeamDocumentId: teamId,
        teamDocumentId: teamId,
        seasonId,
        seasonKey,
        playerUrl: nextPlayerUrl,
        target: fieldKey,
        updated: false,
        reason: 'teamPlayerMissing',
      }
    }

    const nextPlayers = teamPlayers.map((row, index) => (
      index === playerIndex
        ? {
            ...row,
            playerUrl: nextPlayerUrl,
            updatedAt: new Date().toISOString(),
          }
        : row
    ))
    const nextRows = rows.map((row, index) => (
      index === seasonIndex
        ? {
            ...row,
            teamPlayers: nextPlayers,
            updatedAt: new Date().toISOString(),
          }
        : row
    ))

    transaction.set(
      ref,
      {
        [fieldKey]: nextRows,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    )

    return {
      birthTeamDocumentId: teamId,
      teamDocumentId: teamId,
      seasonId,
      seasonKey,
      playerUrl: nextPlayerUrl,
      target: fieldKey,
      playerDocumentId: clean(player.playerDocumentId),
      externalPlayerId: clean(player.externalPlayerId),
      updated: true,
    }
  })
}

export async function updateTeamSeasonPlayerStats({
  season = {},
  team = {},
  target = 'current',
  players = [],
} = {}) {
  const teamId = resolveTeamLookupKey(team)
  const seasonId = clean(season.seasonId)
  if (!teamId) throw new Error('Missing birth team id')
  if (!seasonId) throw new Error('Missing season id')

  const ref = teamDocRef(teamId)

  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    const currentData = snapshot.exists() ? snapshot.data() || {} : {}
    const baseDoc = buildTeamBaseDoc({ ...team, teamDocumentId: teamId }, currentData)
    const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
    const isHistory = clean(target) === 'history'
    const rows = isHistory ? baseDoc.history : baseDoc.current
    const existingSeason = (Array.isArray(rows) ? rows : [])
      .find(row => isSameSeason(row, { seasonId, seasonKey }))
    const baseSeasonDoc = existingSeason || buildTeamSeasonDoc({
      season: { ...season, seasonId, seasonKey },
      team: { ...team, birthTeamDocumentId: teamId, teamDocumentId: teamId },
      players: [],
    })
    const seasonDoc = {
      ...baseSeasonDoc,
      teamPlayers: mergeTeamPlayerStats({
        existingPlayers: baseSeasonDoc.teamPlayers,
        players,
      }),
      updatedAt: new Date().toISOString(),
    }
    const nextData = isHistory
      ? {
          ...baseDoc,
          history: upsertSeasonRows({
            rows: baseDoc.history,
            season: { seasonId, seasonKey },
            seasonDoc,
          }),
        }
      : {
          ...baseDoc,
          current: upsertSeasonRows({
            rows: baseDoc.current,
            season: { seasonId, seasonKey },
            seasonDoc,
          }),
        }

    transaction.set(ref, nextData, { merge: true })

    return {
      birthTeamDocumentId: teamId,
      teamDocumentId: teamId,
      seasonId,
      seasonKey,
      target: isHistory ? 'history' : 'current',
      rowsCount: (Array.isArray(players) ? players : []).length,
      playersCount: seasonDoc.teamPlayers.length,
    }
  })
}

const getTeamMetaUpdateIds = ({
  team = {},
  rows = [],
  teams = [],
} = {}) => {
  const candidates = [
    team,
    ...(Array.isArray(rows) ? rows : []),
    ...(Array.isArray(teams) ? teams : []),
  ]

  return [...new Set(candidates
    .map(row => clean(row.teamDocumentId || row.teamId))
    .filter(Boolean))]
}

export async function updateTeamSeasonsMetaMany({
  season = {},
  team = {},
  rows = [],
  teams = [],
  target = 'current',
  birthYear = null,
  leagueTotalRound = null,
} = {}) {
  const seasonId = clean(season.seasonId)
  if (!seasonId) throw new Error('Missing season id')

  const teamIds = getTeamMetaUpdateIds({ team, rows, teams })
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const isHistory = clean(target) === 'history'
  const fieldKey = isHistory ? 'history' : 'current'
  const results = []

  for (const teamId of teamIds) {
    const ref = teamDocRef(teamId)
    results.push(await runTransaction(db, async transaction => {
      const snapshot = await transaction.get(ref)
      if (!snapshot.exists()) {
        return {
          birthTeamDocumentId: teamId,
      teamDocumentId: teamId,
          updated: false,
          reason: 'teamDocMissing',
        }
      }

      const currentData = snapshot.data() || {}
      const rowsData = Array.isArray(currentData[fieldKey]) ? currentData[fieldKey] : []
      let updated = false
      const nextRows = rowsData.map(row => {
        if (!isSameSeason(row, { seasonId, seasonKey })) return row

        updated = true
        return {
          ...row,
          birthYear: toNumberOrZero(birthYear ?? season.birthYear),
          leagueTotalRound: toNumberOrZero(leagueTotalRound ?? season.leagueTotalRound),
          updatedAt: new Date().toISOString(),
        }
      })

      if (updated) {
        transaction.set(
          ref,
          {
            [fieldKey]: nextRows,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        )
      }

      return {
        birthTeamDocumentId: teamId,
      teamDocumentId: teamId,
        updated,
      }
    }))
  }

  return {
    rowsCount: results.length,
    updatedCount: results.filter(result => result.updated).length,
    results,
  }
}

export async function updateTeamSeasonPlayerScoutProfiles({
  season = {},
  team = {},
  target = 'current',
  player = {},
  scoutProfiles = [],
} = {}) {
  const teamId = resolveTeamLookupKey(team)
  const seasonId = clean(season.seasonId)
  const playerKey = getPlayerMergeKey(player)
  if (!teamId) throw new Error('Missing birth team id')
  if (!seasonId) throw new Error('Missing season id')
  if (!playerKey) throw new Error('Missing player id')

  const ref = teamDocRef(teamId)

  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) {
      return {
        birthTeamDocumentId: teamId,
      teamDocumentId: teamId,
        updated: false,
        reason: 'teamDocMissing',
        scoutProfilesSummary: { total: 0, profileCounts: {} },
      }
    }

    const currentData = snapshot.data() || {}
    const baseDoc = buildTeamBaseDoc({ ...team, teamDocumentId: teamId }, currentData)
    const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
    const isHistory = clean(target) === 'history'
    const fieldKey = isHistory ? 'history' : 'current'
    const rows = Array.isArray(baseDoc[fieldKey]) ? baseDoc[fieldKey] : []
    const nextRows = rows.map(row => {
      if (!isSameSeason(row, { seasonId, seasonKey })) return row

      return {
        ...row,
        teamPlayers: (Array.isArray(row.teamPlayers) ? row.teamPlayers : []).map(nextPlayer => (
          getPlayerMergeKey(nextPlayer) === playerKey
            ? {
                ...nextPlayer,
                scoutProfiles: Array.isArray(scoutProfiles) ? scoutProfiles : [],
                updatedAt: new Date().toISOString(),
              }
            : nextPlayer
        )),
        updatedAt: new Date().toISOString(),
      }
    })
    const seasonDoc = nextRows.find(row => isSameSeason(row, { seasonId, seasonKey })) || null
    const teamPlayers = Array.isArray(seasonDoc?.teamPlayers) ? seasonDoc.teamPlayers : []
    const profileCounts = {}
    let total = 0

    teamPlayers.forEach(nextPlayer => {
      const profiles = Array.isArray(nextPlayer.scoutProfiles) ? nextPlayer.scoutProfiles : []
      if (!profiles.length) return

      total += 1
      profiles.forEach(profile => {
        const profileId = clean(profile.profileId)
        if (!profileId) return
        profileCounts[profileId] = (profileCounts[profileId] || 0) + 1
      })
    })

    transaction.set(
      ref,
      {
        [fieldKey]: nextRows,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    )

    return {
      birthTeamDocumentId: teamId,
      teamDocumentId: teamId,
      updated: true,
      scoutProfilesSummary: {
        total,
        profileCounts,
      },
    }
  })
}

export async function updateTeamSeasonPlayerRole({
  season = {},
  team = {},
  target = 'current',
  player = {},
  primaryPosition = '',
  positionLayer = '',
  numShirt = '',
} = {}) {
  const teamId = resolveTeamLookupKey(team)
  const seasonId = clean(season.seasonId)
  const playerKey = getPlayerMergeKey(player)
  if (!teamId) throw new Error('Missing birth team id')
  if (!seasonId) throw new Error('Missing season id')
  if (!playerKey) throw new Error('Missing player id')

  const ref = teamDocRef(teamId)

  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) {
      return {
        birthTeamDocumentId: teamId,
      teamDocumentId: teamId,
        updated: false,
        reason: 'teamDocMissing',
      }
    }

    const currentData = snapshot.data() || {}
    const baseDoc = buildTeamBaseDoc({ ...team, teamDocumentId: teamId }, currentData)
    const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
    const isHistory = clean(target) === 'history'
    const fieldKey = isHistory ? 'history' : 'current'
    const rows = Array.isArray(baseDoc[fieldKey]) ? baseDoc[fieldKey] : []
    let playerUpdated = false
    const nextRows = rows.map(row => {
      if (!isSameSeason(row, { seasonId, seasonKey })) return row

      return {
        ...row,
        teamPlayers: (Array.isArray(row.teamPlayers) ? row.teamPlayers : []).map(nextPlayer => {
          if (getPlayerMergeKey(nextPlayer) !== playerKey) return nextPlayer

          playerUpdated = true
          return {
            ...nextPlayer,
            primaryPosition: clean(primaryPosition),
            positionLayer: clean(positionLayer),
            numShirt: clean(numShirt),
            updatedAt: new Date().toISOString(),
          }
        }),
        updatedAt: new Date().toISOString(),
      }
    })

    transaction.set(
      ref,
      {
        [fieldKey]: nextRows,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    )

    return {
      birthTeamDocumentId: teamId,
      teamDocumentId: teamId,
      seasonId,
      seasonKey,
      target: isHistory ? 'history' : 'current',
      updated: playerUpdated,
    }
  })
}

export async function updateTeamSeasonPlayerRoleAndScoutProfiles({
  season = {},
  team = {},
  target = 'current',
  player = {},
  primaryPosition = '',
  positionLayer = '',
  numShirt = '',
  scoutProfiles = [],
} = {}) {
  const teamId = resolveTeamLookupKey(team)
  const seasonId = clean(season.seasonId)
  const playerKey = getPlayerMergeKey(player)
  if (!teamId) throw new Error('Missing birth team id')
  if (!seasonId) throw new Error('Missing season id')
  if (!playerKey) throw new Error('Missing player id')

  const ref = teamDocRef(teamId)

  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) {
      return {
        birthTeamDocumentId: teamId,
        teamDocumentId: teamId,
        updated: false,
        reason: 'teamDocMissing',
        scoutProfilesSummary: { total: 0, profileCounts: {} },
      }
    }

    const currentData = snapshot.data() || {}
    const baseDoc = buildTeamBaseDoc({ ...team, teamDocumentId: teamId }, currentData)
    const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
    const isHistory = clean(target) === 'history'
    const fieldKey = isHistory ? 'history' : 'current'
    const rows = Array.isArray(baseDoc[fieldKey]) ? baseDoc[fieldKey] : []
    let playerUpdated = false
    const updatedAt = new Date().toISOString()
    const safeScoutProfiles = Array.isArray(scoutProfiles) ? scoutProfiles : []

    const nextRows = rows.map(row => {
      if (!isSameSeason(row, { seasonId, seasonKey })) return row

      return {
        ...row,
        teamPlayers: (Array.isArray(row.teamPlayers) ? row.teamPlayers : []).map(nextPlayer => {
          if (getPlayerMergeKey(nextPlayer) !== playerKey) return nextPlayer

          playerUpdated = true
          return {
            ...nextPlayer,
            primaryPosition: clean(primaryPosition),
            positionLayer: clean(positionLayer),
            numShirt: clean(numShirt),
            scoutProfiles: safeScoutProfiles,
            updatedAt,
          }
        }),
        updatedAt,
      }
    })

    const seasonDoc = nextRows.find(row => isSameSeason(row, { seasonId, seasonKey })) || null
    const teamPlayers = Array.isArray(seasonDoc?.teamPlayers) ? seasonDoc.teamPlayers : []
    const profileCounts = {}
    let total = 0

    teamPlayers.forEach(nextPlayer => {
      const profiles = Array.isArray(nextPlayer.scoutProfiles) ? nextPlayer.scoutProfiles : []
      if (!profiles.length) return

      total += 1
      profiles.forEach(profile => {
        const profileId = clean(profile.profileId)
        if (!profileId) return
        profileCounts[profileId] = (profileCounts[profileId] || 0) + 1
      })
    })

    if (playerUpdated) {
      transaction.set(
        ref,
        {
          [fieldKey]: nextRows,
          updatedAt,
        },
        { merge: true }
      )
    }

    return {
      birthTeamDocumentId: teamId,
      teamDocumentId: teamId,
      seasonId,
      seasonKey,
      target: isHistory ? 'history' : 'current',
      updated: playerUpdated,
      scoutProfilesSummary: {
        total,
        profileCounts,
      },
    }
  })
}
