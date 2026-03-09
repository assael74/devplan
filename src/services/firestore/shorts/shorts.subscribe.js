// src/services/firestore/shorts/subscribeShorts.js
import { onSnapshot } from 'firebase/firestore'

/**
 * מנוי אחיד לקולקשן "shorts" שמחזיר מערך: [{ docName, list, ...rest }]
 * תואם למבנה שבו אתה משתמש: docName + list:contentReference[oaicite:2]{index=2}
 */
 export function subscribeShorts(colRef, onData, onError) {
   return onSnapshot(
     colRef,
     (snap) => {
       const docs = snap.docs.map((d) => ({
         docName: d.id,
         ...d.data(),
       }))

       //console.log('[Firestore Shorts]', colRef.path, docs)

       onData(docs)
     },
     (err) => onError?.(err)
   )
 }
