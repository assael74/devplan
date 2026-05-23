// src/shared/games/insights/team/sections/performance/performance.model.js

import {
  getGoalsAgainstTone,
  getGoalsForTone,
  getPointsPaceTone,
  getRatingTone,
  getTvaTone,
} from './performance.tone.js'

const emptySummary = {
  teamRating: null,
  tva: null,
  pointsPaceDelta: null,
  goalsForDelta: null,
  goalsAgainstDelta: null,
}

const toNumberOrNull = (value) => {
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

const roundValue = (value, digits = 1) => {
  const num = toNumberOrNull(value)
  if (num === null) return null

  const factor = 10 ** digits
  return Math.round(num * factor) / factor
}

const formatSigned = (value, digits = 1) => {
  const num = roundValue(value, digits)
  if (num === null) return '-'

  return num > 0 ? `+${num}` : `${num}`
}

const formatRating = (value) => {
  const num = roundValue(value, 2)
  if (num === null) return '-'

  return `${num}`
}

const getSummary = (teamScoring = {}) => {
  return {
    ...emptySummary,
    ...(teamScoring?.teamScoringSummary || teamScoring?.summary || {}),
  }
}

const buildCards = (summary = {}) => {
  return [
    {
      id: 'teamRating',
      label: 'מדד יעילות',
      value: formatRating(summary.teamRating),
      rawValue: summary.teamRating,
      tone: getRatingTone(summary.teamRating),
      sub: 'איכות ביצוע ביחס לציפייה',
    },
    {
      id: 'tva',
      label: 'מדד השפעה',
      value: formatSigned(summary.tva),
      rawValue: summary.tva,
      tone: getTvaTone(summary.tva),
      sub: 'ערך מצטבר מול הציפייה',
    },
    {
      id: 'pointsPaceDelta',
      label: 'פער קצב נקודות',
      value: formatSigned(summary.pointsPaceDelta),
      rawValue: summary.pointsPaceDelta,
      tone: getPointsPaceTone(summary.pointsPaceDelta),
      sub: 'Actual מול expected points',
    },
    {
      id: 'goalsForDelta',
      label: 'פער שערי זכות',
      value: formatSigned(summary.goalsForDelta),
      rawValue: summary.goalsForDelta,
      tone: getGoalsForTone(summary.goalsForDelta),
      sub: 'כמה כבשנו ביחס לצפוי',
    },
    {
      id: 'goalsAgainstDelta',
      label: 'פער שערי חובה',
      value: formatSigned(summary.goalsAgainstDelta),
      rawValue: summary.goalsAgainstDelta,
      tone: getGoalsAgainstTone(summary.goalsAgainstDelta),
      sub: 'כמה ספגנו ביחס לצפוי',
    },
  ]
}

const getMainStatus = (summary = {}) => {
  const rating = toNumberOrNull(summary.teamRating)
  const tva = toNumberOrNull(summary.tva)

  if (rating === null && tva === null) {
    return {
      tone: 'neutral',
      label: 'אין מספיק נתונים',
    }
  }

  if (rating >= 6.25 && tva > 0) {
    return {
      tone: 'success',
      label: 'הקבוצה מעל הציפייה',
    }
  }

  if (rating >= 6 && tva >= 0) {
    return {
      tone: 'primary',
      label: 'הקבוצה עומדת בציפייה',
    }
  }

  if (rating >= 5.85 || tva > -1) {
    return {
      tone: 'warning',
      label: 'הקבוצה קרובה לציפייה',
    }
  }

  return {
    tone: 'danger',
    label: 'הקבוצה מתחת לציפייה',
  }
}

export const buildPerformanceModel = ({ teamScoring } = {}) => {
  const summary = getSummary(teamScoring)
  const cards = buildCards(summary)
  const status = getMainStatus(summary)

  return {
    id: 'performance',
    title: 'מדד יעילות והשפעה',
    subtitle: 'Actual מול expected לפי יעד עונתי וציפיות משחק',
    status,
    summary,
    cards,
    trend: teamScoring?.teamScoringTrend || [],
    isEmpty: cards.every((card) => card.rawValue === null),
  }
}
