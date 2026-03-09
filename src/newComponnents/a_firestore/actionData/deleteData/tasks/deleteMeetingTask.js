// 📁 deleteData/helpers/deleteMeetingTask.js
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../../FbConfig";
import { shortsRefs } from "../../shortsRefs";

export async function getUpdatedMeetingTaskList(meetingId, allShorts) {
  if (!Array.isArray(allShorts?.meetingsShorts)) {
    console.warn("[getUpdatedMeetingTaskList] meetingsShorts חסר או לא תקין");
    return [];
  }

  const filteredLists = allShorts.meetingsShorts.map((doc) => {
    const newList = (doc.list || []).filter((item) => item.id !== meetingId);
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

export async function getPlayerMeetingList(meetingId, playerId, allShorts) {
  if (!Array.isArray(allShorts?.playersShorts)) {
    console.warn("[getPlayerMeetingList] playersShorts חסר או לא תקין");
    return [];
  }

  const doc = allShorts.playersShorts.find(doc => doc.docName === 'playersMeettings');
  const playerList = doc?.list || [];
  const playerObj = playerList.find(p => p.id === playerId);
  const updatedMeetings = playerObj?.playerMeetings?.filter(p => p !== meetingId) || [];

  const newList = playerList.map(p =>
    p.id === playerId ? { ...p, playerMeetings: updatedMeetings } : p
  );

  //console.log("📋 רשימה מעודכנת במסמך playersMeettings:", newList);

  return {
    docId: doc?.docId,
    docName: doc?.docName,
    list: newList,
  };
}
