// shared/games/insights/player/sections/positionFit/positionFit.texts.js

import {
  formatNumber,
} from '../../../team/common/index.js'

import { getPositionFitCoreIssue } from './positionFit.rules.js'

export function buildPositionFitStateText(metrics) {
  if (!metrics.hasAnyData) {
    return 'אין מספיק נתונים כדי לבחון התאמה לעמדה.'
  }

  if (!metrics.hasPosition) {
    return 'לא הוגדרה לשחקן עמדה, ולכן לא ניתן לפרש את התפוקה לפי תפקיד.'
  }

  if (metrics.isDefensiveRole) {
    return `עמדה: ${metrics.position.layerLabel}. ספיגה בזמן ששיחק: ${formatNumber(
      metrics.goalsAgainstPerGame,
      2
    )} למשחק, מול יעד קבוצתי של ${formatNumber(
      metrics.goalsAgainstPerGameTarget,
      2
    )}. תרומה התקפית: ${formatNumber(metrics.goalContributions)} מעורבויות שערים.`
  }

  return `עמדה: ${metrics.position.layerLabel}. קצב מעורבות שערים: ${formatNumber(
    metrics.contributionsPerGame,
    2
  )} למשחק. שערים: ${formatNumber(metrics.goals)}, בישולים: ${formatNumber(
    metrics.assists
  )}.`
}

export function buildPositionFitRecommendationText(metrics, evaluationState) {
  const issue = getPositionFitCoreIssue(metrics, evaluationState)

  if (issue === 'missing_data') {
    return 'נדרש לצבור נתוני משחקים לפני בדיקת התאמה לעמדה.'
  }

  if (issue === 'missing_position') {
    return 'מומלץ להגדיר עמדה לשחקן כדי לבדוק האם המדדים שלו תואמים את תפקידו.'
  }

  if (issue === 'attack_output_gap') {
    return `לשחקן בעמדה התקפית יש תפוקה נמוכה ביחס לנקודת הייחוס. מומלץ לבדוק איכות מצבים, דקות בפועל ורמת יריבות.`
  }

  if (issue === 'attack_fit') {
    return 'התפוקה ההתקפית תואמת את הציפייה מהעמדה.'
  }

  if (issue === 'defensive_gap') {
    return 'קצב הספיגה בזמן שהשחקן משחק גבוה מיעד הקבוצה. מומלץ לבדוק האם מדובר בהקשר קבוצתי או בפער אישי.'
  }

  if (issue === 'defensive_fit') {
    return 'קצב הספיגה בזמן שהשחקן משחק עומד ביעד הקבוצה או טוב ממנו.'
  }

  if (issue === 'defensive_attack_bonus') {
    return 'לשחקן הגנה קיימת גם תרומה התקפית. זהו בונוס חיובי מעבר למדדי התפקיד המרכזיים.'
  }

  if (issue === 'middle_attack_bonus') {
    return 'השחקן מוסיף תרומה התקפית מעמדת קישור, ולכן יש לו ערך נוסף מעבר לשימוש וליציבות.'
  }

  if (issue === 'middle_balance_watch') {
    return 'לשחקן קישור מומלץ לבחון שילוב של דקות, יציבות, השפעת קבוצה ותרומה התקפית משנית.'
  }

  return 'מומלץ להמשיך לבחון את המדדים ביחס לעמדה ולתפקיד בפועל.'
}
