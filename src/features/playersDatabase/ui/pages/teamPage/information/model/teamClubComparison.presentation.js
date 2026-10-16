// src/features/playersDatabase/ui/pages/teamPage/information/model/teamClubComparison.presentation.js

export const CLUB_METRIC_LABELS = {
  leagueLevel: 'רמת תחרות',
  successRate: 'אחוז הצלחה',
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
const percentMetrics = new Set(['successRate', 'professionalRate', 'underuseRate'])
const rounded = value => Number(value.toFixed(1))
export const formatComparisonSeason = seasonId => String(seasonId).split('_').map(year => year.slice(-2)).join('/')

export const clubMetricTone = metric => {
  if (metric?.availability !== 'available' || !metric.isAnomaly || !metric.delta) return 'neutral'
  const lowerIsBetter = metric.key === 'leagueLevel' || metric.key === 'underuseRate'
  return (lowerIsBetter ? metric.delta < 0 : metric.delta > 0) ? 'success' : 'danger'
}

export const formatClubMetric = (key, value) => {
  if (value === null || value === undefined) return '—'
  if (key === 'offense' || key === 'defense') {
    return PRIORITY_LABELS[value] || `בין ${PRIORITY_LABELS[Math.floor(value)]} ל${PRIORITY_LABELS[Math.ceil(value)]}`
  }
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
    insufficient_games: 'נדרשים לפחות 8 משחקי ליגה לשנתון',
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
    : metric.key === 'leagueLevel' ? ' רמות' : ' דרגות'
  const difference = percentMetrics.has(metric.key) ? Math.round(Math.abs(metric.delta)) : rounded(Math.abs(metric.delta))
  return `${difference}${unit} ${metric.delta > 0 ? 'מעל' : 'מתחת'} לחציון`
}

export const clubMetricFinding = metric => {
  if (metric.key === 'leagueLevel') {
    return `רמת תחרות ${metric.delta < 0 ? 'גבוהה' : 'נמוכה'} מהמקובל במועדון`
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
  const summary = !isPrimaryTeam ? 'ההשוואה מיועדת לקבוצה הראשית של השנתון'
    : !target ? 'נתוני השוואת השנתון לשאר המועדון טרם זמינים'
      : target.findings.length ? target.findings.map(clubMetricFinding).join(' · ')
        : target.availability === 'available' ? 'השנתון אינו חריג ביחס לנורמה ההיסטורית במועדון'
          : target.availability === 'unavailable' ? 'אין מספיק נתונים לקביעת חריגות ביחס למועדון'
            : 'לא זוהתה חריגה במדדים הזמינים; ההשוואה אינה מלאה'
  const unavailable = target ? Object.values(target.metrics).filter(metric => metric.availability !== 'available') : []
  const referenceRows = comparison?.referenceRows || []
  const historySeasons = [...new Set(referenceRows.map(row => row.seasonId))].sort().reverse()
  const historyText = historySeasons.length
    ? `בסיס הנורמה: ${referenceRows.length} רשומות שנתון־עונה · עונות ${historySeasons.map(formatComparisonSeason).join(', ')}`
    : 'אין נתוני עונות קודמות לבניית נורמה'
  const unavailableSeasonIds = comparison?.unavailableSeasonIds || []
  return {
    rows: comparison?.rows || [], referenceRows, historyText, target, isPrimaryTeam, status, summary,
    label: STATUS_LABELS[status],
    reliability: target
      ? `זמינות נתונים: ${target.availableCount}/6 מדדים להשוואה` +
        (unavailable.length ? ` · ${[...new Set(unavailable.map(clubMetricReason))].join(' · ')}` : ' · לפחות 3 שנתונים מהעבר בכל מדד') +
        (unavailableSeasonIds.length ? ` · טעינת עונות ${unavailableSeasonIds.map(formatComparisonSeason).join(', ')} נכשלה` : '')
      : 'זמינות נתונים: טרם התקבלה השוואה לשנתון',
    familyText: target?.families.map(family => FAMILY_LABELS[family]).join(' · ') || '',
  }
}

export const clubComparisonStatusLabel = row => STATUS_LABELS[row.status]
