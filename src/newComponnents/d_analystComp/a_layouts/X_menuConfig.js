export const clubMenuConfig = (club) => {
  return [
    {
      id: 'clubInfo',
      label: 'פרטי המועדון',
      iconId: 'name',
      modal: false,
      getTitle: () => `עריכת ${club.clubName}`,
    },
    {
      id: 'clubRoles',
      label: 'פרטי צוות מקצועי',
      iconId: 'name',
      modal: false,
      getTitle: () => `עריכת ${club.clubName}`,
    },
    { id: 'divider' },
    {
      id: 'photo',
      label: 'עריכת תמונה',
      iconId: 'photo',
      modal: true,
      getTitle: () => `עריכת ${club.clubName}`,
    },
    {
      id: 'delete',
      label: 'מחיקת מועדון',
      iconId: 'delete',
      color: 'danger',
      modal: true,
      getTitle: () => `עריכת ${club.clubName}`,
    },
  ];
}

export const teamMenuConfig = (team) => {
  return [
    {
      id: 'teamInfo',
      label: 'פרטי הקבוצה',
      iconId: 'info',
      modal: false,
      getTitle: () => `עריכת מידע`,
    },
    {
      id: 'teamPro',
      label: 'מידע מקצועי',
      iconId: 'stats',
      modal: false,
      getTitle: () => `עריכת מידע`,
    },
    {
      id: 'teamCoach',
      label: 'פרטי הצוות מקצועי',
      iconId: 'name',
      modal: false,
      getTitle: () => `עריכת`,
    },
    { id: 'divider' },
    {
      id: 'photo',
      label: 'עריכת תמונה',
      iconId: 'photo',
      modal: true,
      getTitle: () => `עריכת`,
    },
    {
      id: 'delete',
      label: 'מחיקת קבוצה',
      iconId: 'delete',
      color: 'danger',
      modal: true,
      getTitle: () => `עריכת`,
    },
  ];
}

export const playerMenuConfig = (player) => {
  return [
    {
      id: 'playerName',
      label: 'שמות השחקן',
      iconId: 'name',
      modal: false,
      getTitle: () => 'עריכת שמות השחקן',
    },
    {
      id: 'playerInfo',
      label: 'מידע אישי',
      iconId: 'info',
      modal: false,
      getTitle: () => 'עריכת שמות השחקן',
    },
    {
      id: 'playerAge',
      label: 'גיל השחקן',
      iconId: 'age',
      modal: false,
      getTitle: () => 'עריכת גיל (שנתון + יום הולדת)',
    },
    {
      id: 'playerPosition',
      label: 'עריכת עמדה',
      iconId: 'position',
      modal: false,
      getTitle: () => 'עריכת עמדות שחקן',
    },

    // ✨ מפריד
    { id: 'divider' },

    {
      id: 'photo',
      label: 'עריכת תמונה',
      iconId: 'photo',
      modal: true,
      getTitle: () => 'עריכת תמונת שחקן',
    },
    {
      id: 'delete',
      label: 'מחיקת שחקן',
      iconId: 'delete',
      color: 'danger',
      modal: true,
      getTitle: () => 'עריכת עמדות שחקן',
    },
  ];
}

export const paymentMenuConfig = (payment) => {
  return [
    {
      id: 'paymentInfo',
      label: 'פרטי התשלום',
      iconId: 'info',
      modal: false,
      getTitle: () => `עריכת תשלום`,
    },
    {
      id: 'paymentStatus',
      label: 'סטטוס התשלום',
      iconId: 'isPaid',
      modal: false,
      getTitle: () => `עדכון תשלום`,
    },
    {
      id: 'paymentType',
      label: 'סוג התשלום',
      iconId: 'payment',
      modal: false,
      getTitle: () => `עריכת תשלום`,
    },
    { id: 'divider' },
    {
      id: 'delete',
      label: 'מחיקת בקשת תשלום',
      iconId: 'delete',
      color: 'danger',
      modal: false,
      getTitle: () => `עריכת תשלום`,
    },
  ];
}

export const meetingMenuConfig = (meeting) => {
  return [
    {
      id: 'meetingInfo',
      label: 'מידע הפגישה',
      iconId: 'info',
      modal: false,
      getTitle: () => `עריכת פגישה ${meeting.meetingFor || ''}`,
    },
    {
      id: 'meetingStatus',
      label: 'סטטוס הפגישה',
      iconId: 'meetingDone',
      modal: false,
      getTitle: () => `עריכת פגישה ${meeting.meetingFor || ''}`,
    },
    {
      id: 'meetingType',
      label: 'סוג הפגישה',
      iconId: 'meeting',
      modal: false,
      getTitle: () => `עריכת פגישה ${meeting.meetingFor || ''}`,
    },
    { id: 'divider' },
    {
      id: 'delete',
      label: 'מחיקת פגישה',
      iconId: 'delete',
      color: 'danger',
      modal: false,
    },
  ];
}

export const gameMenuConfig = (game) => {
  return [
    {
      id: 'gameInfo',
      label: 'מידע המשחק',
      iconId: 'info',
      view: ['profileAnalyst'],
      modal: false,
      getTitle: () => `עריכת משחק ${game.gameDate || ''}`,
    },
    {
      id: 'gameResult',
      label: 'תוצאת משחק',
      iconId: 'results',
      view: ['profileAnalyst'],
      modal: false,
      getTitle: () => `עריכת משחק ${game.gameDate || ''}`,
    },
    {
      id: 'gameTime',
      label: 'זמני משחק',
      iconId: 'day',
      view: ['profileAnalyst'],
      modal: false,
      getTitle: () => `עריכת משחק ${game.gameDate || ''}`,
    },
    {
      id: 'gameStats',
      label: 'סטטיסטיקה אישית',
      iconId: 'stats',
      view: ['profilePlayer'],
      modal: false,
      getTitle: () => `עריכת משחק ${game.gameDate || ''}`,
    },
    {
      id: 'divider',
      view: ['profileAnalyst'],
     },
    {
      id: 'delete',
      label: 'מחיקת משחק',
      iconId: 'delete',
      view: ['profileAnalyst'],
      color: 'danger',
      modal: false,
    },
  ];
}

export const scoutingMenuConfig = (scout) => {
  return [
    {
      id: 'playerInfo',
      label: 'מידע אישי',
      iconId: 'info',
      modal: false,
      getTitle: () => 'עריכת שמות השחקן',
    },
    {
      id: 'playerPro',
      label: 'הוספת מידע משחק',
      iconId: 'game',
      modal: false,
      getTitle: () => 'עריכת שמות השחקן',
    },
    {
      id: 'playerPosition',
      label: 'עריכת עמדה',
      iconId: 'position',
      modal: false,
      getTitle: () => 'עריכת עמדות שחקן',
    },

    // ✨ מפריד
    { id: 'divider' },

    {
      id: 'photo',
      label: 'עריכת תמונה',
      iconId: 'photo',
      modal: true,
      getTitle: () => 'עריכת תמונת שחקן',
    },
    {
      id: 'delete',
      label: 'מחיקת שחקן',
      iconId: 'delete',
      color: 'danger',
      modal: true,
      getTitle: () => 'עריכת עמדות שחקן',
    },
  ];
}

export const videoMenuConfig = (video) => {
  return [
    {
      id: 'videoInfo',
      label: 'עריכת פרטי הוידאו',
      iconId: 'video',
      modal: false,
      getTitle: () => `עריכת מידע`,
    },
    {
      id: 'videoTags',
      label: 'עריכת תגי וידאו',
      iconId: 'tags',
      modal: false,
      getTitle: () => `עריכת מידע`,
    },
    {
      id: 'videoComments',
      label: 'עריכת הערות וידאו',
      iconId: 'comments',
      modal: false,
      getTitle: () => `עריכת מידע`,
    },
    { id: 'divider' },
    {
      id: 'delete',
      label: 'מחיקת וידאו',
      iconId: 'delete',
      color: 'danger',
      modal: true,
      getTitle: () => `עריכת`,
    },
  ];
}

export const videoAnalysisMenuConfig = (video) => {
  return [
    {
      id: 'videoAnalysisInfo',
      label: 'עריכת פרטי הוידאו',
      iconId: 'video',
      modal: false,
      getTitle: () => `עריכת מידע`,
    },
    {
      id: 'videoAnalysisLinks',
      label: 'עריכת הקישור',
      iconId: 'link',
      modal: false,
      getTitle: () => `עריכת`,
    },
    {
      id: 'videoTags',
      label: 'עריכת תגי וידאו',
      iconId: 'tags',
      modal: false,
      getTitle: () => `עריכת מידע`,
    },
    {
      id: 'videoComments',
      label: 'עריכת הערות וידאו',
      iconId: 'comments',
      modal: false,
      getTitle: () => `עריכת מידע`,
    },
    { id: 'divider' },
    {
      id: 'delete',
      label: 'מחיקת וידאו',
      iconId: 'delete',
      color: 'danger',
      modal: true,
      getTitle: () => `עריכת`,
    },
  ];
}

export const tagMenuConfig = (video) => {
  return [
    {
      id: 'tagsInfo',
      label: 'עריכת פרטי התג',
      iconId: 'video',
      modal: false,
      getTitle: () => `עריכת מידע`,
    },
    { id: 'divider' },
    {
      id: 'delete',
      label: 'מחיקת התג',
      iconId: 'delete',
      color: 'danger',
      modal: true,
      getTitle: () => `עריכת`,
    },
  ];
}

export const roleMenuConfig = (video) => {
  return [
    {
      id: 'rolesInfo',
      label: 'עריכת פרטי איש הצוות',
      iconId: 'roles',
      modal: false,
      getTitle: () => `עריכת מידע`,
    },
    { id: 'divider' },
    {
      id: 'photo',
      label: 'עריכת תמונה',
      iconId: 'photo',
      modal: true,
      getTitle: () => 'עריכת תמונת שחקן',
    },
    {
      id: 'delete',
      label: 'מחיקת איש הצוות',
      iconId: 'delete',
      color: 'danger',
      modal: true,
      getTitle: () => `עריכת`,
    },
  ];
}
