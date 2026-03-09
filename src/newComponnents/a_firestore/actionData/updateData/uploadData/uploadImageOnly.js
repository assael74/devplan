import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../../../../FbConfig";

/**
 * מעלה תמונה ל־Firebase Storage ומחזיר כתובת URL.
 * @param {object} params
 * @param {string} params.objectType - 'players' | 'teams' | 'clubs'
 * @param {string} params.objectId - מזהה האובייקט (למשל id של שחקן)
 * @param {File} params.imageFile - קובץ התמונה
 * @param {string} [params.oldImageUrl] - כתובת תמונה ישנה למחיקה (אם קיימת)
 * @param {function} [params.setLoadingImage] - פונקציה לדווח התקדמות (0–100)
 * @returns {Promise<string>} downloadURL
 */
export async function uploadImageOnly({
  objectType,
  objectId,
  imageFile,
  oldImageUrl = '',
  setLoadingImage = () => {},
}) {
  try {
    const imagePath = `images/${objectType}/${objectId}/${imageFile.name}`;
    const imageRef = ref(storage, imagePath);

    // 🗑️ מחיקת תמונה ישנה (אם קיימת)
    if (oldImageUrl) {
      try {
        const oldRef = ref(storage, oldImageUrl);
        await deleteObject(oldRef);
        console.log("🗑️ תמונה ישנה נמחקה:", oldImageUrl);
      } catch (err) {
        console.warn("⚠️ שגיאה במחיקת תמונה ישנה:", err.message);
      }
    }

    // ⬆️ העלאת קובץ חדש
    const uploadTask = uploadBytesResumable(imageRef, imageFile);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setLoadingImage(Math.round(progress));
        },
        (error) => {
          console.error("❌ שגיאה בהעלאה:", error.message);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("✅ תמונה הועלתה:", downloadURL);
          resolve(downloadURL);
        }
      );
    });
  } catch (error) {
    console.error("❌ שגיאה בהעלאת תמונה:", error.message);
    throw error;
  }
}
