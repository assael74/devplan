// src/features/playersDatabase/services/writeV2/stats/support/applyApprovedClearStatsTeamSeason.js

import {
  CLEAR_STATS_SET_FIELDS,
  CLEAR_STATS_TEAM_SET_FIELDS,
} from '../../../../domain/statsV2/clearStatsApprovedState.builder.js'
import {
  STATS_OWNED_RICH_SCOUT_FIELDS,
} from '../../../../domain/statsV2/statsAbsence.builder.js'
import { resolveStatsPlayerIdentityKey } from '../../../../domain/statsV2/statsReloadDecision.builder.js'

const CLEAR_STATS_SET_FIELD_SET = new Set(CLEAR_STATS_SET_FIELDS)
const CLEAR_STATS_UNSET_FIELD_SET = new Set(STATS_OWNED_RICH_SCOUT_FIELDS)
const CLEAR_STATS_TEAM_SET_FIELD_SET = new Set(CLEAR_STATS_TEAM_SET_FIELDS)

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const clone = value => JSON.parse(JSON.stringify(value))

const fail = (code, message) => {
  const error = new Error(message)
  error.code = code
  throw error
}

const buildPlayerLookup = players => {
  const lookup = new Map()

  ;(Array.isArray(players) ? players : []).forEach(player => {
    const playerKey = clean(resolveStatsPlayerIdentityKey(player))

    if (!playerKey || lookup.has(playerKey)) {
      fail(
        'CLEAR_STATS_CURRENT_PLAYER_IDENTITY_INVALID',
        'Current Team Season player identities must be complete and unique'
      )
    }

    lookup.set(playerKey, player)
  })

  return lookup
}

export const applyApprovedClearStatsTeamSeason = ({
  currentSeason = {},
  canonicalMutation = {},
} = {}) => {
  const nextSeason = clone(currentSeason)
  const nextPlayers = Array.isArray(nextSeason.teamPlayers)
    ? nextSeason.teamPlayers
    : []
  const playerLookup = buildPlayerLookup(nextPlayers)
  const patches = Array.isArray(canonicalMutation.playerOwnedPatches)
    ? canonicalMutation.playerOwnedPatches
    : []

  patches.forEach(patch => {
    const playerKey = clean(patch?.playerKey)
    const currentPlayer = playerLookup.get(playerKey)

    if (!playerKey || !currentPlayer) {
      fail(
        'CLEAR_STATS_PLAYER_PATCH_TARGET_NOT_FOUND',
        `CLEAR_STATS player patch target was not found: ${playerKey || 'missing'}`
      )
    }

    const unsetFields = Array.isArray(patch.unsetFields)
      ? patch.unsetFields
      : []
    const setFields = patch.setFields || {}

    unsetFields.forEach(field => {
      if (!CLEAR_STATS_UNSET_FIELD_SET.has(field)) {
        fail(
          'CLEAR_STATS_UNSET_FIELD_NOT_ALLOWED',
          `CLEAR_STATS cannot unset non-Stats field: ${field}`
        )
      }
    })

    Object.keys(setFields).forEach(field => {
      if (!CLEAR_STATS_SET_FIELD_SET.has(field)) {
        fail(
          'CLEAR_STATS_SET_FIELD_NOT_ALLOWED',
          `CLEAR_STATS cannot set non-Stats field: ${field}`
        )
      }
    })

    unsetFields.forEach(field => {
      delete currentPlayer[field]
    })

    Object.entries(setFields).forEach(([field, value]) => {
      currentPlayer[field] = clone(value)
    })
  })

  const teamOwnedSetFields = canonicalMutation.teamOwnedSetFields || {}

  Object.keys(teamOwnedSetFields).forEach(field => {
    if (!CLEAR_STATS_TEAM_SET_FIELD_SET.has(field)) {
      fail(
        'CLEAR_STATS_TEAM_SET_FIELD_NOT_ALLOWED',
        `CLEAR_STATS cannot set non-Stats team field: ${field}`
      )
    }
  })

  CLEAR_STATS_TEAM_SET_FIELDS.forEach(field => {
    if (Object.prototype.hasOwnProperty.call(teamOwnedSetFields, field)) {
      nextSeason[field] = clone(teamOwnedSetFields[field])
    }
  })

  return nextSeason
}
