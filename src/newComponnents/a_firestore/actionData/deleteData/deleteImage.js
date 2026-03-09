import { ref, deleteObject } from "firebase/storage";
import { storage } from "../../../FbConfig";
import { IS_DEV } from "./helpers/config";

/**
 * ממיר כתובת URL של Firebase Storage לנתיב פנימי עבור ref
 * @param {string} url - כתובת downloadURL של Firebase
 * @returns {string} path פנימי כמו: "images/players/abc.jpg"
 */
export const getStoragePathFromUrl = (url) => {
  try {
    const decoded = decodeURIComponent(url);
    const path = decoded.split("/o/")[1]?.split("?alt=")[0];
    return path || '';
  } catch (err) {
    console.warn("⚠️ לא הצלחנו לחלץ נתיב מתוך ה־URL:", err.message);
    return '';
  }
};

/**
 * מוחק קובץ מתוך Firebase Storage לפי נתיב
 * @param {string} path - נתיב הקובץ (למשל images/players/abc.jpg)
 */
export const deleteImageFromStorage = async (path) => {
  if (!path) {
    console.warn("⚠️ לא סופק path למחיקה");
    return;
  }

  const imageRef = ref(storage, path);

  if (IS_DEV) {
    console.log("🧪 [DEV MODE] הדמיית מחיקת תמונה:", path);
    return;
  }

  try {
    await deleteObject(imageRef);
    console.log("🗑️ התמונה נמחקה בהצלחה:", path);
  } catch (err) {
    console.error("❌ שגיאה במחיקת התמונה:", err.message);
  }
};
