
export const meetingMenuConfig = (player) => {
  return [
    {
      id: 'meetingInfo',
      label: 'מידע הפגישה',
      iconId: 'info',
      modal: false,
      getTitle: (p) => `עריכת פרטי פגישה ${player.playerFullName}`,
    },
    {
      id: 'meetingStatus',
      label: 'סטטוס הפגישה',
      iconId: 'meetingDone',
      modal: false,
      getTitle: (p) => `עדכון סטטוס פגישה ${player.playerFullName}`,
    },
    {
      id: 'meetingType',
      label: 'סוג הפגישה',
      iconId: 'meeting',
      modal: false,
      getTitle: (p) => `עדכון סוג פגישה ${player.playerFullName}`,
    },
    { id: 'divider' },
    {
      id: 'delete',
      label: 'מחיקת פגישה',
      iconId: 'delete',
      color: 'danger',
      modal: false,
      getTitle: (p) => `עדכון `,
    },
  ];
}
