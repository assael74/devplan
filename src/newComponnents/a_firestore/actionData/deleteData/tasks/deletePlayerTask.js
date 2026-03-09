// 📁 deleteData/helpers/deleteMeetingTask.js
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../../FbConfig";
import { shortsRefs } from "../../shortsRefs";

export async function getUpdatedPlayerTaskList(player, allShorts) {
  if (!Array.isArray(allShorts?.playersShorts)) {
    console.warn("[getUpdatedPlayerTaskList] playersShorts חסר או לא תקין");
    return [];
  }

  const filteredLists = allShorts.playersShorts.map((doc) => {
    const newList = (doc.list || []).filter((item) => item.id !== player.id);
    return {
      docId: doc.docId,
      docName: doc.docName,
      list: newList,
    };
  });
  //console.group(`[getUpdatedMeetingTaskList] רשימות מסוננות לפי meetingId: ${meetingId}`);
  filteredLists.forEach(doc => {
    //console.log(`📄 ${doc.docName} (${doc.docId}):`, doc.list);
  });
  //console.groupEnd();

  return filteredLists;
}

export async function getMeetingPlayerList(player, allShorts) {
  const playerMeetingIdsToDelete = player.playerMeetings || [];

  if (!playerMeetingIdsToDelete.length) {
    //console.warn("📭 לשחקן אין פגישות למחיקה  - אין מה לעדכן");
    return [];
  }

  const filteredLists = allShorts.meetingsShorts.map((doc) => {
    const newList = (doc.list || []).filter(
      (item) => !playerMeetingIdsToDelete.includes(item.id)
    );

    return {
      docId: doc.docId,
      docName: doc.docName,
      list: newList,
    };
  });

  console.log("📋 רשימות מעודכנות לאחר הסרת פגישות השחקן:", filteredLists);
  return filteredLists;
}

export async function getPaymentPlayerList(player, allShorts) {
  const playerPaymentsIdsToDelete = player.playersPaymentsId || [];

  if (!playerPaymentsIdsToDelete.length) {
    console.warn("📭 לשחקן אין תשלומים למחיקה – אין מה לעדכן");
    return [];
  }

  const filteredLists = (allShorts.playerPaymentsShorts || []).map((doc) => {
    const newList = (doc.list || []).filter(
      (item) => !playerPaymentsIdsToDelete.includes(item.id)
    );

    return {
      docId: doc.docId,
      docName: doc.docName,
      list: newList,
    };
  });

  return filteredLists
}

export async function getIndexTask(player, allShorts) {
  return {
    updatedPlayerList: await getUpdatedPlayerTaskList(player, allShorts),
    newMeetingsLists: await getMeetingPlayerList(player, allShorts),
    newPaymentsLists: await getPaymentPlayerList(player, allShorts),
  }
}
