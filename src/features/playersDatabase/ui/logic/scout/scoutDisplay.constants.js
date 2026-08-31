// src/features/playersDatabase/ui/logic/scout/scoutDisplay.constants.js

import {
  SCOUT_REVIEW,
  TEAM_FILTER,
} from '../../../../../shared/scouting/players/index.js'
import { POSITION_LAYERS } from '../../../../../shared/players/players.constants.js'

export const SCOUT_PRIORITY_DISPLAY = {
  elite: {
    label: 'יעד מוביל',
    tone: 'elite',
  },
  high: {
    label: 'עדיפות גבוהה',
    tone: 'high',
  },
  positive: {
    label: 'חיובי',
    tone: 'positive',
  },
  neutral: {
    label: 'רגיל',
    tone: 'neutral',
  },
  low: {
    label: 'עדיפות נמוכה',
    tone: 'low',
  },
}

export const SCOUT_PROFILE_GROUP_LABELS = {
  attack: 'התקפי',
  defense_keeper: 'הגנתי',
  defense_midfield: 'הגנתי / קישור',
  attack_creation: 'יצירה והתקפה',
  opportunity: 'הזדמנות',
  all: 'כללי',
}

export const POSITION_CONTEXT_LABELS = {
  defense_midfield: 'הגנתי / קישור',
  not_attack: 'לא התקפי',
}

export const TEAM_FILTER_DISPLAY = {
  [TEAM_FILTER.ANY]: { label: 'כל הקשר קבוצתי' },
  [TEAM_FILTER.ATTACK_POSITIVE]: { label: 'ביצוע התקפי חיובי' },
  [TEAM_FILTER.ATTACK_POSITIVE_OR_GOALS_GTE_10]: { label: 'ביצוע התקפי חיובי או 10+ שערים' },
  [TEAM_FILTER.ANY_POSITIVE]: { label: 'ביצוע חיובי באחד הצדדים' },
  [TEAM_FILTER.CLEAR_POSITIVE]: { label: 'ביצוע קבוצתי מובהק' },
  [TEAM_FILTER.DEFENSE_POSITIVE]: { label: 'ביצוע הגנתי חיובי' },
}

export const SCOUT_REVIEW_DISPLAY = {
  [SCOUT_REVIEW.POSITION]: { label: 'בדיקת עמדה' },
  [SCOUT_REVIEW.TEAM_CONTEXT]: { label: 'בדיקת הקשר ביצוע קבוצתי' },
  [SCOUT_REVIEW.VIDEO_POSITION]: { label: 'אימות עמדה ותפקיד בווידאו' },
  [SCOUT_REVIEW.PROFILE_RELEVANCE]: { label: 'בדיקת רלוונטיות הפרופיל' },
}

export const DEPENDENCY_DISPLAY = {
  low: 'תלות נמוכה',
  medium: 'תלות בינונית',
  high: 'תלות גבוהה',
}

export const SCOUT_RULE_OPERATOR_DISPLAY = {
  truthy: 'קיים',
  falsy: 'לא קיים',
  eq: '=',
  gte: '>=',
  lte: '<=',
  in: 'בתוך',
  gt: '>',
  lt: '<',
  between: 'בין',
}

export const SCOUT_RULE_METRIC_DISPLAY = {
  games: 'הופעות',
  goals: 'שערים',
  goalsPer90: 'שערים ל-90',
  goalsShareOfTeam: 'חלק משערי הקבוצה',
  minutes: 'דקות',
  minutesPct: 'אחוז דקות',
  minutesPerGame: 'דקות להופעה',
  starts: 'הרכב',
  startsPct: 'אחוז הרכב',
  subIn: 'כניסות כמחליף',
  subInPct: 'אחוז כניסות כמחליף',
  subOut: 'יציאות בחילוף',
  subOutPct: 'אחוז יציאות בחילוף',
  yellowCards: 'צהובים',
  yellowCardsPer90: 'צהובים ל-90',
  scoringGamesPct: 'אחוז משחקים עם שער',
  isYoungerAgeGroup: 'שנתון צעיר',
  topClubOpportunityEligible: 'הזדמנות במועדון מוביל',
}

export const POSITION_LABEL_BY_CODE = Object.values(POSITION_LAYERS || {})
  .flat()
  .reduce((map, position) => {
    if (position?.code) map[position.code] = position.label || position.code
    return map
  }, {})
