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
  writes: 0,

  documentDeletes: 0,
  logicalDeletes: 0,

  listeners: 0,
  activeListeners: 0,
  listenerCloses: 0,
  listenerInitials: 0,
  listenerUpdates: 0,

  estimatedReadKb: 0,
  estimatedWriteKb: 0,
})

const createFeatureDetails = () => ({
  totals: createEmptyBucket(),
  byCollection: {},
  byShortKey: {},
  byAction: {},
  byProcess: {},
})

const createEmptyUsageState = () => ({
  startedAt: new Date().toISOString(),
  updatedAt: null,

  totals: createEmptyBucket(),

  byCollection: {},
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

    addToBucket(usageState.totals, entry)
    addToBucket(ensureBucket(usageState.byCollection, entry.collection), entry)
    addToBucket(ensureBucket(usageState.byProcess, buildProcessKey(entry)), entry)

    if (entry.shortKey) {
      addToBucket(ensureBucket(usageState.byShortKey, entry.shortKey), entry)
    }

    if (entry.feature) {
      addToBucket(ensureBucket(usageState.byFeature, entry.feature), entry)
      addToFeatureDetails(
        ensureFeatureDetails(usageState.byFeatureDetails, entry.feature),
        entry
      )
    }

    if (entry.action) {
      addToBucket(ensureBucket(usageState.byAction, entry.action), entry)
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

const addToBucket = (bucket, entry) => {
  const docsCount = Number(entry.docsCount || 0)
  const readsCount = Number(entry.readsCount || docsCount || 0)
  const writesCount = Number(entry.writesCount || 0)
  const documentDeletesCount = Number(entry.documentDeletesCount || 0)
  const logicalDeletesCount = Number(entry.logicalDeletesCount || 0)
  const estimatedKb = Number(entry.estimatedKb || 0)

  bucket.calls += 1
  bucket.durationMs += Number(entry.durationMs || 0)

  if (entry.status === 'error') {
    bucket.failures += 1
  }

  if (entry.operation === 'read') {
    bucket.reads += readsCount
    bucket.estimatedReadKb += estimatedKb
  }

  if (entry.operation === 'write') {
    bucket.writes += writesCount || 1
    bucket.estimatedWriteKb += estimatedKb
  }

  if (entry.operation === 'document-delete') {
    bucket.documentDeletes += documentDeletesCount || 1
  }

  if (entry.operation === 'logical-delete') {
    const count = logicalDeletesCount || 1
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
    bucket.activeListeners += 1
  }

  if (entry.operation === 'listener-close') {
    bucket.listenerCloses += 1
    bucket.activeListeners = Math.max(0, bucket.activeListeners - 1)
  }

  if (entry.operation === 'listener-update') {
    if (entry.listenerPhase === 'initial') {
      bucket.listenerInitials += 1
    } else {
      bucket.listenerUpdates += 1
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

const addToFeatureDetails = (details, entry) => {
  addToBucket(details.totals, entry)
  addToBucket(ensureBucket(details.byCollection, entry.collection), entry)

  if (entry.shortKey) {
    addToBucket(ensureBucket(details.byShortKey, entry.shortKey), entry)
  }

  if (entry.action) {
    addToBucket(ensureBucket(details.byAction, entry.action), entry)
  }

  addToBucket(ensureBucket(details.byProcess, buildProcessKey(entry)), entry)
}

const updateActiveListenerRegistry = entry => {
  if (!entry.listenerId) return

  if (entry.operation === 'listener-open') {
    usageState.activeListenerIds[entry.listenerId] = {
      listenerId: entry.listenerId,
      collection: entry.collection,
      shortKey: entry.shortKey,
      feature: entry.feature,
      action: entry.action,
      openedAt: entry.createdAt,
      runtimeId: entry.runtimeId || null,
    }
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
  const normalized = {
    id: entry.id || `${runtimeId}-${createdAt}-${entrySequence}`,
    createdAt,
    runtimeId: entry.runtimeId || runtimeId,

    operation: entry.operation || 'read',
    operationSubtype: entry.operationSubtype || null,

    collection: entry.collection || 'unknown',
    shortKey: entry.shortKey || null,
    feature: entry.feature || null,
    action: entry.action || null,
    route: entry.route || null,
    queryKey: entry.queryKey || null,

    docsCount: Number(entry.docsCount || 0),
    readsCount: Number(entry.readsCount || 0),
    writesCount: Number(entry.writesCount || 0),

    documentDeletesCount: Number(entry.documentDeletesCount || 0),
    logicalDeletesCount: Number(entry.logicalDeletesCount || 0),

    estimatedKb: Number(entry.estimatedKb || 0),
    estimatedReadKb: Number(entry.estimatedReadKb || 0),
    estimatedWriteKb: Number(entry.estimatedWriteKb || 0),

    listenerId: entry.listenerId || null,
    listenerPhase: entry.listenerPhase || null,
    fromCache: Boolean(entry.fromCache),

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

  addToBucket(usageState.totals, normalized)
  addToBucket(
    ensureBucket(usageState.byCollection, normalized.collection),
    normalized
  )

  addToBucket(
    ensureBucket(usageState.byProcess, buildProcessKey(normalized)),
    normalized
  )

  if (normalized.shortKey) {
    addToBucket(
      ensureBucket(usageState.byShortKey, normalized.shortKey),
      normalized
    )
  }

  if (normalized.feature) {
    addToBucket(
      ensureBucket(usageState.byFeature, normalized.feature),
      normalized
    )

    addToFeatureDetails(
      ensureFeatureDetails(usageState.byFeatureDetails, normalized.feature),
      normalized
    )
  }

  if (normalized.action) {
    addToBucket(
      ensureBucket(usageState.byAction, normalized.action),
      normalized
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
