// 📁 deleteTeamTask.js
export async function getIndexTask(videoAnalysis, allShorts, formProps) {
  return {
    updatedVideoAnalysisList: await getUpdatedVideoAnalysisList(videoAnalysis.id, allShorts),
  };
}
/**
 * מחיקה של מועדון מכל המסמכים של clubsShorts
 */
async function getUpdatedVideoAnalysisList(videoAnalysisId, allShorts) {
   if (!Array.isArray(allShorts?.videoAnalysisShorts)) {
     console.warn("[getUpdatedVideosAnalysisList] videoAnalysisShorts חסר או לא תקין");
     return [];
   }

   return allShorts.videoAnalysisShorts.map((doc) => {
     const newList = (doc.list || []).filter(item => item.id !== videoAnalysisId);
     return {
       docId: doc.docId,
       docName: doc.docName,
       list: newList,
     };
   });
 }
