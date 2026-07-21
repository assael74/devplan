// features/playersDatabase/services/write/teams/teamDelete.js

import { runTransaction } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { clean } from '../leagues/leagueDoc.js'
import { buildPlayerMatchValues } from '../../../model/playerIdentity.model.js'
import {
  isSameSeason,
  normalizeSeasonIdentity,
} from '../../../model/season.model.js'
import { resolveTeamLookupKey } from '../../../model/teamIdentity.model.js'
import { buildTeamBaseDoc, teamDocRef } from './teamDoc.js'

const getPlayerMergeKey = player => (
  buildPlayerMatchValues(player)[0] || ''
).toLowerCase()

export const buildTeamPlayersScoutProfilesSummary = (players = []) => {
  const profileCounts = {}
  let total = 0

  ;(Array.isArray(players) ? players : []).forEach(player => {
    const profiles = Array.isArray(player?.scoutProfiles) ? player.scoutProfiles : []
    if (!profiles.length) return

    total += 1
    profiles.forEach(profile => {
      const profileId = clean(profile?.profileId)
      if (!profileId) return

      profileCounts[profileId] = (profileCounts[profileId] || 0) + 1
    })
  })

  return {
    total,
    profileCounts,
  }
}

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

  return runTransaction(db, async transaction => {
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
    const baseDoc = buildTeamBaseDoc({ ...team, birthTeamDocumentId: teamId, teamDocumentId: teamId }, currentData)
    const isHistory = clean(target) === 'history'
    const fieldKey = isHistory ? 'history' : 'current'
    const rows = Array.isArray(baseDoc[fieldKey]) ? baseDoc[fieldKey] : []
    const nextRows = removeSeasonRows({ rows, season: { seasonId, seasonKey } })

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

  return runTransaction(db, async transaction => {
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
    const baseDoc = buildTeamBaseDoc({ ...team, birthTeamDocumentId: teamId, teamDocumentId: teamId }, currentData)
    const isHistory = clean(target) === 'history'
    const fieldKey = isHistory ? 'history' : 'current'
    const rows = Array.isArray(baseDoc[fieldKey]) ? baseDoc[fieldKey] : []
    const nextRows = rows.map(row => {
      if (!isSameSeason(row, { seasonId, seasonKey })) return row

      return {
        ...row,
        teamPlayers: (Array.isArray(row.teamPlayers) ? row.teamPlayers : [])
          .filter(nextPlayer => getPlayerMergeKey(nextPlayer) !== playerKey),
        updatedAt: new Date().toISOString(),
      }
    })
    const seasonRow = nextRows.find(row => isSameSeason(row, { seasonId, seasonKey })) || null
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

