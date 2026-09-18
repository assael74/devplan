import { AUDIT_FINDING_TYPE } from '../../../../services/audit/index.js'
import { getFullDateTimeIl } from '../../../../../../shared/format/dateUtils.js'

export const clean = value => String(value === undefined || value === null ? '' : value).trim()

export const TYPE_LABELS = Object.freeze({
  [AUDIT_FINDING_TYPE.MISSING_DOCUMENT]: 'מסמכים חסרים',
  [AUDIT_FINDING_TYPE.SOURCE_MISMATCH]: 'נתונים לא תואמים',
  [AUDIT_FINDING_TYPE.BROKEN_RELATION]: 'קשרים שבורים',
  [AUDIT_FINDING_TYPE.UNEXPECTED_DOCUMENT]: 'מסמכים מיותרים',
  [AUDIT_FINDING_TYPE.PARTIAL_WRITE]: 'כתיבות חלקיות',
})

const LIFECYCLE_LABELS = Object.freeze({
  league_only: 'קבוצה מטבלת הליגה בלבד',
  root_without_seasons: 'קבוצה ללא עונות',
  roster_loaded: 'סגל נטען',
  stats_loaded: 'סטטיסטיקות נטענו',
  roster_only: 'שחקן בסגל ללא פרופיל סקאוט',
  out_of_roster_scope: 'שחקן מחוץ לסגל הנוכחי',
  profiled: 'שחקן עם פרופיל סקאוט',
  tracked_outside_current_roster: 'שחקן במעקב מחוץ לסגל הנוכחי',
  unknown: 'מצב לא ידוע',
})
const FIELD_LABELS = Object.freeze({
  tableRank: 'מיקום בטבלה',
  tableAttackRank: 'דירוג התקפה',
  tableDefenseRank: 'דירוג הגנה',
  teamGamePlayed: 'משחקים',
  goalsFor: 'שערי זכות',
  goalsAgainst: 'שערי חובה',
  goalsForPerGame: 'שערי זכות למשחק',
  goalsAgainstPerGame: 'שערי חובה למשחק',
  leaguesCount: 'ליגות',
  seasonsCount: 'עונות',
  teamsCount: 'קבוצות',
  playersCount: 'שחקנים',
  playersWithScoutProfileCount: 'שחקנים עם פרופיל',
  scoutProfilesCount: 'פרופילים',
  seasonKey: 'עונה',
})

export const lifecycleLabel = status => LIFECYCLE_LABELS[clean(status)] || clean(status)

export const sourceLabel = source => {
  if (source === 'League table → buildLeagueTeamPerformanceProjection') return 'טבלת הליגה'
  if (source === 'Team Season teamBalance → buildTeamBalanceSearchIndexProjection') return 'מאזן הקבוצה בעונה'
  if (source === 'Team Season player scout state → buildPlayerScoutIndexFields') return 'נתוני הסקאוט של השחקן'
  if (source === 'Team Season player scout profile → Player Document') return 'פרופיל הסקאוט בעונת הקבוצה'
  if (source === 'Team Season player scout profile → Player SearchIndex') return 'פרופיל הסקאוט בעונת הקבוצה'
  if (source === 'Player and Team Season data → Team Season player scout profile') return 'נתוני השחקן והקבוצה בעונה'
  if (source === 'Team Season scout profile lifecycle') return 'כללי יצירת מסמך שחקן'
  if (source === 'League Documents → buildLeaguesMasterLeagueEntry') return 'מסמכי הליגה'
  if (source === 'League Documents → buildLeaguesMasterSummary') return 'מסמכי הליגה'
  if (source === 'League season lifecycle') return 'מחזור החיים של עונת הליגה'
  if (source === 'Write flow recovery journal') return 'יומן התאוששות כתיבה'
  return clean(source)
}

export const formatValue = value => {
  if (value === undefined) return 'לא קיים'
  if (value === null) return 'ריק'
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return value.map(formatValue).join(', ')
  if (typeof value === 'object') {
    return Object.entries(value)
      .map(([key, item]) => `${FIELD_LABELS[key] || key}: ${formatValue(item)}`)
      .join(' · ')
  }
  return String(value)
}

export const formatAuditDate = value => (value ? getFullDateTimeIl(value) : 'לא ידוע')

export const playerDetailsOf = finding => {
  if (finding?.entityType !== 'player' || !finding?.actual || typeof finding.actual !== 'object') {
    return null
  }

  return {
    name: clean(finding.actual.playerName),
    contexts: Array.isArray(finding.actual.contexts) ? finding.actual.contexts : [],
  }
}

export const isTeamSearchIndexLifecycleMismatch = finding => (
  finding?.type === AUDIT_FINDING_TYPE.SOURCE_MISMATCH &&
  finding?.entityType === 'teamSearchIndex' &&
  finding?.source === 'League season → buildTeamSeasonSearchMetrics' &&
  clean(finding?.documentId) &&
  clean(finding?.teamDocumentId) &&
  clean(finding?.seasonKey)
)
export const isLeagueDocumentFinding = finding => (
  finding?.type === AUDIT_FINDING_TYPE.SOURCE_MISMATCH && finding?.entityType === 'leaguesMasterLeague' && clean(finding?.relatedDocumentId)
)
export const isLeagueLifecycleDocumentFinding = finding => (
  finding?.type === AUDIT_FINDING_TYPE.SOURCE_MISMATCH && finding?.entityType === 'leagueSeason' &&
  finding?.source === 'League season lifecycle' && clean(finding?.actual?.leagueId)
)
export const isLeagueClubProjectionFinding = finding => (
  finding?.type === AUDIT_FINDING_TYPE.MISSING_DOCUMENT &&
  (finding?.entityType === 'clubDocument' || finding?.entityType === 'clubAgeGroupSeason') &&
  finding?.source === 'League table → Club Document' && clean(finding?.relatedDocumentId) && clean(finding?.seasonKey)
)
export const conflictingLeagueIdsOf = finding => (
  finding?.type === AUDIT_FINDING_TYPE.BROKEN_RELATION && finding?.source === 'League table identity'
    ? [...new Set((Array.isArray(finding?.actual?.leagueIds) ? finding.actual.leagueIds : []).map(clean).filter(Boolean))]
    : []
)
export const isLeaguesMasterSummaryFinding = finding => (
  finding?.type === AUDIT_FINDING_TYPE.SOURCE_MISMATCH && finding?.entityType === 'leaguesMaster'
)
