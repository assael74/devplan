import { getDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../../../FbConfig";
import { IS_DEBUG } from './config'

/**
 * מוסיף מזהה לרשימה קיימת בתוך list במסמך מסוג shorts
 * @param {Object} params
 * @param {string} params.collection
 * @param {string} params.docId
 * @param {string} params.itemId
 * @param {string} params.targetId - ה-id של האובייקט שצריך לעדכן בתוכו את הרשימה
 * @param {string} params.field - שם השדה ברשימה (כמו teams, players וכו')
 * @param {Function} [params.onSuccess]
 * @param {Function} [params.onError]
 * @param {boolean} [params.debug]
 */
export async function addShortItemList({
  collection,
  docId,
  itemId,
  targetId,
  field,
  onSuccess,
  onError,
  debug = IS_DEBUG,
}) {
  try {
    const ref = doc(db, collection, docId);
    const snap = await getDoc(ref);
    const data = snap.data();

    if (!Array.isArray(data?.list)) {
      throw new Error(`Document ${docId} does not contain a valid list`);
    }

    const updatedList = data.list.map((entry) =>
      entry.id === targetId
        ? {
            ...entry,
            [field]: entry[field]?.includes(itemId)
              ? entry[field]
              : [...(entry[field] || []), itemId],
          }
        : entry
    );

    if (debug) {
      console.group(`[addShortItemList] DEBUG`);
      console.log("📂 collection:", collection);
      console.log("📄 docId:", docId);
      console.log("🎯 targetId:", targetId);
      console.log("➕ itemId:", itemId);
      console.log("📋 updatedList:", updatedList);
      console.groupEnd();
      return;
    }

    await updateDoc(ref, { list: updatedList });

    console.log(`[addShortItemList] ✅ הוסף ${itemId} לשדה ${field} במסמך ${docId}`);
    onSuccess?.();
  } catch (err) {
    console.error("[addShortItemList] ❌ שגיאה:", err.message);
    onError?.(err);
  }
}
