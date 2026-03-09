// 📁 deleteClubTask.js

export async function getIndexTask(scout, allShorts, formProps) {
  return {
    updatedScoutingList: await getUpdatedScoutingList(scout.id, allShorts),
  };
}

async function getUpdatedScoutingList(scoutId, allShorts) {
  if (!Array.isArray(allShorts?.scoutingShorts)) {
    console.warn("[getUpdatedScoutingList] scoutingShorts חסר או לא תקין");
    return [];
  }

  return allShorts.scoutingShorts.map((doc) => {
    const newList = (doc.list || []).filter(item => item.id !== scoutId);

    return {
      docId: doc.docId,
      docName: doc.docName,
      list: newList,
    };
  });
}
