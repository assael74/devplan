// src/features/playersDatabase/services/write/teams/teamSeasonPlayer.js



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
import { buildPlayerScoutState } from '../../../domain/orchestration/buildPlayerScoutState.js'
import { removePlayerScoutProfileFromComputedState } from '../../../domain/orchestration/mutatePlayerScoutProfileState.js'
import { normalizePlayerScoutStory } from '../players/playerDoc.model.js'

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
  teamDocument = null,
  player = null,
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
  ...(teamDocument ? { teamDocument } : {}),
  ...(player ? { player } : {}),
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
    let updatedPlayer = null

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

        const nextUpdatedPlayer = {
          ...nextPlayer,
          ...buildPatch(nextPlayer, row, baseDoc),
          updatedAt,
        }
        updatedPlayer = nextUpdatedPlayer

        return nextUpdatedPlayer
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

    const nextTeamDocument = playerUpdated
      ? {
          ...baseDoc,
          [fieldKey]: nextRows,
          updatedAt,
        }
      : baseDoc

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
      teamDocument: nextTeamDocument,
      player: updatedPlayer,
    })
  })
}


export async function removeTeamSeasonPlayerScoutProfile({ profileId = '', player = {}, ...payload } = {}) {
  const removeProfileId = clean(profileId)
  if (!removeProfileId) throw new Error('Missing scout profile id')

  return patchTeamSeasonPlayer({
    ...payload,
    includeScoutSummary: true,
    player,
    buildPatch: currentPlayer => {
      const nextPlayer = removePlayerScoutProfileFromComputedState({
        player: currentPlayer,
        profileId: removeProfileId,
      })

      return {
        scoutProfiles: Array.isArray(nextPlayer.scoutProfiles)
          ? nextPlayer.scoutProfiles
          : [],
        scoutCombinations: Array.isArray(nextPlayer.scoutCombinations)
          ? nextPlayer.scoutCombinations
          : [],
        bestScoutSignal: null,
        ...normalizePlayerScoutStory(nextPlayer),
      }
    },
  })
}


export async function updateTeamSeasonPlayerVerificationAndScout({
  season = {},
  team = {},
  target = 'current',
  player = {},
  verificationAnswers = [],
  ...payload
} = {}) {
  return patchTeamSeasonPlayer({
    ...payload,
    season,
    team,
    target,
    player,
    includeScoutSummary: true,
    buildPatch: (currentPlayer, seasonRow) => {
      const calculatedPlayer = buildPlayerScoutState({
        player: currentPlayer,
        team: {
          ...team,
          ...seasonRow,
        },
        season: {
          ...season,
          ...seasonRow,
        },
        perspective: 'players_database_verification_update',
        verificationAnswers: Array.isArray(verificationAnswers)
          ? verificationAnswers
          : [],
      })

      return {
        scoutProfiles: Array.isArray(calculatedPlayer.scoutProfiles)
          ? calculatedPlayer.scoutProfiles
          : [],
        scoutCombinations: Array.isArray(calculatedPlayer.scoutCombinations)
          ? calculatedPlayer.scoutCombinations
          : [],
        bestScoutSignal: null,
        ...normalizePlayerScoutStory(calculatedPlayer),
      }
    },
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
  ...payload
} = {}) {
  return patchTeamSeasonPlayer({
    ...payload,
    season,
    team,
    target,
    player,
    includeScoutSummary: true,
    buildPatch: (currentPlayer, seasonRow) => {
      const rolePlayer = {
        ...currentPlayer,
        primaryPosition: clean(primaryPosition),
        positionLayer: clean(positionLayer),
        numShirt: clean(numShirt),
      }
      const calculatedPlayer = buildPlayerScoutState({
        player: rolePlayer,
        team: {
          ...team,
          ...seasonRow,
        },
        season: {
          ...season,
          ...seasonRow,
        },
        perspective: 'players_database_role_update',
      })

      return {
        primaryPosition: calculatedPlayer.primaryPosition,
        positionLayer: calculatedPlayer.positionLayer,
        numShirt: calculatedPlayer.numShirt,
        scoutProfiles: Array.isArray(calculatedPlayer.scoutProfiles)
          ? calculatedPlayer.scoutProfiles
          : [],
        scoutCombinations: Array.isArray(calculatedPlayer.scoutCombinations)
          ? calculatedPlayer.scoutCombinations
          : [],
        bestScoutSignal: null,
        ...normalizePlayerScoutStory(calculatedPlayer),
      }
    },
  })
}
