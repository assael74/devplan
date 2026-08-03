// src/services/firestore/usage/index.js

export {
  trackFirestoreRead,
  trackFirestoreListenerOpen,
  trackFirestoreListenerClose,
  trackFirestoreListenerUpdate,
  trackFirestoreWrite,
  trackFirestoreDelete,
  trackFirestoreTransaction,

  getFirestoreUsageSnapshot,
  resetFirestoreUsageSnapshot,
  getCollectionNameFromRef,
} from './firestoreUsage.tracker.js'

export {
  estimatePayloadBytes,
  estimatePayloadKb,
  bytesToKb,
} from './firestoreUsage.size.js'

export { trackedGetDoc, trackedGetDocs, trackedGetCountFromServer, trackedSetDoc, trackedUpdateDoc, trackedDeleteDoc, createTrackedWriteBatch, trackedRunTransaction } from './firestoreUsage.instrumentation.js'
export { FIRESTORE_USAGE_COVERAGE, getFirestoreUsageCoverage } from './firestoreUsage.coverage.js'
