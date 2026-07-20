// features/playersDatabase/services/write/teams/teamSeason.js

import { runTransaction } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { buildSeasonKey, clean, toNumberOrZero } from '../leagues/leagueDoc.js'
import {
  buildPlayerDocumentId,
  hasPlayerScoutProfiles,
  normalizePlayerScoutProfiles,
} from '../players/index.js'
import { buildTeamBaseDoc, teamDocRef } from './teamDoc.js'

const isSameSeason = (row = {}, season = {}) => {
  const rowSeasonKey = clean(row?.seasonKey)
  const rowSeasonId = clean(row?.seasonId)
  const seasonKey = clean(season?.seasonKey)
  const seasonId = clean(season?.seasonId)

  return Boolean(
    (seasonKey && rowSeasonKey === seasonKey) ||
    (seasonId && rowSeasonId === seasonId)
  )
}

const normalizePlayerName = value =>
  clean(value).toLowerCase()

const normalizeIdPart = value =>
  normalizePlayerName(value)
    .replace(/[^0-9a-zA-Z\u0590-\u05FF]+/g, '_')
    .replace(/^_+|_+$/g, '')

const buildInternalPlayerId = ({
  player = {},
  season = {},
} = {}) => {
  const existingPlayerId = clean(player.playerId)
  if (existingPlayerId) return existingPlayerId

  const birthYear = clean(player.birthYear || season.birthYear)
  const externalPlayerId = clean(player.externalPlayerId)
  const fallbackName = normalizeIdPart(player.normalizedName || player.fullName)
  const sourceId = externalPlayerId || fallbackName

  return ['player', birthYear, sourceId]
    .map(normalizeIdPart)
    .filter(Boolean)
    .join('__')
}

const normalizeTeamPlayer = (player, season = {}) => ({
  playerId: buildInternalPlayerId({ player, season }),
  playerDocumentId: hasPlayerScoutProfiles(player) ? buildPlayerDocumentId(player) : clean(player.playerDocumentId),
  externalPlayerId: clean(player.externalPlayerId),
  fullName: clean(player.fullName),
  normalizedName: normalizePlayerName(player.normalizedName || player.fullName),
  playerUrl: clean(player.playerUrl),
  notes: clean(player.notes),
  primaryPosition: clean(player.primaryPosition),
  positionLayer: clean(player.positionLayer),
  numShirt: clean(player.numShirt),
  playerStats: {
    games: toNumberOrZero(player.playerStats?.games ?? player.games),
    goals: toNumberOrZero(player.playerStats?.goals ?? player.goals),
    yellowCards: toNumberOrZero(player.playerStats?.yellowCards ?? player.yellowCards),
    minutes: toNumberOrZero(player.playerStats?.minutes ?? player.minutes),
    starts: toNumberOrZero(player.playerStats?.starts ?? player.starts),
    substituteIn: toNumberOrZero(player.playerStats?.substituteIn ?? player.substituteIn),
    substitutedOut: toNumberOrZero(player.playerStats?.substitutedOut ?? player.substitutedOut),
  },
  scoutProfiles: normalizePlayerScoutProfiles(player),
  updatedAt: new Date().toISOString(),
})

const getPlayerMergeKey = player =>
  clean(player.externalPlayerId || player.normalizedName || player.fullName).toLowerCase()

const mergeTeamPlayerStats = ({
  existingPlayers = [],
  players = [],
} = {}) => {
  const playerStatsByKey = (Array.isArray(players) ? players : [])
    .map(normalizeTeamPlayer)
    .reduce((acc, player) => {
      const key = getPlayerMergeKey(player)
      if (!key) return acc

      acc[key] = player
      return acc
    }, {})
  const touchedKeys = new Set()
  const nextPlayers = (Array.isArray(existingPlayers) ? existingPlayers : []).map(player => {
    const key = getPlayerMergeKey(player)
    const statsPlayer = playerStatsByKey[key]
    if (!statsPlayer) return player

    touchedKeys.add(key)
    return {
      ...player,
      playerDocumentId: statsPlayer.playerDocumentId || player.playerDocumentId || '',
      playerStats: {
        ...(player.playerStats || {}),
        ...statsPlayer.playerStats,
      },
      scoutProfiles: statsPlayer.scoutProfiles,
      updatedAt: new Date().toISOString(),
    }
  })
  const newPlayers = Object.entries(playerStatsByKey)
    .filter(([key]) => !touchedKeys.has(key))
    .map(([, player]) => player)

  return [...nextPlayers, ...newPlayers]
}

const buildTeamSeasonDoc = ({
  season = {},
  team = {},
  players = [],
} = {}) => {
  const rawSeasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(rawSeasonId)
  const seasonId = rawSeasonId || seasonKey

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
      points: toNumberOrZero(team.teamStats?.points ?? team.points),
      goalsFor: toNumberOrZero(team.teamStats?.goalsFor ?? team.goalsFor),
      goalsAgainst: toNumberOrZero(team.teamStats?.goalsAgainst ?? team.goalsAgainst),
      teamGamePlayed: toNumberOrZero(team.teamStats?.teamGamePlayed ?? team.teamGamePlayed),
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
  const teamId = clean(team.birthTeamDocumentId || team.birthTeamId || team.teamDocumentId || team.teamId)
  const rawSeasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(rawSeasonId)
  const seasonId = rawSeasonId || seasonKey
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
  target = 'current',
} = {}) {
  const teamId = clean(team.birthTeamDocumentId || team.birthTeamId || team.teamDocumentId || team.teamId)
  const seasonId = clean(season.seasonId)
  if (!teamId) throw new Error('Missing birth team id')
  if (!seasonId) throw new Error('Missing season id')

  const ref = teamDocRef(teamId)

  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) {
      return {
        birthTeamDocumentId: teamId,
      teamDocumentId: teamId,
        seasonId,
        seasonKey: clean(season.seasonKey) || buildSeasonKey(seasonId),
        teamUrl: clean(team.teamUrl),
        target: clean(target) === 'history' ? 'history' : 'current',
        updated: false,
        reason: 'teamDocMissing',
      }
    }

    const currentData = snapshot.data() || {}
    const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
    const isHistory = clean(target) === 'history'
    const fieldKey = isHistory ? 'history' : 'current'
    const rows = Array.isArray(currentData[fieldKey]) ? currentData[fieldKey] : []
    const seasonIndex = rows.findIndex(row => isSameSeason(row, { seasonId, seasonKey }))

    if (seasonIndex === -1) {
      return {
        birthTeamDocumentId: teamId,
      teamDocumentId: teamId,
        seasonId,
        seasonKey,
        teamUrl: clean(team.teamUrl),
        target: isHistory ? 'history' : 'current',
        updated: false,
        reason: 'teamSeasonMissing',
      }
    }

    const nextRows = rows.map((row, index) => (
      index === seasonIndex
        ? {
            ...row,
            teamUrl: clean(team.teamUrl),
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
      teamUrl: clean(team.teamUrl),
      target: isHistory ? 'history' : 'current',
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
  const teamId = clean(team.birthTeamDocumentId || team.birthTeamId || team.teamDocumentId || team.teamId)
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
  const teamId = clean(team.birthTeamDocumentId || team.birthTeamId || team.teamDocumentId || team.teamId)
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
  const teamId = clean(team.birthTeamDocumentId || team.birthTeamId || team.teamDocumentId || team.teamId)
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


