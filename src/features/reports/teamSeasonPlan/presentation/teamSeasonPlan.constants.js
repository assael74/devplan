// src/features/reports/teamSeasonPlan/presentation/teamSeasonPlan.constants.js

import {
  SEASON_PLAN_STATUS,
} from '../../../../shared/players/players.constants.js'

export const TEAM_SEASON_PLAN_MODE = 'seasonPlan'

export const SEASON_PLAN_PRINT_COLUMNS = [
  { key: 'index', label: '#', width: '4%' },
  { key: 'player', label: 'שחקן', width: '25%' },
  { key: 'positions', label: 'עמדות', width: '14%' },
  { key: 'seasonPlanStatus', label: 'תכנון לעונה', width: '19%' },
  { key: 'level', label: 'פוטנציאל יכולות', width: '29%' },
  { key: 'project', label: 'פרויקט', width: '9%' },
]

export const SEASON_PLAN_REPORT_GROUPS = [
  {
    id: 'planned',
    title: 'בתכנון לעונה',
    subtitle: 'בתוכניות, מעוניינים לעזוב ובהתלבטות',
    tone: 'team',
    statusValues: [
      SEASON_PLAN_STATUS.IN_SQUAD,
      SEASON_PLAN_STATUS.WANTS_TO_LEAVE,
      SEASON_PLAN_STATUS.UNDECIDED,
    ],
  },
  {
    id: 'notSuitable',
    title: 'לא בתכנון',
    subtitle: 'שחקנים שאינם מתאימים מקצועית לעונה',
    tone: 'danger',
    statusValues: [SEASON_PLAN_STATUS.NOT_SUITABLE],
  },
  {
    id: 'evaluation',
    title: 'בתהליך בחינה',
    subtitle: 'טרם נבחנו או נמצאים בהערכה מקצועית',
    tone: 'team',
    statusValues: [
      SEASON_PLAN_STATUS.NOT_REVIEWED,
      SEASON_PLAN_STATUS.UNDER_REVIEW,
    ],
  },
]

export const PLANNED_STATUS_ORDER = {
  [SEASON_PLAN_STATUS.IN_SQUAD]: 0,
  [SEASON_PLAN_STATUS.WANTS_TO_LEAVE]: 1,
  [SEASON_PLAN_STATUS.UNDECIDED]: 2,
}

export const SEASON_PLAN_LAYER_ITEMS = [
  { id: 'goalkeeper', value: 'goalkeeper', label: 'שוער', shortLabel: 'שוער' },
  { id: 'defense', value: 'defense', label: 'הגנה', shortLabel: 'הגנה' },
  { id: 'dmMid', value: 'dmMid', label: 'קישור הגנתי', shortLabel: 'קישור הגנתי' },
  { id: 'atMidfield', value: 'atMidfield', label: 'קישור התקפי', shortLabel: 'קישור התקפי' },
  { id: 'attack', value: 'attack', label: 'התקפה', shortLabel: 'התקפה' },
]
