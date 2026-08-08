// features/playersDatabase/services/write/teams/teamSeasonPlayer.js



import { db } from '../../../../../services/firebase/firebase.js'
import {
  buildSeasonKey,
  clean,
} from '../leagues/leagueDoc.js'
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
import { getPlayerMergeKey } from './teamSeason.model.js'

import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
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

  return trackedRunTransaction(db, async transaction => {
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
    const seasonIndex = rows.findIndex(row => isSameSeason(row, {
      seasonId,
      seasonKey,
    }))

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

const buildTeamPlayerUpdateResult = ({
  teamId,
  seasonId,
  seasonKey,
  target,
  updated,
  scoutProfilesSummary,
  reason = '',
}) => ({
  birthTeamDocumentId: teamId,
  teamDocumentId: teamId,
  seasonId,
  seasonKey,
  target,
  updated,
  ...(reason ? { reason } : {}),
  ...(scoutProfilesSummary
    ? { scoutProfilesSummary }
    : {}),
})

const patchTeamSeasonPlayer = async ({
  season = {},
  team = {},
  target = 'current',
  player = {},
  buildPatch,
  includeScoutSummary = false,
} = {}) => {
  const teamId = resolveTeamLookupKey(team)
  const seasonId = clean(season.seasonId)
  const playerKey = getPlayerMergeKey(player)

  if (!teamId) throw new Error('Missing birth team id')
  if (!seasonId) throw new Error('Missing season id')
  if (!playerKey) throw new Error('Missing player id')
  if (typeof buildPatch !== 'function') {
    throw new Error('Missing team player patch builder')
  }

  const ref = teamDocRef(teamId)

  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
    const isHistory = clean(target) === 'history'
    const fieldKey = isHistory ? 'history' : 'current'

    if (!snapshot.exists()) {
      return buildTeamPlayerUpdateResult({
        teamId,
        seasonId,
        seasonKey,
        target: fieldKey,
        updated: false,
        reason: 'teamDocMissing',
        scoutProfilesSummary: includeScoutSummary
          ? {
            total: 0,
            profileCounts: {},
          }
          : null,
      })
    }

    const currentData = snapshot.data() || {}
    const baseDoc = buildTeamBaseDoc(
      {
        ...team,
        teamDocumentId: teamId,
      },
      currentData
    )
    const rows = Array.isArray(baseDoc[fieldKey])
      ? baseDoc[fieldKey]
      : []
    const updatedAt = new Date().toISOString()
    let playerUpdated = false

    const nextRows = rows.map(row => {
      if (!isSameSeason(row, {
        seasonId,
        seasonKey,
      })) return row

      const teamPlayers = Array.isArray(row.teamPlayers)
        ? row.teamPlayers
        : []
      const nextPlayers = teamPlayers.map(nextPlayer => {
        if (getPlayerMergeKey(nextPlayer) !== playerKey) {
          return nextPlayer
        }

        playerUpdated = true

        return {
          ...nextPlayer,
          ...buildPatch(nextPlayer),
          updatedAt,
        }
      })

      return {
        ...row,
        teamPlayers: nextPlayers,
        updatedAt,
      }
    })

    const seasonDoc = nextRows.find(row => (
      isSameSeason(row, {
        seasonId,
        seasonKey,
      })
    )) || null
    const teamPlayers = Array.isArray(seasonDoc?.teamPlayers)
      ? seasonDoc.teamPlayers
      : []
    const scoutProfilesSummary = includeScoutSummary
      ? buildScoutProfilesSummary(teamPlayers)
      : null

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

    return buildTeamPlayerUpdateResult({
      teamId,
      seasonId,
      seasonKey,
      target: fieldKey,
      updated: playerUpdated,
      scoutProfilesSummary,
    })
  })
}

export async function updateTeamSeasonPlayerScoutProfiles({
  scoutProfiles = [],
  scoutCombinations = [],
  ...payload
} = {}) {
  const safeScoutProfiles = Array.isArray(scoutProfiles)
    ? scoutProfiles
    : []
  const safeScoutCombinations = Array.isArray(scoutCombinations)
    ? scoutCombinations
    : []

  return patchTeamSeasonPlayer({
    ...payload,
    includeScoutSummary: true,
    buildPatch: () => ({
      scoutProfiles: safeScoutProfiles,
      scoutCombinations: safeScoutCombinations,
    }),
  })
}

export async function updateTeamSeasonPlayerRole({
  primaryPosition = '',
  positionLayer = '',
  numShirt = '',
  ...payload
} = {}) {
  return patchTeamSeasonPlayer({
    ...payload,
    buildPatch: () => ({
      primaryPosition: clean(primaryPosition),
      positionLayer: clean(positionLayer),
      numShirt: clean(numShirt),
    }),
  })
}

export async function updateTeamSeasonPlayerRoleAndScoutProfiles({
  primaryPosition = '',
  positionLayer = '',
  numShirt = '',
  scoutProfiles = [],
  scoutCombinations = [],
  ...payload
} = {}) {
  const safeScoutProfiles = Array.isArray(scoutProfiles)
    ? scoutProfiles
    : []
  const safeScoutCombinations = Array.isArray(scoutCombinations)
    ? scoutCombinations
    : []

  return patchTeamSeasonPlayer({
    ...payload,
    includeScoutSummary: true,
    buildPatch: () => ({
      primaryPosition: clean(primaryPosition),
      positionLayer: clean(positionLayer),
      numShirt: clean(numShirt),
      scoutProfiles: safeScoutProfiles,
      scoutCombinations: safeScoutCombinations,
    }),
  })
}
