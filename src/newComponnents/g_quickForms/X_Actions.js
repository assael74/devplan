import { groupFieldsByShortRef } from "../a_firestore/actionData/updateData/helpers/groupFieldsByShortRef";
import { shortsRefs } from "../a_firestore/actionData/shortsRefs.js";
import { updateShortItemList } from "../a_firestore/actionData/updateData/updateShortItemList";
import { normalizeType } from "../a_firestore/actionData/updateData/helpers/getDiffFields";
import { uploadImageOnly } from "../a_firestore/actionData/updateData/uploadData/uploadImageOnly.js";
import { getStoragePathFromUrl, deleteImageFromStorage } from "../a_firestore/actionData/deleteData/deleteImage.js";
import { updateGameStats } from '../a_firestore/actionData/updateData/updateObject/updateGameStats.js';
import { updateGameStatsPartial } from '../a_firestore/actionData/updateData/updateObject/updateGameStatsPartial.js';
import { updatePlayerAbilities } from '../a_firestore/actionData/updateData/updateObject/updatePlayerAbilities.js';

export const getDefaultQuickActions = ({ type: defaultType, paymentsList = [] }) => {
  return {
    onEdit: async ({ oldItem, newItem, addItem, type }, actions) => {
      console.log("[onEdit] ➕", newItem);

      const effectiveType = normalizeType(type || defaultType);
      // 💡 עדכון abilitiesShorts במידה וזה הטייפ הרלוונטי
      if (effectiveType === 'abilities' && addItem) {
        await updatePlayerAbilities({
          docId: addItem.docAbilitiesId,
          newFormData: addItem,
          onSuccess: () => {
            actions.setAlert(`updated_abilitiesShorts`);
            actions.onClose();
          },
          onError: (err) => console.error(`[onEdit] שגיאה בעדכון : abilitiesShorts`, err.message),
        });
        return;
      }

      // 🔁 עדכון מסוג gameStats
      if (effectiveType === "gameStats") {
        await updateGameStats(newItem, actions);
        return;
      }

      // 🧹 מחיקת תמונה אם נמחקה
      if (oldItem.photo && newItem.photo === '') {
        const path = getStoragePathFromUrl(oldItem.photo);
        await deleteImageFromStorage(path);
      }

      // ⬆️ העלאת תמונה חדשה אם קיימת
      if (newItem.photoFile) {
        try {
          const url = await uploadImageOnly({
            objectType: type,
            objectId: newItem.id,
            imageFile: newItem.photoFile,
            oldImageUrl: oldItem.photo,
          });
          newItem.photo = url;
          delete newItem.photoFile;
        } catch (err) {
          console.error("[onEdit] שגיאה בהעלאת תמונה:", err.message);
          return;
        }
      }

      // 🧩 קיבוץ לפי shortsRef
      const grouped = groupFieldsByShortRef(effectiveType, newItem, oldItem);
      //console.log('effectiveType', effectiveType)
      //console.log('grouped', grouped)
      for (const refKey in grouped) {
        const [category, subCategory] = refKey.split('/');
        const shortRef = shortsRefs?.[category]?.[subCategory];
        //console.log('refKey',refKey, 'subCategory', subCategory)
        //console.log(category)
        if (!shortRef) {
          console.warn(`[onEdit] אין הגדרה עבור ${refKey} ב-shortsRefs`, {
            category,
            subCategory,
            available: Object.keys(shortsRefs?.[category] || {}),
          });
          continue;
        }

        const partialNewItem = grouped[refKey];
        //console.log(partialNewItem)
        await updateShortItemList({
          ...shortRef,
          oldItem,
          newItem: partialNewItem,
          onSuccess: () => {
            actions?.setAlert?.(`updated_${subCategory}`);
            actions?.onClose?.();
          },
          onError: (err) =>
            console.error(`[onEdit] שגיאה בעדכון ${refKey}:`, err.message),
        });
      }

      // 💰 עדכון לוגיקת תשלומים
      if (effectiveType === 'payments' && newItem?.playerId) {
        const playerId = newItem.playerId;

        const isNewNow = newItem?.status?.id === 'new';
        const wasNewBefore = oldItem?.status?.id === 'new';

        if (!wasNewBefore && isNewNow) {
          // עדכון ל־true
          await updateShortItemList({
            collection: 'playersShorts',
            docId: 'hBXi4ncY2Cskka7mKhn5',
            oldItem: { id: playerId, isOpenPayment: false },
            newItem: { id: playerId, isOpenPayment: true },
            onSuccess: () =>
              console.log(`🟠 isOpenPayment עודכן ל־true עבור שחקן ${playerId}`),
            onError: (err) =>
              console.error(`[playersShorts] ❌ שגיאה בהפיכה ל־true`, err.message),
          });
        }

        if (wasNewBefore && !isNewNow) {
          const hasOtherOpenPayments = paymentsList.some(
            (p) => p.playerId === playerId && p.status?.id === 'new' && p.id !== newItem.id
          );

          if (!hasOtherOpenPayments) {
            await updateShortItemList({
              collection: 'playersShorts',
              docId: 'hBXi4ncY2Cskka7mKhn5',
              oldItem: { id: playerId, isOpenPayment: true },
              newItem: { id: playerId, isOpenPayment: false },
              onSuccess: () =>
                console.log(`🟢 isOpenPayment עודכן ל־false עבור שחקן ${playerId}`),
              onError: (err) =>
                console.error(`[playersShorts] ❌ שגיאה בהפיכה ל־false`, err.message),
            });
          } else {
            console.log(`ℹ️ לשחקן ${playerId} יש תשלומים פתוחים נוספים`);
          }
        }
      }
    },
  };
};
