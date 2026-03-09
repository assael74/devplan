/// 📁 deleteClub.js
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../FbConfig";
import { IS_DEV } from "./helpers/config";
import { getIndexTask } from "./tasks/deleteRoleTask";
import { deleteImageIfExists } from "./helpers/deleteImageIfExists";
import { getStoragePathFromUrl, deleteImageFromStorage } from './deleteImage';

export async function deleteRole(role, showSnackbar, allShorts, formProps) {
  const {
    updatedRoleList,
  } = await getIndexTask(role, allShorts, formProps);

  if (IS_DEV) {
    console.group("[DEV] תצוגת עדכונים למחיקת איש מקצוע");
    console.log("📂 מסמכים לעדכון - rolesShorts:", updatedRoleList, updatedRoleList.length, " מסמכים");
    console.groupEnd();
  }

  // 🖼️ מחיקת תמונת מועדון אם קיימת
  await deleteImageIfExists(role);

  // 1. עדכון במסמכי clubsShorts
  for (const { docId, docName, list } of updatedRoleList) {
    if (!Array.isArray(list)) continue;
    try {
      const ref = doc(db, 'rolesShorts', docId);
      if (!IS_DEV) await updateDoc(ref, { list });
      //console.log(`✅ clubsShorts/${docName} (${docId}) עודכן עם ${list.length} פריטים.`);
    } catch (error) {
      console.error(`❌ שגיאה בעדכון rolesShorts/${docName}:`, error);
    }
  }

}
