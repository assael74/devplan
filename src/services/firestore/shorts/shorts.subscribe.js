// src/services/firestore/shorts/shorts.subscribe.js

import { subscribeTrackedQuery } from '../subscriptions/index.js'

export function subscribeShorts(colRef, onData, onError, usageMeta = {}) {
  return subscribeTrackedQuery(
    colRef,
    snap => {
      const docs = snap.docs.map(docSnapshot => ({
        docName: docSnapshot.id,
        ...docSnapshot.data(),
      }))
      onData(docs)
    },
    onError,
    {
      subscriptionKey: usageMeta.subscriptionKey || `shorts:${colRef.path}`,
      sourceCollection: colRef.path,
      sourceShortKey: colRef.path,
      sourceFeature: 'coreData',
      sourceAction: 'subscribeShorts',
      sourceMeta: usageMeta.sourceMeta,
      consumerFeature: usageMeta.consumerFeature || usageMeta.feature || 'coreData',
      consumerAction: usageMeta.consumerAction || usageMeta.action || 'subscribeShorts',
    }
  )
}
