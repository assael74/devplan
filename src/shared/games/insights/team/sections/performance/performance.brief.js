// src/shared/games/insights/team/sections/performance/performance.brief.js

import {
  buildPerformanceModel,
} from './performance.model.js'

const hasValue = (value) => {
  return Number.isFinite(Number(value))
}

const getEfficiencyText = ({ teamRating, tva }) => {
  if (!hasValue(teamRating) && !hasValue(tva)) {
    return 'אין מספיק נתוני סקורינג כדי להעריך את היעילות הקבוצתית.'
  }

  if (teamRating >= 6.25 && tva > 0) {
    return 'הקבוצה מייצרת ערך חיובי ומציגה יעילות גבוהה ביחס לציפייה.'
  }

  if (teamRating >= 6 && tva >= 0) {
    return 'הקבוצה עומדת בציפייה המקצועית ושומרת על השפעה מצטברת חיובית.'
  }

  if (teamRating >= 5.85 || tva > -1) {
    return 'הקבוצה קרובה לציפייה, אבל עדיין לא מייצרת יתרון מצטבר מספיק ברור.'
  }

  return 'הקבוצה מתחת לציפייה, גם באיכות הביצוע וגם בהשפעה המצטברת.'
}

const getGoalsText = ({ goalsForDelta, goalsAgainstDelta }) => {
  const hasAttack = hasValue(goalsForDelta)
  const hasDefense = hasValue(goalsAgainstDelta)

  if (!hasAttack && !hasDefense) return ''

  if (goalsForDelta > 0 && goalsAgainstDelta < 0) {
    return 'ההתקפה מעל הציפייה, אבל ההגנה סופגת יותר מהצפוי.'
  }

  if (goalsForDelta < 0 && goalsAgainstDelta > 0) {
    return 'ההגנה מחזיקה את הקבוצה, אבל ההתקפה מתחת לציפייה.'
  }

  if (goalsForDelta > 0 && goalsAgainstDelta > 0) {
    return 'גם ההתקפה וגם ההגנה נמצאות מעל הציפייה.'
  }

  if (goalsForDelta < 0 && goalsAgainstDelta < 0) {
    return 'גם ההתקפה וגם ההגנה נמצאות מתחת לציפייה.'
  }

  return 'פערי השערים מאוזנים יחסית לציפייה.'
}

const getPointsText = ({ pointsPaceDelta }) => {
  if (!hasValue(pointsPaceDelta)) return ''

  if (pointsPaceDelta > 1) {
    return 'קצב הנקודות גבוה מהצפוי ביחס ליעד.'
  }

  if (pointsPaceDelta < -1) {
    return 'קצב הנקודות נמוך מהצפוי ביחס ליעד.'
  }

  return 'קצב הנקודות קרוב לציפייה.'
}

const joinParts = (parts = []) => {
  return parts.filter(Boolean).join(' ')
}

export const buildPerformanceBrief = ({ teamScoring } = {}) => {
  const model = buildPerformanceModel({
    teamScoring,
  })

  const {
    teamRating,
    tva,
    pointsPaceDelta,
    goalsForDelta,
    goalsAgainstDelta,
  } = model.summary

  const text = joinParts([
    getEfficiencyText({
      teamRating,
      tva,
    }),
    getPointsText({
      pointsPaceDelta,
    }),
    getGoalsText({
      goalsForDelta,
      goalsAgainstDelta,
    }),
  ])

  return {
    id: 'performance',
    title: 'מדד יעילות והשפעה',
    tone: model.status.tone,
    label: model.status.label,
    text,
    cards: model.cards,
    model,
  }
}
