// features/playersDatabase/services/write/teams/teamSeasonPlayer.js

import { runTransaction } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { buildSeasonKey, clean } from '../leagues/leagueDoc.js'
import { buildPlayerMatchValues } from '../../../model/playerIdentity.model.js'
import { isSameSeason, normalizeSeasonIdentity } from '../../../model/season.model.js'
import { resolveTeamLookupKey } from '../../../model/teamIdentity.model.js'
import { buildTeamBaseDoc, teamDocRef } from './teamDoc.js'
import { getPlayerMergeKey } from './teamSeason.model.js'

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
