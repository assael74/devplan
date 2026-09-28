// src/features/playersDatabase/services/writeV2/stats/flows/syncStatsClubs.flow.js

import { doc, serverTimestamp, writeBatch } from 'firebase/firestore'

import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import { APPROVED_STATS_STATE_VERSION } from '../../../../domain/statsV2/approvedStatsState.builder.js'
import { invalidateClubsMasterDocumentCache } from '../../../cache/index.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const CLUB_OWNED_FIELDS = new Set(['ageGroups', 'competitionPaths'])

const pickAllowed = (source, allowed, code) => {
  const input = source && typeof source === 'object' && !Array.isArray(source) ? source : {}
  const invalid = Object.keys(input).find(key => !allowed.has(key))
  if (invalid) {
    const error = new Error(`Stats V2 cannot write field: ${invalid}`)
    error.code = code
    throw error
  }
  return { ...input }
}

export async function syncStatsClubsV2({ approvedState } = {}) {
  if (approvedState?.planType !== 'approvedStatsState' ||
      approvedState?.planVersion !== APPROVED_STATS_STATE_VERSION) {
    const error = new Error('Invalid Approved Stats State')
    error.code = 'STATS_APPROVED_STATE_INVALID'
    throw error
  }

  const patches = Array.isArray(approvedState.clubProjectionPatches)
    ? approvedState.clubProjectionPatches
    : []
  const masterPatch = approvedState.clubsMasterPatch
  const masterId = clean(masterPatch?.id) || 'all'
  if (!masterPatch || !Array.isArray(masterPatch.clubs)) {
    const error = new Error('Approved Clubs Master payload is required')
    error.code = 'STATS_CLUBS_MASTER_STATE_REQUIRED'
    throw error
  }

  const batch = writeBatch(db)
  patches.forEach(patch => {
    const clubId = clean(patch?.clubId)
    if (!clubId) {
      const error = new Error('Club projection identity is required')
      error.code = 'STATS_CLUB_PATCH_IDENTITY_INVALID'
      throw error
    }
    const fields = pickAllowed(
      patch.fields,
      CLUB_OWNED_FIELDS,
      'STATS_CLUB_OWNERSHIP_INVALID'
    )
    batch.update(
      doc(db, PLAYERS_DATABASE_COLLECTIONS.clubs, clubId),
      { ...fields, updatedAt: serverTimestamp() }
    )
  })

  batch.update(
    doc(db, PLAYERS_DATABASE_COLLECTIONS.clubsMaster, masterId),
    { clubs: masterPatch.clubs, updatedAt: serverTimestamp() }
  )
  await batch.commit()
  invalidateClubsMasterDocumentCache()

  return {
    updatedClubs: patches.length,
    masterUpdated: true,
    skipped: false,
  }
}
