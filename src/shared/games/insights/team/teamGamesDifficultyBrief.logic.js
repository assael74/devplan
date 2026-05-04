// shared/games/insights/team/teamGamesDifficultyBrief.logic.js

import { getTeamGamesDifficultyTargetsByLevelId } from './team.benchmarks.js'

const MIN_GAMES_FOR_STRONG_INSIGHT = 2

const FALLBACK_DIFFICULTY_TARGETS = {
  easy: { targetRate: 60 },
  equal: { targetRate: 45 },
  hard: { targetRate: 25 },
}

const DIFFICULTY_DEVIATION_RULES = {
  easy: {
    greenMin: 5,
    neutralMin: -2,
    orangeMin: -6,
    redMin: -12,
    strongRedBelow: -13,
  },
  equal: {
    greenMin: 6,
    neutralMin: -3,
    orangeMin: -8,
    redMin: -14,
    strongRedBelow: -15,
  },
  hard: {
    greenMin: 7,
    neutralMin: -5,
    orangeMin: -10,
    redMin: -17,
    strongRedBelow: -18,
  },
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

function formatSignedPercent(value) {
  if (!hasNumber(value)) {
    return '—'
  }

  const n = Math.round(Number(value))
  const sign = n > 0 ? '+' : ''

  return `${sign}${n}%`
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

function normalizeDifficultyKey(value) {
  const key = String(value || '').trim().toLowerCase()

  if (
    key === 'easy' ||
    key === 'low' ||
    key === 'weak' ||
    key === 'קל' ||
    key === 'רמה קלה' ||
    key === 'easy_game'
  ) {
    return 'easy'
  }

  if (
    key === 'equal' ||
    key === 'medium' ||
    key === 'same' ||
    key === 'balanced' ||
    key === 'שווה' ||
    key === 'אותה רמה' ||
    key === 'רמה שווה' ||
    key === 'equal_game'
  ) {
    return 'equal'
  }

  if (
    key === 'hard' ||
    key === 'high' ||
    key === 'strong' ||
    key === 'קשה' ||
    key === 'רמה קשה' ||
    key === 'hard_game'
  ) {
    return 'hard'
  }

  return key
}

function getBucketFromArray(rows, wantedKey) {
  if (!Array.isArray(rows)) {
    return null
  }

  return (
    rows.find((row) => {
      const key = normalizeDifficultyKey(
        row && (row.id || row.key || row.type || row.label || row.title)
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
    const normalizedKey = normalizeDifficultyKey(key)

    if (normalizedKey === wantedKey) {
      return source[key]
    }
  }

  return null
}

function getDifficultyBucket(source, wantedKey) {
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

  if (source && Array.isArray(source.cards)) {
    return getBucketFromArray(source.cards, wantedKey)
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
      color: 'neutral',
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
    ['pointsRate', 'pointsPct', 'rate', 'percent', 'pct'],
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
    color: bucket.color || 'neutral',
  }
}

function resolveDifficultySource(insights) {
  if (!insights) {
    return null
  }

  if (insights.difficultyProjection && insights.difficultyProjection.current) {
    return insights.difficultyProjection.current
  }

  if (insights.difficultyProjection) {
    return insights.difficultyProjection
  }

  if (insights.difficulty && insights.difficulty.current) {
    return insights.difficulty.current
  }

  if (insights.difficulty) {
    return insights.difficulty
  }

  if (
    insights.games &&
    insights.games.difficultyProjection &&
    insights.games.difficultyProjection.current
  ) {
    return insights.games.difficultyProjection.current
  }

  if (insights.games && insights.games.difficultyProjection) {
    return insights.games.difficultyProjection
  }

  if (
    insights.games &&
    insights.games.grouped &&
    insights.games.grouped.byDifficulty
  ) {
    return insights.games.grouped.byDifficulty
  }

  if (
    insights.active &&
    insights.active.grouped &&
    insights.active.grouped.byDifficulty
  ) {
    return insights.active.grouped.byDifficulty
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
  const targets = getTeamGamesDifficultyTargetsByLevelId(targetLevel?.id)

  return {
    targetLevel,
    targetLabel: getLevelLabel(targetLevel),
    targets: targets || FALLBACK_DIFFICULTY_TARGETS,
    hasSpecificTargets: Boolean(targets),
  }
}

function getReliability(games) {
  const count = toNumber(games, 0)

  if (count <= 0) {
    return {
      id: 'none',
      label: 'אין נתונים',
      tone: 'neutral',
      canUseStrongFlag: false,
      caution: true,
    }
  }

  if (count <= 2) {
    return {
      id: 'low',
      label: 'מדגם נמוך',
      tone: 'neutral',
      canUseStrongFlag: false,
      caution: true,
    }
  }

  if (count <= 4) {
    return {
      id: 'medium',
      label: 'מדגם זהיר',
      tone: 'primary',
      canUseStrongFlag: false,
      caution: true,
    }
  }

  if (count <= 7) {
    return {
      id: 'normal',
      label: 'מדגם רגיל',
      tone: 'primary',
      canUseStrongFlag: true,
      caution: false,
    }
  }

  return {
    id: 'high',
    label: 'מדגם גבוה',
    tone: 'success',
    canUseStrongFlag: true,
    caution: false,
  }
}

function evaluateDeviation({ id, actualRate, targetRate, games }) {
  const reliability = getReliability(games)

  if (!hasNumber(actualRate) || !hasNumber(targetRate) || games <= 0) {
    return {
      status: 'empty',
      label: 'אין נתונים',
      tone: 'neutral',
      targetRate,
      actualRate,
      deviation: null,
      reliability,
      isGreen: false,
      isOrange: false,
      isRed: false,
      isStrong: false,
      isNegative: false,
      isPositive: false,
    }
  }

  const rules = DIFFICULTY_DEVIATION_RULES[id] || DIFFICULTY_DEVIATION_RULES.equal
  const deviation = round(Number(actualRate) - Number(targetRate), 1)

  if (deviation >= rules.greenMin) {
    return {
      status: reliability.canUseStrongFlag && deviation >= rules.greenMin + 5
        ? 'strong_green'
        : 'green',
      label: reliability.canUseStrongFlag && deviation >= rules.greenMin + 5
        ? 'ירוק חזק'
        : 'ירוק',
      tone: 'success',
      targetRate,
      actualRate,
      deviation,
      reliability,
      isGreen: true,
      isOrange: false,
      isRed: false,
      isStrong: reliability.canUseStrongFlag && deviation >= rules.greenMin + 5,
      isNegative: false,
      isPositive: true,
    }
  }

  if (deviation >= rules.neutralMin) {
    return {
      status: 'neutral',
      label: 'תקין',
      tone: 'neutral',
      targetRate,
      actualRate,
      deviation,
      reliability,
      isGreen: false,
      isOrange: false,
      isRed: false,
      isStrong: false,
      isNegative: false,
      isPositive: false,
    }
  }

  if (deviation >= rules.orangeMin) {
    return {
      status: 'orange',
      label: 'כתום',
      tone: 'warning',
      targetRate,
      actualRate,
      deviation,
      reliability,
      isGreen: false,
      isOrange: true,
      isRed: false,
      isStrong: false,
      isNegative: true,
      isPositive: false,
    }
  }

  if (deviation >= rules.redMin) {
    return {
      status: 'red',
      label: 'אדום',
      tone: 'danger',
      targetRate,
      actualRate,
      deviation,
      reliability,
      isGreen: false,
      isOrange: false,
      isRed: true,
      isStrong: false,
      isNegative: true,
      isPositive: false,
    }
  }

  return {
    status:
      reliability.canUseStrongFlag && deviation <= rules.strongRedBelow
        ? 'strong_red'
        : 'red',
    label:
      reliability.canUseStrongFlag && deviation <= rules.strongRedBelow
        ? 'אדום חזק'
        : 'אדום',
    tone: 'danger',
    targetRate,
    actualRate,
    deviation,
    reliability,
    isGreen: false,
    isOrange: false,
    isRed: true,
    isStrong: reliability.canUseStrongFlag && deviation <= rules.strongRedBelow,
    isNegative: true,
    isPositive: false,
  }
}

function enrichBucket(bucket, targetState) {
  const targetRate = targetState?.targets?.[bucket.id]?.targetRate

  const evaluation = evaluateDeviation({
    id: bucket.id,
    actualRate: bucket.pointsRate,
    targetRate,
    games: bucket.games,
  })

  return {
    ...bucket,
    targetRate,
    deviation: evaluation.deviation,
    evaluation,
  }
}

function buildDifficultyData(insights) {
  const source = resolveDifficultySource(insights)
  const targetState = resolveTargets(insights)

  const easy = normalizeBucket(getDifficultyBucket(source, 'easy'))
  const equal = normalizeBucket(getDifficultyBucket(source, 'equal'))
  const hard = normalizeBucket(getDifficultyBucket(source, 'hard'))

  const buckets = [
    enrichBucket(
      {
        id: 'easy',
        label: 'רמה קלה',
        shortLabel: 'קלות',
        meaning: 'ניצול יתרון',
        ...easy,
      },
      targetState
    ),
    enrichBucket(
      {
        id: 'equal',
        label: 'אותה רמה',
        shortLabel: 'שוות',
        meaning: 'תחרותיות ישירה',
        ...equal,
      },
      targetState
    ),
    enrichBucket(
      {
        id: 'hard',
        label: 'רמה קשה',
        shortLabel: 'קשות',
        meaning: 'התמודדות עם קושי גבוה',
        ...hard,
      },
      targetState
    ),
  ]

  const available = buckets.filter((bucket) => bucket.games > 0)
  const totalGames = available.reduce((sum, bucket) => sum + bucket.games, 0)

  const rates = available.map((bucket) => bucket.pointsRate)
  const maxRate = rates.length ? Math.max(...rates) : 0
  const minRate = rates.length ? Math.min(...rates) : 0
  const gap = round(maxRate - minRate, 1)

  const best = available.reduce((bestBucket, bucket) => {
    if (!bestBucket) return bucket
    return bucket.pointsRate > bestBucket.pointsRate ? bucket : bestBucket
  }, null)

  const worst = available.reduce((worstBucket, bucket) => {
    if (!worstBucket) return bucket
    return bucket.pointsRate < worstBucket.pointsRate ? bucket : worstBucket
  }, null)

  const strongestPositive = available.reduce((bestBucket, bucket) => {
    if (!bucket?.evaluation?.isPositive) return bestBucket
    if (!bestBucket) return bucket
    return bucket.deviation > bestBucket.deviation ? bucket : bestBucket
  }, null)

  const strongestNegative = available.reduce((worstBucket, bucket) => {
    if (!bucket?.evaluation?.isNegative) return worstBucket
    if (!worstBucket) return bucket
    return bucket.deviation < worstBucket.deviation ? bucket : worstBucket
  }, null)

  return {
    source,
    easy: buckets[0],
    equal: buckets[1],
    hard: buckets[2],
    buckets,
    available,
    best,
    worst,
    strongestPositive,
    strongestNegative,
    totalGames,
    gap,
    absGap: Math.abs(gap),

    targetLevel: targetState.targetLevel,
    targetLabel: targetState.targetLabel,
    targets: targetState.targets,
    hasSpecificTargets: targetState.hasSpecificTargets,

    hasEasyData: easy.games > 0,
    hasEqualData: equal.games > 0,
    hasHardData: hard.games > 0,
    hasAnyData: totalGames > 0,
    hasEnoughData: available.some((bucket) => {
      return bucket.games >= MIN_GAMES_FOR_STRONG_INSIGHT
    }),
    hasFullProfile: available.length >= 2,
  }
}

function getCoreIssue(data) {
  if (!data.hasAnyData) {
    return null
  }

  if (!data.hasEnoughData) {
    return 'sample'
  }

  if (!data.strongestNegative) {
    return 'stable'
  }

  if (data.strongestNegative.id === 'easy') {
    return 'easy_drop'
  }

  if (data.strongestNegative.id === 'equal') {
    return 'equal_gap'
  }

  if (data.strongestNegative.id === 'hard') {
    return 'hard_gap'
  }

  return 'profile_gap'
}

function buildBucketStatePart(bucket) {
  return `${bucket.label}: ${formatPercent(bucket.pointsRate)} מול יעד ${formatPercent(
    bucket.targetRate
  )} (${formatSignedPercent(bucket.deviation)})`
}

function buildStateText(data) {
  if (!data.hasAnyData) {
    return 'אין מספיק נתוני משחקים כדי לבנות תמונת רמת יריבה.'
  }

  if (!data.hasFullProfile) {
    const only = data.available[0]

    if (!only) {
      return 'קיימים נתונים חלקיים בלבד לפי רמת יריבה.'
    }

    return `קיימים נתונים בעיקר מול יריבות ב${only.label}: ${formatPercent(
      only.pointsRate
    )} מול יעד ${formatPercent(only.targetRate)}, סטייה של ${formatSignedPercent(
      only.deviation
    )}.`
  }

  const parts = data.available.map(buildBucketStatePart)

  return `קצב צבירת הנקודות לפי רמת יריבה: ${parts.join(
    ' · '
  )}. הפער בין אחוזי ההצלחה הוא ${formatNumber(data.absGap, 1)} נקודות אחוז.`
}

function buildAdvantageText(data) {
  const positive = data.strongestPositive

  if (!positive) {
    return ''
  }

  if (positive.id === 'hard') {
    return `הקבוצה מציגה ביצוע חיובי מול יריבות חזקות: ${formatPercent(
      positive.pointsRate
    )} מול יעד ${formatPercent(positive.targetRate)}. זה סימן ליכולת להתמודד עם קושי גבוה.`
  }

  if (positive.id === 'equal') {
    return `הקבוצה מעל היעד מול יריבות ברמה דומה. זהו סימן חיובי בתחרות הישירה על אזור הטבלה.`
  }

  if (positive.id === 'easy') {
    return `הקבוצה מנצלת היטב משחקים מול יריבות מתחת לרמה, עם סטייה חיובית של ${formatSignedPercent(
      positive.deviation
    )} מעל נקודת הייחוס.`
  }

  return ''
}

function buildRiskText(data) {
  const issue = getCoreIssue(data)
  const negative = data.strongestNegative

  if (!negative) {
    return ''
  }

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

function buildRecommendationText(data) {
  const issue = getCoreIssue(data)
  const negative = data.strongestNegative
  const positive = data.strongestPositive

  if (!data.hasAnyData) {
    return ''
  }

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

function getTone(data) {
  const issue = getCoreIssue(data)

  if (!data.hasAnyData || issue === 'sample') {
    return 'neutral'
  }

  if (
    issue === 'easy_drop' ||
    issue === 'equal_gap' ||
    issue === 'hard_gap' ||
    issue === 'profile_gap'
  ) {
    return 'warning'
  }

  if (data.strongestPositive) {
    return 'success'
  }

  return 'neutral'
}

function getActionLabel(data) {
  const issue = getCoreIssue(data)

  if (!data.hasAnyData || issue === 'sample') {
    return 'המשך בדיקה'
  }

  if (
    issue === 'easy_drop' ||
    issue === 'equal_gap' ||
    issue === 'hard_gap' ||
    issue === 'profile_gap'
  ) {
    return 'מוקד פעולה'
  }

  if (data.strongestPositive) {
    return 'המשך פעולה'
  }

  return 'המשך בדיקה'
}

function buildReliabilityText(data) {
  const cautious = data.available.filter((bucket) => {
    return bucket?.evaluation?.reliability?.caution
  })

  if (!cautious.length) {
    return ''
  }

  const labels = cautious.map((bucket) => bucket.label).join(', ')

  return `יש להתייחס לדגל בזהירות, משום שכמות המשחקים בקטגוריות ${labels} נמוכה יחסית.`
}

function buildItems(data) {
  const recommendationText = buildRecommendationText(data)
  const stateText = buildStateText(data)
  const advantageText = buildAdvantageText(data)
  const riskText = buildRiskText(data)
  const reliabilityText = buildReliabilityText(data)
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
      id: 'difficulty_state',
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
    reliabilityText
      ? {
          id: 'reliability',
          type: 'reliability',
          label: 'אמינות המדד',
          tone: 'neutral',
          text: reliabilityText,
        }
      : null,
  ].filter(Boolean)
}

export function buildTeamGamesDifficultyBrief(insights) {
  const data = buildDifficultyData(insights)
  const sourceLabel =
    insights && insights.calculation && insights.calculation.sourceLabel
      ? insights.calculation.sourceLabel
      : 'נתוני משחקים'

  if (!data.hasAnyData) {
    return {
      id: 'team_games_difficulty_brief',
      sectionId: 'difficulty',
      status: 'empty',
      tone: 'neutral',
      title: 'תובנות רמת יריבה',
      subtitle: 'פילוח לפי רמת קושי',
      sourceLabel,
      targetLabel: data.targetLabel,
      text: 'אין מספיק נתוני משחקים כדי לבנות תובנות לפי רמת יריבה.',
      items: [],
      metrics: {
        easy: data.easy,
        equal: data.equal,
        hard: data.hard,
        gap: data.gap,
        targets: data.targets,
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
    id: 'team_games_difficulty_brief',
    sectionId: 'difficulty',
    status: 'ready',
    tone,
    title: 'תובנות רמת יריבה',
    subtitle: 'פילוח לפי רמת קושי',
    sourceLabel,
    targetLabel: data.targetLabel,
    text: primary ? primary.text : '',
    items,
    metrics: {
      easy: data.easy,
      equal: data.equal,
      hard: data.hard,
      buckets: data.buckets,
      gap: data.gap,
      absGap: data.absGap,
      targets: data.targets,
    },
    meta: {
      hasEasyData: data.hasEasyData,
      hasEqualData: data.hasEqualData,
      hasHardData: data.hasHardData,
      hasEnoughData: data.hasEnoughData,
      hasFullProfile: data.hasFullProfile,
      bestSide: data.best ? data.best.id : null,
      weakSide: data.worst ? data.worst.id : null,
      strongestPositiveSide: data.strongestPositive ? data.strongestPositive.id : null,
      strongestNegativeSide: data.strongestNegative ? data.strongestNegative.id : null,
      coreIssue: getCoreIssue(data),
      targetLevelId: data.targetLevel?.id || null,
      targetLabel: data.targetLabel,
      hasSpecificTargets: data.hasSpecificTargets,
    },
  }
}
