// 📁 deleteTeamTask.js
export async function getIndexTask(statsParm, allShorts, formProps) {
  return {
    updatedStatsParmList: await getUpdatedStatsParmList(statsParm.id, allShorts),
  };
}
/**
 * מחיקה של מועדון מכל המסמכים של clubsShorts
 */
async function getUpdatedStatsParmList(statsParmId, allShorts) {
   if (!Array.isArray(allShorts?.statsParmShorts)) {
     console.warn("[getUpdatedStatsParmList] statsParmShorts חסר או לא תקין");
     return [];
   }

   return allShorts.statsParmShorts.map((doc) => {
     const newList = (doc.list || []).filter(item => item.id !== statsParmId);
     return {
       docId: doc.docId,
       docName: doc.docName,
       list: newList,
     };
   });
 }
