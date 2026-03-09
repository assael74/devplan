/// 📁 deleteClub.js
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../FbConfig";
import { IS_DEV } from "./helpers/config";
import { getIndexTask } from "./tasks/deleteScoutingTask";
import { deleteImageIfExists } from "./helpers/deleteImageIfExists";
import { getStoragePathFromUrl, deleteImageFromStorage } from './deleteImage';

export async function deleteScouting(scouting, showSnackbar, allShorts, formProps) {
  const {
    updatedScoutingList,
  } = await getIndexTask(scouting, allShorts, formProps);

  if (IS_DEV) {
    console.group("[DEV] תצוגת עדכונים למחיקת איש מקצוע");
    console.log("📂 מסמכים לעדכון - scoutingShorts:", updatedScoutingList, updatedScoutingList.length, " מסמכים");
    console.groupEnd();
  }

  // 🖼️ מחיקת תמונת מועדון אם קיימת
  await deleteImageIfExists(scouting);

  // 1. עדכון במסמכי clubsShorts
  for (const { docId, docName, list } of updatedScoutingList) {
    if (!Array.isArray(list)) continue;
    try {
      const ref = doc(db, 'scoutingShorts', docId);
      if (!IS_DEV) await updateDoc(ref, { list });
      //console.log(`✅ clubsShorts/${docName} (${docId}) עודכן עם ${list.length} פריטים.`);
    } catch (error) {
      console.error(`❌ שגיאה בעדכון scoutingShorts/${docName}:`, error);
    }
  }

}
