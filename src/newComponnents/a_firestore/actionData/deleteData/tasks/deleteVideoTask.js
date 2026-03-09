// 📁 deleteTeamTask.js
export async function getIndexTask(video, allShorts, formProps) {
  return {
    updatedVideoList: await getUpdatedVideoList(video.id, allShorts),
  };
}
/**
 * מחיקה של מועדון מכל המסמכים של clubsShorts
 */
async function getUpdatedVideoList(videoId, allShorts) {
   if (!Array.isArray(allShorts?.videosShorts)) {
     console.warn("[getUpdatedVideoList] videosShorts חסר או לא תקין");
     return [];
   }

   return allShorts.videosShorts.map((doc) => {
     const newList = (doc.list || []).filter(item => item.id !== videoId);
     return {
       docId: doc.docId,
       docName: doc.docName,
       list: newList,
     };
   });
 }
