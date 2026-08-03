// src/services/firestore/shorts/gameStats/getGameStatsDoc.js

import { doc } from 'firebase/firestore'

import { gameStatsShortsRef } from '../../shortsCollections.js'
import { trackedGetDoc } from '../../usage/firestoreUsage.instrumentation.js'

const clean = value => {
  return String(value ?? '').trim()
}

export async function getGameStatsDoc({ gameStatsDocId } = {}) {
  const id = clean(gameStatsDocId)

  if (!id) {
    throw new Error('[getGameStatsDoc] missing gameStatsDocId')
  }

  const ref = doc(gameStatsShortsRef, id)
  const snap = await trackedGetDoc(ref, {
    feature: 'hub',
    action: 'game-stats-document-read',
    collection: 'gameStatsShorts',
    operationSubtype: 'getDoc',
  })

  if (!snap.exists()) {
    return null
  }

  return {
    id: snap.id,
    docId: snap.id,
    ...(snap.data() || {}),
  }
}
