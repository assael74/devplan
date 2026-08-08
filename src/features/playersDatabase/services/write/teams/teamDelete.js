// features/playersDatabase/services/write/teams/teamDelete.js



import { db } from '../../../../../services/firebase/firebase.js'
import { clean } from '../leagues/leagueDoc.js'
import { buildPlayerMatchValues } from '../../../model/playerIdentity.model.js'
import { buildScoutProfilesSummary } from '../../../model/scoutProfilesSummary.model.js'
import {
  isSameSeason,
  normalizeSeasonIdentity,
} from '../../../model/season.model.js'
import { resolveTeamLookupKey } from '../../../model/teamIdentity.model.js'
import {
  buildTeamBaseDoc,
  teamDocRef,
} from './teamDoc.js'

import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
const getPlayerMergeKey = player => (
  buildPlayerMatchValues(player)[0] || ''
).toLowerCase()

export const buildTeamPlayersScoutProfilesSummary = buildScoutProfilesSummary

const resolvePlayerDocumentIds = players => Array.from(new Set(
  (Array.isArray(players) ? players : [])
    .map(player => clean(
      player?.playerDocumentId ||
      player?.documentId
    ))
    .filter(Boolean)
))

const removeSeasonRows = ({ rows = [], season = {} } = {}) =>
  (Array.isArray(rows) ? rows : []).filter(row => !isSameSeason(row, season))

export async function removeTeamSeason({
  season = {},
  team = {},
  target = 'current',
} = {}) {
  const teamId = resolveTeamLookupKey(team)
  const { seasonId, seasonKey } = normalizeSeasonIdentity({ season })
  if (!teamId) throw new Error('Missing birth team id')
  if (!seasonId) throw new Error('Missing season id')

  const ref = teamDocRef(teamId)

  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) {
      return {
        birthTeamDocumentId: teamId,
        teamDocumentId: teamId,
        seasonId,
        seasonKey,
        removed: false,
        reason: 'teamDocMissing',
      }
    }

    const currentData = snapshot.data() || {}
    const baseDoc = buildTeamBaseDoc({
      ...team,
      birthTeamDocumentId: teamId,
      teamDocumentId: teamId,
    }, currentData)
    const isHistory = clean(target) === 'history'
    const fieldKey = isHistory ? 'history' : 'current'
    const rows = Array.isArray(baseDoc[fieldKey]) ? baseDoc[fieldKey] : []
    const removedRows = rows.filter(row => (
      isSameSeason(row, {
        seasonId,
        seasonKey,
      })
    ))
    const removedPlayers = removedRows.flatMap(row => (
      Array.isArray(row.teamPlayers) ? row.teamPlayers : []
    ))
    const playerDocumentIds = resolvePlayerDocumentIds(removedPlayers)
    const nextRows = removeSeasonRows({
      rows,
      season: {
        seasonId,
        seasonKey,
      },
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
      removed: nextRows.length !== rows.length,
      removedPlayersCount: removedPlayers.length,
      playerDocumentIds,
    }
  })
}

export async function removeTeamPlayerFromSeason({
  season = {},
  team = {},
  target = 'current',
  player = {},
} = {}) {
  const teamId = resolveTeamLookupKey(team)
  const { seasonId, seasonKey } = normalizeSeasonIdentity({ season })
  const playerKey = getPlayerMergeKey(player)
  if (!teamId) throw new Error('Missing birth team id')
  if (!seasonId) throw new Error('Missing season id')
  if (!playerKey) throw new Error('Missing player id')

  const ref = teamDocRef(teamId)

  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) {
      return {
        birthTeamDocumentId: teamId,
        teamDocumentId: teamId,
        seasonId,
        seasonKey,
        removed: false,
        reason: 'teamDocMissing',
        playersCount: 0,
        scoutProfilesSummary: buildTeamPlayersScoutProfilesSummary([]),
      }
    }

    const currentData = snapshot.data() || {}
    const baseDoc = buildTeamBaseDoc({
      ...team,
      birthTeamDocumentId: teamId,
      teamDocumentId: teamId,
    }, currentData)
    const isHistory = clean(target) === 'history'
    const fieldKey = isHistory ? 'history' : 'current'
    const rows = Array.isArray(baseDoc[fieldKey]) ? baseDoc[fieldKey] : []
    const nextRows = rows.map(row => {
      if (!isSameSeason(row, {
        seasonId,
        seasonKey,
      })) return row

      return {
        ...row,
        teamPlayers: (Array.isArray(row.teamPlayers) ? row.teamPlayers : [])
          .filter(nextPlayer => getPlayerMergeKey(nextPlayer) !== playerKey),
        updatedAt: new Date().toISOString(),
      }
    })
    const seasonRow = nextRows.find(row => isSameSeason(row, {
      seasonId,
      seasonKey,
    })) || null
    const teamPlayers = Array.isArray(seasonRow?.teamPlayers) ? seasonRow.teamPlayers : []

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
      removed: true,
      playersCount: teamPlayers.length,
      scoutProfilesSummary: buildTeamPlayersScoutProfilesSummary(teamPlayers),
    }
  })
}


export async function clearTeamSeasonPlayers({
  season = {},
  team = {},
  target = 'current',
} = {}) {
  const teamId = resolveTeamLookupKey(team)
  const { seasonId, seasonKey } = normalizeSeasonIdentity({ season })
  if (!teamId) throw new Error('Missing birth team id')
  if (!seasonId) throw new Error('Missing season id')

  const ref = teamDocRef(teamId)

  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) {
      return {
        birthTeamDocumentId: teamId,
        teamDocumentId: teamId,
        seasonId,
        seasonKey,
        updated: false,
        reason: 'teamDocMissing',
        removedPlayersCount: 0,
      }
    }

    const currentData = snapshot.data() || {}
    const baseDoc = buildTeamBaseDoc(
      {
        ...team,
        birthTeamDocumentId: teamId,
        teamDocumentId: teamId,
      },
      currentData
    )
    const isHistory = clean(target) === 'history'
    const fieldKey = isHistory ? 'history' : 'current'
    const rows = Array.isArray(baseDoc[fieldKey]) ? baseDoc[fieldKey] : []
    let removedPlayersCount = 0
    let removedPlayers = []
    let seasonFound = false

    const nextRows = rows.map(row => {
      if (!isSameSeason(row, {
        seasonId,
        seasonKey,
      })) return row

      seasonFound = true
      removedPlayers = Array.isArray(row.teamPlayers)
        ? row.teamPlayers
        : []
      removedPlayersCount = removedPlayers.length

      return {
        ...row,
        teamPlayers: [],
        playersCount: 0,
        playerSeasonIndexCount: 0,
        scoutProfiledPlayersCount: 0,
        scoutProfilesSummary: {
          total: 0,
          profileCounts: {},
        },
        updatedAt: new Date().toISOString(),
      }
    })

    if (!seasonFound) {
      return {
        birthTeamDocumentId: teamId,
        teamDocumentId: teamId,
        seasonId,
        seasonKey,
        target: isHistory ? 'history' : 'current',
        updated: false,
        reason: 'teamSeasonMissing',
        removedPlayersCount: 0,
      }
    }

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
      updated: true,
      removedPlayersCount,
      playerDocumentIds: resolvePlayerDocumentIds(removedPlayers),
      playersCount: 0,
      scoutProfilesSummary: {
        total: 0,
        profileCounts: {},
      },
    }
  })
}
