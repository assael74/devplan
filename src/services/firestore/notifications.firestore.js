// src/services/firestore/notifications.firestore.js

import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase/firebase'
import {
  createTrackedWriteBatch,
  trackFirestoreListenerClose,
  trackFirestoreListenerOpen,
  trackFirestoreListenerUpdate,
  trackedDeleteDoc,
  trackedGetDocs,
  trackedUpdateDoc,
} from './usage/index.js'

const NOTIFICATIONS_COLLECTION = 'users/*/notifications'

function getUserNotificationsCollection(userId) {
  return collection(db, 'users', userId, 'notifications')
}

const getErrorCode = error => error?.code || error?.name || 'unknown'

export function buildUserNotificationsQuery(userId, options = {}) {
  const safeLimit = Number.isFinite(options?.limit) ? options.limit : 50

  return query(
    getUserNotificationsCollection(userId),
    orderBy('createdAt', 'desc'),
    limit(safeLimit)
  )
}

export function subscribeUserNotifications(userId, onData, onError, options = {}) {
  if (!userId) {
    onData?.([])
    return () => {}
  }

  const safeLimit = Number.isFinite(options?.limit) ? options.limit : 50
  const q = buildUserNotificationsQuery(userId, { limit: safeLimit })
  const usageMeta = {
    collection: NOTIFICATIONS_COLLECTION,
    feature: 'notifications',
    action: 'subscribe-user-notifications',
    queryKey: `notifications:latest:${safeLimit}`,
    meta: { limit: safeLimit },
  }
  const openEntry = trackFirestoreListenerOpen(usageMeta)
  const listenerId = openEntry?.listenerId || null
  let hasInitialSnapshot = false

  const unsubscribe = onSnapshot(
    q,
    snapshot => {
      const items = snapshot.docs.map(item => ({
        id: item.id,
        ...item.data(),
      }))
      const changedItems = hasInitialSnapshot
        ? snapshot.docChanges().map(change => ({
            changeType: change.type,
            id: change.doc.id,
            ...change.doc.data(),
          }))
        : items
      const isFromCache = Boolean(snapshot.metadata?.fromCache)
      const readsCount = isFromCache
        ? 0
        : hasInitialSnapshot
          ? changedItems.length
          : Math.max(1, changedItems.length)

      trackFirestoreListenerUpdate({
        ...usageMeta,
        listenerId,
        listenerPhase: hasInitialSnapshot ? 'update' : 'initial',
        docs: changedItems,
        docsCount: changedItems.length,
        readsCount,
        fromCache: isFromCache,
        meta: {
          ...usageMeta.meta,
          totalDocumentsInSnapshot: items.length,
        },
      })

      hasInitialSnapshot = true
      onData?.(items)
    },
    error => {
      trackFirestoreListenerUpdate({
        ...usageMeta,
        listenerId,
        listenerPhase: 'error',
        docsCount: 0,
        readsCount: 0,
        status: 'error',
        errorCode: getErrorCode(error),
      })
      onError?.(error)
    }
  )

  return () => {
    unsubscribe()
    trackFirestoreListenerClose({
      ...usageMeta,
      listenerId,
    })
  }
}

export async function markNotificationRead(userId, notificationId) {
  if (!userId || !notificationId) return

  const ref = doc(db, 'users', userId, 'notifications', notificationId)

  await trackedUpdateDoc(
    ref,
    {
      status: 'read',
      readAt: serverTimestamp(),
    },
    {
      __firestoreUsageContext: {
        collection: NOTIFICATIONS_COLLECTION,
        feature: 'notifications',
        action: 'mark-notification-read',
        operationSubtype: 'update-notification',
      },
    }
  )
}

export async function markAllNotificationsRead(userId) {
  if (!userId) return

  const queryLimit = 200
  const q = buildUserNotificationsQuery(userId, { limit: queryLimit })
  const snapshot = await trackedGetDocs(q, {
    collection: NOTIFICATIONS_COLLECTION,
    feature: 'notifications',
    action: 'load-unread-notifications-for-batch',
    operationSubtype: 'getDocs-before-writeBatch',
    queryKey: `notifications:mark-all:${queryLimit}`,
    meta: { limit: queryLimit },
  })

  const unreadDocs = snapshot.docs.filter(item => {
    const data = item.data()
    return !data?.readAt && data?.status !== 'read'
  })

  if (!unreadDocs.length) return

  const batch = createTrackedWriteBatch(db, {
    collection: NOTIFICATIONS_COLLECTION,
    feature: 'notifications',
    action: 'mark-all-notifications-read',
    operationSubtype: 'writeBatch-update',
    meta: {
      selectedDocumentsCount: snapshot.size,
      unreadDocumentsCount: unreadDocs.length,
    },
  })

  unreadDocs.forEach(item => {
    batch.update(item.ref, {
      status: 'read',
      readAt: serverTimestamp(),
    })
  })

  await batch.commit()
}

export async function deleteNotificationById(userId, notificationId) {
  if (!userId || !notificationId) return

  const ref = doc(db, 'users', userId, 'notifications', notificationId)
  await trackedDeleteDoc(ref, {
    collection: NOTIFICATIONS_COLLECTION,
    feature: 'notifications',
    action: 'delete-notification',
    operationSubtype: 'deleteDoc',
  })
}
