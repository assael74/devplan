// src/features/playersDatabase/services/writeV2/stats/flows/writeClearStatsCanonical.flow.js

import {
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'

import { db } from '../../../../../../services/firebase/firebase.js'
import { trackedGetDocFromServer } from '../../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import { buildTeamSeasonDocumentId } from '../../../../model/team/teamIdentity.model.js'
import { CLEAR_STATS_APPROVED_STATE_VERSION } from '../../../../domain/statsV2/clearStatsApprovedState.builder.js'
import { applyApprovedClearStatsTeamSeason } from '../support/applyApprovedClearStatsTeamSeason.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const fail = (code, message) => {
  const error = new Error(message)
  error.code = code
  throw error
}

const requireApprovedState = approvedState => {
  if (!approvedState || typeof approvedState !== 'object' || Array.isArray(approvedState)) {
    fail('CLEAR_STATS_APPROVED_STATE_REQUIRED', 'Clear Stats Approved State is required')
  }

  if (
    approvedState.stateType !== 'clearStatsApprovedState' ||
    Number(approvedState.stateVersion) !== CLEAR_STATS_APPROVED_STATE_VERSION ||
    approvedState.flowType !== 'stats' ||
    approvedState.operationType !== 'clear' ||
    approvedState.label !== 'CLEAR_STATS'
  ) {
    fail('CLEAR_STATS_APPROVED_STATE_INVALID', 'Unsupported Clear Stats Approved State contract')
  }

  const identity = {
    birthTeamDocumentId: clean(approvedState.identity?.birthTeamDocumentId),
    seasonKey: clean(approvedState.identity?.seasonKey),
    leagueId: clean(approvedState.identity?.leagueId),
  }

  if (!identity.birthTeamDocumentId || !identity.seasonKey || !identity.leagueId) {
    fail('CLEAR_STATS_APPROVED_IDENTITY_INVALID', 'Clear Stats Approved State identity is incomplete')
  }

  return {
    approvedState,
    identity,
  }
}

const normalize = value => {
  if (Array.isArray(value)) {
    return value.map(normalize)
  }

  if (value && typeof value === 'object') {
    return Object.keys(value).sort().reduce((result, key) => {
      result[key] = normalize(value[key])
      return result
    }, {})
  }

  return value
}

const sameValue = (left, right) => (
  JSON.stringify(normalize(left)) === JSON.stringify(normalize(right))
)

const buildOwnedWriteState = season => ({
  teamPlayers: season.teamPlayers,
  scoutProfilesSummary: season.scoutProfilesSummary,
  statsLoadState: season.statsLoadState,
  teamBalance: season.teamBalance,
})

export async function writeClearStatsCanonicalV2({ approvedState } = {}) {
  const validated = requireApprovedState(approvedState)
  const approved = validated.approvedState
  const identity = validated.identity
  const teamSeasonDocumentId = buildTeamSeasonDocumentId(
    identity.birthTeamDocumentId,
    identity.seasonKey
  )
  const playersAffected = Number(approved.impact?.playersAffected) || 0
  const isIdempotentContract = (
    approved.isIdempotent === true &&
    approved.canonicalMutation === null
  )
  const isMutationContract = (
    approved.isIdempotent === false &&
    approved.canonicalMutation &&
    typeof approved.canonicalMutation === 'object' &&
    !Array.isArray(approved.canonicalMutation)
  )

  if (!isIdempotentContract && !isMutationContract) {
    fail(
      'CLEAR_STATS_APPROVED_MUTATION_INVALID',
      'Clear Stats Approved State idempotency and mutation contract is invalid'
    )
  }

  if (isIdempotentContract) {
    return {
      birthTeamDocumentId: identity.birthTeamDocumentId,
      teamSeasonDocumentId,
      seasonKey: identity.seasonKey,
      playersAffected,
      writeSkipped: true,
    }
  }

  const rootRef = doc(
    db,
    PLAYERS_DATABASE_COLLECTIONS.teams,
    identity.birthTeamDocumentId
  )
  const seasonRef = doc(
    db,
    PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
    teamSeasonDocumentId
  )
  const rootSnapshot = await trackedGetDocFromServer(rootRef, {
    feature: 'playersDatabase',
    collection: PLAYERS_DATABASE_COLLECTIONS.teams,
    action: 'clear-stats-canonical-team-root',
    operationSubtype: 'clear-stats-canonical-getDocFromServer',
  })

  if (!rootSnapshot.exists()) {
    fail('CLEAR_STATS_TEAM_ROOT_NOT_FOUND', 'Canonical Team Root does not exist')
  }

  const seasonSnapshot = await trackedGetDocFromServer(seasonRef, {
    feature: 'playersDatabase',
    collection: PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
    action: 'clear-stats-canonical-team-season',
    operationSubtype: 'clear-stats-canonical-getDocFromServer',
  })

  if (!seasonSnapshot.exists()) {
    fail('CLEAR_STATS_TEAM_SEASON_NOT_FOUND', 'Canonical Team Season does not exist')
  }

  const currentSeason = seasonSnapshot.data() || {}
  const nextSeason = applyApprovedClearStatsTeamSeason({
    currentSeason,
    canonicalMutation: approved.canonicalMutation,
  })
  const currentOwnedState = buildOwnedWriteState(currentSeason)
  const nextOwnedState = buildOwnedWriteState(nextSeason)
  const writeSkipped = sameValue(currentOwnedState, nextOwnedState)

  if (!writeSkipped) {
    await updateDoc(seasonRef, {
      ...nextOwnedState,
      updatedAt: serverTimestamp(),
    })
  }

  return {
    birthTeamDocumentId: identity.birthTeamDocumentId,
    teamSeasonDocumentId,
    seasonKey: identity.seasonKey,
    playersAffected,
    writeSkipped,
  }
}
