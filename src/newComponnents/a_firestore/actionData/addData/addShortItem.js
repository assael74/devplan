// src/firebase/utils/addShortItem.js
import { doc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';
import { db } from '../../../FbConfig';
import { IS_DEBUG } from './config'

export async function addShortItem({
  collection,
  docId,
  item,
  onSuccess,
  onError,
  logging = false,
  debug = IS_DEBUG,
}) {
  const ref = doc(db, collection, docId);

  try {
    if (debug) {
      console.log("📄 האייטם שנכנס למערך:", docId, item);
      return;
    }

    await updateDoc(ref, {
      list: arrayUnion(item)
    });

    if (logging) console.log(`[shorts] Added to ${collection}/${docId}`, item);
    if (onSuccess) onSuccess();
  } catch (err) {
    console.error(`[shorts] Error in ${collection}/${docId}:`, err.message);
    if (onError) onError(err);
  }
}

export async function setShortItem({
  collection,
  docId,
  item,
  onSuccess,
  onError,
  logging = false,
  debug = IS_DEBUG,
}) {
  const ref = doc(db, collection, docId);

  try {
    if (debug) {
      console.log("🆕 המסמך החדש שייכתב:", docId, item);
      return;
    }

    await setDoc(ref, item);

    if (logging) console.log(`[shorts] Set ${collection}/${docId}`, item);
    if (onSuccess) onSuccess();
  } catch (err) {
    console.error(`[shorts] Error setting ${collection}/${docId}:`, err.message);
    if (onError) onError(err);
  }
}
