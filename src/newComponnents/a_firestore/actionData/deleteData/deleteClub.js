/// 📁 deleteClub.js
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../FbConfig";
import { IS_DEV } from "./helpers/config";
import { getIndexTask } from "./tasks/deleteClubTask";
import { deleteImageIfExists } from "./helpers/deleteImageIfExists";
import { getStoragePathFromUrl, deleteImageFromStorage } from './deleteImage';

export async function deleteClub(club, showSnackbar, allShorts, formProps) {
  const {
    updatedGameList,
    updatedClubList,
    updatedTeamList,
    updatedPlayerList,
    updatedPhotosList,
    updatedPaymentList,
    updatedMeetingList,
    updatedAbilitiesList,
    updatedClubRoleList,
  } = await getIndexTask(club, allShorts, formProps);

  if (IS_DEV) {
    console.group("[DEV] תצוגת עדכונים למחיקת מועדון");
    console.log("📂 מסמכים לעדכון - clubsShorts:", updatedClubList, updatedClubList.length, " מסמכים");
    console.log("📂 מסמכים לעדכון - teamsShorts:", updatedTeamList, updatedTeamList.length, " מסמכים");
    console.log("📂 מסמכים לעדכון - playersShorts:", updatedPlayerList, updatedPlayerList.length, " מסמכים");
    console.log("📂 מסמכים לעדכון - playerPaymentsShorts:", updatedPaymentList, updatedPaymentList.length, " מסמכים");
    console.log("📂 מסמכים לעדכון - meetingShorts:", updatedMeetingList, updatedMeetingList.length, " מסמכים");
    console.log("📂 מסמכים לעדכון - gamesShorts:", updatedGameList, updatedGameList.length, " מסמכים");
    console.log("📂 מסמכים לעדכון - club--roleshorts:", updatedClubRoleList, updatedClubRoleList.length, " מסמכים");
    console.groupEnd();
  }

  // 🖼️ מחיקת תמונת מועדון אם קיימת
  await deleteImageIfExists(club);

  // 1. עדכון במסמכי clubsShorts
  for (const { docId, docName, list } of updatedClubList) {
    if (!Array.isArray(list)) continue;
    try {
      const ref = doc(db, 'clubsShorts', docId);
      if (!IS_DEV) await updateDoc(ref, { list });
      //console.log(`✅ clubsShorts/${docName} (${docId}) עודכן עם ${list.length} פריטים.`);
    } catch (error) {
      console.error(`❌ שגיאה בעדכון clubsShorts/${docName}:`, error);
    }
  }

  // 2. מחיקת קבוצות
  for (const doc of updatedTeamList) {
    await applyUpdatedTeamsList(doc);
  }

  // 3. מחיקת שחקני הפרוייקט של המועדון
  for (const { docId, list } of updatedPlayerList) {
    if (!Array.isArray(list)) continue;

    // מחיקת abilities + תמונה של כל שחקן
    for (const player of list) {
      // 🗑️ מחיקת abilitiesShorts
      try {
        const abilitiesRef = doc(db, 'abilitiesShorts', player.docAbilitiesId);
        if (!IS_DEV) await deleteDoc(abilitiesRef);
        console.log(`🧹 abilitiesShorts/${player.id}-abilities נמחק`);
      } catch (error) {
        console.error(`❌ שגיאה במחיקת abilitiesShorts/${player.id}-abilities:`, error);
      }

      // 🖼️ מחיקת תמונת שחקן אם קיימת
      await deleteImageIfExists(player);
    }

    // עדכון playersShorts
    await applyUpdatedPlayersList({ docId, list });
  }

  /// 4. מחיקת תשלומים של כל שחקני המועדון
  for (const doc of updatedPaymentList) {
    await applyUpdatedPaymentsList(doc);
  }

  /// 5. מחיקת כל הפגישות של שחקני המועדון
  for (const doc of updatedMeetingList) {
    await applyUpdatedMeetingsList(doc);
  }

  /// 6. מחיקת כל משחקי המועדון
  for (const doc of updatedGameList) {
    await applyUpdatedGamesList(doc);
  }

  /// 7. מחיקת כל אנשי הצוות של המועדון
  for (const doc of updatedClubRoleList) {
    await applyUpdatedClubRolesList(doc);
  }

  /// 8. מחיקת טפסי abilities של שחקני הקבוצה
  await deleteAbilitiesForms(updatedAbilitiesList);

  /// 9. מחיקת תמונות השחקנים בקבוצה
  await deletePhotosFromUrls(updatedPhotosList);
}

async function applyUpdatedPaymentsList({ docId, list }) {
  if (!docId || !Array.isArray(list)) return;
  if (IS_DEV) {
    //console.log("[DEV] רשימת תשלומים חדשה:", list);
    return;
  }
  try {
    const ref = doc(db, "playerPaymentsShorts", docId);
    await updateDoc(ref, { list });
    //console.log(`✅ playerPaymentsShorts/${docId} עודכן עם ${list.length} פריטים.`);
  } catch (error) {
    console.error(`❌ שגיאה בעדכון playerPaymentsShorts/${docId}:`, error);
  }
}

async function applyUpdatedMeetingsList({ docId, list }) {
  if (!docId || !Array.isArray(list)) return;
  if (IS_DEV) {
    //console.log("[DEV] רשימת פגישות חדשה:", list);
    return;
  }
  try {
    const ref = doc(db, "meetingShorts", docId);
    await updateDoc(ref, { list });
    //console.log(`✅ meetingShorts/${docId} עודכן עם ${list.length} פריטים.`);
  } catch (error) {
    console.error(`❌ שגיאה בעדכון meetingShorts/${docId}:`, error);
  }
}

async function applyUpdatedPlayersList({ docId, list }) {
  if (!docId || !Array.isArray(list)) return;
  if (IS_DEV) {
    console.log("[DEV] רשימת שחקנים", list);
    return;
  }
  try {
    const ref = doc(db, 'playersShorts', docId);
    await updateDoc(ref, { list });
    //console.log(`✅ playersShorts/${docId} עודכן עם ${list.length} פריטים.`);
  } catch (error) {
    console.error(`❌ שגיאה בעדכון playersShorts/${docId}:`, error);
  }
}

async function applyUpdatedTeamsList({ docId, list }) {
  if (!docId || !Array.isArray(list)) return;
  if (IS_DEV) {
    console.log("[DEV] רשימת קבוצות חדשה", list);
    return;
  }
  try {
    const ref = doc(db, "teamsShorts", docId);
    await updateDoc(ref, { list });
    //console.log(`✅ teamsShorts/${docId} עודכן עם ${list.length} פריטים.`);
  } catch (error) {
    console.error(`❌ שגיאה בעדכון teamsShorts/${docId}:`, error);
  }
}

async function applyUpdatedGamesList({ docId, list }) {
  if (!docId || !Array.isArray(list)) return;
  if (IS_DEV) {
    //console.log("[DEV] רשימת פגישות חדשה:", list);
    return;
  }
  try {
    const ref = doc(db, "gamesShorts", docId);
    await updateDoc(ref, { list });
    //console.log(`✅ teamsShorts/${docId} עודכן עם ${list.length} פריטים.`);
  } catch (error) {
    console.error(`❌ שגיאה בעדכון gamesShorts/${docId}:`, error);
  }
}

async function deleteAbilitiesForms(abilitiesIds = []) {
  if (!Array.isArray(abilitiesIds) || abilitiesIds.length === 0) return;

  for (const id of abilitiesIds) {
    try {
      const abilitiesRef = doc(db, "abilitiesShorts", id);
      if (!IS_DEV) {
        await deleteDoc(abilitiesRef);
      }
      console.log(`🧹 abilitiesShorts/${id} נמחק`);
    } catch (error) {
      console.error(`❌ שגיאה במחיקת abilitiesShorts/${id}:`, error);
    }
  }
}

async function deletePhotosFromUrls(photoUrls = []) {
  if (!Array.isArray(photoUrls) || photoUrls.length === 0) return;

  for (const url of photoUrls) {
    try {
      const path = getStoragePathFromUrl(url);
      if (path) {
        await deleteImageFromStorage(path);
      } else {
        console.warn("⚠️ לא נמצא path תקף מתוך כתובת התמונה:", url);
      }
    } catch (err) {
      console.error("❌ שגיאה במחיקת תמונה מתוך URL:", url, err.message);
    }
  }
}

async function applyUpdatedClubRolesList({ docId, list }) {
  if (!docId || !Array.isArray(list)) return;
  if (IS_DEV) {
    //console.log("[DEV] רשימת פגישות חדשה:", list);
    return;
  }
  try {
    const ref = doc(db, "rolesShorts", docId);
    await updateDoc(ref, { list });
    //console.log(`✅ teamsShorts/${docId} עודכן עם ${list.length} פריטים.`);
  } catch (error) {
    console.error(`❌ שגיאה בעדכון rolesShorts/${docId}:`, error);
  }
}
