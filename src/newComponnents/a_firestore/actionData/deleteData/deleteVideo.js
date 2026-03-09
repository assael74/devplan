// 📁 deleteTeam.js

import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../FbConfig";
import { IS_DEV } from "./helpers/config";
import { getIndexTask } from "./tasks/deleteVideoTask.js";

export async function deleteVideo(video, showSnackbar, allShorts, formProps) {
  const {
    updatedVideoList,
  } = await getIndexTask(video, allShorts, formProps);
  if (IS_DEV) {
    const logList = [
      ['videosShorts', updatedVideoList],
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
