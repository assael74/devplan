// 📁 deleteTeamTask.js
export async function getIndexTask(game, allShorts, formProps) {
  return {
    updatedGameList: await getUpdatedGameList(game.id, allShorts),
    updatedGameStatsList: await getUpdatedGameStatsList(game.id, allShorts),
  };
}
/**
 * מחיקה של מועדון מכל המסמכים של clubsShorts
 */
async function getUpdatedGameList(gameId, allShorts) {
  if (!Array.isArray(allShorts?.gamesShorts)) {
    console.warn("[getUpdatedGameList] gamesShorts חסר או לא תקין");
    return [];
  }

  return allShorts.gamesShorts.map((doc) => {
    const newList = (doc.list || []).filter(item => item.id !== gameId);
    return {
      docId: doc.docId,
      docName: doc.docName,
      list: newList,
    };
  });
}

async function getUpdatedGameStatsList(gameId, allShorts) {
  if (!Array.isArray(allShorts?.gameStatsShorts)) {
    console.warn("[updatedGameStatsList] gameStatsShorts חסר או לא תקין");
    return [];
  }

  return allShorts.gameStatsShorts.map((doc) => {
    const newList = (doc.list || []).filter(item => item.gameId !== gameId);
    return {
      docId: doc.docId,
      docName: doc.docName,
      list: newList,
    };
  });
}
