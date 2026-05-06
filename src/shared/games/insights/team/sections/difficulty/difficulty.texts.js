// shared/games/insights/team/sections/difficulty/difficulty.texts.js

import {
  formatNumber,
  formatPercent,
} from '../../common/index.js'

import { getDifficultyCoreIssue } from './difficulty.rules.js'

function formatSignedPercent(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '—'
  }

  const n = Math.round(Number(value))
  const sign = n > 0 ? '+' : ''

  return `${sign}${n}%`
}

function buildBucketStatePart(bucket) {
  return `${bucket.label}: ${formatPercent(bucket.pointsRate)} מול יעד ${formatPercent(
    bucket.targetRate
  )} (${formatSignedPercent(bucket.deviation)})`
}

export function buildDifficultyStateText(metrics, evaluationState) {
  if (!metrics.hasAnyData) {
    return 'אין מספיק נתוני משחקים כדי לבנות תמונת רמת יריבה.'
  }

  if (!evaluationState.hasFullProfile) {
    const only = evaluationState.available[0]

    if (!only) {
      return 'קיימים נתונים חלקיים בלבד לפי רמת יריבה.'
    }

    return `קיימים נתונים בעיקר מול יריבות ב${only.label}: ${formatPercent(
      only.pointsRate
    )} מול יעד ${formatPercent(only.targetRate)}, סטייה של ${formatSignedPercent(
      only.deviation
    )}.`
  }

  const parts = evaluationState.available.map(buildBucketStatePart)

  return `קצב צבירת הנקודות לפי רמת יריבה: ${parts.join(
    ' · '
  )}. הפער בין אחוזי ההצלחה הוא ${formatNumber(metrics.absGap, 1)} נקודות אחוז.`
}

export function buildDifficultyAdvantageText(evaluationState) {
  const positive = evaluationState.strongestPositive

  if (!positive) return ''

  if (positive.id === 'hard') {
    return `הקבוצה מציגה ביצוע חיובי מול יריבות חזקות: ${formatPercent(
      positive.pointsRate
    )} מול יעד ${formatPercent(positive.targetRate)}. זה סימן ליכולת להתמודד עם קושי גבוה.`
  }

  if (positive.id === 'equal') {
    return 'הקבוצה מעל היעד מול יריבות ברמה דומה. זהו סימן חיובי בתחרות הישירה על אזור הטבלה.'
  }

  if (positive.id === 'easy') {
    return `הקבוצה מנצלת היטב משחקים מול יריבות מתחת לרמה, עם סטייה חיובית של ${formatSignedPercent(
      positive.deviation
    )} מעל נקודת הייחוס.`
  }

  return ''
}

export function buildDifficultyRiskText(metrics, evaluationState) {
  const issue = getDifficultyCoreIssue(metrics, evaluationState)
  const negative = evaluationState.strongestNegative

  if (!negative) return ''

  if (issue === 'easy_drop') {
    return `הפער המרכזי הוא איבוד נקודות מול יריבות נוחות יותר: ${formatPercent(
      negative.pointsRate
    )} מול יעד ${formatPercent(negative.targetRate)}.`
  }

  if (issue === 'equal_gap') {
    return `הפער המרכזי הוא קצב נמוך מול יריבות ברמה דומה: ${formatPercent(
      negative.pointsRate
    )} מול יעד ${formatPercent(negative.targetRate)}.`
  }

  if (issue === 'hard_gap') {
    return `הפער המרכזי הוא קושי לצבור נקודות מול יריבות חזקות יותר: ${formatPercent(
      negative.pointsRate
    )} מול יעד ${formatPercent(negative.targetRate)}.`
  }

  return ''
}

export function buildDifficultyRecommendationText(metrics, evaluationState) {
  const issue = getDifficultyCoreIssue(metrics, evaluationState)
  const negative = evaluationState.strongestNegative
  const positive = evaluationState.strongestPositive

  if (!metrics.hasAnyData) return ''

  if (issue === 'sample') {
    return 'מומלץ להתייחס לפילוח רמת היריבה בזהירות עד שיצטברו עוד משחקים בכל רמת קושי.'
  }

  if (issue === 'easy_drop') {
    return negative?.evaluation?.reliability?.caution
      ? 'מומלץ לעקוב בזהירות אחרי המשחקים מול יריבות מתחת לרמה; המדגם עדיין נמוך, אך זו קטגוריה קריטית לצבירת נקודות.'
      : 'מומלץ לתעדף את שיפור צבירת הנקודות מול יריבות מתחת לרמה, משום שזו הקטגוריה המרכזית שבה הקבוצה אמורה לייצר יתרון.'
  }

  if (issue === 'equal_gap') {
    return negative?.evaluation?.reliability?.caution
      ? 'מומלץ לעקוב בזהירות אחרי המשחקים מול יריבות באותה רמה; המדגם עדיין לא מספיק חזק לדגל חד.'
      : 'מומלץ לבחון את המשחקים מול יריבות באותה רמה, משום שזו התחרות הישירה על אזור הטבלה שהוגדר כיעד.'
  }

  if (issue === 'hard_gap') {
    return negative?.evaluation?.reliability?.caution
      ? 'מול יריבות חזקות יש שונות גבוהה יותר, ולכן מומלץ להמשיך לעקוב לפני קביעה חזקה מדי.'
      : 'מומלץ לבחון כיצד לשפר את ההתמודדות מול יריבות חזקות יותר, אך לפרש את הדגל ביחס לכמות המשחקים ולקושי הצפוי.'
  }

  if (positive?.id === 'hard') {
    return 'מומלץ לשמר את היכולת להתמודד עם משחקים קשים, ובמקביל לבדוק שהקבוצה אינה מאבדת נקודות במשחקים שאמורים להיות מקור הצבירה המרכזי.'
  }

  if (positive?.id === 'easy') {
    return 'מומלץ לשמר את ניצול היתרון מול יריבות מתחת לרמה ולבדוק האם אותו בסיס תומך גם בתחזית הכללית.'
  }

  if (positive?.id === 'equal') {
    return 'מומלץ לשמר את התחרותיות מול יריבות באותה רמה, משום שהיא משפיעה ישירות על העמידה ביעד הטבלאי.'
  }

  return 'הקבוצה קרובה לנקודות הייחוס לפי רמת יריבה. מומלץ להמשיך לעקוב כדי לזהות מגמה מקצועית ברורה יותר.'
}

export function buildDifficultyReliabilityText(evaluationState) {
  const cautious = evaluationState.available.filter((bucket) => {
    return bucket?.evaluation?.reliability?.caution
  })

  if (!cautious.length) return ''

  const labels = cautious.map((bucket) => bucket.label).join(', ')

  return `יש להתייחס לדגל בזהירות, משום שכמות המשחקים בקטגוריות ${labels} נמוכה יחסית.`
}
