// 📁 deleteTeam.js

import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../FbConfig";
import { IS_DEV } from "./helpers/config";
import { getIndexTask } from "./tasks/deleteGameTask.js";

export async function deleteGame(game, showSnackbar, allShorts, formProps) {
  const {
    updatedGameList,
    updatedGameStatsList,
  } = await getIndexTask(game, allShorts, formProps);

  if (IS_DEV) {
    const logList = [
      ['gamesShorts', updatedGameList],
      ['gameStatsShorts', updatedGameStatsList],
    ];

    console.group("[DEV] תצוגת עדכונים למחיקת קבוצה");
    logList.forEach(([label, list]) => {
      if (list?.length)
        console.log(`📂 ${label}:`, list, `${list.length} מסמכים`);
    });
    console.groupEnd();
  }

  // 1. עדכון במסמכי gamesShorts
  for (const { docId, docName, list } of updatedGameList) {
    if (!Array.isArray(list)) continue;

    try {
      const ref = doc(db, 'gamesShorts', docId);

      if (!IS_DEV) await updateDoc(ref, { list });
      //console.log(`✅ teamsShorts/${docName} (${docId}) עודכן עם ${list.length} פריטים.`);
    } catch (error) {
      console.error(`❌ שגיאה בעדכון gamesShorts/${docName}:`, error);
    }
  }

  // 2. מחיקת קבצי סטטיסטיקה
  for (const doc of updatedGameStatsList) {
    await applyUpdatedGameStatsList(doc)
  }
}

async function applyUpdatedGameStatsList({ docId, list }) {
  if (!docId || !Array.isArray(list)) return;
  if (IS_DEV) {
    console.log("[DEV] רשימת פגישות חדשה:", list);
    return;
  }
  try {
    const ref = doc(db, "gameStatsShorts", docId);
    await updateDoc(ref, { list });
    //console.log(`✅ meetingShorts/${docId} עודכן עם ${list.length} פריטים.`);
  } catch (error) {
    console.error(`❌ שגיאה בעדכון gameStatsShorts/${docId}:`, error);
  }
}
