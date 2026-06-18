// src/services/firestore/usage/trackShortsTransaction.js

import { shortsRefs } from '../shorts/shorts.refs.js'
import { trackFirestoreTransaction } from './firestoreUsage.tracker.js'

const resolveShortMeta = shortKey => {
  const [group, docName] = String(shortKey || '').split('.')
  const meta = shortsRefs?.[group]?.[docName]

  if (!meta?.collection || !meta?.docId) {
    return {
      collection: 'unknown',
      docId: null,
    }
  }

  return meta
}

export function trackShortsTransaction({
  shortKey,
  action,
  feature = 'shorts',

  readsCount = 0,
  writesCount = 0,

  logicalDeletesCount = 0,
  documentDeletesCount = 0,

  readPayload,
  writePayload,

  source = 'client',
  meta = {},
} = {}) {
  const shortMeta = resolveShortMeta(shortKey)

  return trackFirestoreTransaction({
    collection: shortMeta.collection,
    shortKey,
    feature,
    action,

    readsCount,
    writesCount,

    logicalDeletesCount,
    documentDeletesCount,

    readPayload,
    writePayload,

    source,

    meta: {
      ...meta,
      docId: shortMeta.docId,
    },
  })
}
