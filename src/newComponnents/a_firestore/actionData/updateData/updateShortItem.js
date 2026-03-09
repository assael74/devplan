import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from "../../../FbConfig";
import { IS_DEV } from './config'; // אם רלוונטי

export async function updateShortItem({
  collection,
  docId,
  updates,
  onSuccess,
  onError,
  logging = true,
  debug = IS_DEV,
}) {
  const ref = doc(db, collection, docId);
  
  try {
    if (debug) {
      console.log('✏️ עדכון למסמך:', docId, updates);
      return;
    }

    await updateDoc(ref, updates);

    if (logging) console.log(`[shorts] Updated ${collection}/${docId}`, updates);
    if (onSuccess) onSuccess();
  } catch (err) {
    console.error(`[shorts] Error updating ${collection}/${docId}:`, err.message);
    if (onError) onError(err);
  }
}
