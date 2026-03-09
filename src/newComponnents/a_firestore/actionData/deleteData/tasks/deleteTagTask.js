// 📁 deleteTeamTask.js
export async function getIndexTask(tag, allShorts, formProps) {
  return {
    updatedTagList: await getUpdatedTagList(tag.id, allShorts),
    updatedVideoList: await getUpdatedVideosList(tag.id, allShorts),
    updatedVideoAnalysisList: await getUpdatedVideoAnalysisList(tag.id, allShorts),
  };
}
/**
 * מחיקה של מועדון מכל המסמכים של clubsShorts
 */
async function getUpdatedTagList(tagId, allShorts) {
   if (!Array.isArray(allShorts?.tagsShorts)) {
     console.warn("[getUpdatedTagList] tagsShorts חסר או לא תקין");
     return [];
   }

   return allShorts.tagsShorts.map((doc) => {
     const newList = (doc.list || []).filter(item => item.id !== tagId);
     return {
       docId: doc.docId,
       docName: doc.docName,
       list: newList,
     };
   });
 }

async function getUpdatedVideosList(tagId, allShorts) {
  // שלב 1: בדיקה כללית אם התג בכלל נמצא באחד המסמכים
  const isTagUsedAnywhere = (allShorts.videosShorts || []).some(doc =>
    doc.docName === 'videoTags' &&
    (doc.list || []).some(item => {
      return Array.isArray(item.tags) && item.tags.includes(tagId);
    })
  );
  //console.log(isTagUsedAnywhere)
  if (!isTagUsedAnywhere) {
    console.warn(`📭 התג "${tagId}" לא נמצא וידאו עם התג:`);
    return [];
  }

  // שלב 2: בניית מסמכים חדשים רק אם היה שינוי
  const filteredLists = (allShorts.videosShorts || [])
    .filter(doc => doc.docName === 'videoTags')
    .map((doc) => {
      const newList = (doc.list || []).map((item) => {
        if (!Array.isArray(item.tags)) return item;

        const filteredTags = item.tags.filter(t => t !== tagId);
        if (filteredTags.length !== item.tags.length) {
          return { ...item, tags: filteredTags };
        }
        return item;
      });

      const hasChanges = doc.list.some(
        (item, idx) =>
          Array.isArray(item.tags) &&
          item.tags.length !== newList[idx]?.tags?.length
      );

      return hasChanges
        ? { docId: doc.docId, docName: doc.docName, list: newList }
        : null;
    })
    .filter(Boolean);

  return filteredLists;
}

async function getUpdatedVideoAnalysisList(tagId, allShorts) {
  // שלב 1: בדיקה כללית אם התג בכלל נמצא באחד המסמכים
  const isTagUsedAnywhere = (allShorts.videoAnalysisShorts || []).some(doc =>
    doc.docName === 'analysisTags' &&
    (doc.list || []).some(item =>
      Array.isArray(item.tags) && item.tags.includes(tagId)
    )
  );

  if (!isTagUsedAnywhere) {
    console.warn(`📭 התג "${tagId}" לא נמצא בשום ניתוח — אין צורך בעדכון`);
    return [];
  }

  // שלב 2: בניית מסמכים חדשים רק אם היה שינוי
  const filteredLists = (allShorts.videoAnalysisShorts || [])
    .filter(doc => doc.docName === 'analysisTags')
    .map((doc) => {
      const newList = (doc.list || []).map((item) => {
        if (!Array.isArray(item.tags)) return item;

        const filteredTags = item.tags.filter(t => t !== tagId);
        if (filteredTags.length !== item.tags.length) {
          return { ...item, tags: filteredTags };
        }
        return item;
      });

      const hasChanges = doc.list.some(
        (item, idx) =>
          Array.isArray(item.tags) &&
          item.tags.length !== newList[idx]?.tags?.length
      );

      return hasChanges
        ? { docId: doc.docId, docName: doc.docName, list: newList }
        : null;
    })
    .filter(Boolean);

  return filteredLists;
}
