// src/services/firestore/subscriptions/firestoreSubscriptions.js

import { onSnapshot } from 'firebase/firestore'
import {
  getCollectionNameFromRef,
  trackFirestoreListenerClose,
  trackFirestoreListenerOpen,
  trackFirestoreListenerUpdate,
} from '../usage/index.js'

const activeSubscriptions = new Map()

const clean = value => String(value ?? '').trim()

const resolvePath = ref => clean(
  ref?.path || ref?._query?.path?.canonicalString?.() || ref?.id || ''
)

const resolveSubscriptionKey = ({ ref, kind, usageMeta }) => {
  const explicitKey = clean(usageMeta?.subscriptionKey)
  if (explicitKey) return `${kind}:${explicitKey}`

  if (kind === 'query') {
    throw new Error('Tracked query subscription requires an explicit subscriptionKey')
  }

  const path = resolvePath(ref)
  if (!path) {
    throw new Error('Tracked document subscription requires a ref path')
  }

  return `${kind}:${path}`
}

const resolveCommonMeta = ({ ref, usageMeta = {}, defaultAction }) => ({
  collection: usageMeta.sourceCollection || getCollectionNameFromRef(ref),
  shortKey: usageMeta.sourceShortKey,
  feature: usageMeta.sourceFeature || 'firestore',
  action: usageMeta.sourceAction || defaultAction,
  meta: {
    ...(usageMeta.sourceMeta || {}),
    subscriptionKey: usageMeta.subscriptionKey || null,
  },
})

const resolveConsumerFeature = usageMeta => clean(
  usageMeta?.consumerFeature || usageMeta?.feature || ''
)

const resolveConsumerAction = usageMeta => clean(
  usageMeta?.consumerAction || usageMeta?.action || ''
)

const addConsumerMetadata = (entry, usageMeta = {}) => {
  const feature = resolveConsumerFeature(usageMeta)
  const action = resolveConsumerAction(usageMeta)

  if (feature) entry.consumerFeatures.add(feature)
  if (action) entry.consumerActions.add(action)
}

const withConsumerMetadata = (entry, meta = {}) => ({
  ...meta,
  consumerFeatures: Array.from(entry.consumerFeatures).sort(),
  consumerActions: Array.from(entry.consumerActions).sort(),
})

const notifySnapshot = (entry, snapshot) => {
  entry.subscribers.forEach(subscriber => {
    subscriber.onSnapshot?.(snapshot)
  })
}

const notifyError = (entry, error) => {
  entry.subscribers.forEach(subscriber => {
    subscriber.onError?.(error)
  })
}

const closeEntry = (key, entry) => {
  if (activeSubscriptions.get(key) !== entry) return

  entry.unsubscribeSource?.()
  activeSubscriptions.delete(key)

  trackFirestoreListenerClose({
    ...entry.commonMeta,
    listenerId: entry.listenerId,
    meta: withConsumerMetadata(entry, {
      ...(entry.commonMeta.meta || {}),
    }),
  })
}

const trackDocumentSnapshot = ({ entry, snapshot }) => {
  const exists = snapshot.exists()
  const data = exists ? snapshot.data() : null
  const fromCache = Boolean(snapshot.metadata?.fromCache)

  trackFirestoreListenerUpdate({
    ...entry.commonMeta,
    listenerId: entry.listenerId,
    listenerPhase: entry.hasInitialSnapshot ? 'update' : 'initial',
    docs: data,
    docsCount: exists ? 1 : 0,
    readsCount: fromCache ? 0 : 1,
    fromCache,
    meta: withConsumerMetadata(entry, {
      ...(entry.commonMeta.meta || {}),
      documentPath: resolvePath(entry.ref),
    }),
  })
}

const trackQuerySnapshot = ({ entry, snapshot }) => {
  const allDocs = snapshot.docs.map(docSnapshot => ({
    docName: docSnapshot.id,
    ...docSnapshot.data(),
  }))

  const changedDocs = entry.hasInitialSnapshot
    ? snapshot.docChanges().map(change => ({
        changeType: change.type,
        docName: change.doc.id,
        ...change.doc.data(),
      }))
    : allDocs

  const fromCache = Boolean(snapshot.metadata?.fromCache)

  trackFirestoreListenerUpdate({
    ...entry.commonMeta,
    listenerId: entry.listenerId,
    listenerPhase: entry.hasInitialSnapshot ? 'update' : 'initial',
    docs: changedDocs,
    docsCount: changedDocs.length,
    readsCount: fromCache ? 0 : changedDocs.length,
    fromCache,
    meta: withConsumerMetadata(entry, {
      ...(entry.commonMeta.meta || {}),
      totalDocumentsInSnapshot: allDocs.length,
      queryPath: resolvePath(entry.ref),
    }),
  })
}

const openTrackedSubscription = ({
  ref,
  kind,
  onSnapshotValue,
  onError,
  usageMeta,
}) => {
  const key = resolveSubscriptionKey({ ref, kind, usageMeta })
  let entry = activeSubscriptions.get(key)

  const subscriber = {
    onSnapshot: onSnapshotValue,
    onError,
  }

  if (entry) {
    entry.subscribers.add(subscriber)
    addConsumerMetadata(entry, usageMeta)

    if (entry.latestSnapshot) {
      onSnapshotValue?.(entry.latestSnapshot)
    }
    if (entry.latestError) {
      onError?.(entry.latestError)
    }

    return () => {
      entry.subscribers.delete(subscriber)
      if (!entry.subscribers.size) closeEntry(key, entry)
    }
  }

  const commonMeta = resolveCommonMeta({
    ref,
    usageMeta,
    defaultAction: kind === 'document'
      ? 'subscribeTrackedDocument'
      : 'subscribeTrackedQuery',
  })

  const openEntry = trackFirestoreListenerOpen(commonMeta)

  entry = {
    key,
    ref,
    kind,
    commonMeta,
    listenerId: openEntry?.listenerId || null,
    subscribers: new Set([subscriber]),
    unsubscribeSource: null,
    hasInitialSnapshot: false,
    latestSnapshot: null,
    latestError: null,
    consumerFeatures: new Set(),
    consumerActions: new Set(),
  }

  addConsumerMetadata(entry, usageMeta)

  activeSubscriptions.set(key, entry)

  entry.unsubscribeSource = onSnapshot(
    ref,
    snapshot => {
      if (activeSubscriptions.get(key) !== entry) return

      if (kind === 'document') {
        trackDocumentSnapshot({ entry, snapshot })
      } else {
        trackQuerySnapshot({ entry, snapshot })
      }

      entry.hasInitialSnapshot = true
      entry.latestSnapshot = snapshot
      entry.latestError = null
      notifySnapshot(entry, snapshot)
    },
    error => {
      if (activeSubscriptions.get(key) !== entry) return
      entry.latestError = error
      notifyError(entry, error)
      closeEntry(key, entry)
    }
  )

  return () => {
    entry.subscribers.delete(subscriber)
    if (!entry.subscribers.size) closeEntry(key, entry)
  }
}

export function subscribeTrackedDocument(
  documentRef,
  onSnapshotValue,
  onError,
  usageMeta = {}
) {
  return openTrackedSubscription({
    ref: documentRef,
    kind: 'document',
    onSnapshotValue,
    onError,
    usageMeta,
  })
}

export function subscribeTrackedQuery(
  queryRef,
  onSnapshotValue,
  onError,
  usageMeta = {}
) {
  return openTrackedSubscription({
    ref: queryRef,
    kind: 'query',
    onSnapshotValue,
    onError,
    usageMeta,
  })
}

export function resetTrackedSubscriptions() {
  for (const [key, entry] of Array.from(activeSubscriptions.entries())) {
    entry.subscribers.clear()
    closeEntry(key, entry)
  }
}

export function getTrackedSubscriptionsSnapshot() {
  return Array.from(activeSubscriptions.values()).map(entry => ({
    key: entry.key,
    kind: entry.kind,
    subscribersCount: entry.subscribers.size,
    hasInitialSnapshot: entry.hasInitialSnapshot,
    hasError: Boolean(entry.latestError),
    consumerFeatures: Array.from(entry.consumerFeatures).sort(),
    consumerActions: Array.from(entry.consumerActions).sort(),
  }))
}
