// 📁 deleteTeam.js

import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../FbConfig";
import { IS_DEV } from "./helpers/config";
import { getIndexTask } from "./tasks/deleteVideoAnalysisTask.js";

export async function deleteVideoAnalysis(videoAnalysis, showSnackbar, allShorts, formProps) {
  const {
    updatedVideoAnalysisList,
  } = await getIndexTask(videoAnalysis, allShorts, formProps);
  if (IS_DEV) {
    const logList = [
      ['videoAnalysisShorts', updatedVideoAnalysisList],
    ];

    console.group("[DEV] תצוגת עדכונים למחיקת קבוצה");
    logList.forEach(([label, list]) => {
      if (list?.length)
        console.log(`📂 ${label}:`, list, `${list.length} מסמכים`);
    });
    console.groupEnd();
  }

  showSnackbar?.("🧹 הוידאו נמחק בהצלחה");
}
