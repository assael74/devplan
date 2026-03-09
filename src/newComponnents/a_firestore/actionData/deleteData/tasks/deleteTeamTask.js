// 📁 deleteTeamTask.js
export async function getIndexTask(team, allShorts, formProps) {
  return {
    updatedTeamList: await getUpdatedTeamList(team.id, allShorts),
    updatedPlayerList: await getUpdatedPlayerList(team.id, allShorts, formProps),
    updatedAbilitiesList: await getUpdatedPlayerAbilitiesList(team.id, allShorts, formProps),
    updatedPhotosList: await getUpdatedPlayerPhotoList(team.id, allShorts, formProps),
    updatedPaymentList: await getUpdatedPaymentList(team.id, allShorts, formProps),
    updatedMeetingList: await getUpdatedMeetingList(team.id, allShorts, formProps),
    updatedGameList: await getUpdatedGameList(team.id, allShorts, formProps),
    updatedTeamRoleList: await getUpdatedTeamRoleList(team.id, allShorts, formProps),
  };
}

async function getUpdatedTeamList(teamId, allShorts) {
   if (!Array.isArray(allShorts?.teamsShorts)) {
     console.warn("[getUpdatedTeamList] teamsShorts חסר או לא תקין");
     return [];
   }

   return allShorts.teamsShorts.map((doc) => {
     const newList = (doc.list || []).filter(item => item.id !== teamId);
     return {
       docId: doc.docId,
       docName: doc.docName,
       list: newList,
     };
   });
 }

async function getUpdatedPlayerList(teamId, allShorts, formProps) {
  const teamPlayersIdsToDelete = (formProps.players || [])
    .filter(player => player.teamId === teamId)
    .map(player => player.id);

  if (!teamPlayersIdsToDelete.length) {
    console.warn("📭 למועדון אין שחקני פרוייקט למחיקה");
    return [];
  }

  const filteredLists = (allShorts.playersShorts || []).map((doc) => {
    const newList = (doc.list || []).filter(
      (item) => !teamPlayersIdsToDelete.includes(item.id)
    );

    return {
      docId: doc.docId,
      docName: doc.docName,
      list: newList,
    };
  });

  return filteredLists
}

async function getUpdatedPlayerAbilitiesList(teamId, allShorts, formProps) {
  const teamPlayersAbelitiesIdsToDelete = (formProps.players || [])
    .filter(player => player.teamId === teamId)
    .map(i=>i.docAbilitiesId)

  if (!teamPlayersAbelitiesIdsToDelete.length) {
    console.warn("📭 למועדון אין שחקני פרוייקט למחיקה");
    return [];
  }

  return teamPlayersAbelitiesIdsToDelete
}

async function getUpdatedPlayerPhotoList(teamId, allShorts, formProps) {
  const teamPlayersPhotoIdsToDelete = (formProps.players || [])
    .filter(player => player.teamId === teamId && !!player.photo)
    .map(player => player.photo);

  if (!teamPlayersPhotoIdsToDelete.length) {
    console.warn("📭 למועדון אין שחקני פרוייקט למחיקה");
    return [];
  }

  return teamPlayersPhotoIdsToDelete
}

export async function getUpdatedPaymentList(teamId, allShorts, formProps) {
  const teamPlayerIds = (formProps.players || [])
    .filter(player => player.teamId === teamId)
    .map(player => player.id);

  const playerPaymentsIds = (formProps?.payments || [])
    .filter(p => teamPlayerIds.includes(p.playerId))
    .map(p => p.id);

  if (!teamPlayerIds.length) {
    console.warn("📭 למועדון אין שחקנים עם תשלומים למחיקה");
    return [];
  }

  const filteredLists = (allShorts.playerPaymentsShorts || []).map((doc) => {
    const newList = (doc.list || []).filter(
      (item) => !playerPaymentsIds.includes(item.id)
    );

    return {
      docId: doc.docId,
      docName: doc.docName,
      list: newList,
    };
  });

  return filteredLists;
}

export async function getUpdatedMeetingList(teamId, allShorts, formProps) {
  const teamPlayerIds = (formProps.players || [])
    .filter(player => player.teamId === teamId)
    .map(player => player.id);

  const playerMeetingsIds = (formProps?.meetings || [])
    .filter(p => teamPlayerIds.includes(p.playerId))
    .map(p => p.id);

  if (!playerMeetingsIds.length) {
    console.warn("📭 למועדון אין שחקנים עם פגישות למחיקה");
    return [];
  }

  const filteredLists = (allShorts.meetingShorts || []).map((doc) => {
    const newList = (doc.list || []).filter(
      (item) => !playerMeetingsIds.includes(item.id)
    );

    return {
      docId: doc.docId,
      docName: doc.docName,
      list: newList,
    };
  });

  return filteredLists;
}

async function getUpdatedGameList(teamId, allShorts, formProps) {
  const teamGamesIdsToDelete = (formProps.games || [])
    .filter(game => game.teamId === teamId)
    .map(game => game.id);

  if (!teamGamesIdsToDelete.length) {
    console.warn("📭 למועדון אין משחקים למחיקה");
    return [];
  }

  const filteredLists = (allShorts.gamesShorts || []).map((doc) => {
    const newList = (doc.list || []).filter(
      (item) => !teamGamesIdsToDelete.includes(item.id)
    );

    return {
      docId: doc.docId,
      docName: doc.docName,
      list: newList,
    };
  });

  return filteredLists
}

async function getUpdatedTeamRoleList(teamId, allShorts, formProps) {
  const teamRolesIdToUpdate = (formProps.roles || [])
    .filter(role => role.teamId === teamId).map(i=>i.teamId);

  if (!teamRolesIdToUpdate.length) {
    console.warn("📭 למועדון אין אנשי צוות למחיקה");
    return [];
  }

  const filteredLists = (allShorts.rolesShorts || []).map((doc) => {
    const newList = (doc.list || []).map((item) => {
      if (teamRolesIdToUpdate.includes(item.teamId)) {
        return {
          ...item,
          teamId: '',
        };
      }
      return item; // כל השאר נשארים אותו דבר
    });

    return {
      docId: doc.docId,
      docName: doc.docName,
      list: newList,
    };
  }).filter(p=>p.docName === 'rolesInfo');

  return filteredLists;
}
