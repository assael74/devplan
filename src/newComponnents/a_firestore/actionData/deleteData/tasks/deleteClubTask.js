// 📁 deleteClubTask.js

export async function getIndexTask(club, allShorts, formProps) {
  return {
    updatedClubList: await getUpdatedClubList(club.id, allShorts),
    updatedTeamList: await getUpdatedTeamList(club.id, allShorts, formProps),
    updatedPlayerList: await getUpdatedPlayerList(club.id, allShorts, formProps),
    updatedAbilitiesList: await getUpdatedPlayerAbilitiesList(club.id, allShorts, formProps),
    updatedPhotosList: await getUpdatedPlayerPhotoList(club.id, allShorts, formProps),
    updatedPaymentList: await getUpdatedPaymentList(club.id, allShorts, formProps),
    updatedMeetingList: await getUpdatedMeetingList(club.id, allShorts, formProps),
    updatedGameList: await getUpdatedGameList(club.id, allShorts, formProps),
    updatedClubRoleList: await getUpdatedClubRoleList(club.id, allShorts, formProps),
  };
}

async function getUpdatedClubList(clubId, allShorts) {
  if (!Array.isArray(allShorts?.clubsShorts)) {
    console.warn("[getUpdatedClubList] clubsShorts חסר או לא תקין");
    return [];
  }

  return allShorts.clubsShorts.map((doc) => {
    const newList = (doc.list || []).filter(item => item.id !== clubId);

    return {
      docId: doc.docId,
      docName: doc.docName,
      list: newList,
    };
  });
}

async function getUpdatedTeamList(clubId, allShorts, formProps) {
  const clubTeamsIdsToDelete = (formProps.teams || []).filter(team => team.clubId === clubId).map(team => team.id);

  if (!clubTeamsIdsToDelete.length) {
    console.warn("📭 למועדון אין קבוצות למחיקה");
    return [];
  }

  const filteredLists = (allShorts.teamsShorts || []).map((doc) => {
    const newList = (doc.list || []).filter(
      (item) => !clubTeamsIdsToDelete.includes(item.id)
    );

    return {
      docId: doc.docId,
      docName: doc.docName,
      list: newList,
    };
  });

  return filteredLists
}

async function getUpdatedPlayerList(clubId, allShorts, formProps) {
  const clubPlayersIdsToDelete = (formProps.players || [])
  .filter(player => player.clubId === clubId).map(player => player.id);

  if (!clubPlayersIdsToDelete.length) {
    console.warn("📭 למועדון אין שחקני פרוייקט למחיקה");
    return [];
  }

  const filteredLists = (allShorts.playersShorts || []).map((doc) => {
    const newList = (doc.list || []).filter(
      (item) => !clubPlayersIdsToDelete.includes(item.id)
    );

    return {
      docId: doc.docId,
      docName: doc.docName,
      list: newList,
    };
  });

  return filteredLists
}

async function getUpdatedPlayerAbilitiesList(clubId, allShorts, formProps) {
  const clubPlayersAbelitiesIdsToDelete = (formProps.players || [])
    .filter(player => player.clubId === clubId)
    .map(i=>i.docAbilitiesId)

  if (!clubPlayersAbelitiesIdsToDelete.length) {
    console.warn("📭 למועדון אין שחקני פרוייקט למחיקה");
    return [];
  }

  return clubPlayersAbelitiesIdsToDelete
}

async function getUpdatedPlayerPhotoList(clubId, allShorts, formProps) {
  const clubPlayersPhotoIdsToDelete = (formProps.players || [])
    .filter(player => player.clubId === clubId && !!player.photo)
    .map(player => player.photo);

  if (!clubPlayersPhotoIdsToDelete.length) {
    console.warn("📭 למועדון אין שחקני פרוייקט למחיקה");
    return [];
  }

  return clubPlayersPhotoIdsToDelete
}

async function getUpdatedPaymentList(clubId, allShorts, formProps) {
  const clubPlayerIds = (formProps.players || [])
    .filter(player => player.clubId === clubId)
    .map(player => player.id);

  const playerPaymentsIds = (formProps?.payments || [])
    .filter(p => clubPlayerIds.includes(p.playerId))
    .map(p => p.id);

  if (!playerPaymentsIds.length) {
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

async function getUpdatedMeetingList(clubId, allShorts, formProps) {
  const clubPlayerIds = (formProps.players || [])
    .filter(player => player.clubId === clubId)
    .map(player => player.id);

  const playerMeetingsIds = (formProps?.meetings || [])
    .filter(p => clubPlayerIds.includes(p.playerId))
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

async function getUpdatedGameList(clubId, allShorts, formProps) {
  const clubGamesIdsToDelete = (formProps.games || [])
    .filter(game => game.clubId === clubId)
    .map(game => game.id);

  if (!clubGamesIdsToDelete.length) {
    console.warn("📭 למועדון אין משחקים למחיקה");
    return [];
  }

  const filteredLists = (allShorts.gamesShorts || []).map((doc) => {
    const newList = (doc.list || []).filter(
      (item) => !clubGamesIdsToDelete.includes(item.id)
    );

    return {
      docId: doc.docId,
      docName: doc.docName,
      list: newList,
    };
  });

  return filteredLists
}

async function getUpdatedClubRoleList(clubId, allShorts, formProps) {
  const clubRolesIdToUpdate = (formProps.roles || [])
    .filter(role => role.clubId === clubId).map(i=>i.clubId);

  if (!clubRolesIdToUpdate.length) {
    console.warn("📭 למועדון אין אנשי צוות למחיקה");
    return [];
  }

  const filteredLists = (allShorts.rolesShorts || []).map((doc) => {
    const newList = (doc.list || []).map((item) => {
      if (clubRolesIdToUpdate.includes(item.clubId)) {
        return {
          ...item,
          teamId: '',
          clubId: '',
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
