// shared/games/insights/team/teamGamesSquadBrief.logic.js

import { getTeamGamesScorersTargetsByLevelId } from './team.benchmarks.js'

const ATTACK_WIDE_THRESHOLD = 45
const ATTACK_MEDIUM_THRESHOLD = 30

const LINEUP_STABLE_THRESHOLD = 65
const LINEUP_UNSTABLE_THRESHOLD = 45

const INTEGRATION_WIDE_THRESHOLD = 80
const INTEGRATION_MEDIUM_THRESHOLD = 65

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

  const factor = Math.pow(10, digits)

  return Math.round(n * factor) / factor
}

function calcPercent(value, total) {
  const v = toNumber(value, 0)
  const t = toNumber(total, 0)

  if (!t) {
    return 0
  }

  return Math.round((v / t) * 100)
}

function formatPercent(value) {
  if (!hasNumber(value)) {
    return '—'
  }

  return `${Math.round(Number(value))}%`
}

function formatNumber(value) {
  if (!hasNumber(value)) {
    return '—'
  }

  return String(Math.round(Number(value)))
}

function formatTargetGoals(value) {
  if (!hasNumber(value)) {
    return 'יעד שערי הזכות שהוגדר'
  }

  return `כ־${formatNumber(value)} שערי זכות`
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

function pickArray(source, keys, fallback = []) {
  if (!source) {
    return fallback
  }

  for (const key of keys) {
    const value = source[key]

    if (Array.isArray(value)) {
      return value
    }
  }

  return fallback
}

function getMetricRow(source, id) {
  const rows = source && Array.isArray(source.rows) ? source.rows : []

  return (
    rows.find((row) => {
      return row && row.id === id
    }) || null
  )
}

function pickMetricPct(source, id, fallback) {
  const row = getMetricRow(source, id)

  if (row && hasNumber(row.pct)) {
    return Number(row.pct)
  }

  return fallback
}

function pickMetricCountFromDisplay(source, id, fallback) {
  const row = getMetricRow(source, id)

  if (!row || !row.display) {
    return fallback
  }

  const match = String(row.display).match(/(\d+)\s*\/\s*(\d+)/)

  if (!match) {
    return fallback
  }

  return Number(match[1])
}

function pickMetricTotalFromDisplay(source, id, fallback) {
  const row = getMetricRow(source, id)

  if (!row || !row.display) {
    return fallback
  }

  const match = String(row.display).match(/(\d+)\s*\/\s*(\d+)/)

  if (!match) {
    return fallback
  }

  return Number(match[2])
}

function getTargetProgressValue(targetProgress, key) {
  const rows =
    targetProgress && Array.isArray(targetProgress.rows)
      ? targetProgress.rows
      : []

  const row = rows.find((item) => {
    if (!item) return false

    return item.id === key || item.key === key
  })

  if (!row) return null

  if (row.target !== undefined && row.target !== null) return row.target
  if (row.targetValue !== undefined && row.targetValue !== null) return row.targetValue

  return null
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

function resolveSquadSource(insights) {
  if (!insights) {
    return null
  }

  if (insights.squadMetrics) {
    return insights.squadMetrics
  }

  if (insights.squad) {
    return insights.squad
  }

  if (insights.games && insights.games.squadMetrics) {
    return insights.games.squadMetrics
  }

  if (insights.active && insights.active.squadMetrics) {
    return insights.active.squadMetrics
  }

  return null
}

function resolveScorersSource(insights, source) {
  if (!insights && !source) {
    return null
  }

  return (
    insights?.scorersMetrics ||
    insights?.scorers ||
    insights?.games?.scorersMetrics ||
    insights?.games?.scorers ||
    insights?.active?.scorersMetrics ||
    insights?.active?.scorers ||
    source?.scorersMetrics ||
    source?.scorers ||
    source?.scoringDistribution ||
    null
  )
}

function buildPerformanceContext(insights) {
  const active = insights && insights.active ? insights.active : {}
  const targetProgress = insights && insights.targetProgress ? insights.targetProgress : {}
  const benchmarkLevel = insights && insights.benchmarkLevel ? insights.benchmarkLevel : {}
  const forecastLevel = insights && insights.forecastLevel ? insights.forecastLevel : {}
  const targetLevel = benchmarkLevel?.id ? benchmarkLevel : forecastLevel

  const pointsRate = pickNumber(active, ['pointsRate'], null)
  const projectedTotalPoints = pickNumber(active, ['projectedTotalPoints'], null)
  const projectedGoalsFor = pickNumber(active, ['projectedGoalsFor'], null)

  const targetFromRows = getTargetProgressValue(targetProgress, 'points')
  const targetPoints = hasNumber(targetFromRows)
    ? Number(targetFromRows)
    : pickNumber(targetLevel, ['targetPoints'], null)

  const targetGoalsForFromRows = getTargetProgressValue(targetProgress, 'goalsFor')
  const targetGoalsFor = hasNumber(targetGoalsForFromRows)
    ? Number(targetGoalsForFromRows)
    : pickNumber(targetLevel, ['targetGoalsFor'], null)

  const isOnTarget =
    hasNumber(projectedTotalPoints) &&
    hasNumber(targetPoints) &&
    Number(targetPoints) > 0 &&
    Number(projectedTotalPoints) >= Number(targetPoints) * 0.97

  const isGoalsForOnTarget =
    hasNumber(projectedGoalsFor) &&
    hasNumber(targetGoalsFor) &&
    Number(targetGoalsFor) > 0 &&
    Number(projectedGoalsFor) >= Number(targetGoalsFor) * 0.94

  const isPositive =
    hasNumber(pointsRate) &&
    Number(pointsRate) >= 50

  const isStrong =
    Boolean(isOnTarget || isGoalsForOnTarget || isPositive)

  const isWeak =
    hasNumber(pointsRate) &&
    Number(pointsRate) < 40 &&
    !isOnTarget

  return {
    targetLevel,
    targetLevelId: targetLevel?.id || null,
    targetLabel: getLevelLabel(targetLevel),

    pointsRate,
    projectedTotalPoints,
    projectedGoalsFor,

    targetPoints,
    targetGoalsFor,

    isOnTarget,
    isGoalsForOnTarget,
    isPositive,
    isStrong,
    isWeak,
  }
}

function normalizeSquadMetrics(source) {
  const squadSize =
    pickNumber(source, ['activePlayersCount', 'squadCount', 'playersCount'], 0) ||
    pickMetricTotalFromDisplay(source, 'squadUsedPlayersRate', 0)

  const usedPlayers =
    pickMetricCountFromDisplay(source, 'squadUsedPlayersRate', 0)

  const scorers =
    pickMetricCountFromDisplay(source, 'squadScorersRate', 0)

  const assisters =
    pickMetricCountFromDisplay(source, 'squadAssistersRate', 0)

  const goalContributors =
    pickMetricCountFromDisplay(source, 'squadGoalContributorsRate', 0)

  const starters =
    pickMetricCountFromDisplay(source, 'squadStartersRate', 0)

  const attackingInvolvementPct =
    pickMetricPct(source, 'squadGoalContributorsRate', 0)

  const playerIntegrationPct =
    pickMetricPct(source, 'squadUsedPlayersRate', 0)

  const startersRate =
    pickMetricPct(source, 'squadStartersRate', 0)

  const lineupStabilityPct = Math.max(0, 100 - startersRate)

  const notUsedPlayers = Math.max(squadSize - usedPlayers, 0)

  return {
    squadSize,
    usedPlayers,
    scorers,
    assisters,
    goalContributors,
    starters,
    notUsedPlayers,
    attackingInvolvementPct,
    playerIntegrationPct,
    lineupStabilityPct,
  }
}

function buildScorerRows(source) {
  const rows = pickArray(source, ['rows', 'items', 'players', 'scorersList'], [])

  return rows
    .map((row) => {
      const goals = pickNumber(row, ['goals', 'value', 'count', 'total'], null)

      if (!hasNumber(goals)) return null

      return {
        id: row.id || row.playerId || row.name || row.label,
        name: row.name || row.playerName || row.label || 'שחקן',
        goals: Number(goals),
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.goals - a.goals)
}

function normalizeScorersMetrics(source) {
  const rows = buildScorerRows(source)

  const totalGoalsFromRows = rows.reduce((sum, row) => {
    return sum + toNumber(row.goals, 0)
  }, 0)

  const totalGoals =
    pickNumber(
      source,
      [
        'totalGoalsFromScorers',
        'scorersGoals',
        'goalsFromScorers',
        'totalGoals',
        'goalsFor',
      ],
      totalGoalsFromRows
    ) || totalGoalsFromRows

  const uniqueScorers =
    pickNumber(source, ['uniqueScorers', 'scorers', 'scorersCount'], rows.length) ||
    rows.length

  const oneGoalScorers =
    pickNumber(
      source,
      ['oneGoalScorers', 'oneGoalScorersCount'],
      rows.filter((row) => row.goals === 1).length
    )

  const scorers3Plus =
    pickNumber(
      source,
      ['scorers3Plus', 'threePlusScorers', 'scorersOver3'],
      rows.filter((row) => row.goals >= 3).length
    )

  const scorers5Plus =
    pickNumber(
      source,
      ['scorers5Plus', 'fivePlusScorers', 'scorersOver5'],
      rows.filter((row) => row.goals >= 5).length
    )

  const scorers10Plus =
    pickNumber(
      source,
      ['scorers10Plus', 'tenPlusScorers', 'scorersOver10'],
      rows.filter((row) => row.goals >= 10).length
    )

  const topScorerGoals =
    pickNumber(source, ['topScorerGoals', 'leaderGoals'], rows[0]?.goals || 0)

  const top3ScorersGoals =
    pickNumber(
      source,
      ['top3ScorersGoals', 'topThreeScorersGoals'],
      rows.slice(0, 3).reduce((sum, row) => sum + toNumber(row.goals, 0), 0)
    )

  const topScorerDependencyPct =
    pickNumber(
      source,
      ['topScorerDependencyPct', 'leaderDependencyPct'],
      calcPercent(topScorerGoals, totalGoals)
    )

  const top3DependencyPct =
    pickNumber(
      source,
      ['top3DependencyPct', 'topThreeDependencyPct'],
      calcPercent(top3ScorersGoals, totalGoals)
    )

  const oneGoalScorersPct =
    pickNumber(
      source,
      ['oneGoalScorersPct'],
      calcPercent(oneGoalScorers, uniqueScorers)
    )

  const hasScorersData =
    totalGoals > 0 ||
    uniqueScorers > 0 ||
    rows.length > 0 ||
    scorers3Plus > 0 ||
    scorers5Plus > 0 ||
    scorers10Plus > 0

  return {
    hasScorersData,
    rows,
    totalGoalsFromScorers: totalGoals,
    uniqueScorers,
    oneGoalScorers,
    scorers3Plus,
    scorers5Plus,
    scorers10Plus,
    topScorerGoals,
    top3ScorersGoals,
    topScorerDependencyPct,
    top3DependencyPct,
    oneGoalScorersPct,
  }
}

function evaluateHigherIsBetter(value, target) {
  if (!target || !hasNumber(value)) {
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
    tone: 'neutral',
    isGreen: false,
    isRed: false,
    isWatch: true,
  }
}

function evaluateLowerIsBetter(value, target) {
  if (!target || !hasNumber(value)) {
    return {
      status: 'empty',
      tone: 'neutral',
      isGreen: false,
      isRed: false,
      isWatch: false,
    }
  }

  const n = Number(value)

  if (hasNumber(target.greenMax) && n <= Number(target.greenMax)) {
    return {
      status: 'green',
      tone: 'success',
      isGreen: true,
      isRed: false,
      isWatch: false,
    }
  }

  if (hasNumber(target.redAbove) && n > Number(target.redAbove)) {
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
    tone: 'neutral',
    isGreen: false,
    isRed: false,
    isWatch: true,
  }
}

function buildScorersTargets(performance) {
  const targetLevelId = performance?.targetLevelId
  const targets = getTeamGamesScorersTargetsByLevelId(targetLevelId)

  return targets || null
}

function buildScorersEvaluation(scorers, performance) {
  const targets = buildScorersTargets(performance)

  if (!targets || !scorers?.hasScorersData) {
    return {
      hasTargets: Boolean(targets),
      targets,
      rows: [],
      summary: {
        greenCount: 0,
        redCount: 0,
        warningCount: 0,
        isStrong: false,
        isRisk: false,
      },
    }
  }

  const rows = [
    {
      id: 'uniqueScorers',
      label: 'כובשים שונים',
      value: scorers.uniqueScorers,
      target: targets.uniqueScorers,
      evaluation: evaluateHigherIsBetter(
        scorers.uniqueScorers,
        targets.uniqueScorers
      ),
    },
    {
      id: 'scorers3Plus',
      label: 'שחקנים עם 3+ שערים',
      value: scorers.scorers3Plus,
      target: targets.scorers3Plus,
      evaluation: evaluateHigherIsBetter(
        scorers.scorers3Plus,
        targets.scorers3Plus
      ),
    },
    {
      id: 'scorers5Plus',
      label: 'שחקנים עם 5+ שערים',
      value: scorers.scorers5Plus,
      target: targets.scorers5Plus,
      evaluation: evaluateHigherIsBetter(
        scorers.scorers5Plus,
        targets.scorers5Plus
      ),
    },
    {
      id: 'scorers10Plus',
      label: 'שחקנים עם 10+ שערים',
      value: scorers.scorers10Plus,
      target: targets.scorers10Plus,
      evaluation: evaluateHigherIsBetter(
        scorers.scorers10Plus,
        targets.scorers10Plus
      ),
    },
    {
      id: 'topScorerDependencyPct',
      label: 'תלות בכובש מוביל',
      value: scorers.topScorerDependencyPct,
      suffix: '%',
      target: targets.topScorerDependencyPct,
      evaluation: evaluateLowerIsBetter(
        scorers.topScorerDependencyPct,
        targets.topScorerDependencyPct
      ),
    },
    {
      id: 'top3DependencyPct',
      label: 'תלות טופ 3',
      value: scorers.top3DependencyPct,
      suffix: '%',
      target: targets.top3DependencyPct,
      evaluation: evaluateLowerIsBetter(
        scorers.top3DependencyPct,
        targets.top3DependencyPct
      ),
    },
    {
      id: 'oneGoalScorersPct',
      label: 'כובשים חד־פעמיים',
      value: scorers.oneGoalScorersPct,
      suffix: '%',
      target: targets.oneGoalScorersPct,
      evaluation: evaluateLowerIsBetter(
        scorers.oneGoalScorersPct,
        targets.oneGoalScorersPct
      ),
    },
  ]

  const greenCount = rows.filter((row) => row.evaluation.isGreen).length
  const redCount = rows.filter((row) => row.evaluation.isRed).length
  const warningCount = rows.filter((row) => {
    return row.evaluation.isRed || row.evaluation.isWatch
  }).length

  return {
    hasTargets: true,
    targets,
    rows,
    summary: {
      greenCount,
      redCount,
      warningCount,
      isStrong: redCount === 0 && greenCount >= 4,
      isRisk: redCount >= 2,
    },
  }
}

function getAttackStatus(metrics) {
  if (metrics.scorersEvaluation?.summary?.isStrong) {
    return 'wide'
  }

  if (metrics.scorersEvaluation?.summary?.isRisk) {
    return 'narrow'
  }

  if (!metrics.usedPlayers && !metrics.squadSize) {
    return 'empty'
  }

  if (metrics.attackingInvolvementPct >= ATTACK_WIDE_THRESHOLD) {
    return 'wide'
  }

  if (metrics.attackingInvolvementPct >= ATTACK_MEDIUM_THRESHOLD) {
    return 'medium'
  }

  return 'narrow'
}

function getLineupStatus(metrics) {
  if (!metrics.usedPlayers || !metrics.starters) {
    return 'empty'
  }

  if (metrics.lineupStabilityPct >= LINEUP_STABLE_THRESHOLD) {
    return 'stable'
  }

  if (metrics.lineupStabilityPct < LINEUP_UNSTABLE_THRESHOLD) {
    return 'unstable'
  }

  return 'medium'
}

function getIntegrationStatus(metrics) {
  if (!metrics.squadSize && !metrics.usedPlayers) {
    return 'empty'
  }

  if (metrics.playerIntegrationPct >= INTEGRATION_WIDE_THRESHOLD) {
    return 'wide'
  }

  if (metrics.playerIntegrationPct >= INTEGRATION_MEDIUM_THRESHOLD) {
    return 'medium'
  }

  return 'limited'
}

function buildScorersBenchmarkText(metrics, performance) {
  const scorers = metrics.scorersProfile
  const targets = metrics.scorersEvaluation?.targets

  if (!scorers?.hasScorersData || !targets) {
    return ''
  }

  const targetLabel = performance.targetLabel || 'היעד שהוגדר'
  const targetGoalsFor = formatTargetGoals(performance.targetGoalsFor)

  return `ליעד ${targetLabel}, נקודת הייחוס היא ${targetGoalsFor}: לפחות ${targets.uniqueScorers.greenMin} כובשים שונים, לפחות ${targets.scorers3Plus.greenMin} שחקנים עם 3+ שערים, לפחות ${targets.scorers5Plus.greenMin} שחקנים עם 5+ שערים ולפחות ${targets.scorers10Plus.greenMin} שחקנים עם 10+ שערים. בפועל יש ${scorers.uniqueScorers} כובשים שונים, ${scorers.scorers3Plus} שחקנים עם 3+ שערים, ${scorers.scorers5Plus} שחקנים עם 5+ שערים ו־${scorers.scorers10Plus} שחקנים עם 10+ שערים.`
}

function buildAttackText(metrics, performance) {
  const status = getAttackStatus(metrics)
  const scorers = metrics.scorersProfile
  const evaluation = metrics.scorersEvaluation
  const benchmarkText = buildScorersBenchmarkText(metrics, performance)

  if (status === 'empty') {
    return 'אין מספיק נתוני סגל כדי להעריך מעורבות התקפית.'
  }

  if (scorers?.hasScorersData && evaluation?.summary?.isStrong) {
    return `${benchmarkText} המשמעות היא שמבנה הכיבוש עומד בפרופיל היעד: יש מספיק כובשים, מספיק שחקנים עם תרומה משמעותית, והתלות בכובשים המרכזיים אינה חריגה.`
  }

  if (scorers?.hasScorersData && evaluation?.summary?.isRisk) {
    return `${benchmarkText} המשמעות היא שמבנה הכיבוש לא עומד בפרופיל היעד: ייתכן שיש כמות כובשים כללית טובה, אבל חסרים כובשים משמעותיים או שקיימת תלות גבוהה מדי בכובשים המרכזיים.`
  }

  if (scorers?.hasScorersData) {
    return `${benchmarkText} המשמעות היא שמבנה הכיבוש נמצא באזור ביניים: חלק מהמדדים עומדים ביעד, אבל עדיין צריך לבדוק האם יש מספיק עומק התקפי כדי לתמוך ביעד הטבלה.`
  }

  if (status === 'wide' && performance.isStrong) {
    return 'פיזור התרומה ההתקפית תומך בביצוע הכללי ומייצר קבוצה עם יותר פתרונות התקפיים וקושי גבוה יותר להתכונן אליה.'
  }

  if (status === 'wide') {
    return 'פיזור התרומה ההתקפית חיובי, אך חשוב לבדוק האם הוא מתורגם לביצוע כללי יציב.'
  }

  if (status === 'medium' && performance.isStrong) {
    return 'הביצוע הכללי חיובי, אך יש מקום להרחיב את מעגל השחקנים המעורבים בשערים כדי להקטין תלות התקפית.'
  }

  if (status === 'medium') {
    return 'מומלץ להרחיב את כמות השחקנים המעורבים בשערים כדי לייצר יותר פתרונות התקפיים.'
  }

  if (performance.isStrong) {
    return 'הביצוע הכללי חיובי, אך התרומה ההתקפית מרוכזת יחסית ועלולה לייצר תלות במספר מצומצם של שחקנים.'
  }

  return 'מומלץ להרחיב את מעגל השחקנים המעורבים בשערים כדי לייצר יותר פתרונות התקפיים ולשפר את הביצוע הכללי.'
}

function buildEvaluationGapText(row) {
  const suffix = row.suffix || ''
  const value = `${formatNumber(row.value)}${suffix}`

  if (row.target?.greenMin !== undefined && row.target?.greenMin !== null) {
    return `${row.label}: בפועל ${value}, יעד לפחות ${row.target.greenMin}${suffix}`
  }

  if (row.target?.greenMax !== undefined && row.target?.greenMax !== null) {
    return `${row.label}: בפועל ${value}, יעד עד ${row.target.greenMax}${suffix}`
  }

  return `${row.label}: בפועל ${value}`
}

function buildAttackDetails(metrics, performance) {
  const details = [
    {
      id: 'attack_state',
      label: 'תמונת מצב',
      text: `${metrics.goalContributors} שחקנים מעורבים ישירות בשערים מתוך ${metrics.usedPlayers || metrics.squadSize} שחקנים ששולבו.`,
    },
    {
      id: 'attack_context',
      label: 'הקשר ביצועי',
      text: performance.isStrong
        ? 'הביצוע הכללי תומך במסקנה שהמעורבות ההתקפית מייצרת ערך מקצועי.'
        : 'המעורבות ההתקפית צריכה להיבחן ביחס ליכולת שלה לשפר את קצב הנקודות הכללי.',
    },
  ]

  const scorers = metrics.scorersProfile
  const targets = metrics.scorersEvaluation?.targets
  const evaluationRows = metrics.scorersEvaluation?.rows || []

  if (scorers?.hasScorersData && targets) {
    details.push({
      id: 'scorers_target_reference',
      label: 'נקודת ייחוס ליעד',
      text: `ליעד ${performance.targetLabel || 'שהוגדר'} נדרשים ${formatTargetGoals(
        performance.targetGoalsFor
      )}, לפחות ${targets.uniqueScorers.greenMin} כובשים שונים, ${targets.scorers3Plus.greenMin} שחקנים עם 3+ שערים, ${targets.scorers5Plus.greenMin} שחקנים עם 5+ שערים ו־${targets.scorers10Plus.greenMin} שחקנים עם 10+ שערים.`,
    })

    details.push({
      id: 'scorers_actual_profile',
      label: 'בפועל',
      text: `בפועל יש ${scorers.uniqueScorers} כובשים שונים, ${scorers.scorers3Plus} שחקנים עם 3+ שערים, ${scorers.scorers5Plus} שחקנים עם 5+ שערים ו־${scorers.scorers10Plus} שחקנים עם 10+ שערים. תלות בכובש מוביל: ${formatPercent(
        scorers.topScorerDependencyPct
      )}; תלות טופ 3: ${formatPercent(scorers.top3DependencyPct)}.`,
    })
  }

  if (evaluationRows.length) {
    const gaps = evaluationRows
      .filter((row) => row.evaluation.isRed)
      .map(buildEvaluationGapText)

    const strengths = evaluationRows
      .filter((row) => row.evaluation.isGreen)
      .map(buildEvaluationGapText)

    if (gaps.length) {
      details.push({
        id: 'scorers_gap',
        label: 'פער מול נקודת ייחוס',
        text: gaps.join(' · '),
      })
    }

    if (strengths.length) {
      details.push({
        id: 'scorers_strength',
        label: 'עמידה ביעד',
        text: strengths.join(' · '),
      })
    }
  }

  return details
}

function buildLineupText(metrics, performance) {
  const status = getLineupStatus(metrics)

  if (status === 'empty') {
    return 'אין מספיק נתוני הרכב כדי להעריך יציבות הרכב.'
  }

  if (status === 'stable' && performance.isStrong) {
    return 'יציבות ההרכב תומכת בביצוע הכללי ומצביעה על בסיס מקצועי ברור.'
  }

  if (status === 'stable') {
    return 'ההרכב יציב יחסית, אך חשוב לבדוק האם הבסיס הקבוע אכן מקדם את הביצוע הכללי.'
  }

  if (status === 'unstable' && performance.isStrong) {
    return 'הביצוע הכללי חיובי למרות תחלופה בהרכב; מומלץ לבדוק האם מדובר ברוטציה מנוהלת או בחוסר יציבות.'
  }

  if (status === 'unstable') {
    return 'מומלץ לבחון האם ריבוי השינויים בהרכב פוגע בחיבור הקבוצתי ובביצוע הכללי.'
  }

  return 'יציבות ההרכב נמצאת באזור ביניים; מומלץ להמשיך לבדוק האם הרוטציה תורמת או פוגעת בביצוע הכללי.'
}

function buildLineupDetails(metrics, performance) {
  return [
    {
      id: 'lineup_state',
      label: 'תמונת מצב',
      text: `${metrics.starters} שחקנים פתחו בהרכב מתוך ${metrics.usedPlayers} שחקנים ששולבו.`,
    },
    {
      id: 'lineup_context',
      label: 'הקשר ביצועי',
      text: performance.isStrong
        ? 'ביצוע כללי חיובי מאפשר לבדוק האם יציבות ההרכב היא חלק מהיתרון המקצועי.'
        : 'כאשר הביצוע הכללי אינו מספיק יציב, תחלופה בהרכב יכולה להיות גורם מרכזי לבדיקה.',
    },
  ]
}

function buildIntegrationText(metrics, performance) {
  const status = getIntegrationStatus(metrics)

  if (status === 'empty') {
    return 'אין מספיק נתוני סגל כדי להעריך שילוב שחקנים.'
  }

  if (status === 'wide' && performance.isStrong) {
    return 'שילוב רחב של שחקנים תומך בביצוע הכללי ומייצר עומק תחרותי לאורך העונה.'
  }

  if (status === 'wide') {
    return 'השילוב הרחב חיובי, אך צריך לבדוק האם הוא מתורגם להמשכיות ולביצוע כללי יציב.'
  }

  if (status === 'limited' && performance.isStrong) {
    return 'הביצוע הכללי חיובי, אך השימוש בסגל מצומצם יחסית; מומלץ לבדוק עומס ותלות בשחקני מפתח.'
  }

  if (status === 'limited') {
    return 'מומלץ להרחיב בהדרגה את שילוב השחקנים כדי לייצר עומק, תחרות פנימית ואפשרויות לשיפור הביצוע הכללי.'
  }

  return 'שילוב השחקנים נמצא באזור ביניים; מומלץ לבדוק האם הוא מייצר עומק תחרותי ותומך בביצוע הכללי.'
}

function buildIntegrationDetails(metrics, performance) {
  return [
    {
      id: 'integration_state',
      label: 'תמונת מצב',
      text: `${metrics.usedPlayers} שחקנים שולבו מתוך ${metrics.squadSize} שחקני סגל פעילים.`,
    },
    {
      id: 'integration_context',
      label: 'הקשר ביצועי',
      text: performance.isStrong
        ? 'ביצוע כללי חיובי מאפשר לראות בשילוב רחב יתרון של עומק ולא רק רוטציה.'
        : 'כאשר הביצוע הכללי פחות יציב, צריך לבדוק האם שילוב השחקנים תורם להמשכיות או פוגע בה.',
    },
  ]
}

function getAttackTone(metrics, performance) {
  const status = getAttackStatus(metrics)

  if (status === 'empty') return 'neutral'
  if (metrics.scorersEvaluation?.summary?.isStrong) return 'success'
  if (metrics.scorersEvaluation?.summary?.isRisk) return 'warning'
  if (status === 'wide' && performance.isStrong) return 'success'
  if (status === 'narrow') return 'warning'

  return 'neutral'
}

function getLineupTone(metrics, performance) {
  const status = getLineupStatus(metrics)

  if (status === 'empty') return 'neutral'
  if (status === 'stable' && performance.isStrong) return 'success'
  if (status === 'unstable' && !performance.isStrong) return 'warning'

  return 'neutral'
}

function getIntegrationTone(metrics, performance) {
  const status = getIntegrationStatus(metrics)

  if (status === 'empty') return 'neutral'
  if (status === 'wide' && performance.isStrong) return 'success'
  if (status === 'limited') return 'warning'

  return 'neutral'
}

function getLabelByTone(tone) {
  if (tone === 'warning') {
    return 'מוקד פעולה'
  }

  if (tone === 'success') {
    return 'המשך פעולה'
  }

  return 'המשך בדיקה'
}

function buildItems(metrics, performance) {
  const attackTone = getAttackTone(metrics, performance)
  const lineupTone = getLineupTone(metrics, performance)
  const integrationTone = getIntegrationTone(metrics, performance)

  return [
    {
      id: 'attacking_involvement',
      type: 'attacking',
      label: 'מעורבות התקפית',
      actionLabel: getLabelByTone(attackTone),
      tone: attackTone,
      value: metrics.scorersProfile?.hasScorersData
        ? `${metrics.scorersProfile.uniqueScorers} כובשים`
        : formatPercent(metrics.attackingInvolvementPct),
      text: buildAttackText(metrics, performance),
      details: buildAttackDetails(metrics, performance),
      metrics: {
        scorers: metrics.scorers,
        assisters: metrics.assisters,
        goalContributors: metrics.goalContributors,
        attackingInvolvementPct: metrics.attackingInvolvementPct,
        scorersProfile: metrics.scorersProfile,
        scorersEvaluation: metrics.scorersEvaluation,
      },
    },
    {
      id: 'lineup_stability',
      type: 'lineup',
      label: 'יציבות הרכב',
      actionLabel: getLabelByTone(lineupTone),
      tone: lineupTone,
      value: formatPercent(metrics.lineupStabilityPct),
      text: buildLineupText(metrics, performance),
      details: buildLineupDetails(metrics, performance),
      metrics: {
        starters: metrics.starters,
        usedPlayers: metrics.usedPlayers,
        lineupStabilityPct: metrics.lineupStabilityPct,
      },
    },
    {
      id: 'player_integration',
      type: 'integration',
      label: 'שילוב שחקנים',
      actionLabel: getLabelByTone(integrationTone),
      tone: integrationTone,
      value: formatPercent(metrics.playerIntegrationPct),
      text: buildIntegrationText(metrics, performance),
      details: buildIntegrationDetails(metrics, performance),
      metrics: {
        squadSize: metrics.squadSize,
        usedPlayers: metrics.usedPlayers,
        notUsedPlayers: metrics.notUsedPlayers,
        playerIntegrationPct: metrics.playerIntegrationPct,
      },
    },
  ]
}

function getOverallTone(items) {
  if (items.some((item) => item.tone === 'warning')) {
    return 'warning'
  }

  if (items.some((item) => item.tone === 'success')) {
    return 'success'
  }

  return 'neutral'
}

export function buildTeamGamesSquadBrief(insights) {
  const source = resolveSquadSource(insights)
  const scorersSource = resolveScorersSource(insights, source)
  const performance = buildPerformanceContext(insights)
  const baseMetrics = normalizeSquadMetrics(source)
  const scorersProfile = normalizeScorersMetrics(scorersSource)
  const scorersEvaluation = buildScorersEvaluation(scorersProfile, performance)

  const metrics = {
    ...baseMetrics,
    scorersProfile,
    scorersEvaluation,
  }

  const sourceLabel =
    insights && insights.calculation && insights.calculation.sourceLabel
      ? insights.calculation.sourceLabel
      : 'נתוני משחקים'

  if (!source && !scorersProfile.hasScorersData) {
    return {
      id: 'team_games_squad_brief',
      sectionId: 'squad',
      status: 'empty',
      tone: 'neutral',
      title: 'תובנות הסגל',
      subtitle: 'מעורבות · יציבות · שילוב',
      sourceLabel,
      text: 'אין מספיק נתוני סגל כדי לבנות תובנות.',
      items: [],
      metrics: {},
      meta: {
        hasData: false,
      },
    }
  }

  const items = buildItems(metrics, performance)
  const tone = getOverallTone(items)
  const primary = items.find((item) => item.tone === 'warning') || items[0]

  return {
    id: 'team_games_squad_brief',
    sectionId: 'squad',
    status: 'ready',
    tone,
    title: 'תובנות הסגל',
    subtitle: 'מעורבות · יציבות · שילוב',
    sourceLabel,
    text: primary ? primary.text : '',
    items,
    metrics,
    meta: {
      hasData: true,
      performance,
      targetLevelId: performance.targetLevelId,
      targetLabel: performance.targetLabel,
      targetGoalsFor: performance.targetGoalsFor,
      hasScorersTargets: scorersEvaluation.hasTargets,
    },
  }
}
