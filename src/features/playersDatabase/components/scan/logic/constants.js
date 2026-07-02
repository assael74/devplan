// src/features/playersDatabase/components/scan/logic/constants.js

import { PLAYERS_DATABASE_SEASONS_CATALOG } from '../../../catalog/seasons.catalog.js'
import { SCOUT_PROFILES } from '../../../../../shared/players/scouting/index.js'

export const SCAN_SCOPE_OPTIONS = [
  { value: 'all', label: 'כל הפרופילים' },
  { value: 'database', label: 'דאטה בייס' },
  { value: 'year', label: 'שנתון' },
  { value: 'league', label: 'ליגה' },
]

export const SCAN_STATUS_OPTIONS = [
  { value: 'all', label: 'כל הסטטוסים' },
  { value: 'risk', label: 'בסיכון' },
  { value: 'profiles', label: 'עם פרופילים' },
  { value: 'missingSnapshot', label: 'חסר צילום' },
  { value: 'ok', label: 'ללא דגל' },
]

export const SCAN_PROFILE_OPTIONS = [
  { value: 'all', label: 'כל הפרופילים' },
  ...SCOUT_PROFILES.map(profile => ({ value: profile.id, label: profile.label })),
]

export const SEARCH_MODE_OPTIONS = [
  { value: 'year', label: 'לפי שנתון' },
  { value: 'league', label: 'לפי ליגה' },
  { value: 'all', label: 'כל חיפוש' },
]

export const DEFAULT_SCAN_SEASON_ID = PLAYERS_DATABASE_SEASONS_CATALOG.at(-1)?.id || ''

export const SCAN_SCOPE_LABELS = {
  database: 'דאטה בייס',
  year: 'שנתון',
  league: 'ליגה',
}

export const SCAN_STATUS_LABELS = {
  risk: 'בסיכון',
  profiles: 'עם פרופילים',
  missingSnapshot: 'חסר צילום',
  ok: 'ללא דגל',
}

export const SCAN_STATUS_COLORS = {
  risk: 'warning',
  profiles: 'neutral',
  missingSnapshot: 'danger',
  ok: 'success',
}

export const SCOUT_PROFILE_ICON_FALLBACKS = {
  game_changer: 'gameChanger',
  gameChanger: 'gameChanger',
  promoted_talent: 'promotedTalent',
  promotedTalent: 'promotedTalent',
  lineup_banker: 'lineupBanker',
  lineupBanker: 'lineupBanker',
  last_station: 'lastStation',
  lastStation: 'lastStation',
  back_threat: 'backThreat',
  backThreat: 'backThreat',
  pro_anchor: 'proAnchor',
  proAnchor: 'proAnchor',
  single_engine: 'singleEngine',
  singleEngine: 'singleEngine',
  clear_scorer: 'clearScorer',
  clearScorer: 'clearScorer',
  killer_efficiency: 'killerEfficiency',
  killerEfficiency: 'killerEfficiency',
  targetWorker: 'targetWorker',
  secondary_threat: 'secondaryThreat',
  secondaryThreat: 'secondaryThreat',
}

export const SCOUT_METRIC_LABELS = {
  isYoungerAgeGroup: 'שחקן משנתון צעיר',
  startsPct: 'אחוז פתיחות',
  subOut: 'הוחלף החוצה',
  minutesPct: 'אחוז דקות',
  yellowCards: 'כרטיסים צהובים',
  goals: 'שערים',
  goalsShareOfTeam: 'חלק מהשערים של הקבוצה',
  goalsPer90: 'שערים ל-90',
}

export const SCOUT_OPERATOR_LABELS = {
  truthy: 'קיים',
  eq: 'שווה ל',
  gte: 'לפחות',
  lte: 'עד',
  gt: 'מעל',
  lt: 'מתחת',
  between: 'בין',
}

export const SCOUT_LEVEL_LABELS = {
  below_level: 'מחפש שנתון נמוך יותר',
  same_level: 'מחפש באותו שנתון',
  above_level: 'מחפש שנתון גבוה יותר',
}

export const SCOUT_TEAM_FILTER_LABELS = {
  any_team: 'כל קבוצה',
  attack_positive: 'קבוצות התקפה',
  attack_positive_or_goals_gte_10: 'קבוצות התקפה או קבוצה עם 10+ שערים',
  any_positive: 'כל קבוצה עם סימן חיובי',
  clear_positive: 'קבוצות עם יתרון ברור',
  defense_positive: 'קבוצות הגנה',
}
