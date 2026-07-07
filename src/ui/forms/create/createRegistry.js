// ui/forms/create/createRegistry.js

import { iconUi } from '../../core/icons/iconUi.js'

export const CREATE_TYPES = {
  club: {
    type: 'club',
    title: 'יצירת מועדון',
    iconKey: 'addClub',
    entityType: 'club',
    form: null,
    formLoader: () => import('../ClubCreateForm.js'),
    size: 'md',
  },

  team: {
    type: 'team',
    title: 'יצירת קבוצה',
    iconKey: 'addTeam',
    entityType: 'team',
    form: null,
    formLoader: () => import('../TeamCreateForm.js'),
    size: 'md',
  },

  player: {
    type: 'player',
    title: 'יצירת שחקן',
    iconKey: 'addPlayer',
    entityType: 'player',
    form: null,
    formLoader: () => import('../PlayerCreateForm.js'),
    size: 'lg',
  },

  privatePlayer: {
    type: 'privatePlayer',
    title: 'יצירת שחקן פרטי',
    iconKey: 'addPlayer',
    entityType: 'privatePlayer',
    form: null,
    formLoader: () => import('../PrivateCreateForm.js'),
    size: 'lg',
  },

  players: {
    type: 'players',
    title: 'יצירת מספר שחקנים',
    iconKey: 'addPlayer',
    entityType: 'players',
    form: null,
    formLoader: () => import('../PlayerMultiCreateForm.js'),
    size: 'lg',
  },

  role: {
    type: 'role',
    title: 'יצירת איש צוות',
    iconKey: 'addRole',
    entityType: 'role',
    form: null,
    formLoader: () => import('../RoleCreateForm.js'),
    size: 'lg',
  },

  game: {
    type: 'game',
    title: 'יצירת משחק',
    iconKey: 'addGame',
    entityType: 'team',
    form: null,
    formLoader: () => import('../GameCreateForm.js'),
    size: 'lg',
  },

  games: {
    type: 'games',
    title: 'יצירת מספר משחקים',
    iconKey: 'addGame',
    entityType: 'team',
    form: null,
    formLoader: () => import('../GameMultiCreateForm.js'),
    size: 'lg',
  },

  meeting: {
    type: 'meeting',
    title: 'יצירת פגישה',
    iconKey: 'addMeeting',
    entityType: 'player',
    domainColor: '#f7b13b',
    form: null,
    formLoader: () => import('../MeetingCreateForm.js'),
    size: 'lg',
  },

  payment: {
    type: 'payment',
    title: 'יצירת תשלום',
    iconKey: 'addPayment',
    entityType: 'player',
    domainColor: '#0f766e',
    form: null,
    formLoader: () => import('../PaymentCreateForm.js'),
    size: 'lg',
  },

  scout: {
    type: 'scout',
    title: 'יצירת סקאוט',
    iconKey: 'scouting',
    entityType: 'scout',
    domainColor: '#96ede6',
    form: null,
    formLoader: null,
    size: 'lg',
  },

  tag: {
    type: 'tag',
    title: 'יצירת תג חדש',
    iconKey: 'addTag',
    entityType: 'tag',
    domainColor: '#96ede6',
    form: null,
    formLoader: () => import('../TagsCreateForm.js'),
    size: 'lg',
  },

  videoAnalysis: {
    type: 'video',
    title: 'יצירת ניתוח וידאו חדש',
    iconKey: 'video',
    entityType: 'videoAnalysis',
    domainColor: '#96ede6',
    form: null,
    formLoader: () => import('../VideoAnalysisCreateForm.js'),
    size: 'lg',
  },

  videos: {
    type: 'video',
    title: 'יצירת וידאו חדש',
    iconKey: 'video',
    entityType: 'videoGeneral',
    form: null,
    formLoader: () => import('../VideoCreateForm.js'),
    size: 'lg',
  },

  abilities: {
    type: 'abilities',
    title: 'יצירת טופס יכולות חדש',
    iconKey: 'abilities',
    entityType: 'abilities',
    form: null,
    formLoader: () => import('../AbilitiesCreateForm.js'),
    size: 'lg',
  },

  training: {
    type: 'trainingWeek',
    title: 'תכנון שבוע אימונים',
    iconKey: 'training',
    entityType: 'team',
    form: null,
    formLoader: () => import('../TrainingWeekCreateForm.js'),
    size: 'lg',
  },

  task: {
    type: 'tasks',
    title: 'משימה חדשה',
    iconKey: 'task',
    entityType: 'task',
    form: null,
    formLoader: () => import('../TasksCreateForm.js'),
    size: 'lg',
  },
}

export function getCreateMeta(type) {
  return (
    CREATE_TYPES[type] || {
      type,
      title: 'יצירת אובייקט',
      iconKey: 'add',
      entityType: 'player',
      form: null,
      formLoader: null,
      size: 'lg',
    }
  )
}

export function resolveCreateIcon(iconKey) {
  return iconUi({ id: iconKey })
}
