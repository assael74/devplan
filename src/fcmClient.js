// src/fcmClient.js
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging'
import { doc, setDoc, arrayUnion, serverTimestamp } from 'firebase/firestore'
import { app, db } from './services/firebase/firebase.js'

let foregroundUnsubscribe = null

function canUseBrowserApis() {
  return typeof window !== 'undefined' && typeof navigator !== 'undefined'
}

export async function enableFcm({ userId, vapidKey }) {
  try {
    if (!canUseBrowserApis()) return null
    if (!userId || !vapidKey) return null

    const supported = await isSupported().catch(() => false)
    if (!supported) return null

    if (!('Notification' in window)) return null
    if (!('serviceWorker' in navigator)) return null

    const perm = await Notification.requestPermission()
    if (perm !== 'granted') return null

    const swReg = await navigator.serviceWorker.getRegistration()
    if (!swReg) return null

    const messaging = getMessaging(app)

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: swReg,
    })

    if (!token) return null

    await setDoc(
      doc(db, 'users', userId),
      {
        fcmTokens: arrayUnion(token),
        fcmUpdatedAt: serverTimestamp(),
      },
      { merge: true }
    )

    if (foregroundUnsubscribe) {
      foregroundUnsubscribe()
      foregroundUnsubscribe = null
    }

    foregroundUnsubscribe = onMessage(messaging, ({ notification }) => {
      if (!notification) return
      if (Notification.permission !== 'granted') return

      new Notification(notification.title || 'פגישה', {
        body: notification.body || '',
      })
    })

    return token
  } catch (error) {
    console.error('enableFcm failed', error)
    return null
  }
}
