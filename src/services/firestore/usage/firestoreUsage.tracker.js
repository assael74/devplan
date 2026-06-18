// src/services/firestore/usage/firestoreUsage.tracker.js

import { FIRESTORE_USAGE_CONFIG } from './firestoreUsage.config.js'
import { estimatePayloadKb } from './firestoreUsage.size.js'
import {
  getFirestoreUsageSession,
  pushFirestoreUsageEntry,
  resetFirestoreUsageSession,
} from './firestoreUsage.session.js'

const safePath = ref => {
  if (!ref) return 'unknown'
  return ref.path || ref.id || 'unknown'
}

const usageConsoleLog = (label, entry) => {
  if (!FIRESTORE_USAGE_CONFIG.consoleEnabled) return

  const docsCount = Number(entry.docsCount || 0)
  const readsCount = Number(entry.readsCount || 0)
  const writesCount = Number(entry.writesCount || 0)
  const logicalDeletesCount = Number(entry.logicalDeletesCount || 0)
  const estimatedKb = Number(entry.estimatedKb || 0)

  const operationText =
    label === 'transaction'
      ? `${readsCount} reads | ${writesCount} writes | ${logicalDeletesCount} logical deletes`
      : `${docsCount} docs`

  console.groupCollapsed(
    `[FirestoreUsage] ${label} | ${entry.collection} | ${operationText} | ${estimatedKb.toFixed(2)} KB`
  )

  console.log(entry)
  console.groupEnd()
}

export function trackFirestoreListenerOpen({
  collection,
  shortKey,
  feature,
  action,
  source = 'client',
} = {}) {
  if (!FIRESTORE_USAGE_CONFIG.enabled) return null

  const entry = pushFirestoreUsageEntry(
    {
      operation: 'listener-open',
      collection,
      shortKey,
      feature,
      action,
      source,
    },
    FIRESTORE_USAGE_CONFIG
  )

  usageConsoleLog('listener-open', entry)

  return entry
}

export function trackFirestoreListenerUpdate({
  collection,
  shortKey,
  feature,
  action,
  docs,
  docsCount,
  estimatedKb,
  source = 'client',
} = {}) {
  if (!FIRESTORE_USAGE_CONFIG.enabled) return null

  const payloadKb = estimatedKb ?? estimatePayloadKb(docs)

  const count =
    docsCount ??
    (Array.isArray(docs) ? docs.length : docs ? 1 : 0)

  const entry = pushFirestoreUsageEntry(
    {
      operation: 'listener-update',
      collection,
      shortKey,
      feature,
      action,
      docsCount: count,
      estimatedKb: payloadKb,
      source,
    },
    FIRESTORE_USAGE_CONFIG
  )

  usageConsoleLog('listener-update', entry)

  return entry
}

export function trackFirestoreRead({
  collection,
  shortKey,
  feature,
  action,
  docs,
  docsCount,
  estimatedKb,
  source = 'client',
} = {}) {
  if (!FIRESTORE_USAGE_CONFIG.enabled) return null

  const payloadKb = estimatedKb ?? estimatePayloadKb(docs)

  const count =
    docsCount ??
    (Array.isArray(docs) ? docs.length : docs ? 1 : 0)

  const entry = pushFirestoreUsageEntry(
    {
      operation: 'read',
      collection,
      shortKey,
      feature,
      action,
      docsCount: count,
      estimatedKb: payloadKb,
      source,
    },
    FIRESTORE_USAGE_CONFIG
  )

  usageConsoleLog('read', entry)

  return entry
}

export function trackFirestoreWrite({
  collection,
  shortKey,
  feature,
  action,
  docs,
  writesCount = 1,
  estimatedKb,
  source = 'client',
} = {}) {
  if (!FIRESTORE_USAGE_CONFIG.enabled) return null

  const payloadKb = estimatedKb ?? estimatePayloadKb(docs)

  const entry = pushFirestoreUsageEntry(
    {
      operation: 'write',
      collection,
      shortKey,
      feature,
      action,
      writesCount,
      estimatedKb: payloadKb,
      source,
    },
    FIRESTORE_USAGE_CONFIG
  )

  usageConsoleLog('write', entry)

  return entry
}

export function trackFirestoreDelete({
  collection,
  shortKey,
  feature,
  action,
  deletesCount = 1,
  source = 'client',
} = {}) {
  if (!FIRESTORE_USAGE_CONFIG.enabled) return null

  const entry = pushFirestoreUsageEntry(
    {
      operation: 'document-delete',
      collection,
      shortKey,
      feature,
      action,
      documentDeletesCount: deletesCount,
      source,
    },
    FIRESTORE_USAGE_CONFIG
  )

  usageConsoleLog('document-delete', entry)

  return entry
}

export function trackFirestoreTransaction({
  collection,
  shortKey,
  feature,
  action,

  readsCount = 0,
  writesCount = 0,

  documentDeletesCount = 0,
  logicalDeletesCount = 0,

  readPayload,
  writePayload,

  estimatedReadKb,
  estimatedWriteKb,

  source = 'client',
  meta,
} = {}) {
  if (!FIRESTORE_USAGE_CONFIG.enabled) return null

  const resolvedReadKb =
    estimatedReadKb ?? estimatePayloadKb(readPayload)

  const resolvedWriteKb =
    estimatedWriteKb ?? estimatePayloadKb(writePayload)

  const totalEstimatedKb = Number(
    (resolvedReadKb + resolvedWriteKb).toFixed(2)
  )

  const entry = pushFirestoreUsageEntry(
    {
      operation: 'transaction',

      collection,
      shortKey,
      feature,
      action,

      readsCount,
      writesCount,

      documentDeletesCount,
      logicalDeletesCount,

      estimatedReadKb: resolvedReadKb,
      estimatedWriteKb: resolvedWriteKb,

      source,
      meta,
    },
    FIRESTORE_USAGE_CONFIG
  )

  usageConsoleLog('transaction', {
    ...entry,
    docsCount: readsCount,
    estimatedKb: totalEstimatedKb,
  })

  return entry
}

export function getFirestoreUsageSnapshot() {
  return getFirestoreUsageSession()
}

export function resetFirestoreUsageSnapshot() {
  return resetFirestoreUsageSession()
}

export function getCollectionNameFromRef(ref) {
  return safePath(ref)
}

/**
 * כלי debug זמניים.
 *
 * כאשר נסיים את הפיתוח, מספיק לשנות:
 * consoleEnabled: false
 *
 * ב-firestoreUsage.config.js.
 */
if (
  typeof window !== 'undefined' &&
  FIRESTORE_USAGE_CONFIG.consoleEnabled
) {
  window.getFirestoreUsageSnapshot =
    getFirestoreUsageSnapshot

  window.resetFirestoreUsageSnapshot =
    resetFirestoreUsageSnapshot

  window.setTimeout(() => {
    console.log(
      '[FirestoreUsage] Current snapshot:',
      getFirestoreUsageSnapshot()
    )
  }, 3000)
}
