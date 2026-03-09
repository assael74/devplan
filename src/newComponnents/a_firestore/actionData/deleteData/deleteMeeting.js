// deleteData/deleteMeeting.js
import { doc, getDoc, updateDoc, arrayRemove } from "firebase/firestore";
import { db } from "../../../FbConfig";
import { shortsRefs } from "../shortsRefs";
import { IS_DEV } from "./helpers/config";
import { getUpdatedMeetingTaskList, getPlayerMeetingList } from "./tasks/deleteMeetingTask"

 export async function deleteMeeting(meeting, showSnackbar, allShorts) {
   const newLists = await getUpdatedMeetingTaskList(meeting.id, allShorts);
   const newPlayerLists = await getPlayerMeetingList(meeting.id, meeting.playerId, allShorts);

   if (IS_DEV) {
     console.log("[DEV] רשימות מוכנות למחיקה:", newLists);
     return;
   }

   for (const docObj of newLists) {
      const { docId, docName, list } = docObj;
      try {
        const ref = doc(db, 'meetingShorts', docId);
        await updateDoc(ref, { list });
        console.log(`✅ עודכן meetingShorts/${docName} (${docId}) עם ${list.length} פריטים.`);
      } catch (error) {
        console.error(`❌ שגיאה בעדכון ${docName} (${docId}):`, error);
      }
    }

   await applyUpdatedPlayerList(newPlayerLists);
 }

 async function applyUpdatedPlayerList({ docId, list }) {
   if (!docId || !Array.isArray(list)) {
     console.warn("[applyUpdatedPlayerList] פרמטרים לא תקינים לעדכון");
     return;
   }

   if (IS_DEV) {
     console.log("[DEV] רשימה חדשה של פגישות השחקן:", list);
     return;
   }

   try {
     const ref = doc(db, "playersShorts", docId);
     await updateDoc(ref, { list });
     console.log(`✅ playersShorts/${docId} עודכן עם ${list.length} פריטים.`);
   } catch (error) {
     console.error(`❌ שגיאה בעדכון playersShorts/${docId}:`, error);
   }
 }
