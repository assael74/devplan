// src/features/playersDatabase/components/leagues/scoutUi.js

import {
  DRILLDOWN_STATUS,
  SCOUT_INTEREST,
  SCOUT_LEVEL,
  TEAM_FILTER,
} from '../../../../shared/players/scouting/index.js'

const STATUS_UI = {
  [DRILLDOWN_STATUS.STRONG]: {
    label: 'דריל דאון חזק',
    color: 'success',
  },
  [DRILLDOWN_STATUS.OPEN]: {
    label: 'פתוח לחיפוש כללי',
    color: 'primary',
  },
  [DRILLDOWN_STATUS.HIDDEN]: {
    label: 'לא מסומן',
    color: 'neutral',
  },
}

const INTEREST_LABELS = {
  [SCOUT_INTEREST.SUPER]: 'סופר מעניין',
  [SCOUT_INTEREST.INTERESTING]: 'מעניין',
  [SCOUT_INTEREST.REASONABLE]: 'סביר',
}

const LEVEL_LABELS = {
  [SCOUT_LEVEL.SAME]: 'רמה שלי',
  [SCOUT_LEVEL.BELOW]: 'רמה מתחת',
  [SCOUT_LEVEL.ABOVE]: 'רמה מעל',
}

const FILTER_LABELS = {
  [TEAM_FILTER.ANY]: 'בכל קבוצה',
  [TEAM_FILTER.ANY_POSITIVE]: 'התקפה או הגנה מעל הסף',
  [TEAM_FILTER.CLEAR_POSITIVE]: 'ביצוע חיובי מובהק',
  [TEAM_FILTER.DEFENSE_POSITIVE]: 'הגנה מעל הסף',
}

const INTEREST_ORDER = {
  [SCOUT_INTEREST.SUPER]: 0,
  [SCOUT_INTEREST.INTERESTING]: 1,
  [SCOUT_INTEREST.REASONABLE]: 2,
}

const pct = (value) => {
  if (value === null || value === undefined || value === '') return 'לא פעיל'

  const n = Number(value)
  if (!Number.isFinite(n)) return '-'

  return `${Math.round(n * 100)}%`
}

const num = (value) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return '-'

  return Number(n.toFixed(2))
}

export const getDrilldownUi = (status) => {
  return STATUS_UI[status] || STATUS_UI[DRILLDOWN_STATUS.HIDDEN]
}

export const getScoutMetricItems = (drilldown = {}) => {
  const metrics = drilldown.metrics || {}

  return [
    {
      id: 'attackEdge',
      label: 'ביצוע התקפי',
      value: pct(metrics.attackEdge),
      compareValue: `${num(metrics.goalsForPerGame)} שערים למשחק`,
    },
    {
      id: 'defenseEdge',
      label: 'ביצוע הגנתי',
      value: pct(metrics.defenseEdge),
      compareValue: `${num(metrics.goalsAgainstPerGame)} ספיגות למשחק`,
    },
    {
      id: 'threshold',
      label: 'סף חיפוש',
      value: `התקפה ${pct(drilldown.settings?.attackPerformanceThreshold)}`,
      compareValue: drilldown.settings?.includeUniversal ? 'כולל חיפוש כללי' : 'ללא חיפוש כללי',
    },
    {
      id: 'defenseThreshold',
      label: 'סף הגנה',
      value: pct(drilldown.settings?.defensePerformanceThreshold),
      compareValue: '',
    },
  ]
}

export const getScoutProfileItems = (drilldown = {}) => {
  return (drilldown.profiles || [])
    .slice()
    .sort((a, b) => {
      const aRank = INTEREST_ORDER[a.interest] ?? 99
      const bRank = INTEREST_ORDER[b.interest] ?? 99

      return aRank - bRank
    })
    .map((profile) => ({
      id: profile.id,
      label: profile.label,
      description: FILTER_LABELS[profile.teamFilter] || profile.teamFilter,
      interestLabel: INTEREST_LABELS[profile.interest] || profile.interest,
      filterLabel: FILTER_LABELS[profile.teamFilter] || profile.teamFilter,
      levelLabels: (profile.searchLevels || []).map((level) => LEVEL_LABELS[level] || level),
      params: [
        ...((profile.searchLevels || []).map((level) => LEVEL_LABELS[level] || level)),
        ...((profile.rules || []).map((rule) => rule.reason || rule.metric)),
      ],
    }))
}
