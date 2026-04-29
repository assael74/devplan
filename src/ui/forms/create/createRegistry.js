// ui/forms/create/createRegistry.js

import React from 'react'
import ClubCreateForm from '../ClubCreateForm'
import TeamCreateForm from '../TeamCreateForm'
import PlayerCreateForm from '../PlayerCreateForm'
import PlayerMultiCreateForm from '../PlayerMultiCreateForm'
import PrivateCreateForm from '../PrivateCreateForm'
import MeetingCreateForm from '../MeetingCreateForm'
import PaymentCreateForm from '../PaymentCreateForm'
import GameCreateForm from '../GameCreateForm'
import GameMultiCreateForm from '../GameMultiCreateForm'
import TagsCreateForm from '../TagsCreateForm'
import VideoAnalysisCreateForm from '../VideoAnalysisCreateForm'
import VideoCreateForm from '../VideoCreateForm'
import AbilitiesCreateForm from '../AbilitiesCreateForm'
import TrainingWeekCreateForm from '../TrainingWeekCreateForm.js'
import TasksCreateForm from '../TasksCreateForm.js'
import { iconUi } from '../../core/icons/iconUi.js'

export const CREATE_TYPES = {
  club: {
    type: 'club',
    title: 'פתיחת מועדון',
    iconKey: 'addClub',
    entityType: 'club',
    form: ClubCreateForm,
    size: 'md'
  },

  team: {
    type: 'team',
    title: 'פתיחת קבוצה',
    iconKey: 'addTeam',
    entityType: 'team',
    form: TeamCreateForm,
    size: 'md'
  },

  player: {
    type: 'player',
    title: 'פתיחת שחקן',
    iconKey: 'addPlayer',
    entityType: 'player',
    form: PlayerCreateForm,
    size: 'lg'
  },

  privatePlayer: {
    type: 'privatePlayer',
    title: 'פתיחת שחקן פרטי',
    iconKey: 'addPlayer',
    entityType: 'privatePlayer',
    form: PrivateCreateForm,
    size: 'lg'
  },

  players: {
    type: 'players',
    title: 'פתיחת מספר שחקנים',
    iconKey: 'addPlayer',
    entityType: 'players',
    form: PlayerMultiCreateForm,
    size: 'lg'
  },

  role: {
    type: 'role',
    title: 'פתיחת איש צוות',
    iconKey: 'addRole',
    entityType: 'role',
    form: null,
    size: 'lg'
  },

  game: {
    type: 'game',
    title: 'פתיחת משחק',
    iconKey: 'addGame',
    entityType: 'team',
    form: GameCreateForm,
    size: 'lg'
  },

  games: {
    type: 'games',
    title: 'פתיחת מספר משחקים',
    iconKey: 'addGame',
    entityType: 'team',
    form: GameMultiCreateForm,
    size: 'lg'
  },

  meeting: {
    type: 'meeting',
    title: 'פתיחת מפגש',
    iconKey: 'addMeeting',
    entityType: 'player',
    domainColor: '#f7b13b',
    form: MeetingCreateForm,
    size: 'lg'
  },

  payment: {
    type: 'payment',
    title: 'פתיחת תשלום',
    iconKey: 'addPayment',
    entityType: 'player',
    domainColor: '#0f766e',
    form: PaymentCreateForm,
    size: 'lg'
  },

  scout: {
    type: 'scout',
    title: 'פתיחת שחקן למעקב',
    iconKey: 'scouting',
    entityType: 'scout',
    domainColor: '#96ede6',
    form: null,
    size: 'lg'
  },

  tag: {
    type: 'tag',
    title: 'יצירת תג חדש',
    iconKey: 'addTag',
    entityType: 'tag',
    domainColor: '#96ede6',
    form: TagsCreateForm,
    size: 'lg'
  },

  videoAnalysis: {
    type: 'video',
    title: 'פתיחת ניתוח וידאו חדש',
    iconKey: 'video',
    entityType: 'videoAnalysis',
    form: VideoAnalysisCreateForm,
    size: 'lg'
  },

  videos: {
    type: 'video',
    title: 'פתיחת וידאו חדש',
    iconKey: 'video',
    entityType: 'videoGeneral',
    form: VideoCreateForm,
    size: 'lg'
  },

  abilities: {
    type: 'abilities',
    title: 'פתיחת טופס יכולות חדש',
    iconKey: 'abilities',
    entityType: 'abilities',
    form: AbilitiesCreateForm,
    size: 'lg'
  },

  training: {
    type: 'trainingWeek',
    title: 'תכנון שבוע אימונים',
    iconKey: 'training',
    entityType: 'team',
    form: TrainingWeekCreateForm,
    size: 'lg'
  },

  task: {
    type: 'tasks',
    title: 'משימה חדשה',
    iconKey: 'task',
    entityType: 'task',
    form: TasksCreateForm,
    size: 'lg'
  },
}

export function getCreateMeta(type) {
  return CREATE_TYPES[type] || {
    type,
    title: 'פתיחת אובייקט',
    iconKey: 'add',
    entityType: 'player',
    size: 'lg'
  }
}

export function resolveCreateIcon(iconKey) {
  return iconUi({ id: iconKey })
}
