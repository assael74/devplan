// shared/games/insights/player/sections/recent/recent.texts.js

import {
  formatNumber,
} from '../../../team/common/index.js'

import { getRecentCoreIssue } from './recent.rules.js'

export function buildRecentStateText(metrics) {
  if (!metrics.hasAnyData) {
    return 'אין מספיק משחקים אחרונים כדי לזהות מגמה.'
  }

  return `ב־${formatNumber(metrics.sampleSize)} המשחקים האחרונים: ${formatNumber(
    metrics.minutes
  )} דקות, ${formatNumber(metrics.goals)} שערים, ${formatNumber(
    metrics.assists
  )} בישולים, קצב מעורבות ${formatNumber(
    metrics.contributionsPerGame,
    2
  )} למשחק.`
}

export function buildRecentRecommendationText(metrics, evaluationState) {
  const issue = getRecentCoreIssue(metrics, evaluationState)

  if (issue === 'missing_data') {
    return 'נדרש לצבור משחקים אחרונים לפני זיהוי מגמה.'
  }

  if (issue === 'sample_caution') {
    return 'מדגם המשחקים האחרונים עדיין נמוך, ולכן זו אינדיקציה ראשונית בלבד.'
  }

  if (issue === 'positive_form') {
    return 'השחקן נמצא במומנטום תפוקה חיובי במשחקים האחרונים. מומלץ לבדוק האם העלייה מגיעה גם מול יריבות תחרותיות.'
  }

  if (issue === 'quiet_form') {
    return 'במשחקים האחרונים אין מעורבות שערים. מומלץ לבדוק האם מדובר בירידה בתפוקה, שינוי תפקיד או ירידה בדקות.'
  }

  return 'המגמה האחרונה יציבה ללא חריגה חדה בתפוקה.'
}
