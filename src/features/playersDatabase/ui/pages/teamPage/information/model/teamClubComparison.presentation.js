// src/features/playersDatabase/ui/pages/teamPage/information/model/teamClubComparison.presentation.js

import { CLUB_COMPARISON_METRICS } from '../../../../../../../shared/scouting/teams/clubComparison/index.js'

export const CLUB_METRIC_LABELS = {
  leagueLevel: 'רמת תחרות',
  rankPercentile: 'מיקום יחסי בטבלה',
  successRate: 'אחוז הצלחה',
  goalsForPerGame: 'שערים למשחק',
  goalsAgainstPerGame: 'ספיגות למשחק',
  offense: 'עדיפות התקפית',
  defense: 'עדיפות הגנתית',
  professionalRate: 'פרופילים מקצועיים',
  underuseRate: 'פרופילי חוסר שימוש',
}

const PRIORITY_LABELS = ['נמוכה', 'רגילה', 'חיובית', 'גבוהה', 'עילית']
const FAMILY_LABELS = { competition: 'תחרות', performance: 'ביצועים', squad: 'סגל' }
const STATUS_LABELS = {
  multiple: 'חריג בכמה תחומים · לחקירה',
  single: 'חריג בתחום אחד · למעקב',
  none: 'ללא חריגה',
  limited: 'השוואה חלקית',
}
const percentMetrics = new Set(['rankPercentile', 'successRate', 'professionalRate', 'underuseRate'])
const goalRateMetrics = new Set(['goalsForPerGame', 'goalsAgainstPerGame'])
const rounded = value => Number(value.toFixed(1))
export const formatComparisonSeason = seasonId => String(seasonId).split('_').map(year => year.slice(-2)).join('/')

export const clubMetricTone = metric => {
  if (metric?.availability !== 'available' || !metric.isAnomaly || !metric.delta) return 'neutral'
  const lowerIsBetter = ['leagueLevel', 'rankPercentile', 'goalsAgainstPerGame', 'underuseRate'].includes(metric.key)
  return (lowerIsBetter ? metric.delta < 0 : metric.delta > 0) ? 'success' : 'danger'
}

export const formatClubMetric = (key, value) => {
  if (value === null || value === undefined) return '—'
  if (key === 'offense' || key === 'defense') {
    return PRIORITY_LABELS[value] || `בין ${PRIORITY_LABELS[Math.floor(value)]} ל${PRIORITY_LABELS[Math.ceil(value)]}`
  }
  if (goalRateMetrics.has(key)) return rounded(value).toFixed(1)
  return percentMetrics.has(key) ? `${Math.round(value)}%` : `${rounded(value)}`
}

export const clubMetricReason = metric => {
  if (metric.reason === 'insufficient_peers') {
    const sample = metric.cohortCount === 1 ? 'רק שנתון כשיר אחד' : `רק ${metric.cohortCount} שנתונים כשירים`
    return `${sample} בעונות קודמות${metric.key === 'successRate' ? ' באותה רמת ליגה' : ''}; נדרשים 3`
  }
  return {
    ambiguous_cohort: 'קיימת יותר מקבוצה ראשית אחת לשנתון',
    not_primary: 'ההשוואה מיועדת לקבוצה הראשית',
    insufficient_games: `נדרשים לפחות ${metric.family === 'squad' ? 8 : 3} משחקי ליגה לשנתון`,
    missing_games: 'מספר משחקי הליגה חסר',
    season_not_started: 'העונה טרם החלה',
    missing_league_level: 'רמת הליגה חסרה',
    profiles_unavailable: 'נתוני הסגל או הפרופילים אינם מלאים',
    missing_value: 'נתון המדד חסר בעונה הנבחרת',
  }[metric.reason] || 'נתוני ההשוואה אינם זמינים'
}

export const clubMetricDifference = metric => {
  if (metric.delta === null) return '—'
  if (metric.delta === 0) return 'ללא פער'
  const unit = percentMetrics.has(metric.key) ? ' נק׳ אחוז'
    : metric.key === 'leagueLevel' ? ' רמות'
      : goalRateMetrics.has(metric.key) ? ' שערים למשחק' : ' דרגות'
  const difference = goalRateMetrics.has(metric.key) ? rounded(Math.abs(metric.delta)).toFixed(1)
    : percentMetrics.has(metric.key) ? Math.round(Math.abs(metric.delta)) : rounded(Math.abs(metric.delta))
  return `${difference}${unit} ${metric.delta > 0 ? 'מעל' : 'מתחת'} לחציון`
}

export const clubMetricFinding = metric => {
  if (metric.key === 'leagueLevel') {
    return `רמת תחרות ${metric.delta < 0 ? 'גבוהה' : 'נמוכה'} מהמקובל במועדון`
  }
  if (metric.key === 'rankPercentile') {
    return `מיקום בטבלה ${metric.delta < 0 ? 'גבוה' : 'נמוך'} מהמקובל במועדון`
  }
  return `${CLUB_METRIC_LABELS[metric.key]} ${metric.delta > 0 ? 'מעל' : 'מתחת'} לנורמה ההיסטורית במועדון`
}

export const buildClubComparisonInsight = (view, intelligence) => {
  const selectedSeasonId = view?.selectedSeasonOption?.seasonId
  const source = intelligence?.cohortComparison
  const comparison = (!selectedSeasonId || selectedSeasonId === source?.seasonId) &&
    (!view?.team?.clubId || view.team.clubId === source?.clubId) ? source : null
  const teamId = view?.team?.birthTeamId || view?.team?.id || view?.team?.teamId
  const target = comparison?.rows.find(row => row.teamId === teamId) || null
  const isPrimaryTeam = Number(view?.team?.birthTeamSlot) === 1
  const status = target?.status || 'limited'
  const familyText = target?.families.map(family => FAMILY_LABELS[family]).join(' · ') || ''
  const summary = !isPrimaryTeam ? 'ההשוואה מיועדת לקבוצה הראשית של השנתון'
    : !target ? 'נתוני השוואת השנתון לשאר המועדון טרם זמינים'
      : target.families.length === 1 ? `חריגה במשפחת ${familyText}`
        : target.families.length ? `חריגות במשפחות ${familyText}`
        : target.availability === 'available' ? 'השנתון אינו חריג ביחס לנורמה ההיסטורית במועדון'
          : target.availability === 'unavailable' ? 'אין מספיק נתונים לקביעת חריגות ביחס למועדון'
            : 'לא זוהתה חריגה במדדים הזמינים; ההשוואה אינה מלאה'
  const headline = !isPrimaryTeam ? 'ההשוואה מיועדת לקבוצה הראשית'
    : !target ? 'נתוני ההשוואה טרם זמינים'
      : target.families.length === 1 ? 'משפחת איתותים חריגה אחת ביחס למועדון'
        : target.families.length ? `${target.families.length} משפחות איתותים חריגות ביחס למועדון`
          : target.availability === 'available' ? 'לא נמצאה חריגה ביחס למועדון'
            : 'אין מספיק נתונים לקביעה מלאה'
  const unavailable = target ? Object.values(target.metrics).filter(metric => metric.availability !== 'available') : []
  const earlyCount = target ? Object.values(target.metrics).filter(metric => metric.isAnomaly && metric.isEarlySample).length : 0
  const referenceRows = comparison?.referenceRows || []
  const historySeasons = [...new Set(referenceRows.map(row => row.seasonId))].sort().reverse()
  const historyText = historySeasons.length
    ? `בסיס הנורמה: ${referenceRows.length} רשומות שנתון־עונה · עונות ${historySeasons.map(formatComparisonSeason).join(', ')}`
    : 'אין נתוני עונות קודמות לבניית נורמה'
  const unavailableSeasonIds = comparison?.unavailableSeasonIds || []
  return {
    rows: comparison?.rows || [], referenceRows, historyText, target, isPrimaryTeam, status, summary, headline,
    label: target ? clubComparisonStatusLabel(target) : STATUS_LABELS[status],
    reliability: target
      ? `זמינות נתונים: ${target.availableCount}/${CLUB_COMPARISON_METRICS.length} מדדים להשוואה` +
        (earlyCount ? ` · ${earlyCount} תתי־איתותים מוקדמים (פחות מ־8 משחקים)` : '') +
        (unavailable.length ? ` · ${[...new Set(unavailable.map(clubMetricReason))].join(' · ')}` : ' · לפחות 3 שנתונים מהעבר בכל מדד') +
        (unavailableSeasonIds.length ? ` · טעינת עונות ${unavailableSeasonIds.map(formatComparisonSeason).join(', ')} נכשלה` : '')
      : 'זמינות נתונים: טרם התקבלה השוואה לשנתון',
    familyText,
  }
}

export const clubComparisonStatusLabel = row => row.families?.includes('competition') && row.signalLevel === 2 && row.families.length === 1
  ? 'חריג ברמת התחרות · לחקירה' : STATUS_LABELS[row.status]
