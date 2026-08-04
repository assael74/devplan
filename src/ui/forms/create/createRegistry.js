// src/ui/forms/create/createRegistry.js

import { iconUi } from '../../core/icons/iconUi.js'

export const CREATE_TYPES = {
  club: {
    type: 'club',
    title: 'יצירת מועדון',
    iconKey: 'addClub',
    entityType: 'club',
    formLoader: () => import('../clubs/ClubCreateForm.js'),
    size: 'md',
  },

  team: {
    type: 'team',
    title: 'יצירת קבוצה',
    iconKey: 'addTeam',
    entityType: 'team',
    formLoader: () => import('../teams/TeamCreateForm.js'),
    size: 'md',
  },

  player: {
    type: 'player',
    title: 'יצירת שחקן',
    iconKey: 'addPlayer',
    entityType: 'player',
    formLoader: () => import('../players/PlayerCreateForm.js'),
    size: 'lg',
  },

  privatePlayer: {
    type: 'privatePlayer',
    title: 'יצירת שחקן פרטי',
    iconKey: 'addPlayer',
    entityType: 'privatePlayer',
    formLoader: () => import('../privates/PrivateCreateForm.js'),
    size: 'lg',
  },

  players: {
    type: 'players',
    title: 'יצירת מספר שחקנים',
    iconKey: 'addPlayer',
    entityType: 'players',
    formLoader: () => import('../players/PlayerMultiCreateForm.js'),
    size: 'lg',
  },

  role: {
    type: 'role',
    title: 'יצירת איש צוות',
    iconKey: 'addRole',
    entityType: 'role',
    formLoader: () => import('../roles/RoleCreateForm.js'),
    size: 'lg',
  },

  game: {
    type: 'game',
    title: 'יצירת משחק',
    iconKey: 'addGame',
    entityType: 'team',
    formLoader: () => import('../games/GameCreateForm.js'),
    size: 'lg',
  },

  games: {
    type: 'games',
    title: 'יצירת מספר משחקים',
    iconKey: 'addGame',
    entityType: 'team',
    formLoader: () => import('../games/GameMultiCreateForm.js'),
    size: 'lg',
  },

  meeting: {
    type: 'meeting',
    title: 'יצירת פגישה',
    iconKey: 'addMeeting',
    entityType: 'player',
    domainColor: '#f7b13b',
    formLoader: () => import('../meetings/MeetingCreateForm.js'),
    size: 'lg',
  },

  payment: {
    type: 'payment',
    title: 'יצירת תשלום',
    iconKey: 'addPayment',
    entityType: 'player',
    domainColor: '#0f766e',
    formLoader: () => import('../payments/PaymentCreateForm.js'),
    size: 'lg',
  },

  privatePaymentAgreement: {
    type: 'privatePaymentAgreement',
    title: 'פתיחת תשלום חדש',
    iconKey: 'addPayment',
    entityType: 'player',
    domainColor: '#0f766e',
    formLoader: () => import('../payments/PrivatePaymentAgreementCreateForm.js'),
    size: 'lg',
  },

  scout: {
    type: 'scout',
    title: 'יצירת סקאוט',
    iconKey: 'scouting',
    entityType: 'scout',
    domainColor: '#96ede6',
    formLoader: null,
    size: 'lg',
  },

  tag: {
    type: 'tag',
    title: 'יצירת תג חדש',
    iconKey: 'addTag',
    entityType: 'tag',
    domainColor: '#96ede6',
    formLoader: () => import('../tags/TagsCreateForm.js'),
    size: 'lg',
  },

  videoAnalysis: {
    type: 'video',
    title: 'יצירת ניתוח וידאו חדש',
    iconKey: 'video',
    entityType: 'videoAnalysis',
    domainColor: '#96ede6',
    formLoader: () => import('../videos/VideoAnalysisCreateForm.js'),
    size: 'lg',
  },

  videos: {
    type: 'video',
    title: 'יצירת וידאו חדש',
    iconKey: 'video',
    entityType: 'videoGeneral',
    formLoader: () => import('../videos/VideoCreateForm.js'),
    size: 'lg',
  },

  abilities: {
    type: 'abilities',
    title: 'יצירת טופס יכולות חדש',
    iconKey: 'abilities',
    entityType: 'abilities',
    formLoader: () => import('../abilities/AbilitiesCreateForm.js'),
    size: 'lg',
  },

  training: {
    type: 'trainingWeek',
    title: 'תכנון שבוע אימונים',
    iconKey: 'training',
    entityType: 'team',
    formLoader: () => import('../trainings/TrainingWeekCreateForm.js'),
    size: 'lg',
  },

  task: {
    type: 'tasks',
    title: 'משימה חדשה',
    iconKey: 'task',
    entityType: 'task',
    formLoader: () => import('../tasks/TasksCreateForm.js'),
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
        formLoader: null,
      size: 'lg',
    }
  )
}

export function resolveCreateIcon(iconKey) {
  return iconUi({ id: iconKey })
}
