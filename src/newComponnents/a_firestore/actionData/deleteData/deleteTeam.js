// 📁 deleteTeam.js
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../FbConfig";
import { IS_DEV } from "./helpers/config";
import { getIndexTask } from "./tasks/deleteTeamTask";
import { deleteImageIfExists } from "./helpers/deleteImageIfExists";
import { getStoragePathFromUrl, deleteImageFromStorage } from './deleteImage';

export async function deleteTeam(team, showSnackbar, allShorts, formProps) {
  const {
    updatedTeamList,
    updatedPlayerList,
    updatedAbilitiesList,
    updatedPhotosList,
    updatedPaymentList,
    updatedMeetingList,
    updatedGameList,
    updatedTeamRoleList
  } = await getIndexTask(team, allShorts, formProps);

  if (IS_DEV) {
    const logList = [
      ['teamsShorts', updatedTeamList],
      ['playersShorts', updatedPlayerList],
      ['updatedAbilitiesList', updatedAbilitiesList],
      ['updatedPhotosList', updatedPhotosList],
      ['playerPaymentsShorts', updatedPaymentList],
      ['meetingShorts', updatedMeetingList],
      ['gamesShorts', updatedGameList],
      ['rolesShorts', updatedTeamRoleList],
    ];

    console.group("[DEV] תצוגת עדכונים למחיקת קבוצה");
    logList.forEach(([label, list]) => {
      if (list?.length)
        console.log(`📂 ${label}:`, list, `${list.length} מסמכים`);
    });
    console.groupEnd();
  }

  await deleteImageIfExists(team);

  // 1. עדכון במסמכי teamsShorts
  for (const { docId, docName, list } of updatedTeamList) {
    if (!Array.isArray(list)) continue;
    try {
      const ref = doc(db, 'teamsShorts', docId);
      if (!IS_DEV) await updateDoc(ref, { list });
      //console.log(`✅ teamsShorts/${docName} (${docId}) עודכן עם ${list.length} פריטים.`);
    } catch (error) {
      console.error(`❌ שגיאה בעדכון teamsShorts/${docName}:`, error);
    }
  }

  // 2. מחיקת שחקני הפרוייקט של הקבוצה
  for (const { docId, list } of updatedPlayerList) {
    if (!Array.isArray(list)) continue;

    await applyUpdatedPlayersList({ docId, list });
  }

  /// 3. מחיקת תשלומים של כל שחקני הקבוצה
  for (const doc of updatedPaymentList) {
    await applyUpdatedPaymentsList(doc);
  }

  /// 4. מחיקת כל הפגישות של שחקני הקבוצה
  for (const doc of updatedMeetingList) {
    await applyUpdatedMeetingsList(doc);
  }

  /// 5. מחיקת כל משחקי הקבוצה
  for (const doc of updatedGameList) {
    await applyUpdatedGamesList(doc);
  }

  /// 6. מחיקת כל אנשי הצוות של המועדון
  for (const doc of updatedTeamRoleList) {
    await applyUpdatedTeamRolesList(doc);
  }

  /// 7. מחיקת טפסי abilities של שחקני הקבוצה
  await deleteAbilitiesForms(updatedAbilitiesList);

  /// 8. מחיקת תמונות השחקנים בקבוצה
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
    //console.log("[DEV] רשימת פגישות חדשה:", list);
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

async function applyUpdatedGamesList({ docId, list }) {
  if (!docId || !Array.isArray(list)) return;
  if (IS_DEV) {
    //console.log("[DEV] רשימת פגישות חדשה:", list);
    return;
  }
  try {
    const ref = doc(db, 'gameshorts', docId);
    await updateDoc(ref, { list });
    //console.log(`✅ playersShorts/${docId} עודכן עם ${list.length} פריטים.`);
  } catch (error) {
    console.error(`❌ שגיאה בעדכון gameshorts/${docId}:`, error);
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

async function applyUpdatedTeamRolesList({ docId, list }) {
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
