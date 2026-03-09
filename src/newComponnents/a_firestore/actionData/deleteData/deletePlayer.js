// 📁 deletePlayer.js
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../FbConfig";
import { IS_DEV } from "./helpers/config";
import { getIndexTask } from "./tasks/deletePlayerTask";
import { deleteImageIfExists } from './helpers/deleteImageIfExists';

export async function deletePlayer(player, showSnackbar, allShorts, formProps = {}, options = {}) {
  const {
    updatedPlayerList,
    newMeetingsLists,
    newPaymentsLists,
  } = await getIndexTask(player, allShorts);

  if (IS_DEV) {
    const updates = [
      ['playersShorts', updatedPlayerList],
      ['meetingsShorts', newMeetingsLists],
      ['paymentsShorts', newPaymentsLists],
    ];

    console.group("[DEV] עדכונים למחיקת שחקן");
    updates.forEach(([label, list]) => {
      if (list?.length) {
        console.log(`📂 ${label}: ${list.length} מסמכים`, list);
      }
    });
    console.groupEnd();
  }

  // 🔁 עדכון playersShorts
  for (const { docId, docName, list } of updatedPlayerList) {
    try {
      const ref = doc(db, 'playersShorts', docId);
      if (!IS_DEV) await updateDoc(ref, { list });
    } catch (error) {
      console.error(`❌ שגיאה בעדכון ${docName} (${docId}):`, error);
    }
  }

  // 🔁 עדכון תשלומים
  for (const doc of newPaymentsLists) {
    await applyUpdatedPaymentsList(doc);
  }

  // 🔁 עדכון פגישות
  for (const doc of newMeetingsLists) {
    await applyUpdatedMeetingsList(doc);
  }

  // 🗑️ מחיקת abilitiesShorts עבור השחקן
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

async function applyUpdatedPaymentsList({ docId, list }) {
  if (!docId || !Array.isArray(list)) return;
  if (IS_DEV) return;
  try {
    const ref = doc(db, "playerPaymentsShorts", docId);
    await updateDoc(ref, { list });
  } catch (error) {
    console.error(`❌ שגיאה בעדכון playerPaymentsShorts/${docId}:`, error);
  }
}

async function applyUpdatedMeetingsList({ docId, list }) {
  if (!docId || !Array.isArray(list)) return;
  if (IS_DEV) return;
  try {
    const ref = doc(db, "meetingShorts", docId);
    await updateDoc(ref, { list });
  } catch (error) {
    console.error(`❌ שגיאה בעדכון meetingShorts/${docId}:`, error);
  }
}
