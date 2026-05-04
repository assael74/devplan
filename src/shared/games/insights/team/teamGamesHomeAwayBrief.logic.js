// shared/games/insights/team/teamGamesHomeAwayBrief.logic.js

import { getTeamGamesHomeAwayTargetsByLevelId } from './team.benchmarks.js'

const MIN_GAMES_FOR_STRONG_INSIGHT = 2

const FALLBACK_HOME_AWAY_TARGETS = {
  overall: { greenMin: 50, redBelow: 40 },
  home: { greenMin: 55, redBelow: 40 },
  away: { greenMin: 45, redBelow: 30 },
  gap: { greenMax: 12, redMin: 18 },
}

function toNumber(value, fallback) {
  const n = Number(value)

  if (Number.isFinite(n)) {
    return n
  }

  return fallback
}

function hasNumber(value) {
  return Number.isFinite(Number(value))
}

function round(value, digits) {
  const n = Number(value)

  if (!Number.isFinite(n)) {
    return 0
  }

  const factor = 10 ** digits

  return Math.round(n * factor) / factor
}

function formatPercent(value) {
  if (!hasNumber(value)) {
    return '—'
  }

  return `${Math.round(Number(value))}%`
}

function formatNumber(value, digits) {
  if (!hasNumber(value)) {
    return '—'
  }

  return String(round(value, digits))
}

function calcPercent(value, total) {
  const v = toNumber(value, 0)
  const t = toNumber(total, 0)

  if (!t) {
    return 0
  }

  return Math.round((v / t) * 100)
}

function pickNumber(source, keys, fallback) {
  if (!source) {
    return fallback
  }

  for (const key of keys) {
    const value = source[key]

    if (hasNumber(value)) {
      return Number(value)
    }
  }

  return fallback
}

function normalizeLocationKey(value) {
  const key = String(value || '').trim().toLowerCase()

  if (
    key === 'home' ||
    key === 'בית' ||
    key === 'homegame' ||
    key === 'home_game'
  ) {
    return 'home'
  }

  if (
    key === 'away' ||
    key === 'חוץ' ||
    key === 'awaygame' ||
    key === 'away_game'
  ) {
    return 'away'
  }

  return key
}

function getBucketFromArray(rows, wantedKey) {
  if (!Array.isArray(rows)) {
    return null
  }

  return (
    rows.find((row) => {
      const key = normalizeLocationKey(
        row && (row.id || row.key || row.type || row.label)
      )

      return key === wantedKey
    }) || null
  )
}

function getBucketFromObject(source, wantedKey) {
  if (!source || Array.isArray(source)) {
    return null
  }

  if (source[wantedKey]) {
    return source[wantedKey]
  }

  const keys = Object.keys(source)

  for (const key of keys) {
    const normalizedKey = normalizeLocationKey(key)

    if (normalizedKey === wantedKey) {
      return source[key]
    }
  }

  return null
}

function getLocationBucket(source, wantedKey) {
  const fromObject = getBucketFromObject(source, wantedKey)

  if (fromObject) {
    return fromObject
  }

  const fromArray = getBucketFromArray(source, wantedKey)

  if (fromArray) {
    return fromArray
  }

  if (source && Array.isArray(source.rows)) {
    return getBucketFromArray(source.rows, wantedKey)
  }

  if (source && Array.isArray(source.items)) {
    return getBucketFromArray(source.items, wantedKey)
  }

  return null
}

function normalizeBucket(bucket) {
  if (!bucket) {
    return {
      games: 0,
      points: 0,
      maxPoints: 0,
      pointsRate: 0,
      remainingGames: 0,
      projectedPoints: 0,
    }
  }

  const games = pickNumber(
    bucket,
    ['games', 'gamesCount', 'count', 'playedGames', 'playedGamesCount', 'total'],
    0
  )

  const points = pickNumber(bucket, ['points', 'value'], 0)

  const maxPoints = pickNumber(
    bucket,
    ['maxPoints', 'possiblePoints', 'totalMaxPoints'],
    games * 3
  )

  const pointsRate = pickNumber(
    bucket,
    ['pointsRate', 'rate', 'percent', 'pct'],
    calcPercent(points, maxPoints)
  )

  const remainingGames = pickNumber(
    bucket,
    ['remainingGames', 'remainingGamesCount', 'upcomingGames', 'upcomingCount'],
    0
  )

  const projectedPoints = pickNumber(
    bucket,
    ['projectedPoints', 'projection', 'projectedTotalPoints'],
    points
  )

  return {
    games,
    points,
    maxPoints,
    pointsRate,
    remainingGames,
    projectedPoints,
  }
}

function resolveHomeAwaySource(insights) {
  if (!insights) {
    return null
  }

  if (insights.homeAwayProjection && insights.homeAwayProjection.current) {
    return insights.homeAwayProjection.current
  }

  if (insights.homeAwayProjection) {
    return insights.homeAwayProjection
  }

  if (insights.homeAway && insights.homeAway.current) {
    return insights.homeAway.current
  }

  if (insights.homeAway) {
    return insights.homeAway
  }

  if (
    insights.games &&
    insights.games.homeAwayProjection &&
    insights.games.homeAwayProjection.current
  ) {
    return insights.games.homeAwayProjection.current
  }

  if (insights.games && insights.games.homeAwayProjection) {
    return insights.games.homeAwayProjection
  }

  if (
    insights.games &&
    insights.games.grouped &&
    insights.games.grouped.byHomeOrAway
  ) {
    return insights.games.grouped.byHomeOrAway
  }

  if (
    insights.active &&
    insights.active.grouped &&
    insights.active.grouped.byHomeOrAway
  ) {
    return insights.active.grouped.byHomeOrAway
  }

  return null
}

function resolveTargetLevel(insights) {
  return insights?.benchmarkLevel || insights?.forecastLevel || null
}

function getLevelLabel(level) {
  return (
    level?.rankRangeLabel ||
    level?.rankLabel ||
    level?.shortLabel ||
    level?.label ||
    ''
  )
}

function resolveTargets(insights) {
  const targetLevel = resolveTargetLevel(insights)
  const targets = getTeamGamesHomeAwayTargetsByLevelId(targetLevel?.id)

  return {
    targetLevel,
    targetLabel: getLevelLabel(targetLevel),
    targets: targets || FALLBACK_HOME_AWAY_TARGETS,
    hasSpecificTargets: Boolean(targets),
  }
}

function evaluateHigherIsBetter(value, target) {
  if (!hasNumber(value) || !target) {
    return {
      status: 'empty',
      tone: 'neutral',
      isGreen: false,
      isRed: false,
      isWatch: false,
    }
  }

  const n = Number(value)

  if (hasNumber(target.greenMin) && n >= Number(target.greenMin)) {
    return {
      status: 'green',
      tone: 'success',
      isGreen: true,
      isRed: false,
      isWatch: false,
    }
  }

  if (hasNumber(target.redBelow) && n < Number(target.redBelow)) {
    return {
      status: 'red',
      tone: 'warning',
      isGreen: false,
      isRed: true,
      isWatch: false,
    }
  }

  return {
    status: 'watch',
    tone: 'primary',
    isGreen: false,
    isRed: false,
    isWatch: true,
  }
}

function evaluateGap(value, target) {
  if (!hasNumber(value) || !target) {
    return {
      status: 'empty',
      tone: 'neutral',
      isGreen: false,
      isRed: false,
      isWatch: false,
    }
  }

  const n = Math.abs(Number(value))

  if (hasNumber(target.greenMax) && n <= Number(target.greenMax)) {
    return {
      status: 'green',
      tone: 'success',
      isGreen: true,
      isRed: false,
      isWatch: false,
    }
  }

  if (hasNumber(target.redMin) && n >= Number(target.redMin)) {
    return {
      status: 'red',
      tone: 'warning',
      isGreen: false,
      isRed: true,
      isWatch: false,
    }
  }

  return {
    status: 'watch',
    tone: 'primary',
    isGreen: false,
    isRed: false,
    isWatch: true,
  }
}

function buildHomeAwayData(insights) {
  const source = resolveHomeAwaySource(insights)
  const targetState = resolveTargets(insights)

  const home = normalizeBucket(getLocationBucket(source, 'home'))
  const away = normalizeBucket(getLocationBucket(source, 'away'))

  const totalGames = home.games + away.games
  const gap = round(home.pointsRate - away.pointsRate, 1)
  const absGap = Math.abs(gap)

  const overallRate = pickNumber(
    insights?.active,
    ['pointsRate', 'rate', 'percent', 'pct'],
    null
  )

  const evaluation = {
    overall: evaluateHigherIsBetter(overallRate, targetState.targets.overall),
    home: evaluateHigherIsBetter(home.pointsRate, targetState.targets.home),
    away: evaluateHigherIsBetter(away.pointsRate, targetState.targets.away),
    gap: evaluateGap(absGap, targetState.targets.gap),
  }

  return {
    source,
    home,
    away,
    totalGames,
    gap,
    absGap,
    overallRate,

    targetLevel: targetState.targetLevel,
    targetLabel: targetState.targetLabel,
    targets: targetState.targets,
    hasSpecificTargets: targetState.hasSpecificTargets,

    evaluation,

    hasHomeData: home.games > 0,
    hasAwayData: away.games > 0,
    hasEnoughData:
      home.games >= MIN_GAMES_FOR_STRONG_INSIGHT &&
      away.games >= MIN_GAMES_FOR_STRONG_INSIGHT,
  }
}

function getBetterSide(data) {
  const greenGap = Number(data?.targets?.gap?.greenMax ?? 8)

  if (data.absGap <= greenGap) {
    return 'balanced'
  }

  if (data.gap > 0) {
    return 'home'
  }

  return 'away'
}

function hasSystemicRisk(data) {
  return data.evaluation.home.isRed && data.evaluation.away.isRed
}

function hasStrongProfile(data) {
  return (
    data.evaluation.home.isGreen &&
    data.evaluation.away.isGreen &&
    data.evaluation.gap.isGreen
  )
}

function buildStateText(data) {
  if (!data.hasHomeData && !data.hasAwayData) {
    return 'אין מספיק נתוני משחקים כדי לבנות תמונת בית / חוץ.'
  }

  if (!data.hasHomeData) {
    return `קיימים נתוני חוץ בלבד, עם קצב צבירת נקודות של ${formatPercent(
      data.away.pointsRate
    )}.`
  }

  if (!data.hasAwayData) {
    return `קיימים נתוני בית בלבד, עם קצב צבירת נקודות של ${formatPercent(
      data.home.pointsRate
    )}.`
  }

  return `הקבוצה צוברת ${formatPercent(
    data.home.pointsRate
  )} מהנקודות בבית לעומת ${formatPercent(
    data.away.pointsRate
  )} בחוץ, פער של ${formatNumber(data.absGap, 1)} נקודות אחוז.`
}

function buildAdvantageText(data) {
  const betterSide = getBetterSide(data)

  if (hasStrongProfile(data)) {
    return data.targetLabel
      ? `הקבוצה עומדת בפרופיל בית / חוץ חיובי ביחס ל${data.targetLabel}: בסיס ביתי חזק, תחרותיות בחוץ ופער מאוזן.`
      : 'הקבוצה מציגה פרופיל בית / חוץ חיובי: בסיס ביתי חזק, תחרותיות בחוץ ופער מאוזן.'
  }

  if (data.evaluation.away.isGreen) {
    return data.targetLabel
      ? `אחוז ההצלחה בחוץ גבוה ביחס ל${data.targetLabel}, וזה סימן לבגרות תחרותית וליכולת לקחת נקודות גם בתנאים פחות נוחים.`
      : 'אחוז ההצלחה בחוץ גבוה, וזה סימן לבגרות תחרותית וליכולת לקחת נקודות גם בתנאים פחות נוחים.'
  }

  if (data.evaluation.home.isGreen) {
    return data.targetLabel
      ? `משחקי הבית מייצרים בסיס נקודות חזק ביחס ל${data.targetLabel}.`
      : 'משחקי הבית מייצרים בסיס נקודות חזק.'
  }

  if (betterSide === 'balanced' && data.hasHomeData && data.hasAwayData) {
    return 'אין כרגע פער חריג בין משחקי בית למשחקי חוץ, וזה מצביע על איזון יחסי.'
  }

  return ''
}

function buildRecommendationText(data) {
  const betterSide = getBetterSide(data)

  if (!data.hasHomeData && !data.hasAwayData) {
    return ''
  }

  if (!data.hasEnoughData && data.hasHomeData && data.hasAwayData) {
    return 'מומלץ להתייחס לפילוח בית / חוץ בזהירות עד שיצטברו עוד משחקים בכל אחד מהמצבים.'
  }

  if (hasSystemicRisk(data)) {
    return data.targetLabel
      ? `גם הבית וגם החוץ נמצאים מתחת לסף האדום ביחס ל${data.targetLabel}; זה מצביע על חולשה מערכתית ולא על בעיית בית / חוץ נקודתית.`
      : 'גם הבית וגם החוץ נמצאים מתחת לסף האדום; זה מצביע על חולשה מערכתית ולא על בעיית בית / חוץ נקודתית.'
  }

  if (data.evaluation.away.isRed && data.evaluation.gap.isRed) {
    return data.targetLabel
      ? `אחוז ההצלחה בחוץ נמוך ביחס ל${data.targetLabel}, והפער מול משחקי הבית גבוה. זהו מוקד פעולה שעלול לפגוע בתחזית הכללית.`
      : 'אחוז ההצלחה בחוץ נמוך והפער מול משחקי הבית גבוה. זהו מוקד פעולה שעלול לפגוע בתחזית הכללית.'
  }

  if (data.evaluation.home.isRed && data.evaluation.gap.isRed) {
    return data.targetLabel
      ? `אחוז ההצלחה בבית נמוך ביחס ל${data.targetLabel}, למרות שמצופה מהבית להיות בסיס הנקודות המרכזי.`
      : 'אחוז ההצלחה בבית נמוך, למרות שמצופה מהבית להיות בסיס הנקודות המרכזי.'
  }

  if (data.evaluation.away.isRed) {
    return data.targetLabel
      ? `מומלץ לבחון את משחקי החוץ: אחוז ההצלחה בחוץ נמוך ביחס ל${data.targetLabel} ועלול להגביל את היכולת להתקדם בטבלה.`
      : 'מומלץ לבחון את משחקי החוץ: אחוז ההצלחה בחוץ נמוך ועלול להגביל את היכולת להתקדם בטבלה.'
  }

  if (data.evaluation.home.isRed) {
    return data.targetLabel
      ? `מומלץ לבחון את משחקי הבית: אחוז ההצלחה בבית נמוך ביחס ל${data.targetLabel}, ולכן אין כרגע בסיס נקודות יציב מספיק.`
      : 'מומלץ לבחון את משחקי הבית: אחוז ההצלחה בבית נמוך, ולכן אין כרגע בסיס נקודות יציב מספיק.'
  }

  if (data.evaluation.gap.isRed) {
    if (betterSide === 'home') {
      return 'מומלץ לצמצם את התלות במשחקי הבית ולשפר את היכולת לקחת נקודות בחוץ.'
    }

    if (betterSide === 'away') {
      return 'מומלץ לוודא שמשחקי הבית אינם הופכים לנקודת חולשה ביחס ליכולת שהקבוצה מציגה בחוץ.'
    }
  }

  if (hasStrongProfile(data)) {
    return data.targetLabel
      ? `מומלץ לשמר את האיזון בין בית לחוץ, משום שהוא תומך בפרופיל ביצועים חיובי ביחס ל${data.targetLabel}.`
      : 'מומלץ לשמר את האיזון בין בית לחוץ, משום שהוא תומך בפרופיל ביצועים חיובי.'
  }

  if (data.evaluation.gap.isGreen) {
    return 'מומלץ לשמר את האיזון בין משחקי הבית והחוץ ולבחון האם הוא ממשיך לתמוך בקצב הנקודות הכללי.'
  }

  return 'מומלץ להמשיך לעקוב אחרי פערי בית / חוץ, משום שהנתונים נמצאים באזור ביניים ולא מייצרים כרגע דגל חד.'
}

function buildRiskText(data) {
  const betterSide = getBetterSide(data)

  if (!data.hasEnoughData) {
    return ''
  }

  if (hasSystemicRisk(data)) {
    return 'הבעיה אינה ממוקדת רק בבית או בחוץ: שני המצבים נמוכים ביחס לסף הנדרש.'
  }

  if (data.evaluation.away.isRed) {
    return 'הפער המרכזי נמצא במשחקי החוץ, שבהם קצב צבירת הנקודות נמוך ביחס לרמת היעד.'
  }

  if (data.evaluation.home.isRed) {
    return 'הפער המרכזי נמצא במשחקי הבית, שבהם הקבוצה לא מייצרת בסיס נקודות מספיק יציב.'
  }

  if (data.evaluation.gap.isRed && betterSide === 'home') {
    return 'הפער בין בית לחוץ מצביע על תלות גבוהה במשחקי הבית.'
  }

  if (data.evaluation.gap.isRed && betterSide === 'away') {
    return 'הפער בין חוץ לבית מצביע על חולשה יחסית במשחקי הבית.'
  }

  return ''
}

function getTone(data) {
  if (!data.hasHomeData && !data.hasAwayData) {
    return 'neutral'
  }

  if (!data.hasEnoughData) {
    return 'neutral'
  }

  if (
    data.evaluation.home.isRed ||
    data.evaluation.away.isRed ||
    data.evaluation.gap.isRed
  ) {
    return 'warning'
  }

  if (hasStrongProfile(data)) {
    return 'success'
  }

  return 'primary'
}

function getActionLabel(data) {
  if (!data.hasEnoughData) {
    return 'המשך בדיקה'
  }

  if (
    hasSystemicRisk(data) ||
    data.evaluation.home.isRed ||
    data.evaluation.away.isRed ||
    data.evaluation.gap.isRed
  ) {
    return 'מוקד פעולה'
  }

  if (hasStrongProfile(data)) {
    return 'דגל ירוק'
  }

  return 'המשך פעולה'
}

function buildItems(data) {
  const recommendationText = buildRecommendationText(data)
  const stateText = buildStateText(data)
  const advantageText = buildAdvantageText(data)
  const riskText = buildRiskText(data)

  const actionTone = getTone(data)

  return [
    recommendationText
      ? {
          id: 'action_focus',
          type: 'focus',
          label: getActionLabel(data),
          tone: actionTone,
          text: recommendationText,
        }
      : null,
    {
      id: 'home_away_state',
      type: 'state',
      label: 'תמונת מצב',
      tone: 'primary',
      text: stateText,
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
    riskText
      ? {
          id: 'risk',
          type: 'risk',
          label: 'פער מרכזי',
          tone: 'warning',
          text: riskText,
        }
      : null,
  ].filter(Boolean)
}

export function buildTeamGamesHomeAwayBrief(insights) {
  const data = buildHomeAwayData(insights)
  const sourceLabel =
    insights && insights.calculation && insights.calculation.sourceLabel
      ? insights.calculation.sourceLabel
      : 'נתוני משחקים'

  if (!data.hasHomeData && !data.hasAwayData) {
    return {
      id: 'team_games_home_away_brief',
      sectionId: 'homeAway',
      status: 'empty',
      tone: 'neutral',
      title: 'תובנות בית / חוץ',
      subtitle: 'פילוח לפי מיקום משחק',
      sourceLabel,
      targetLabel: data.targetLabel,
      text: 'אין מספיק נתוני משחקים כדי לבנות תובנות בית / חוץ.',
      items: [],
      metrics: {
        home: data.home,
        away: data.away,
        gap: data.gap,
        absGap: data.absGap,
        overallRate: data.overallRate,
        evaluation: data.evaluation,
      },
      meta: {
        hasEnoughData: false,
        targetLevelId: data.targetLevel?.id || null,
        hasSpecificTargets: data.hasSpecificTargets,
      },
    }
  }

  const items = buildItems(data)
  const primary = items.find((item) => item.id === 'action_focus') || items[0]
  const tone = getTone(data)

  return {
    id: 'team_games_home_away_brief',
    sectionId: 'homeAway',
    status: 'ready',
    tone,
    title: 'תובנות בית / חוץ',
    subtitle: 'פילוח לפי מיקום משחק',
    sourceLabel,
    targetLabel: data.targetLabel,
    text: primary ? primary.text : '',
    items,
    metrics: {
      home: data.home,
      away: data.away,
      gap: data.gap,
      absGap: data.absGap,
      overallRate: data.overallRate,
      evaluation: data.evaluation,
      targets: data.targets,
    },
    meta: {
      hasHomeData: data.hasHomeData,
      hasAwayData: data.hasAwayData,
      hasEnoughData: data.hasEnoughData,
      betterSide: getBetterSide(data),
      targetLevelId: data.targetLevel?.id || null,
      targetLabel: data.targetLabel,
      hasSpecificTargets: data.hasSpecificTargets,
      hasSystemicRisk: hasSystemicRisk(data),
      hasStrongProfile: hasStrongProfile(data),
    },
  }
}
