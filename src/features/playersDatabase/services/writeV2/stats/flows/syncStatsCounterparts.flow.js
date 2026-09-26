// src/features/playersDatabase/services/writeV2/stats/flows/syncStatsCounterparts.flow.js

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'

import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import { buildTeamSeasonDocumentId } from '../../../../model/team/teamIdentity.model.js'
import { APPROVED_STATS_STATE_VERSION } from '../../../../domain/statsV2/approvedStatsState.builder.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const requireApprovedState = approvedState => {
  if (!approvedState || typeof approvedState !== 'object' ||
      clean(approvedState.planType) !== 'approvedStatsState' ||
      Number(approvedState.planVersion) !== APPROVED_STATS_STATE_VERSION) {
    const error = new Error('Unsupported Approved Stats State contract')
    error.code = 'STATS_APPROVED_STATE_INVALID'
    throw error
  }

  return approvedState
}

const buildMovementPatch = patch => ({
  transfersIn: Array.isArray(patch.transfersIn) ? patch.transfersIn : [],
  transfersOut: Array.isArray(patch.transfersOut) ? patch.transfersOut : [],
  pendingPlayers: Array.isArray(patch.pendingPlayers) ? patch.pendingPlayers : [],
})

export async function syncStatsCounterpartsV2({ approvedState } = {}) {
  const approved = requireApprovedState(approvedState)
  const patches = Array.isArray(approved.counterpartMovementPatches)
    ? approved.counterpartMovementPatches
    : []
  const results = []

  for (const patch of patches) {
    const birthTeamDocumentId = clean(patch?.birthTeamDocumentId)
    const seasonKey = clean(patch?.seasonKey)
    const teamSeasonDocumentId = buildTeamSeasonDocumentId(birthTeamDocumentId, seasonKey)

    if (!birthTeamDocumentId || !seasonKey || !teamSeasonDocumentId) {
      const error = new Error('Approved counterpart Movement identity is incomplete')
      error.code = 'STATS_COUNTERPART_IDENTITY_INVALID'
      throw error
    }

    const ref = doc(db, PLAYERS_DATABASE_COLLECTIONS.teamSeasons, teamSeasonDocumentId)
    const snapshot = await getDoc(ref)

    if (!snapshot.exists()) {
      results.push({
        birthTeamDocumentId,
        seasonKey,
        teamSeasonDocumentId,
        status: 'notFound',
        writeSkipped: true,
      })
      continue
    }

    const current = snapshot.data() || {}
    const movementPatch = buildMovementPatch(patch)
    const unchanged = (
      JSON.stringify(current.transfersIn || []) === JSON.stringify(movementPatch.transfersIn) &&
      JSON.stringify(current.transfersOut || []) === JSON.stringify(movementPatch.transfersOut) &&
      JSON.stringify(current.pendingPlayers || []) === JSON.stringify(movementPatch.pendingPlayers)
    )

    if (!unchanged) {
      await setDoc(ref, {
        ...movementPatch,
        updatedAt: serverTimestamp(),
      }, { merge: true })
    }

    results.push({
      birthTeamDocumentId,
      seasonKey,
      teamSeasonDocumentId,
      status: unchanged ? 'unchanged' : 'updated',
      writeSkipped: unchanged,
    })
  }

  return {
    updatedCount: results.filter(result => result.status === 'updated').length,
    notFoundCount: results.filter(result => result.status === 'notFound').length,
    results,
  }
}
