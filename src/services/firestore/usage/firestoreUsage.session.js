// src/services/firestore/usage/firestoreUsage.session.js

const FIRESTORE_USAGE_CHANNEL = 'devplan-firestore-usage'

const createRuntimeId = () => (
  `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
)

const runtimeId = createRuntimeId()
const seenEntryIds = new Set()
let usageChannel = null

const createEmptyBucket = () => ({
  calls: 0,
  failures: 0,
  durationMs: 0,

  reads: 0,
  cacheReads: 0,
  writes: 0,

  documentDeletes: 0,
  logicalDeletes: 0,

  listeners: 0,
  activeListeners: 0,
  listenerCloses: 0,
  listenerInitials: 0,
  listenerUpdates: 0,

  estimatedReadKb: 0,
  estimatedCacheReadKb: 0,
  estimatedWriteKb: 0,
})

const createFeatureDetails = () => ({
  totals: createEmptyBucket(),
  byDocument: {},
  byCollection: {},
  byShortKey: {},
  byAction: {},
  byProcess: {},
})

const createEmptyUsageState = () => ({
  measurementVersion: 3,
  startedAt: new Date().toISOString(),
  updatedAt: null,

  totals: createEmptyBucket(),

  byCollection: {},
  byDocument: {},
  byShortKey: {},
  byFeature: {},
  byAction: {},
  byProcess: {},
  byFeatureDetails: {},

  activeListenerIds: {},
  recentEntries: [],
  expensiveActions: [],
})

let usageState = createEmptyUsageState()
let entrySequence = 0

export function getFirestoreUsageRuntimeId() {
  return runtimeId
}

export function getFirestoreUsageSession() {
  return usageState
}

const resetLocalSession = () => {
  const activeListenerIds = { ...(usageState.activeListenerIds || {}) }
  usageState = createEmptyUsageState()
  usageState.activeListenerIds = activeListenerIds
  entrySequence = 0
  seenEntryIds.clear()

  Object.values(activeListenerIds).forEach(listener => {
    const entry = {
      operation: 'listener-open',
      collection: listener.collection,
      shortKey: listener.shortKey,
      feature: listener.feature,
      action: listener.action,
      listenerId: listener.listenerId,
      listenerPhase: 'open',
      createdAt: listener.openedAt || usageState.startedAt,
      runtimeId: listener.runtimeId,
      source: 'client',
      meta: {
        restoredAfterReset: true,
      },
    }

    addToBucket(usageState.totals, entry, 1)
    addToBucket(ensureBucket(usageState.byCollection, entry.collection), entry, 1)
    addToBucket(ensureBucket(usageState.byProcess, buildProcessKey(entry)), entry, 1)

    if (entry.shortKey) {
      addToBucket(ensureBucket(usageState.byShortKey, entry.shortKey), entry, 1)
    }

    if (entry.feature) {
      addToBucket(ensureBucket(usageState.byFeature, entry.feature), entry, 1)
      addToFeatureDetails(
        ensureFeatureDetails(usageState.byFeatureDetails, entry.feature),
        entry,
        1
      )
    }

    if (entry.action) {
      addToBucket(ensureBucket(usageState.byAction, entry.action), entry, 1)
    }
  })

  return usageState
}

export function resetFirestoreUsageSession({ broadcast = true } = {}) {
  const nextState = resetLocalSession()

  if (broadcast && usageChannel) {
    usageChannel.postMessage({
      type: 'reset',
      sourceRuntimeId: runtimeId,
    })
  }

  return nextState
}

const ensureBucket = (target, key) => {
  const cleanKey = key || 'unknown'

  if (!target[cleanKey]) {
    target[cleanKey] = createEmptyBucket()
  }

  return target[cleanKey]
}

const ensureFeatureDetails = (target, feature) => {
  const cleanFeature = feature || 'unknown'

  if (!target[cleanFeature]) {
    target[cleanFeature] = createFeatureDetails()
  }

  return target[cleanFeature]
}

const addToBucket = (bucket, entry, activeListenerDelta = 0) => {
  const readsCount = Number(entry.readsCount || 0)
  const writesCount = Number(entry.writesCount || 0)
  const documentDeletesCount = Number(entry.documentDeletesCount || 0)
  const logicalDeletesCount = Number(entry.logicalDeletesCount || 0)
  const estimatedKb = Number(entry.estimatedKb || 0)

  bucket.calls += 1
  bucket.durationMs += Number(entry.durationMs || 0)
  bucket.cacheReads += Number(entry.cacheReadsCount || 0)
  bucket.estimatedCacheReadKb += Number(entry.estimatedCacheReadKb || 0)
  bucket.activeListeners += activeListenerDelta

  if (entry.status === 'error') {
    bucket.failures += 1
  }

  if (entry.operation === 'read') {
    bucket.reads += readsCount
    bucket.estimatedReadKb += estimatedKb
  }

  if (entry.operation === 'write') {
    bucket.writes += writesCount
    bucket.estimatedWriteKb += estimatedKb
  }

  if (entry.operation === 'document-delete') {
    bucket.documentDeletes += documentDeletesCount
  }

  if (entry.operation === 'logical-delete') {
    const count = logicalDeletesCount
    bucket.logicalDeletes += count
    bucket.writes += count
    bucket.estimatedWriteKb += estimatedKb
  }

  if (entry.operation === 'transaction') {
    bucket.reads += readsCount
    bucket.writes += writesCount
    bucket.documentDeletes += documentDeletesCount
    bucket.logicalDeletes += logicalDeletesCount

    bucket.estimatedReadKb += Number(entry.estimatedReadKb || 0)
    bucket.estimatedWriteKb += Number(entry.estimatedWriteKb || 0)
  }

  if (entry.operation === 'listener-open') {
    bucket.listeners += 1
  }

  if (entry.operation === 'listener-close') {
    bucket.listenerCloses += 1
  }

  if (entry.operation === 'listener-update') {
    if (!entry.fromCache && entry.status !== 'error') {
      if (entry.listenerPhase === 'initial') {
        bucket.listenerInitials += 1
      } else {
        bucket.listenerUpdates += 1
      }
    }

    bucket.reads += readsCount
    bucket.estimatedReadKb += estimatedKb
  }
}

const buildProcessKey = entry => [
  entry.feature || 'unknown',
  entry.action || entry.operation || 'unknown',
  entry.collection || 'unknown',
].join('::')

const addDocumentSamples = (target, entry) => {
  if (entry.status === 'error' || !['read', 'listener-update'].includes(entry.operation)) return

  entry.documents.forEach(sample => {
    const parts = sample.path.split('/')
    const documentId = parts.pop()
    const row = target[sample.path] || {
      path: sample.path,
      collection: parts.join('/'),
      documentId,
      reads: 0,
      cacheReads: 0,
      estimatedReadKb: 0,
      estimatedCacheReadKb: 0,
      maxReadKb: 0,
    }
    row.lastReadKb = sample.estimatedKb
    row.maxReadKb = Math.max(row.maxReadKb, sample.estimatedKb)
    row.lastSeenAt = entry.createdAt
    row.lastFromCache = entry.fromCache
    if (entry.fromCache) {
      row.cacheReads += 1
      row.estimatedCacheReadKb += sample.estimatedKb
    } else if (entry.readsCount > 0) {
      row.reads += 1
      row.estimatedReadKb += sample.estimatedKb
    }
    target[sample.path] = row
  })
}

const addToFeatureDetails = (details, entry, activeListenerDelta = 0) => {
  addToBucket(details.totals, entry, activeListenerDelta)
  if (entry.documents) addDocumentSamples(details.byDocument, entry)
  addToBucket(ensureBucket(details.byCollection, entry.collection), entry, activeListenerDelta)

  if (entry.shortKey) {
    addToBucket(ensureBucket(details.byShortKey, entry.shortKey), entry, activeListenerDelta)
  }

  if (entry.action) {
    addToBucket(ensureBucket(details.byAction, entry.action), entry, activeListenerDelta)
  }

  addToBucket(ensureBucket(details.byProcess, buildProcessKey(entry)), entry, activeListenerDelta)
}

const updateActiveListenerRegistry = entry => {
  if (!entry.listenerId) return

  if (entry.operation === 'listener-open' && !usageState.activeListenerIds[entry.listenerId]) {
    usageState.activeListenerIds[entry.listenerId] = {
      listenerId: entry.listenerId,
      collection: entry.collection,
      shortKey: entry.shortKey,
      feature: entry.feature,
      action: entry.action,
      openedAt: entry.createdAt,
      runtimeId: entry.runtimeId || null,
      hasInitialSnapshot: false,
    }
  }

  if (
    entry.operation === 'listener-update' &&
    !entry.fromCache &&
    entry.status !== 'error' &&
    usageState.activeListenerIds[entry.listenerId]
  ) {
    usageState.activeListenerIds[entry.listenerId].hasInitialSnapshot = true
  }

  if (entry.operation === 'listener-close') {
    delete usageState.activeListenerIds[entry.listenerId]
  }
}

const broadcastEntry = normalized => {
  if (!usageChannel) return

  usageChannel.postMessage({
    type: 'entry',
    sourceRuntimeId: runtimeId,
    entry: normalized,
  })
}

export function pushFirestoreUsageEntry(entry = {}, config = {}) {
  entrySequence += 1

  const createdAt = entry.createdAt || new Date().toISOString()
  const operation = entry.operation || 'read'
  const isRead = operation === 'read' || operation === 'listener-update'
  const fromCache = isRead && Boolean(entry.fromCache)
  const docsCount = Number(entry.docsCount || 0)
  const count = (value, fallback = 0) => Number(value != null ? value : fallback)
  const listener = usageState.activeListenerIds[entry.listenerId]
  const lifecycleContext = operation === 'listener-close' && listener ? listener : entry
  // A close from an earlier runtime or a repeated cleanup must not remove another listener.
  const activeListenerDelta = entry.listenerId && operation === 'listener-open'
    ? listener ? 0 : 1
    : operation === 'listener-close' && listener ? -1 : 0
  const listenerPhase = operation === 'listener-update'
    ? entry.status === 'error'
      ? 'error'
      : listener
        ? listener.hasInitialSnapshot ? 'update' : 'initial'
        : entry.listenerPhase || 'update'
    : entry.listenerPhase || null
  const normalized = {
    id: entry.id || `${runtimeId}-${createdAt}-${entrySequence}`,
    createdAt,
    runtimeId: entry.runtimeId || runtimeId,

    operation,
    operationSubtype: entry.operationSubtype || null,

    collection: lifecycleContext.collection || 'unknown',
    shortKey: lifecycleContext.shortKey || null,
    feature: lifecycleContext.feature || null,
    action: lifecycleContext.action || null,
    route: entry.route || (
      typeof window !== 'undefined'
        ? `${window.location.pathname}${window.location.search}`
        : null
    ),
    queryKey: entry.queryKey || null,

    docsCount,
    documents: (Array.isArray(entry.documents) ? entry.documents : []).filter(sample => (
      typeof sample?.path === 'string' && sample.path.split('/').length % 2 === 0 &&
      Number.isFinite(sample.estimatedKb) && sample.estimatedKb >= 0
    )).map(sample => ({ path: sample.path, estimatedKb: sample.estimatedKb })),
    readsCount: fromCache ? 0 : count(entry.readsCount, isRead ? docsCount : 0),
    cacheReadsCount: fromCache ? count(entry.cacheReadsCount, docsCount) : 0,
    writesCount: count(entry.writesCount, operation === 'write' ? 1 : 0),

    documentDeletesCount: count(entry.documentDeletesCount, operation === 'document-delete' ? 1 : 0),
    logicalDeletesCount: count(entry.logicalDeletesCount, operation === 'logical-delete' ? 1 : 0),

    estimatedKb: fromCache ? 0 : Number(entry.estimatedKb || 0),
    estimatedCacheReadKb: fromCache
      ? count(entry.estimatedCacheReadKb, entry.estimatedKb || 0)
      : 0,
    estimatedReadKb: Number(entry.estimatedReadKb || 0),
    estimatedWriteKb: Number(entry.estimatedWriteKb || 0),

    listenerId: entry.listenerId || null,
    listenerPhase,
    fromCache,

    status: entry.status || 'success',
    durationMs: Number(entry.durationMs || 0),
    errorCode: entry.errorCode || null,

    source: entry.source || 'client',
    meta: entry.meta || null,
  }

  if (seenEntryIds.has(normalized.id)) {
    return normalized
  }
  seenEntryIds.add(normalized.id)

  usageState.updatedAt = normalized.createdAt
  addDocumentSamples(usageState.byDocument, normalized)

  addToBucket(usageState.totals, normalized, activeListenerDelta)
  addToBucket(
    ensureBucket(usageState.byCollection, normalized.collection),
    normalized,
    activeListenerDelta
  )

  addToBucket(
    ensureBucket(usageState.byProcess, buildProcessKey(normalized)),
    normalized,
    activeListenerDelta
  )

  if (normalized.shortKey) {
    addToBucket(
      ensureBucket(usageState.byShortKey, normalized.shortKey),
      normalized,
      activeListenerDelta
    )
  }

  if (normalized.feature) {
    addToBucket(
      ensureBucket(usageState.byFeature, normalized.feature),
      normalized,
      activeListenerDelta
    )

    addToFeatureDetails(
      ensureFeatureDetails(usageState.byFeatureDetails, normalized.feature),
      normalized,
      activeListenerDelta
    )
  }

  if (normalized.action) {
    addToBucket(
      ensureBucket(usageState.byAction, normalized.action),
      normalized,
      activeListenerDelta
    )
  }

  updateActiveListenerRegistry(normalized)

  usageState.recentEntries = [
    normalized,
    ...(usageState.recentEntries || []),
  ].slice(0, Number(config.maxRecentEntries || 200))

  const totalKb =
    normalized.estimatedKb +
    normalized.estimatedReadKb +
    normalized.estimatedWriteKb

  const threshold = Number(config.expensiveActionKbThreshold || 250)

  if (totalKb >= threshold) {
    usageState.expensiveActions = [
      {
        ...normalized,
        totalEstimatedKb: Number(totalKb.toFixed(2)),
      },
      ...usageState.expensiveActions,
    ].slice(0, Number(config.maxExpensiveActions || 20))
  }

  if (!config.skipBroadcast) {
    broadcastEntry(normalized)
  }

  return normalized
}

if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
  usageChannel = new BroadcastChannel(FIRESTORE_USAGE_CHANNEL)
  usageChannel.onmessage = event => {
    const message = event?.data || {}
    if (message.sourceRuntimeId === runtimeId) return

    if (message.type === 'reset') {
      resetFirestoreUsageSession({ broadcast: false })
      return
    }

    if (message.type === 'entry' && message.entry) {
      pushFirestoreUsageEntry(message.entry, {
        skipBroadcast: true,
      })
    }
  }
}
