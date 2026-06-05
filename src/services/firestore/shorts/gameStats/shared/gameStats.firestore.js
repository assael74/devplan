// src/services/firestore/shorts/gameStats/shared/gameStats.firestore.js

import { doc } from 'firebase/firestore'

import { db } from '../../../../firebase/firebase.js'

export function buildShortDocRef(meta) {
  return doc(db, meta.collection, meta.docId)
}

export async function readShortListDoc(tx, ref) {
  const snap = await tx.get(ref)
  const data = snap.exists() ? snap.data() || {} : {}
  const list = Array.isArray(data.list) ? data.list : []

  return { data, list }
}

export function buildShortsDocPayload({ data, meta, docName, list, now }) {
  return {
    ...data,
    docId: data.docId || meta.docId,
    docName: data.docName || docName,
    list,
    updatedAt: now,
    createdAt: data.createdAt ?? now,
  }
}
