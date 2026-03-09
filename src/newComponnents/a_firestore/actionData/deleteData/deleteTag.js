// 📁 deleteTeam.js

import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../FbConfig";
import { IS_DEV } from "./helpers/config";
import { getIndexTask } from "./tasks/deleteTagTask.js";

export async function deleteTag(tag, showSnackbar, allShorts, formProps) {
  const {
    updatedTagList,
    updatedVideoList,
    updatedVideoAnalysisList
  } = await getIndexTask(tag, allShorts, formProps);
  if (IS_DEV) {
    const logList = [
      ['tagshorts', updatedTagList],
      ['videosShorts', updatedVideoList],
      ['videoAnalysisShorts', updatedVideoAnalysisList],
    ];

    console.group("[DEV] תצוגת עדכונים למחיקת קבוצה");
    logList.forEach(([label, list]) => {
      if (list?.length)
        console.log(`📂 ${label}:`, list, `${list.length} מסמכים`);
    });
    console.groupEnd();
  }

  // 1. עדכון במסמכי tagsShorts
  for (const { docId, docName, list } of updatedTagList) {
    if (!Array.isArray(list)) continue;
    try {
      const ref = doc(db, 'tagsShorts', docId);
      if (!IS_DEV) await updateDoc(ref, { list });
      //console.log(`✅ teamsShorts/${docName} (${docId}) עודכן עם ${list.length} פריטים.`);
    } catch (error) {
      console.error(`❌ שגיאה בעדכון tagsShorts/${docName}:`, error);
    }
  }

  // 2. מחיקת תג ממסמכי הוידאו
  for (const doc of updatedVideoList) {
    await applyUpdatedVideosList(doc)
  }

  // 3. מחיקת תג ממסמכי ניתוח וידאו
  for (const doc of updatedVideoAnalysisList) {
    await applyUpdatedVideoAnalysisList(doc)
  }

  showSnackbar?.("🧹 התג נמחק בהצלחה");
}

async function applyUpdatedVideosList({ docId, list }) {
  if (!docId || !Array.isArray(list) || !list.length) return;
  if (IS_DEV) {
    console.log("[DEV] רשימת פגישות חדשה:", list);
    return;
  }
  try {
    const ref = doc(db, "videosShorts", docId);
    await updateDoc(ref, { list });
    //console.log(`✅ meetingShorts/${docId} עודכן עם ${list.length} פריטים.`);
  } catch (error) {
    console.error(`❌ שגיאה בעדכון videosShorts/${docId}:`, error);
  }
}

async function applyUpdatedVideoAnalysisList({ docId, list }) {
  if (!docId || !Array.isArray(list) || !list.length) return;
  if (IS_DEV) {
    console.log("[DEV] רשימת פגישות חדשה:", list);
    return;
  }
  try {
    const ref = doc(db, "videoAnalysisShorts", docId);
    await updateDoc(ref, { list });
    //console.log(`✅ meetingShorts/${docId} עודכן עם ${list.length} פריטים.`);
  } catch (error) {
    console.error(`❌ שגיאה בעדכון videoAnalysisShorts/${docId}:`, error);
  }
}
