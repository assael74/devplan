// src/services/firestore/usage/firestoreUsage.session.js

const createEmptyBucket = () => ({
  reads: 0,
  writes: 0,

  // מחיקת מסמך אמיתית באמצעות deleteDoc / tx.delete
  documentDeletes: 0,

  // מחיקת פריטים מתוך מערך ואז כתיבת המסמך מחדש
  logicalDeletes: 0,

  listeners: 0,
  listenerUpdates: 0,

  estimatedReadKb: 0,
  estimatedWriteKb: 0,
})

const createEmptyUsageState = () => ({
  startedAt: new Date().toISOString(),
  updatedAt: null,

  totals: createEmptyBucket(),

  byCollection: {},
  byShortKey: {},
  byFeature: {},
  byAction: {},

  recentEntries: [],
  expensiveActions: [],
})

let usageState = createEmptyUsageState()

export function getFirestoreUsageSession() {
  return usageState
}

export function resetFirestoreUsageSession() {
  usageState = createEmptyUsageState()
  return usageState
}

const ensureBucket = (target, key) => {
  const cleanKey = key || 'unknown'

  if (!target[cleanKey]) {
    target[cleanKey] = createEmptyBucket()
  }

  return target[cleanKey]
}

const addToBucket = (bucket, entry) => {
  const docsCount = Number(entry.docsCount || 0)
  const readsCount = Number(entry.readsCount || docsCount || 0)
  const writesCount = Number(entry.writesCount || 0)
  const documentDeletesCount = Number(entry.documentDeletesCount || 0)
  const logicalDeletesCount = Number(entry.logicalDeletesCount || 0)
  const estimatedKb = Number(entry.estimatedKb || 0)

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
    bucket.logicalDeletes += logicalDeletesCount || 1
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

  if (entry.operation === 'listener-update') {
    bucket.listenerUpdates += 1
    bucket.reads += readsCount
    bucket.estimatedReadKb += estimatedKb
  }
}

export function pushFirestoreUsageEntry(entry = {}, config = {}) {
  const normalized = {
    createdAt: new Date().toISOString(),

    operation: entry.operation || 'read',

    collection: entry.collection || 'unknown',
    shortKey: entry.shortKey || null,
    feature: entry.feature || null,
    action: entry.action || null,

    docsCount: Number(entry.docsCount || 0),
    readsCount: Number(entry.readsCount || 0),
    writesCount: Number(entry.writesCount || 0),

    documentDeletesCount: Number(entry.documentDeletesCount || 0),
    logicalDeletesCount: Number(entry.logicalDeletesCount || 0),

    estimatedKb: Number(entry.estimatedKb || 0),
    estimatedReadKb: Number(entry.estimatedReadKb || 0),
    estimatedWriteKb: Number(entry.estimatedWriteKb || 0),

    source: entry.source || 'client',
    meta: entry.meta || null,
  }

  usageState.updatedAt = normalized.createdAt

  addToBucket(usageState.totals, normalized)

  addToBucket(
    ensureBucket(usageState.byCollection, normalized.collection),
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
  }

  if (normalized.action) {
    addToBucket(
      ensureBucket(usageState.byAction, normalized.action),
      normalized
    )
  }

  usageState.recentEntries = [
    normalized,
    ...(usageState.recentEntries || []),
  ].slice(0, Number(config.maxRecentEntries || 200))

  const totalKb =
    normalized.estimatedKb +
    normalized.estimatedReadKb +
    normalized.estimatedWriteKb

  const threshold = Number(
    config.expensiveActionKbThreshold || 250
  )

  if (totalKb >= threshold) {
    usageState.expensiveActions = [
      {
        ...normalized,
        totalEstimatedKb: Number(totalKb.toFixed(2)),
      },
      ...usageState.expensiveActions,
    ].slice(0, Number(config.maxExpensiveActions || 20))
  }

  return normalized
}
