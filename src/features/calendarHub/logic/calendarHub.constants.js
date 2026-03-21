// src/features/calendar/logic/calendarHub.constants.js

import { getEntityColors } from '../../../ui/core/theme/Colors.js'

const c = getEntityColors('calendar')

export const CALENDAR_EVENT_TYPES = {
  game: {
    id: 'game',
    label: 'משחק',
    idIcon: 'game',
    color: c.game?.bg
  },

  training: {
    id: 'training',
    label: 'אימון',
    idIcon: 'training',
    color: c.training?.bg
  },

  meeting: {
    id: 'meeting',
    label: 'פגישה',
    idIcon: 'meeting',
    color: c.meeting?.bg
  },
}

export const CALENDAR_FILTERS_DEFAULT = {
  weekend: true,
  weekday: true,
  games: true,
  trainings: false,
  meetings: true,
}
