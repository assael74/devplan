// shared/games/insights/team/teamGamesForecastBrief.logic.js

import { buildTeamGamesHomeAwayBrief } from './teamGamesHomeAwayBrief.logic.js'
import { buildTeamGamesDifficultyBrief } from './teamGamesDifficultyBrief.logic.js'
import { buildTeamGamesSquadBrief } from './teamGamesSquadBrief.logic.js'

const toNumber = (value, fallback = 0) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const hasNumber = (value) => Number.isFinite(Number(value))

const round = (value, digits = 1) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0

  const factor = 10 ** digits
  return Math.round(n * factor) / factor
}

const formatNumber = (value, digits = 1) => {
  if (!hasNumber(value)) return '—'
  return String(round(value, digits))
}

const getLevelLabel = (level) => {
  return (
    level?.rankRangeLabel ||
    level?.rankLabel ||
    level?.shortLabel ||
    level?.label ||
    ''
  )
}

function getTargetProgressValue(targetProgress, key) {
  const rows = Array.isArray(targetProgress?.rows) ? targetProgress.rows : []

  const row = rows.find((item) => {
    return item?.id === key || item?.key === key
  })

  if (!row) {
    return null
  }

  if (row.target !== undefined && row.target !== null) {
    return row.target
  }

  if (row.targetValue !== undefined && row.targetValue !== null) {
    return row.targetValue
  }

  return null
}

const buildTargetValues = ({ targetProgress, targetLevel }) => {
  return {
    points:
      getTargetProgressValue(targetProgress, 'points') ??
      targetLevel?.targetPoints,

    goalsFor:
      getTargetProgressValue(targetProgress, 'goalsFor') ??
      targetLevel?.targetGoalsFor,

    goalsAgainst:
      getTargetProgressValue(targetProgress, 'goalsAgainst') ??
      targetLevel?.targetGoalsAgainst,
  }
}

const resolveTargetLevel = ({ benchmarkLevel, forecastLevel }) => {
  return benchmarkLevel || forecastLevel || null
}

const compareHigherIsBetter = ({ actual, target, tolerancePct = 3 }) => {
  if (!hasNumber(actual) || !hasNumber(target) || Number(target) <= 0) {
    return null
  }

  const actualValue = toNumber(actual)
  const targetValue = toNumber(target)
  const ratio = (actualValue / targetValue) * 100
  const gap = actualValue - targetValue

  let status = 'below'

  if (ratio >= 100 + tolerancePct) status = 'above'
  else if (ratio >= 100 - tolerancePct) status = 'met'

  return {
    actual: round(actualValue, 1),
    target: round(targetValue, 1),
    ratio: Math.round(ratio),
    gap: round(gap, 1),
    status,
    isPositive: status === 'above' || status === 'met',
    isRisk: status === 'below',
  }
}

const compareLowerIsBetter = ({ actual, target, tolerancePct = 10 }) => {
  if (!hasNumber(actual) || !hasNumber(target) || Number(target) <= 0) {
    return null
  }

  const actualValue = toNumber(actual)
  const targetValue = toNumber(target)
  const ratio = (actualValue / targetValue) * 100
  const gap = actualValue - targetValue

  let status = 'below'

  if (actualValue <= targetValue) {
    status = 'above'
  } else if (actualValue <= targetValue * (1 + tolerancePct / 100)) {
    status = 'met'
  }

  return {
    actual: round(actualValue, 1),
    target: round(targetValue, 1),
    ratio: Math.round(ratio),
    gap: round(gap, 1),
    status,
    isPositive: status === 'above' || status === 'met',
    isRisk: status === 'below',
  }
}

const buildComparisons = ({ active, targetLevel, targetProgress }) => {
  const targets = buildTargetValues({
    targetProgress,
    targetLevel,
  })

  return {
    points: compareHigherIsBetter({
      actual: active?.projectedTotalPoints,
      target: targets.points,
      tolerancePct: 3,
    }),

    goalsFor: compareHigherIsBetter({
      actual: active?.projectedGoalsFor,
      target: targets.goalsFor,
      tolerancePct: 6,
    }),

    goalsAgainst: compareLowerIsBetter({
      actual: active?.projectedGoalsAgainst,
      target: targets.goalsAgainst,
      tolerancePct: 10,
    }),
  }
}

const hasRisk = ({ points, goalsFor, goalsAgainst }) => {
  return Boolean(points?.isRisk || goalsFor?.isRisk || goalsAgainst?.isRisk)
}

const buildForecastStateText = ({ points }) => {
  if (!points) {
    return 'אין מספיק נתונים כדי להעריך בצורה מלאה את קצב צבירת הנקודות מול היעד.'
  }

  if (points.status === 'above') {
    return `הקבוצה נמצאת מעל יעד התחזית: ${formatNumber(
      points.actual
    )} נק׳ צפויות מול יעד של ${formatNumber(
      points.target
    )}. הפוקוס המרכזי צריך לעבור לאיכות הדרך שבה התחזית מושגת.`
  }

  if (points.status === 'met') {
    return 'הקבוצה עומדת כרגע ביעד התחזית, ללא פער תוצאתי משמעותי ביחס לרמת היעד.'
  }

  return `הקבוצה נמצאת מתחת ליעד התחזית: ${formatNumber(
    points.actual
  )} נק׳ צפויות מול יעד של ${formatNumber(
    points.target
  )}. נדרש לזהות מה פוגע בקצב צבירת הנקודות.`
}

const buildAdvantageText = ({ points, goalsFor, goalsAgainst }) => {
  if (goalsFor?.status === 'above') {
    return 'קצב שערי הזכות נמצא מעל היעד ומייצר יתרון התקפי משמעותי.'
  }

  if (goalsAgainst?.status === 'above') {
    return 'תחזית שערי החובה טובה מהיעד ומצביעה על בסיס הגנתי יציב.'
  }

  if (points?.isPositive) {
    return 'הקבוצה נמצאת בקצב נקודות שתומך בתחזית הנוכחית ומייצר יציבות תוצאתית.'
  }

  return ''
}

const buildFocusBaseText = ({ points, goalsFor, goalsAgainst }) => {
  if (goalsAgainst?.isRisk) {
    return 'שערי החובה גבוהים מהיעד ועלולים לפגוע ביציבות ובשמירה על מיקום היעד.'
  }

  if (goalsFor?.isRisk) {
    return 'קצב שערי הזכות נמצא מתחת ליעד ועלול להגביל את יכולת הקבוצה לשפר את התחזית.'
  }

  if (points?.isRisk) {
    return 'קצב צבירת הנקודות נמוך מהיעד ולכן נדרש לזהות מה פוגע בתוצאה המצטברת.'
  }

  return ''
}

const buildRecommendationText = ({ points, goalsFor, goalsAgainst }) => {
  const hasAnyRisk = hasRisk({ points, goalsFor, goalsAgainst })

  if (goalsAgainst?.isRisk && goalsFor?.status === 'above') {
    return 'מומלץ לבחון את משחק ההגנה של הקבוצה תוך שמירה על היתרון ההתקפי הקיים.'
  }

  if (goalsAgainst?.isRisk) {
    return 'מומלץ להתמקד בצמצום שערי החובה כדי לשפר את יציבות הקבוצה ואת תחזית המשך העונה.'
  }

  if (goalsFor?.isRisk) {
    return 'מומלץ לבחון כיצד להגדיל את האיום ההתקפי ואת קצב הכיבוש בלי לפגוע באיזון הקבוצתי.'
  }

  if (points?.isRisk) {
    return 'מומלץ לתעדף פעולות שיכולות לייצר שיפור תוצאתי מהיר.'
  }

  if (!hasAnyRisk && points?.isPositive && goalsFor?.status === 'above') {
    return 'מומלץ לשמר את היתרון ההתקפי ואת קצב צבירת הנקודות הקיים.'
  }

  if (!hasAnyRisk && goalsAgainst?.status === 'above') {
    return 'מומלץ לשמר את היציבות ההגנתית ולוודא שהיא ממשיכה לתמוך בתחזית הקבוצה.'
  }

  if (!hasAnyRisk && points?.isPositive) {
    return 'מומלץ לשמר את קצב צבירת הנקודות ולבחון אילו מרכיבים תומכים ביציבות הנוכחית.'
  }

  return ''
}

const buildActionFocusText = (comparisons) => {
  return buildRecommendationText(comparisons) || buildFocusBaseText(comparisons)
}

const getOverallTone = ({ points, goalsFor, goalsAgainst }) => {
  if (goalsFor?.status === 'above' && goalsAgainst?.isRisk) return 'warning'
  if (goalsAgainst?.isRisk || points?.isRisk || goalsFor?.isRisk) return 'warning'
  if (points?.isPositive) return 'success'

  return 'neutral'
}

export const buildTeamGamesForecastBrief = (insights = {}) => {
  const active = insights?.active || {}
  const calculation = insights?.calculation || {}
  const forecastLevel = insights?.forecastLevel || null
  const benchmarkLevel = insights?.benchmarkLevel || null
  const targetLevel = resolveTargetLevel({ benchmarkLevel, forecastLevel })

  const isReady =
    active?.isReady === true ||
    hasNumber(active?.projectedTotalPoints) ||
    hasNumber(active?.pointsRate)

  if (!isReady) {
    return {
      id: 'team_games_forecast_brief',
      sectionId: 'forecast',
      status: 'empty',
      tone: 'neutral',
      title: 'תובנות ראשוניות',
      subtitle: 'תחזית כללית',
      sourceLabel:
        calculation?.sourceLabel || active?.sourceLabel || 'נתונים קיימים',
      text: 'אין מספיק נתונים כדי לבנות תובנה ראשונית לתחזית הקבוצה.',
      items: [],
      metrics: {},
      meta: {},
    }
  }

  const comparisons = buildComparisons({
    active,
    targetLevel,
    targetProgress: insights?.targetProgress,
  })

  const hasActionRisk = hasRisk(comparisons)

  const forecastStateText = buildForecastStateText({
    points: comparisons.points,
  })

  const advantageText = buildAdvantageText(comparisons)
  const actionFocusText = buildActionFocusText(comparisons)

  const items = [
    actionFocusText
      ? {
          id: 'action_focus',
          type: 'focus',
          label: hasActionRisk ? 'מוקד פעולה' : 'המשך פעולה',
          tone: hasActionRisk ? 'warning' : 'success',
          text: actionFocusText,
        }
      : null,
    {
      id: 'forecast_state',
      type: 'state',
      label: 'מצב התחזית',
      tone: comparisons.points?.isRisk ? 'warning' : 'primary',
      text: forecastStateText,
    },
    advantageText
      ? {
          id: 'advantage',
          type: 'advantage',
          label: 'יתרון',
          tone: 'success',
          text: advantageText,
        }
      : null,
  ].filter(Boolean)

  return {
    id: 'team_games_forecast_brief',
    sectionId: 'forecast',
    status: 'ready',
    tone: getOverallTone(comparisons),
    title: 'תובנות ראשוניות',
    subtitle: 'תחזית כללית',
    sourceLabel:
      calculation?.sourceLabel || active?.sourceLabel || 'נתונים קיימים',
    targetLabel: getLevelLabel(targetLevel),
    forecastLabel: getLevelLabel(forecastLevel),
    text: actionFocusText || forecastStateText,
    items,
    metrics: {
      projectedTotalPoints: active?.projectedTotalPoints,
      projectedGoalsFor: active?.projectedGoalsFor,
      projectedGoalsAgainst: active?.projectedGoalsAgainst,
      pointsRate: active?.pointsRate,
      comparisons,
    },
    meta: {
      calculationMode: calculation?.mode,
      source: calculation?.source || active?.source,
      benchmarkLevelId: benchmarkLevel?.id || null,
      forecastLevelId: forecastLevel?.id || null,
      hasActionRisk,
      pointsAchievementPct: comparisons.points?.ratio ?? null,
      goalsForAchievementPct: comparisons.goalsFor?.ratio ?? null,
      goalsAgainstAchievementPct: comparisons.goalsAgainst?.ratio ?? null,
    },
  }
}

export const buildTeamGamesBriefSections = (insights = {}) => {
  return {
    forecast: buildTeamGamesForecastBrief(insights),
    homeAway: buildTeamGamesHomeAwayBrief(insights),
    difficulty: buildTeamGamesDifficultyBrief(insights),
    squad: buildTeamGamesSquadBrief(insights),
  }
}
