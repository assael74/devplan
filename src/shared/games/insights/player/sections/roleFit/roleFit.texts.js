// shared/games/insights/player/sections/roleFit/roleFit.texts.js

import {
  formatPercent,
} from '../../../team/common/index.js'

import { getRoleFitCoreIssue } from './roleFit.rules.js'

function getDifficultyLabels(metrics) {
  const labels = []

  if (metrics.hasEasyMinutes) labels.push('יריבות קלות')
  if (metrics.hasEqualMinutes) labels.push('יריבות באותה רמה')
  if (metrics.hasHardMinutes) labels.push('יריבות חזקות')

  return labels.join(', ')
}

export function buildRoleFitStateText(metrics) {
  if (!metrics.hasAnyData) {
    return 'אין מספיק נתונים כדי לבחון התאמה בין מעמד השחקן לשימוש בפועל.'
  }

  if (!metrics.hasRole) {
    return 'לא הוגדר לשחקן מעמד בסגל.'
  }

  const difficultyText = getDifficultyLabels(metrics) || 'ללא פילוח רמת יריבה'

  return `מעמד השחקן הוא "${metrics.role.label}". בפועל הוא שיחק ${formatPercent(
    metrics.minutesPct
  )} מהדקות האפשריות ופתח ב־${formatPercent(
    metrics.startsPctFromTeamGames
  )} ממשחקי הקבוצה. דקות הופיעו מול: ${difficultyText}.`
}

export function buildRoleFitRecommendationText(metrics, evaluationState) {
  const issue = getRoleFitCoreIssue(metrics, evaluationState)

  if (issue === 'missing_data') {
    return 'נדרש לצבור נתוני משחקים לפני בדיקת התאמה למעמד.'
  }

  if (issue === 'missing_role') {
    return 'מומלץ להגדיר לשחקן מעמד בסגל כדי לבחון האם השימוש בפועל תואם את התכנון.'
  }

  if (issue === 'strong_under_role') {
    return `השחקן רחוק משמעותית מטווח הדקות המצופה למעמד "${metrics.role.label}". זהו פער שדורש בדיקה מקצועית.`
  }

  if (issue === 'under_role') {
    return `השחקן מתחת לטווח הדקות המצופה למעמד "${metrics.role.label}". מומלץ לבדוק האם ההגדרה עדיין משקפת את מקומו בסגל.`
  }

  if (issue === 'above_role') {
    if (metrics.role?.id === 'rotation' || metrics.role?.id === 'fringe') {
      return `השחקן מקבל שימוש גבוה מהמעמד שהוגדר לו. זה יכול להעיד על התקדמות, אמון גובר או צורך מקצועי.`
    }

    return `השחקן מעל טווח השימוש שהוגדר לו. מומלץ לבדוק האם מדובר בעומס מתוכנן או בשינוי מעמד בפועל.`
  }

  if (issue === 'difficulty_trust_gap') {
    return `השימוש בשחקן קיים, אך רמת היריבות שבה הוא מקבל דקות עדיין מוגבלת ביחס למעמד "${metrics.role.label}".`
  }

  if (issue === 'trusted_role') {
    return `השחקן מקבל דקות גם במשחקים תחרותיים, ולכן השימוש בו תומך במעמד "${metrics.role.label}".`
  }

  if (issue === 'role_fit') {
    return `השימוש בפועל תואם את המעמד שהוגדר לשחקן.`
  }

  return 'מומלץ להמשיך לעקוב אחרי השימוש ביחס למעמד ולרמת היריבות.'
}
