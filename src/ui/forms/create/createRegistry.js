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
import { iconUi } from '../../core/icons/iconUi.js'

export const CREATE_TYPES = {
  club: {
    type: 'club',
    title: 'פתיחת מועדון',
    iconKey: 'addClub',
    entityType: 'club',
    form: ClubCreateForm,
    required: ['clubName'],
    surface: 'modal',
  },

  team: {
    type: 'team',
    title: 'פתיחת קבוצה',
    iconKey: 'addTeam',
    entityType: 'team',
    form: TeamCreateForm,
    required: ['teamName', 'clubId', 'teamYear'],
    surface: 'modal',
  },

  player: {
    type: 'player',
    title: 'פתיחת שחקן',
    iconKey: 'addPlayer',
    entityType: 'player',
    form: PlayerCreateForm,
    required: ['playerFirstName', 'playerLastName', 'clubId', 'teamId', 'birthMonthYear'],
    surface: 'modal',
  },

  privatePlayer: {
    type: 'privatePlayer',
    title: 'פתיחת שחקן פרטי',
    iconKey: 'addPlayer',
    entityType: 'privatePlayer',
    form: PrivateCreateForm,
    required: ['playerFirstName', 'playerLastName', 'birthMonthYear'],
    surface: 'modal',
  },

  players: {
    type: 'players',
    title: 'פתיחת מספר שחקנים',
    iconKey: 'addPlayer',
    entityType: 'players',
    form: PlayerMultiCreateForm,
    required: ['playerFirstName', 'playerLastName', 'clubId', 'teamId', 'birthMonthYear'],
    surface: 'modal',
  },

  role: {
    type: 'role',
    title: 'פתיחת איש צוות',
    iconKey: 'addRole',
    entityType: 'role',
    form: null,
    required: ['fullName', 'type'],
    surface: 'modal',
  },

  game: {
    type: 'game',
    title: 'פתיחת משחק',
    iconKey: 'addGame',
    entityType: 'team',
    form: GameCreateForm,
    required: ['gameDuration', 'rivel', 'type', 'gameDate'],
    surface: 'modal',
  },

  games: {
    type: 'games',
    title: 'פתיחת מספר משחקים',
    iconKey: 'addGame',
    entityType: 'team',
    form: GameMultiCreateForm,
    required: ['gameDuration', 'rivel', 'type', 'gameDate'],
    surface: 'modal',
  },

  meeting: {
    type: 'meeting',
    title: 'פתיחת מפגש',
    iconKey: 'addMeeting',
    entityType: 'player',
    domainColor: '#f7b13b',
    form: MeetingCreateForm,
    required: ['type', 'meetingDate', 'meetingFor', 'meetingHour'],
    surface: 'modal',
  },

  payment: {
    type: 'payment',
    title: 'פתיחת תשלום',
    iconKey: 'addPayment',
    entityType: 'player',
    domainColor: '#0f766e',
    form: PaymentCreateForm,
    required: ['paymentFor', 'price', 'type'],
    surface: 'modal',
  },

  scout: {
    type: 'scout',
    title: 'פתיחת שחקן למעקב',
    iconKey: 'scouting',
    entityType: 'scout',
    domainColor: '#96ede6',
    form: null,
    required: ['playerName', 'clubName', 'teamName', 'birth'],
    surface: 'modal',
  },

  tag: {
    type: 'tag',
    title: 'יצירת תג חדש',
    iconKey: 'addTag',
    entityType: 'tag',
    domainColor: '#96ede6',
    form: TagsCreateForm,
    required: ['tagName', 'tagType'],
    surface: 'modal',
  },

  videoAnalysis: {
    type: 'video',
    title: 'פתיחת ניתוח וידאו חדש',
    iconKey: 'video',
    entityType: 'videoAnalysis',
    form: VideoAnalysisCreateForm,
    required: ['name', 'link', 'contextType', 'objectType'],
    surface: 'modal',
  },

  videos: {
    type: 'video',
    title: 'פתיחת וידאו חדש',
    iconKey: 'video',
    entityType: 'videoGeneral',
    form: VideoCreateForm,
    required: ['name', 'link'],
    surface: 'modal',
  },

  abilities: {
    type: 'abilities',
    title: 'פתיחת טופס יכולות חדש',
    iconKey: 'abilities',
    entityType: 'abilities',
    form: AbilitiesCreateForm,
    required: [],
    surface: 'modal',
  },

  training: {
    type: 'trainingWeek',
    title: 'תכנון שבוע אימונים',
    iconKey: 'training',
    entityType: 'team',
    form: TrainingWeekCreateForm,
    required: ['teamId', 'weekId'],
    surface: 'modal',
  },
}

export function getCreateMeta(type) {
  return CREATE_TYPES[type] || {
    type,
    title: 'פתיחת אובייקט',
    iconKey: 'add',
    entityType: 'player',
    surface: 'modal',
  }
}

export function resolveCreateIcon(iconKey) {
  return iconUi({ id: iconKey })
}
