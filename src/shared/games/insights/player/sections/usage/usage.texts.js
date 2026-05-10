// shared/games/insights/player/sections/usage/usage.texts.js

import {
  formatNumber,
  formatPercent,
} from '../../../team/common/index.js'

import { getUsageCoreIssue } from './usage.rules.js'

function formatRange(min, max) {
  if (min === null || min === undefined || max === null || max === undefined) {
    return '—'
  }

  return `${min}%–${max}%`
}

export function buildUsageStateText(metrics, evaluationState) {
  if (!metrics.hasAnyData) {
    return 'אין מספיק נתוני משחקים כדי לבחון את השימוש בשחקן.'
  }

  if (!metrics.hasRole) {
    return 'לא הוגדר לשחקן מעמד בסגל, ולכן לא ניתן להשוות את השימוש בפועל ליעד אישי.'
  }

  const minutesTarget = formatRange(
    metrics.minutesTargetMin,
    metrics.minutesTargetMax
  )

  const startsTarget = formatRange(
    metrics.startsTargetMin,
    metrics.startsTargetMax
  )

  return `השחקן שיחק ${formatNumber(metrics.minutesPlayed)} דקות, שהן ${formatPercent(
    metrics.minutesPct
  )} מהדקות האפשריות. יעד הדקות למעמד "${metrics.role.label}" הוא ${minutesTarget}. הרכב: ${formatPercent(
    metrics.startsPctFromTeamGames
  )} ממשחקי הקבוצה, מול יעד ${startsTarget}.`
}

export function buildUsageRecommendationText(metrics, evaluationState) {
  const issue = getUsageCoreIssue(metrics, evaluationState)

  if (issue === 'missing_data') {
    return 'נדרש לצבור נתוני משחקים לפני קביעת תובנת שימוש.'
  }

  if (issue === 'missing_role') {
    return 'מומלץ להגדיר לשחקן מעמד בסגל כדי לבחון האם השימוש בפועל תואם את התכנון המקצועי.'
  }

  if (issue === 'under_usage') {
    return `השימוש בפועל נמוך מהיעד למעמד "${metrics.role.label}". מומלץ לבדוק האם מדובר בפציעה, החלטה מקצועית או פער בין התכנון למעמד בפועל.`
  }

  if (issue === 'over_usage') {
    if (metrics.role?.id === 'rotation' || metrics.role?.id === 'fringe') {
      return `השחקן מקבל שימוש גבוה מהצפוי למעמד "${metrics.role.label}". זה עשוי להעיד על עלייה באמון או צורך מקצועי שנוצר במהלך העונה.`
    }

    return `השחקן מעל טווח השימוש שהוגדר למעמד שלו. מומלץ לבדוק האם העומס תואם את תכנון הסגל.`
  }

  if (issue === 'role_fit') {
    return `השימוש בשחקן תואם את מעמד "${metrics.role.label}" שהוגדר לו.`
  }

  return 'מומלץ להמשיך לעקוב אחרי השימוש בפועל ביחס למעמד שהוגדר.'
}

export function buildUsageReliabilityText(metrics) {
  if (!metrics.hasAnyData) return ''

  if (metrics.teamGamesTotal < 5) {
    return 'מדגם המשחקים עדיין נמוך, לכן מומלץ להתייחס לתובנת השימוש בזהירות.'
  }

  return ''
}
