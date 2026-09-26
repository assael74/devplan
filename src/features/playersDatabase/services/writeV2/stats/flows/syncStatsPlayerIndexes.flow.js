// src/features/playersDatabase/services/writeV2/stats/flows/syncStatsPlayerIndexes.flow.js

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'

import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import { APPROVED_STATS_STATE_VERSION } from '../../../../domain/statsV2/approvedStatsState.builder.js'
import {
  pickOwnedFields,
  STATS_PLAYER_INDEX_OWNED_FIELDS,
} from '../support/statsProjectionOwnership.js'

const sameValue = (left, right) => JSON.stringify(left ?? null) === JSON.stringify(right ?? null)

const assertApproved = approved => {
  if (approved?.planType !== 'approvedStatsState' || approved?.planVersion !== APPROVED_STATS_STATE_VERSION) {
    const error = new Error('Invalid Approved Stats State')
    error.code = 'STATS_APPROVED_STATE_INVALID'
    throw error
  }
}

export async function syncStatsPlayerIndexesV2({ approved } = {}) {
  assertApproved(approved)
  const states = Array.isArray(approved.playerSearchIndexStates)
    ? approved.playerSearchIndexStates
    : []
  const seen = new Set()
  const prepared = []

  for (const state of states) {
    const docId = String(state?.docId || '').trim()
    if (!docId || seen.has(docId)) {
      const error = new Error('Player SearchIndex identity must be unique and complete')
      error.code = 'STATS_PLAYER_INDEX_IDENTITY_INVALID'
      throw error
    }
    seen.add(docId)

    const fields = pickOwnedFields({
      fields: state?.fields,
      allowed: STATS_PLAYER_INDEX_OWNED_FIELDS,
      code: 'STATS_PLAYER_INDEX_SCOPE_INVALID',
    })
    const ref = doc(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes, docId)
    const snapshot = await getDoc(ref)
    const existing = snapshot.exists() ? snapshot.data() : {}
    const changed = Object.entries(fields).some(([key, value]) => !sameValue(existing?.[key], value))

    prepared.push({ ref, fields, changed })
  }

  let writtenCount = 0
  for (const item of prepared) {
    if (!item.changed) continue
    await setDoc(item.ref, {
      ...item.fields,
      updatedAt: serverTimestamp(),
    }, { merge: true })
    writtenCount += 1
  }

  return {
    totalCount: prepared.length,
    writtenCount,
    skippedCount: prepared.length - writtenCount,
  }
}
