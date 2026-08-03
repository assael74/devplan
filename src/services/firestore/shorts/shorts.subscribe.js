// src/services/firestore/shorts/shorts.subscribe.js

import { onSnapshot } from 'firebase/firestore'
import {
  getCollectionNameFromRef,
  trackFirestoreListenerClose,
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

  const openEntry = trackFirestoreListenerOpen(commonMeta)
  const listenerId = openEntry?.listenerId || null
  let hasInitialSnapshot = false

  const unsubscribe = onSnapshot(
    colRef,
    snap => {
      const docs = snap.docs.map(docSnapshot => ({
        docName: docSnapshot.id,
        ...docSnapshot.data(),
      }))

      const changedDocs = hasInitialSnapshot
        ? snap.docChanges().map(change => ({
            changeType: change.type,
            docName: change.doc.id,
            ...change.doc.data(),
          }))
        : docs

      trackFirestoreListenerUpdate({
        ...commonMeta,
        listenerId,
        listenerPhase: hasInitialSnapshot ? 'update' : 'initial',
        docs: changedDocs,
        docsCount: changedDocs.length,
        readsCount: snap.metadata.fromCache ? 0 : changedDocs.length,
        fromCache: snap.metadata.fromCache,
        meta: {
          totalDocumentsInSnapshot: docs.length,
        },
      })

      hasInitialSnapshot = true
      onData(docs)
    },
    error => onError?.(error)
  )

  return () => {
    unsubscribe()
    trackFirestoreListenerClose({
      ...commonMeta,
      listenerId,
    })
  }
}
