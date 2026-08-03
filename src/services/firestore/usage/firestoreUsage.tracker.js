// src/services/firestore/usage/firestoreUsage.tracker.js

import { FIRESTORE_USAGE_CONFIG } from './firestoreUsage.config.js'
import { estimatePayloadKb } from './firestoreUsage.size.js'
import {
  getFirestoreUsageSession,
  pushFirestoreUsageEntry,
  resetFirestoreUsageSession,
  getFirestoreUsageRuntimeId,
} from './firestoreUsage.session.js'

let listenerSequence = 0
const runtimeId = getFirestoreUsageRuntimeId()

const safePath = ref => {
  if (!ref) return 'unknown'
  return ref.path || ref.id || 'unknown'
}

const createListenerId = ({ collection, feature, action } = {}) => {
  listenerSequence += 1
  return [
    feature || 'unknown',
    action || 'listener',
    collection || 'unknown',
    runtimeId,
    listenerSequence,
  ].join(':')
}

const usageConsoleLog = (label, entry) => {
  if (!FIRESTORE_USAGE_CONFIG.consoleEnabled) return

  const docsCount = Number(entry.docsCount || 0)
  const readsCount = Number(entry.readsCount || 0)
  const writesCount = Number(entry.writesCount || 0)
  const logicalDeletesCount = Number(entry.logicalDeletesCount || 0)
  const estimatedKb = Number(
    entry.estimatedKb ||
      entry.estimatedReadKb ||
      entry.estimatedWriteKb ||
      0
  )

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
  listenerId,
  source = 'client',
  meta,
} = {}) {
  if (!FIRESTORE_USAGE_CONFIG.enabled) return null

  const resolvedListenerId =
    listenerId || createListenerId({ collection, feature, action })

  const entry = pushFirestoreUsageEntry(
    {
      operation: 'listener-open',
      collection,
      shortKey,
      feature,
      action,
      listenerId: resolvedListenerId,
      listenerPhase: 'open',
      source,
      meta,
    },
    FIRESTORE_USAGE_CONFIG
  )

  usageConsoleLog('listener-open', entry)

  return entry
}

export function trackFirestoreListenerClose({
  collection,
  shortKey,
  feature,
  action,
  listenerId,
  source = 'client',
  meta,
} = {}) {
  if (!FIRESTORE_USAGE_CONFIG.enabled || !listenerId) return null

  const entry = pushFirestoreUsageEntry(
    {
      operation: 'listener-close',
      collection,
      shortKey,
      feature,
      action,
      listenerId,
      listenerPhase: 'close',
      source,
      meta,
    },
    FIRESTORE_USAGE_CONFIG
  )

  usageConsoleLog('listener-close', entry)

  return entry
}

export function trackFirestoreListenerUpdate({
  collection,
  shortKey,
  feature,
  action,
  listenerId,
  listenerPhase = 'update',
  docs,
  docsCount,
  readsCount,
  estimatedKb,
  fromCache = false,
  durationMs,
  status = 'success',
  errorCode,
  source = 'client',
  meta,
} = {}) {
  if (!FIRESTORE_USAGE_CONFIG.enabled) return null

  const payloadKb =
    estimatedKb != null ? estimatedKb : estimatePayloadKb(docs)

  const count =
    docsCount != null
      ? docsCount
      : Array.isArray(docs)
        ? docs.length
        : docs
          ? 1
          : 0

  const resolvedReadsCount =
    readsCount != null ? readsCount : count

  const entry = pushFirestoreUsageEntry(
    {
      operation: 'listener-update',
      collection,
      shortKey,
      feature,
      action,
      listenerId,
      listenerPhase,
      docsCount: count,
      readsCount: resolvedReadsCount,
      estimatedKb: payloadKb,
      fromCache,
      durationMs,
      status,
      errorCode,
      source,
      meta,
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
  readsCount,
  estimatedKb,
  operationSubtype,
  queryKey,
  durationMs,
  status = 'success',
  errorCode,
  source = 'client',
  meta,
} = {}) {
  if (!FIRESTORE_USAGE_CONFIG.enabled) return null

  const payloadKb =
    estimatedKb != null ? estimatedKb : estimatePayloadKb(docs)

  const count =
    docsCount != null
      ? docsCount
      : Array.isArray(docs)
        ? docs.length
        : docs
          ? 1
          : 0

  const resolvedReadsCount =
    readsCount != null ? readsCount : count

  const entry = pushFirestoreUsageEntry(
    {
      operation: 'read',
      operationSubtype,
      collection,
      shortKey,
      feature,
      action,
      queryKey,
      docsCount: count,
      readsCount: resolvedReadsCount,
      estimatedKb: payloadKb,
      durationMs,
      status,
      errorCode,
      source,
      meta,
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
  operationSubtype,
  durationMs,
  status = 'success',
  errorCode,
  source = 'client',
  meta,
} = {}) {
  if (!FIRESTORE_USAGE_CONFIG.enabled) return null

  const payloadKb =
    estimatedKb != null ? estimatedKb : estimatePayloadKb(docs)

  const entry = pushFirestoreUsageEntry(
    {
      operation: 'write',
      operationSubtype,
      collection,
      shortKey,
      feature,
      action,
      writesCount,
      estimatedKb: payloadKb,
      durationMs,
      status,
      errorCode,
      source,
      meta,
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
  durationMs,
  status = 'success',
  errorCode,
  source = 'client',
  meta,
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
      durationMs,
      status,
      errorCode,
      source,
      meta,
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
  durationMs,
  status = 'success',
  errorCode,
  source = 'client',
  meta,
} = {}) {
  if (!FIRESTORE_USAGE_CONFIG.enabled) return null

  const resolvedReadKb =
    estimatedReadKb != null
      ? estimatedReadKb
      : estimatePayloadKb(readPayload)

  const resolvedWriteKb =
    estimatedWriteKb != null
      ? estimatedWriteKb
      : estimatePayloadKb(writePayload)

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
      durationMs,
      status,
      errorCode,
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
  listenerSequence = 0
  return resetFirestoreUsageSession()
}

export function getCollectionNameFromRef(ref) {
  return safePath(ref)
}

if (
  typeof window !== 'undefined' &&
  FIRESTORE_USAGE_CONFIG.consoleEnabled
) {
  window.getFirestoreUsageSnapshot = getFirestoreUsageSnapshot
  window.resetFirestoreUsageSnapshot = resetFirestoreUsageSnapshot
}
