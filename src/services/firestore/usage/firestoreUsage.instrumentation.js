// src/services/firestore/usage/firestoreUsage.instrumentation.js

import {
  getCountFromServer,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  runTransaction,
} from 'firebase/firestore'

import {
  trackFirestoreRead,
  trackFirestoreTransaction,
  trackFirestoreWrite,
  trackFirestoreDelete,
} from './firestoreUsage.tracker.js'

const now = () => (
  typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now()
)

const getErrorCode = error => (
  error?.code || error?.name || 'unknown'
)

const getCollectionFromRef = ref => {
  const path = String(ref?.path || ref?._query?.path?.canonicalString?.() || '')
  const [collectionName] = path.split('/').filter(Boolean)
  return collectionName || 'unknown'
}

const buildReadMeta = ({ meta, billingEstimate } = {}) => ({
  ...(meta || {}),
  billingEstimate,
})

export async function trackedGetDoc(ref, context = {}) {
  const startedAt = now()
  const collection = context.collection || getCollectionFromRef(ref)

  try {
    const snapshot = await getDoc(ref)
    const exists = snapshot.exists()
    const data = exists ? snapshot.data() : null

    trackFirestoreRead({
      ...context,
      collection,
      operationSubtype: context.operationSubtype || 'getDoc',
      docs: data,
      docsCount: exists ? 1 : 0,
      readsCount: 1,
      durationMs: now() - startedAt,
      meta: buildReadMeta({
        meta: context.meta,
        billingEstimate: exists ? 'document-read' : 'missing-document-read',
      }),
    })

    return snapshot
  } catch (error) {
    trackFirestoreRead({
      ...context,
      collection,
      operationSubtype: context.operationSubtype || 'getDoc',
      readsCount: 0,
      durationMs: now() - startedAt,
      status: 'error',
      errorCode: getErrorCode(error),
      meta: buildReadMeta({
        meta: context.meta,
        billingEstimate: 'unknown-on-error',
      }),
    })

    throw error
  }
}

export async function trackedGetDocs(queryRef, context = {}) {
  const startedAt = now()
  const collection = context.collection || getCollectionFromRef(queryRef)

  try {
    const snapshot = await getDocs(queryRef)
    const docs = snapshot.docs.map(item => item.data())
    const docsCount = snapshot.size

    trackFirestoreRead({
      ...context,
      collection,
      operationSubtype: context.operationSubtype || 'getDocs',
      docs,
      docsCount,
      readsCount: Math.max(1, docsCount),
      durationMs: now() - startedAt,
      meta: buildReadMeta({
        meta: context.meta,
        billingEstimate: docsCount
          ? 'returned-documents'
          : 'minimum-query-read',
      }),
    })

    return snapshot
  } catch (error) {
    trackFirestoreRead({
      ...context,
      collection,
      operationSubtype: context.operationSubtype || 'getDocs',
      readsCount: 0,
      durationMs: now() - startedAt,
      status: 'error',
      errorCode: getErrorCode(error),
      meta: buildReadMeta({
        meta: context.meta,
        billingEstimate: 'unknown-on-error',
      }),
    })

    throw error
  }
}

export async function trackedGetCountFromServer(queryRef, context = {}) {
  const startedAt = now()
  const collection = context.collection || getCollectionFromRef(queryRef)

  try {
    const snapshot = await getCountFromServer(queryRef)
    const count = Number(snapshot.data()?.count || 0)

    trackFirestoreRead({
      ...context,
      collection,
      operationSubtype: context.operationSubtype || 'aggregation-count',
      docsCount: 0,
      readsCount: 1,
      durationMs: now() - startedAt,
      meta: buildReadMeta({
        meta: {
          ...(context.meta || {}),
          resultCount: count,
        },
        billingEstimate: 'aggregation-minimum-estimate',
      }),
    })

    return snapshot
  } catch (error) {
    trackFirestoreRead({
      ...context,
      collection,
      operationSubtype: context.operationSubtype || 'aggregation-count',
      readsCount: 0,
      durationMs: now() - startedAt,
      status: 'error',
      errorCode: getErrorCode(error),
      meta: buildReadMeta({
        meta: context.meta,
        billingEstimate: 'unknown-on-error',
      }),
    })

    throw error
  }
}

export async function trackedSetDoc(ref, data, options, context = {}) {
  const startedAt = now()
  const collection = context.collection || getCollectionFromRef(ref)

  try {
    const result = await setDoc(ref, data, options)
    trackFirestoreWrite({
      ...context,
      collection,
      operationSubtype: context.operationSubtype || 'setDoc',
      docs: data,
      writesCount: 1,
      durationMs: now() - startedAt,
    })
    return result
  } catch (error) {
    trackFirestoreWrite({
      ...context,
      collection,
      operationSubtype: context.operationSubtype || 'setDoc',
      writesCount: 0,
      durationMs: now() - startedAt,
      status: 'error',
      errorCode: getErrorCode(error),
      meta: { ...(context.meta || {}), attemptedWritesCount: 1 },
    })
    throw error
  }
}

export async function trackedUpdateDoc(ref, data, ...args) {
  const maybeContext = args.length && args[args.length - 1]?.__firestoreUsageContext
    ? args.pop().__firestoreUsageContext
    : {}
  const context = maybeContext || {}
  const startedAt = now()
  const collection = context.collection || getCollectionFromRef(ref)

  try {
    const result = await updateDoc(ref, data, ...args)
    trackFirestoreWrite({
      ...context,
      collection,
      operationSubtype: context.operationSubtype || 'updateDoc',
      docs: data,
      writesCount: 1,
      durationMs: now() - startedAt,
    })
    return result
  } catch (error) {
    trackFirestoreWrite({
      ...context,
      collection,
      operationSubtype: context.operationSubtype || 'updateDoc',
      writesCount: 0,
      durationMs: now() - startedAt,
      status: 'error',
      errorCode: getErrorCode(error),
      meta: { ...(context.meta || {}), attemptedWritesCount: 1 },
    })
    throw error
  }
}

export async function trackedDeleteDoc(ref, context = {}) {
  const startedAt = now()
  const collection = context.collection || getCollectionFromRef(ref)

  try {
    const result = await deleteDoc(ref)
    trackFirestoreDelete({
      ...context,
      collection,
      operationSubtype: context.operationSubtype || 'deleteDoc',
      deletesCount: 1,
      durationMs: now() - startedAt,
    })
    return result
  } catch (error) {
    trackFirestoreDelete({
      ...context,
      collection,
      operationSubtype: context.operationSubtype || 'deleteDoc',
      deletesCount: 0,
      durationMs: now() - startedAt,
      status: 'error',
      errorCode: getErrorCode(error),
      meta: { ...(context.meta || {}), attemptedDeletesCount: 1 },
    })
    throw error
  }
}

export function createTrackedWriteBatch(db, context = {}) {
  const batch = writeBatch(db)
  const counters = {
    writesCount: 0,
    documentDeletesCount: 0,
    writePayload: [],
  }

  const trackedBatch = {
    set(ref, data, options) {
      counters.writesCount += 1
      counters.writePayload.push(data)
      batch.set(ref, data, options)
      return trackedBatch
    },
    update(ref, data, ...fieldValues) {
      counters.writesCount += 1
      counters.writePayload.push(data)
      batch.update(ref, data, ...fieldValues)
      return trackedBatch
    },
    delete(ref) {
      counters.documentDeletesCount += 1
      batch.delete(ref)
      return trackedBatch
    },
    async commit() {
      const startedAt = now()

      try {
        const result = await batch.commit()

        trackFirestoreTransaction({
          ...context,
          collection: context.collection || 'unknown',
          operationSubtype: context.operationSubtype || 'writeBatch',
          writesCount: counters.writesCount,
          documentDeletesCount: counters.documentDeletesCount,
          writePayload: counters.writePayload,
          durationMs: now() - startedAt,
          meta: {
            ...(context.meta || {}),
            batchOperationsCount:
              counters.writesCount + counters.documentDeletesCount,
          },
        })

        return result
      } catch (error) {
        trackFirestoreTransaction({
          ...context,
          collection: context.collection || 'unknown',
          operationSubtype: context.operationSubtype || 'writeBatch',
          writesCount: 0,
          documentDeletesCount: 0,
          durationMs: now() - startedAt,
          status: 'error',
          errorCode: getErrorCode(error),
          meta: {
            ...(context.meta || {}),
            attemptedWritesCount: counters.writesCount,
            attemptedDeletesCount: counters.documentDeletesCount,
          },
        })

        throw error
      }
    },
  }

  return trackedBatch
}

export async function trackedRunTransaction(db, updateFunction, context = {}, options) {
  const startedAt = now()
  const attempts = []

  try {
    const result = await runTransaction(db, async transaction => {
        const counters = {
          readsCount: 0,
          writesCount: 0,
          documentDeletesCount: 0,
          readPayload: [],
          writePayload: [],
          collections: new Set(),
        }

        const rememberRef = ref => {
          const collection = getCollectionFromRef(ref)
          if (collection && collection !== 'unknown') counters.collections.add(collection)
        }

        const trackedTransaction = {
          async get(ref) {
            rememberRef(ref)
            const snapshot = await transaction.get(ref)
            counters.readsCount += 1
            if (snapshot.exists()) counters.readPayload.push(snapshot.data())
            return snapshot
          },
          set(ref, data, setOptions) {
            rememberRef(ref)
            counters.writesCount += 1
            counters.writePayload.push(data)
            transaction.set(ref, data, setOptions)
            return trackedTransaction
          },
          update(ref, data, ...fieldValues) {
            rememberRef(ref)
            counters.writesCount += 1
            counters.writePayload.push(data)
            transaction.update(ref, data, ...fieldValues)
            return trackedTransaction
          },
          delete(ref) {
            rememberRef(ref)
            counters.documentDeletesCount += 1
            transaction.delete(ref)
            return trackedTransaction
          },
        }

        const value = await updateFunction(trackedTransaction)
        attempts.push(counters)
        return value
      }, options)

    const finalAttempt = attempts[attempts.length - 1] || {
      writesCount: 0,
      documentDeletesCount: 0,
      writePayload: [],
      collections: new Set(),
    }
    const readsCount = attempts.reduce((sum, item) => sum + item.readsCount, 0)
    const readPayload = attempts.flatMap(item => item.readPayload)
    const collections = Array.from(
      attempts.reduce((set, item) => {
        item.collections.forEach(value => set.add(value))
        return set
      }, new Set())
    )

    trackFirestoreTransaction({
      ...context,
      feature: context.feature || 'playersDatabase',
      action: context.action || 'firestore-transaction',
      collection: context.collection || collections[0] || 'unknown',
      operationSubtype: context.operationSubtype || 'runTransaction',
      readsCount,
      writesCount: finalAttempt.writesCount,
      documentDeletesCount: finalAttempt.documentDeletesCount,
      readPayload,
      writePayload: finalAttempt.writePayload,
      durationMs: now() - startedAt,
      meta: {
        ...(context.meta || {}),
        attemptsCount: attempts.length,
        collections,
      },
    })

    return result
  } catch (error) {
    trackFirestoreTransaction({
      ...context,
      feature: context.feature || 'playersDatabase',
      action: context.action || 'firestore-transaction',
      collection: context.collection || 'unknown',
      operationSubtype: context.operationSubtype || 'runTransaction',
      readsCount: attempts.reduce((sum, item) => sum + item.readsCount, 0),
      writesCount: 0,
      documentDeletesCount: 0,
      durationMs: now() - startedAt,
      status: 'error',
      errorCode: getErrorCode(error),
      meta: {
        ...(context.meta || {}),
        attemptsCount: attempts.length,
      },
    })
    throw error
  }
}
