// shared/games/insights/team/sections/forecast/forecast.texts.js

import { formatNumber } from '../../common/index.js'
import { hasForecastRisk } from './forecast.rules.js'

export function buildForecastTargetGapText(targetGap) {
  if (!targetGap || targetGap.relation === 'unknown') return ''

  return targetGap.text || ''
}

export function buildForecastStateText(comparisons = {}) {
  const points = comparisons.points

  if (!points) {
    return 'אין מספיק נתונים כדי להעריך בצורה מלאה את קצב צבירת הנקודות מול היעד.'
  }

  if (points.status === 'above') {
    return `הקבוצה נמצאת מעל יעד התחזית: ${formatNumber(
      points.actual,
      1
    )} נק׳ צפויות מול יעד של ${formatNumber(
      points.target,
      1
    )}. הפוקוס המרכזי צריך לעבור לאיכות הדרך שבה התחזית מושגת.`
  }

  if (points.status === 'met') {
    return 'הקבוצה עומדת כרגע ביעד התחזית, ללא פער תוצאתי משמעותי ביחס לרמת היעד.'
  }

  return `הקבוצה נמצאת מתחת ליעד התחזית: ${formatNumber(
    points.actual,
    1
  )} נק׳ צפויות מול יעד של ${formatNumber(
    points.target,
    1
  )}. נדרש לזהות מה פוגע בקצב צבירת הנקודות.`
}

export function buildForecastAdvantageText(comparisons = {}) {
  const { points, goalsFor, goalsAgainst } = comparisons

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

export function buildForecastFocusBaseText(comparisons = {}) {
  const { points, goalsFor, goalsAgainst } = comparisons

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

export function buildForecastRecommendationText(comparisons = {}) {
  const { points, goalsFor, goalsAgainst } = comparisons
  const hasAnyRisk = hasForecastRisk(comparisons)

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

export function buildForecastActionFocusText(comparisons = {}) {
  return (
    buildForecastRecommendationText(comparisons) ||
    buildForecastFocusBaseText(comparisons)
  )
}
