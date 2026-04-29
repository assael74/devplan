// src/features/calendar/logic/calendarHub.constants.js

import { getEntityColors } from '../../../ui/core/theme/Colors.js'

const c = getEntityColors('calendar')

export const CALENDAR_EVENT_TYPES = {
  game: {
    id: 'game',
    label: 'משחק',
    idIcon: 'game',
    color: c.game?.bg,
  },

  training: {
    id: 'training',
    label: 'אימון',
    idIcon: 'training',
    color: c.training?.bg,
  },

  meeting: {
    id: 'meeting',
    label: 'פגישה',
    idIcon: 'meeting',
    color: c.meeting?.bg,
  },
}

export const CALENDAR_FILTERS_DEFAULT = {
  weekend: true,
  weekday: true,
  games: true,
  trainings: false,
  meetings: true,
}

export const CALENDAR_FILTER_GROUPS = [
  {
    id: 'days',
    label: 'ימים',
    options: [
      {
        id: 'weekday',
        label: 'אמצע שבוע',
        idIcon: 'weekday',
      },
      {
        id: 'weekend',
        label: 'סופ״ש',
        idIcon: 'weekend',
      },
    ],
  },
  {
    id: 'types',
    label: 'סוג אירוע',
    options: [
      {
        id: 'games',
        label: 'משחקים',
        idIcon: 'games',
      },
      {
        id: 'meetings',
        label: 'פגישות',
        idIcon: 'meetings',
      },
      {
        id: 'trainings',
        label: 'אימונים',
        idIcon: 'training',
      },
    ],
  },
]

export const CALENDAR_SORT_OPTIONS = [
  {
    id: 'time',
    label: 'שעה',
    idIcon: 'calendar',
    defaultDirection: 'asc',
  },
  {
    id: 'type',
    label: 'סוג אירוע',
    idIcon: 'filter',
    defaultDirection: 'asc',
  },
  {
    id: 'team',
    label: 'קבוצה',
    idIcon: 'teams',
    defaultDirection: 'asc',
  },
  {
    id: 'title',
    label: 'כותרת',
    idIcon: 'text',
    defaultDirection: 'asc',
  },
]

export const CALENDAR_SORT_DEFAULT = {
  by: 'time',
  direction: 'asc',
}
