// 📁 utils/deleteImageIfExists.js
import { getStoragePathFromUrl, deleteImageFromStorage } from '../deleteImage';

/**
 * מוחק תמונה אם קיימת בשדה photo של האובייקט
 * @param {Object} item - אובייקט המכיל שדה photo
 * @param {string} item.photo - כתובת downloadURL של Firebase
 */
export const deleteImageIfExists = async (item) => {
  if (!item?.photo) return;

  const path = getStoragePathFromUrl(item.photo);
  if (!path) {
    console.warn("⚠️ נתיב למחיקת תמונה ריק או שגוי");
    return;
  }

  await deleteImageFromStorage(path);
};
