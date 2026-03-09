// 📁 deleteData/helpers/deleteMeetingTask.js

import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../../FbConfig";
import { shortsRefs } from "../../shortsRefs";

export async function getUpdatedPaymentTaskList(paymentId, allShorts) {
  if (!Array.isArray(allShorts?.paymentsShorts)) {
    console.warn("[getUpdatedPaymentTaskList] paymentsShorts חסר או לא תקין");
    return [];
  }

  const filteredLists = allShorts.paymentsShorts.map((doc) => {
    const newList = (doc.list || []).filter((item) => item.id !== paymentId);
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

export async function getPlayerPymentsList(paymentId, playerId, allShorts) {
  if (!Array.isArray(allShorts?.playersShorts)) {
    console.warn("[getPlayerPymentsList] playersShorts חסר או לא תקין");
    return [];
  }

  const doc = allShorts.playersShorts.find(doc => doc.docName === 'playersPaymentsId');
  const playerList = doc?.list || [];
  const playerObj = playerList.find(p => p.id === playerId);
  const updatedPyments = playerObj?.playerPayments?.filter(p => p !== paymentId) || [];
  const paymentOperativeDoc = allShorts.paymentsShorts.find(doc => doc.docName === 'paymentOperative');
  const paymentList = paymentOperativeDoc?.list || [];
  const hasOtherOpenPayments = paymentList.some(p =>
    p.playerId === playerId &&
    p.status?.id === 'new' &&
    p.id !== paymentId // לוודא שזה לא התשלום שאתה מוחק עכשיו
  );

  const newList = playerList.map(p =>
    p.id === playerId ? { ...p, playerPayments: updatedPyments, isOpenPayment: hasOtherOpenPayments } : p
  );

  console.log("📋 רשימה מעודכנת במסמך playerPayments:", newList);

  return {
    docId: doc?.docId,
    docName: doc?.docName,
    list: newList,
  };
}
