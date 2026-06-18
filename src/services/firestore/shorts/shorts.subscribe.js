// src/services/firestore/shorts/shorts.subscribe.js

import { onSnapshot } from 'firebase/firestore'
import {
  getCollectionNameFromRef,
  trackFirestoreListenerOpen,
  trackFirestoreListenerUpdate,
} from '../usage/index.js'

export function subscribeShorts(colRef, onData, onError, usageMeta = {}) {
  const collection =
    usageMeta.collection || getCollectionNameFromRef(colRef)

  const commonMeta = {
    collection,
    shortKey: usageMeta.shortKey,
    feature: usageMeta.feature || 'coreData',
    action: usageMeta.action || 'subscribeShorts',
  }

  trackFirestoreListenerOpen(commonMeta)

  return onSnapshot(
    colRef,
    snap => {
      const docs = snap.docs.map(docSnapshot => ({
        docName: docSnapshot.id,
        ...docSnapshot.data(),
      }))

      trackFirestoreListenerUpdate({
        ...commonMeta,
        docs,
        docsCount: docs.length,
      })

      onData(docs)
    },
    error => onError?.(error)
  )
}
