// src/services/firestore/notifications.firestore.js

import {
  collection,
  doc,
  deleteDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase/firebase'

// אם אצלך הנתיב שונה, תשנה רק את השורה הזאת.

function getUserNotificationsCollection(userId) {
  return collection(db, 'users', userId, 'notifications')
}

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

  const q = buildUserNotificationsQuery(userId, options)

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }))

      onData?.(items)
    },
    (error) => {
      onError?.(error)
    }
  )
}

export async function markNotificationRead(userId, notificationId) {
  if (!userId || !notificationId) return

  const ref = doc(db, 'users', userId, 'notifications', notificationId)

  await updateDoc(ref, {
    status: 'read',
    readAt: serverTimestamp(),
  })
}

export async function markAllNotificationsRead(userId) {
  if (!userId) return

  const q = buildUserNotificationsQuery(userId, { limit: 200 })
  const snapshot = await getDocs(q)

  const unreadDocs = snapshot.docs.filter((item) => {
    const data = item.data()
    return !data?.readAt && data?.status !== 'read'
  })

  if (!unreadDocs.length) return

  const batch = writeBatch(db)

  unreadDocs.forEach((item) => {
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
  await deleteDoc(ref)
}
