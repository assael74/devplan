// shared/games/insights/player/sections/teamContext/teamContext.texts.js

import {
  formatNumber,
  formatPercent,
} from '../../../team/common/index.js'

import { getTeamContextCoreIssue } from './teamContext.rules.js'

function formatSignedPercent(value) {
  const n = Number(value)

  if (!Number.isFinite(n)) return '—'

  const rounded = Math.round(n)
  const sign = rounded > 0 ? '+' : ''

  return `${sign}${rounded}%`
}

export function buildTeamContextStateText(metrics) {
  if (!metrics.hasAnyData) {
    return 'אין מספיק נתוני קבוצה כדי לבדוק השפעה עם/בלי השחקן.'
  }

  return `עם השחקן: ${formatPercent(
    metrics.withPlayer.pointsRate
  )} הצלחה ב־${formatNumber(metrics.withPlayer.games)} משחקים. בלעדיו: ${formatPercent(
    metrics.withoutPlayer.pointsRate
  )} ב־${formatNumber(metrics.withoutPlayer.games)} משחקים. הפער: ${formatSignedPercent(
    metrics.pointsRateGap
  )}.`
}

export function buildTeamContextRecommendationText(metrics, evaluationState) {
  const issue = getTeamContextCoreIssue(metrics, evaluationState)

  if (issue === 'missing_data') {
    return 'נדרש מדגם משחקים רחב יותר כדי לבחון השפעה קבוצתית.'
  }

  if (issue === 'missing_without_data') {
    return 'השחקן שיחק כמעט בכל המדגם, ולכן אין בסיס אמין להשוואה מול משחקים בלעדיו.'
  }

  if (issue === 'missing_with_data') {
    return 'אין מספיק משחקים שבהם השחקן שותף כדי לבחון השפעה קבוצתית.'
  }

  if (issue === 'sample_caution') {
    return 'הפער עם/בלי השחקן מוצג ככיוון בלבד, כי המדגם עדיין לא מספיק חזק למסקנה מקצועית.'
  }

  if (issue === 'positive_impact') {
    return 'הקבוצה צוברת נקודות בקצב גבוה יותר כשהשחקן משחק. מומלץ לבדוק האם זה נשמר גם לפי רמת יריבה.'
  }

  if (issue === 'negative_impact') {
    return 'קצב צבירת הנקודות נמוך יותר כשהשחקן משחק. מומלץ לבדוק הקשר: רמת יריבות, עמדה, דקות ותפקיד בפועל.'
  }

  if (issue === 'positive_sample_caution') {
    return 'קיים כיוון חיובי עם השחקן, אך המדגם עדיין נמוך ולכן אין להסיק מסקנה חזקה.'
  }

  if (issue === 'negative_sample_caution') {
    return 'קיים כיוון שלילי עם השחקן, אך המדגם עדיין נמוך ולכן צריך לבדוק הקשר לפני מסקנה מקצועית.'
  }

  return 'הפער עם/בלי השחקן מתון, ולכן אין כרגע אינדיקציה חזקה להשפעה חריגה.'
}

export function buildTeamContextReliabilityText(metrics) {
  if (metrics.hasEnoughData) return ''

  return `אמינות נמוכה: נדרשים לפחות 7 משחקים עם השחקן ו־5 משחקים בלעדיו. כרגע יש ${formatNumber(
    metrics.withPlayer.games
  )} איתו ו־${formatNumber(metrics.withoutPlayer.games)} בלעדיו.`
}
