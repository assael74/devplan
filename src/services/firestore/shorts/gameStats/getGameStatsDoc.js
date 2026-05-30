// src/services/firestore/shorts/gameStats/getGameStatsDoc.js

import { doc, getDoc } from 'firebase/firestore'

import { gameStatsShortsRef } from '../../shortsCollections.js'

const clean = value => {
  return String(value ?? '').trim()
}

export async function getGameStatsDoc({ gameStatsDocId } = {}) {
  const id = clean(gameStatsDocId)

  if (!id) {
    throw new Error('[getGameStatsDoc] missing gameStatsDocId')
  }

  const ref = doc(gameStatsShortsRef, id)
  const snap = await getDoc(ref)

  if (!snap.exists()) {
    return null
  }

  return {
    id: snap.id,
    docId: snap.id,
    ...(snap.data() || {}),
  }
}
