import { shortsRefs } from "../shortsRefs";
import { getDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../../../FbConfig";
import { IS_DEBUG } from './config'

/**
 * מוסיף itemId לרשימת field בתוך אובייקט בתוך list במסמך shorts
 */
export async function addToLinkedList({
  parentType,
  parentId,
  field,
  itemId,
  onSuccess,
  onError,
  customUpdater = null,
  debug = IS_DEBUG,
}) {
  try {
    const [category, subCategory] = parentType.split("/");
    const ref = shortsRefs?.[category]?.[subCategory];
    //console.log(category, subCategory)
    if (!ref) {
      throw new Error(`❌ לא נמצאה הפניה ל־shortsRefs עבור ${parentType}`);
    }

    const docId = typeof ref.docId === "function"
      ? ref.docId(parentId)
      : ref.docId || parentId;

    const docRef = doc(db, ref.collection, docId);
    const snap = await getDoc(docRef);
    const data = snap.data();

    if (!Array.isArray(data?.list)) {
      throw new Error(`📄 מסמך ${docId} לא מכיל שדה list תקין`);
    }

    const updatedList = customUpdater
      ? customUpdater(data.list, parentId, field, itemId)
      : data.list.map((entry) =>
          entry.id === parentId
            ? {
                ...entry,
                [field]: entry[field]?.includes(itemId)
                  ? entry[field]
                  : [...(entry[field] || []), itemId],
              }
            : entry
        );

    if (debug) {
      console.group(`[addToLinkedList] DEBUG`);
      console.log("📂 collection:", ref.collection);
      console.log("📄 docId:", docId);
      console.log("🎯 parentId (entry.id):", parentId);
      console.log("➕ itemId:", itemId);
      console.log("🧾 field:", field);
      console.log("📋 updatedList:", updatedList);
      console.groupEnd();
      return;
    }

    await updateDoc(docRef, { list: updatedList });

    console.log(`[addToLinkedList] ✅ ${itemId} נוסף ל-${field} של ${parentId} במסמך ${docId}`);
    onSuccess?.();
  } catch (err) {
    console.error(`[addToLinkedList] ❌ שגיאה:`, err.message);
    onError?.(err);
  }
}
