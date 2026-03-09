import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../FbConfig";
import { getDiffFields } from "./helpers/getDiffFields";
import { IS_DEV } from "./config";

export async function updateShortItemList({
  collection,
  docId,
  oldItem,
  newItem,
  idField = "id",
  onSuccess,
  onError,
  debug = IS_DEV,
}) {
  try {
    const itemId = oldItem?.[idField] || newItem?.[idField];
    
    if (!itemId || typeof itemId !== "string") {
      throw new Error(`Missing or invalid id field (${idField})`);
    }

    const ref = doc(db, collection, docId);
    const snap = await getDoc(ref);
    const data = snap.data();

    if (!data?.list || !Array.isArray(data.list)) {
      throw new Error(`Document ${docId} in ${collection} does not contain a valid 'list'`);
    }

    const currentItem = data.list.find((item) => item[idField] === itemId);

    if (!currentItem) {
      throw new Error(`Item with id '${itemId}' not found in list`);
    }

    const diff = getDiffFields(currentItem, newItem);

    // ⛔ אם אין שדות שונים – לא נעדכן בכלל
    if (Object.keys(diff).length === 0) {
      if (debug) {
        console.log(`[updateShortItemList] ⚠️ אין שינוי – לא בוצע עדכון ל־${itemId}`);
      }
      return;
    }

    const updatedList = data.list.map((item) =>
      item[idField] === itemId ? { ...item, ...diff } : item
    );

    if (debug) {
      console.group(`[updateShortItemList] DEBUG`);
      console.log("📂 collection:", collection);
      console.log("📄 docId:", docId);
      console.log("🆔 idField:", idField);
      console.log("🧾 oldItem:", oldItem);
      console.log("🆕 newItem:", newItem);
      console.log("🔎 currentItem:", currentItem);
      console.log("🧮 diff:", diff);
      console.log("📋 updatedList:", updatedList);
      console.groupEnd();
      return;
    }

    await updateDoc(ref, { list: updatedList });

    console.log(`[updateShortItemList] ✅ Updated ${collection}/${docId}`);
    onSuccess?.();
  } catch (err) {
    console.error("[updateShortItemList] ❌ Error:", err.message);
    onError?.(err);
  }
}
