// shared/games/insights/player/sections/difficulty/difficulty.texts.js

import {
  formatNumber,
  formatPercent,
} from '../../../team/common/index.js'

import { getPlayerDifficultyCoreIssue } from './difficulty.rules.js'

function formatSignedPercent(value) {
  const n = Number(value)

  if (!Number.isFinite(n)) return '—'

  const rounded = Math.round(n)
  const sign = rounded > 0 ? '+' : ''

  return `${sign}${rounded}%`
}

function buildBucketPart(bucket) {
  return `${bucket.label}: ${formatNumber(bucket.playerGames)} משחקים, ${formatPercent(
    bucket.playerPointsRate
  )}, פער ${formatSignedPercent(bucket.pointsRateGap)}`
}

export function buildPlayerDifficultyStateText(metrics, evaluationState) {
  if (!metrics.hasAnyData) {
    return 'אין מספיק נתונים כדי לבחון את השחקן לפי רמת יריבה.'
  }

  const parts = evaluationState.available.map(buildBucketPart)

  return `פילוח לפי רמת יריבה: ${parts.join(' · ')}.`
}

export function buildPlayerDifficultyRecommendationText(metrics, evaluationState) {
  const issue = getPlayerDifficultyCoreIssue(metrics, evaluationState)
  const negative = evaluationState.strongestNegative
  const positive = evaluationState.strongestPositive

  if (issue === 'missing_data') {
    return 'נדרש לצבור נתוני משחקים לפי רמת יריבה לפני יצירת תובנה.'
  }

  if (issue === 'sample_caution') {
    return 'המדגם לפי רמת יריבה עדיין נמוך, לכן הפילוח משמש ככיוון בלבד.'
  }

  if (issue === 'partial_profile') {
    return 'קיים מידע רק מול חלק מרמות היריבה, ולכן מומלץ להשלים פרופיל לפני מסקנה חזקה.'
  }

  if (issue === 'difficulty_gap') {
    return `הפער המרכזי מופיע מול ${negative.label}: קצב הנקודות עם השחקן נמוך מקצב הקבוצה ב${formatSignedPercent(
      negative.pointsRateGap
    )}.`
  }

  if (issue === 'difficulty_advantage') {
    return `היתרון המרכזי מופיע מול ${positive.label}: קצב הנקודות עם השחקן גבוה מקצב הקבוצה ב${formatSignedPercent(
      positive.pointsRateGap
    )}.`
  }

  if (issue === 'difficulty_gap_caution') {
    return `קיים פער מול ${negative.label}, אך המדגם עדיין נמוך ולכן זו אינדיקציה בלבד.`
  }

  if (issue === 'difficulty_advantage_caution') {
    return `קיים יתרון מול ${positive.label}, אך המדגם עדיין נמוך ולכן זו אינדיקציה בלבד.`
  }

  return 'הביצוע של השחקן לפי רמת יריבה קרוב לקצב הקבוצה, ללא חריגה מרכזית כרגע.'
}
