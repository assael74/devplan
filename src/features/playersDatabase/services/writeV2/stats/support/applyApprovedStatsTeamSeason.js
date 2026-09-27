// src/features/playersDatabase/services/writeV2/stats/support/applyApprovedStatsTeamSeason.js

import { STATS_OWNED_RICH_SCOUT_FIELDS } from '../../../../domain/statsV2/statsAbsence.builder.js'
import { resolveStatsPlayerIdentityKey } from '../../../../domain/statsV2/statsReloadDecision.builder.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const PLAYER_STATS_OWNED_FIELDS = Object.freeze([
  'statsStatus',
  'playerStats',
  'lineClassification',
  'primaryScoutProfileId',
  'primaryScoutProfileStrengthDepthPct',
  'professionalScoutProfileIds',
  'preliminaryScoutProfileIds',
  'scoutEffectiveImmediacyStatus',
  'scoutPlayerInterestLevel',
  'scoutEngineVersion',
])

const clone = value => JSON.parse(JSON.stringify(value))

const buildOwnedSetFields = setFields => PLAYER_STATS_OWNED_FIELDS.reduce((result, field) => {
  if (Object.prototype.hasOwnProperty.call(setFields || {}, field)) {
    result[field] = clone(setFields[field])
  }

  return result
}, {})

const STATS_OWNED_UNSET_FIELDS = new Set(STATS_OWNED_RICH_SCOUT_FIELDS)

const buildOwnedUnsetFields = unsetFields => (
  Array.isArray(unsetFields) ? unsetFields : []
).map(clean).filter(field => {
  if (!STATS_OWNED_UNSET_FIELDS.has(field)) {
    const error = new Error(`Approved Stats unset field is not Stats-owned: ${field || 'missing'}`)
    error.code = 'STATS_PLAYER_UNSET_FIELD_NOT_OWNED'
    throw error
  }

  return true
})

const buildPlayerLookup = players => new Map(
  (Array.isArray(players) ? players : [])
    .map(player => [resolveStatsPlayerIdentityKey(player), player])
    .filter(([playerKey]) => clean(playerKey))
)

const mergeApprovedPlayers = ({ currentPlayers = [], approvedNewParticipants = [], playerOwnedPatches = [] } = {}) => {
  const nextPlayers = (Array.isArray(currentPlayers) ? currentPlayers : []).map(player => clone(player))
  const currentLookup = buildPlayerLookup(nextPlayers)

  ;(Array.isArray(approvedNewParticipants) ? approvedNewParticipants : []).forEach(player => {
    const playerKey = resolveStatsPlayerIdentityKey(player)

    if (!playerKey || currentLookup.has(playerKey)) return

    const approvedPlayer = clone(player)
    nextPlayers.push(approvedPlayer)
    currentLookup.set(playerKey, approvedPlayer)
  })

  ;(Array.isArray(playerOwnedPatches) ? playerOwnedPatches : []).forEach(patch => {
    const playerKey = clean(patch?.playerKey)
    const currentPlayer = currentLookup.get(playerKey)

    if (!playerKey || !currentPlayer) {
      const error = new Error(`Approved Stats player patch target was not found: ${playerKey || 'missing'}`)
      error.code = 'STATS_PLAYER_PATCH_TARGET_NOT_FOUND'
      throw error
    }

    const setFields = buildOwnedSetFields(patch?.setFields)
    const unsetFields = buildOwnedUnsetFields(patch?.unsetFields)

    unsetFields.forEach(field => {
      delete currentPlayer[field]
    })

    Object.assign(currentPlayer, setFields)
  })

  return nextPlayers
}

export const applyApprovedStatsTeamSeason = ({ currentSeason = {}, approvedTeamSeason = {} } = {}) => {
  const nextPlayers = mergeApprovedPlayers({
    currentPlayers: currentSeason.teamPlayers,
    approvedNewParticipants: approvedTeamSeason.approvedNewParticipants,
    playerOwnedPatches: approvedTeamSeason.playerOwnedPatches,
  })
  const movementPatch = approvedTeamSeason.localMovementPatch
  const nextSeason = {
    ...currentSeason,
    seasonStatus: clean(approvedTeamSeason.seasonStatus),
    teamPlayers: nextPlayers,
    playersCount: approvedTeamSeason.playersCount,
    teamBalance: clone(approvedTeamSeason.teamBalance || {}),
    performance: clone(approvedTeamSeason.teamScout || {}),
    scoutProfilesSummary: clone(approvedTeamSeason.scoutProfilesSummary || {}),
    statsLoadState: clone(approvedTeamSeason.statsLoadState || {}),
  }

  if (movementPatch) {
    nextSeason.transfersIn = clone(Array.isArray(movementPatch.transfersIn) ? movementPatch.transfersIn : [])
    nextSeason.transfersOut = clone(Array.isArray(movementPatch.transfersOut) ? movementPatch.transfersOut : [])
    nextSeason.pendingPlayers = clone(Array.isArray(movementPatch.pendingPlayers) ? movementPatch.pendingPlayers : [])
  }

  return nextSeason
}
