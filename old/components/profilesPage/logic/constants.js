// features/playersDatabase/components/profilesPage/logic/constants.js

import { PLAYERS_DATABASE_SEASONS_CATALOG } from '../../../catalog/seasons.catalog.js'
import { SCOUT_PROFILES } from '../../../../../shared/players/scouting/index.js'
import {
  SCOUT_LEVEL_LABELS,
  SCOUT_METRIC_LABELS,
  SCOUT_OPERATOR_LABELS,
  SCOUT_TEAM_FILTER_LABELS,
} from '../../../sharedLogic/pdbScoutProfiles.logic.js'

export const PROFILE_SCOPE_OPTIONS = [
  { value: 'all', label: 'כל הפרופילים' },
  { value: 'database', label: 'דאטה בייס' },
  { value: 'year', label: 'שנתון' },
  { value: 'league', label: 'ליגה' },
]

export const PROFILE_STATUS_OPTIONS = [
  { value: 'all', label: 'כל הסטטוסים' },
  { value: 'risk', label: 'בסיכון' },
  { value: 'profiles', label: 'עם פרופילים' },
  { value: 'missingSnapshot', label: 'חסר צילום' },
  { value: 'ok', label: 'ללא דגל' },
]

export const PROFILE_FILTER_OPTIONS = [
  { value: 'all', label: 'כל הפרופילים' },
  ...SCOUT_PROFILES.map(profile => ({
    value: profile.id,
    label: profile.label,
  })),
]

export const SEARCH_MODE_OPTIONS = [
  { value: 'year', label: 'לפי שנתון' },
  { value: 'league', label: 'לפי ליגה' },
  { value: 'all', label: 'כל חיפוש' },
]

export const DEFAULT_PROFILE_SEASON_ID =
  PLAYERS_DATABASE_SEASONS_CATALOG.at(-1)?.id || ''

export const PROFILE_SCOPE_LABELS = {
  database: 'דאטה בייס',
  year: 'שנתון',
  league: 'ליגה',
}

export const PROFILE_STATUS_LABELS = {
  risk: 'בסיכון',
  profiles: 'עם פרופילים',
  missingSnapshot: 'חסר צילום',
  ok: 'ללא דגל',
}

export const PROFILE_STATUS_COLORS = {
  risk: 'warning',
  profiles: 'neutral',
  missingSnapshot: 'danger',
  ok: 'success',
}

export {
  SCOUT_LEVEL_LABELS,
  SCOUT_METRIC_LABELS,
  SCOUT_OPERATOR_LABELS,
  SCOUT_TEAM_FILTER_LABELS,
}
