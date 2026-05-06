// shared/games/insights/player/sections/scoring/scoring.texts.js

import {
  formatNumber,
  formatPercent,
} from '../../../team/common/index.js'

import { getScoringCoreIssue } from './scoring.rules.js'

function isDefenseOnlyPosition(metrics = {}) {
  return (
    metrics.position?.layerKey === 'defense' ||
    metrics.position?.layerKey === 'goalkeeper'
  )
}

export function buildScoringStateText(metrics) {
  if (!metrics.hasAnyData) {
    return 'אין מספיק נתונים כדי לבחון תפוקה התקפית.'
  }

  return `תפוקה התקפית: ${formatNumber(metrics.goals)} שערים, ${formatNumber(
    metrics.assists
  )} בישולים, ${formatNumber(
    metrics.goalContributions
  )} מעורבויות שערים. קצב מעורבות: ${formatNumber(
    metrics.contributionsPerGame,
    2
  )} למשחק. חלק משערי הקבוצה: ${formatPercent(metrics.teamGoalsSharePct)}.`
}

export function buildScoringRecommendationText(metrics, evaluationState) {
  const issue = getScoringCoreIssue(metrics, evaluationState)

  if (issue === 'missing_data') {
    return 'נדרש לצבור נתוני משחקים לפני בדיקת תפוקה התקפית.'
  }

  if (issue === 'missing_position') {
    return 'מומלץ להגדיר עמדה לשחקן כדי לפרש נכון את התפוקה שלו.'
  }

  if (isDefenseOnlyPosition(metrics)) {
    if (metrics.hasScoringData) {
      return 'לשחקן הגנה קיימת תרומה התקפית. זהו בונוס, אך ההתאמה המרכזית לעמדה תיבחן דרך מדדי ספיגה ושימוש.'
    }

    return 'לשחקן הגנה אין תפוקה התקפית משמעותית. זה לא בהכרח פער, משום שהמדד המרכזי לעמדה הוא יציבות וספיגה.'
  }

  if (issue === 'manual_target_gap') {
    return `השחקן מתחת ליעד האישי של שערים ובישולים. מומלץ לבדוק האם היעד עדיין ריאלי ביחס לדקות ולתפקיד בפועל.`
  }

  if (issue === 'manual_target_fit') {
    return 'השחקן עומד ביעד התפוקה האישי שהוגדר לו.'
  }

  if (issue === 'low_contribution') {
    return `קצב מעורבות השערים נמוך ביחס לציפייה לעמדה "${metrics.position.layerLabel}".`
  }

  if (issue === 'high_contribution') {
    return `השחקן מייצר קצב מעורבות שערים גבוה ביחס לעמדה "${metrics.position.layerLabel}".`
  }

  if (issue === 'low_team_share') {
    return 'המשקל של השחקן בשערי הקבוצה נמוך יחסית לנקודת הייחוס של העמדה.'
  }

  if (issue === 'high_team_share') {
    return 'השחקן מחזיק משקל משמעותי בשערי הקבוצה, ולכן הוא חלק מרכזי מהתרומה ההתקפית.'
  }

  if (issue === 'active_scoring') {
    return 'קיימת תרומה התקפית, אך עדיין מומלץ לבחון אותה ביחס לדקות, לעמדה וליעד האישי.'
  }

  return 'מומלץ להמשיך לעקוב אחרי תפוקה התקפית ביחס לדקות ולעמדה.'
}
