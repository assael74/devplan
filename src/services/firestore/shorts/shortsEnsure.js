// src/services/shorts/shortsEnsure.js
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase' // תעדכן לפי הנתיב אצלך

// refs – תעדכן אם אצלך שמות שונים
const playersShortsDocRef = (playerId) => doc(db, 'playersShorts', String(playerId))
const abilitiesShortsDocRef = (playerId) => doc(db, 'abilitiesShorts', String(playerId))

export async function ensurePlayerAbilitiesBootstrap({ playerId }) {
  const pid = String(playerId || '').trim()
  if (!pid) throw new Error('ensurePlayerAbilitiesBootstrap: missing playerId')

  const pRef = playersShortsDocRef(pid)
  const aRef = abilitiesShortsDocRef(pid)

  return runTransaction(db, async (tx) => {
    const [pSnap, aSnap] = await Promise.all([tx.get(pRef), tx.get(aRef)])

    // 1) playersShorts/{playerId} for playersAbilities
    if (!pSnap.exists()) {
      tx.set(pRef, {
        docId: pid,
        docName: 'playersAbilities',
        list: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    } else {
      const d = pSnap.data() || {}
      // harden: אם המסמך קיים אבל חסרים שדות (מקרה גבולי)
      const patch = {}
      if (!d.docId) patch.docId = pid
      if (!d.docName) patch.docName = 'playersAbilities'
      if (!Array.isArray(d.list)) patch.list = []
      if (Object.keys(patch).length) {
        patch.updatedAt = serverTimestamp()
        tx.set(pRef, patch, { merge: true })
      }
    }

    // 2) abilitiesShorts/{playerId}
    if (!aSnap.exists()) {
      tx.set(aRef, {
        playerId: pid,
        formsAbilities: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    } else {
      const d = aSnap.data() || {}
      const patch = {}
      if (!d.playerId) patch.playerId = pid
      if (!Array.isArray(d.formsAbilities)) patch.formsAbilities = []
      if (Object.keys(patch).length) {
        patch.updatedAt = serverTimestamp()
        tx.set(aRef, patch, { merge: true })
      }
    }

    return { ok: true, playerId: pid }
  })
}
