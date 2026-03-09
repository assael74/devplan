// src/fcmClient.js
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { getFirestore, doc, setDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';

const db = getFirestore();
const messaging = getMessaging();

export async function enableFcm({ userId, vapidKey }) {
  if (!(await isSupported())) return null;

  const perm = await Notification.requestPermission();
  if (perm !== 'granted') return null;

  const swReg = await navigator.serviceWorker.getRegistration();
  const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: swReg });
  if (!token) return null;

  await setDoc(doc(db, 'users', userId), {
    fcmTokens: arrayUnion(token),
    fcmUpdatedAt: serverTimestamp()
  }, { merge: true });

  onMessage(messaging, ({ notification }) => {
    if (!notification) return;
    new Notification(notification.title || 'פגישה', { body: notification.body || '' });
  });

  return token;
}
