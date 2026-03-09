// 📁 deleteClubTask.js

export async function getIndexTask(role, allShorts, formProps) {
  return {
    updatedRoleList: await getUpdatedRoleList(role.id, allShorts),
  };
}

async function getUpdatedRoleList(roleId, allShorts) {
  if (!Array.isArray(allShorts?.rolesShorts)) {
    console.warn("[getUpdatedRoleList] rolesShorts חסר או לא תקין");
    return [];
  }

  return allShorts.rolesShorts.map((doc) => {
    const newList = (doc.list || []).filter(item => item.id !== roleId);

    return {
      docId: doc.docId,
      docName: doc.docName,
      list: newList,
    };
  });
}
