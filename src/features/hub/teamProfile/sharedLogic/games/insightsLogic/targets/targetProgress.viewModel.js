// teamProfile/sharedLogic/games/insightsLogic/targets/targetProgress.viewModel.js

import {
  EMPTY,
  toNum,
  toNullableNum,
  round1,
  hasValue,
  resolveProgressColor,
  buildLevelView,
} from '../common/view.shared.js'

const calcHigherProgress = (projected, target) => {
  const p = toNum(projected)
  const t = toNum(target)
  if (!t) return 0

  return Math.round((p / t) * 100)
}

const calcLowerProgress = (projected, target) => {
  const p = toNum(projected)
  const t = toNum(target)
  if (!p) return 0

  return Math.round((t / p) * 100)
}

const resolveTargetStatus = ({ projected, target, direction }) => {
  const p = toNum(projected)
  const t = toNum(target)

  if (!hasValue(target)) return 'missing'

  if (direction === 'lower') {
    if (p <= t) return 'ahead'
    if (p <= t * 1.1) return 'close'
    return 'behind'
  }

  if (p >= t) return 'ahead'
  if (p >= t * 0.9) return 'close'
  return 'behind'
}

const getRankRange = (level = {}) => {
  if (!Array.isArray(level?.rankRange)) {
    return {
      bestRank: null,
      worstRank: null,
    }
  }

  const bestRank = Number(level.rankRange[0])
  const worstRank = Number(level.rankRange[1])

  return {
    bestRank: Number.isFinite(bestRank) ? bestRank : null,
    worstRank: Number.isFinite(worstRank) ? worstRank : null,
  }
}

const resolveForecastColorByExactTarget = ({
  forecastLevel,
  targetPosition,
}) => {
  const targetRank = toNullableNum(targetPosition)

  if (!Number.isFinite(targetRank)) return ''

  const { bestRank, worstRank } = getRankRange(forecastLevel)

  if (!Number.isFinite(bestRank) || !Number.isFinite(worstRank)) {
    return ''
  }

  if (targetRank >= bestRank && targetRank <= worstRank) return 'success'
  if (worstRank < targetRank) return 'success'
  if (bestRank > targetRank) return 'danger'

  return ''
}

const resolveForecastColorByTargetLevel = ({
  forecastLevel,
  targetLevel,
}) => {
  const forecastRange = getRankRange(forecastLevel)
  const targetRange = getRankRange(targetLevel)

  if (
    !Number.isFinite(forecastRange.bestRank) ||
    !Number.isFinite(forecastRange.worstRank) ||
    !Number.isFinite(targetRange.bestRank) ||
    !Number.isFinite(targetRange.worstRank)
  ) {
    return ''
  }

  if (forecastRange.worstRank <= targetRange.worstRank) {
    return 'success'
  }

  if (forecastRange.bestRank <= targetRange.worstRank) {
    return 'warning'
  }

  return 'danger'
}

const resolveForecastColor = ({
  forecastLevel,
  targetLevel,
  targetPositionMode,
  targetPosition,
}) => {
  if (!forecastLevel) return 'neutral'

  if (targetPositionMode === 'exact') {
    const exactColor = resolveForecastColorByExactTarget({
      forecastLevel,
      targetPosition,
    })

    if (exactColor) return exactColor
  }

  const levelColor = resolveForecastColorByTargetLevel({
    forecastLevel,
    targetLevel,
  })

  if (levelColor) return levelColor

  return 'neutral'
}

const resolveMismatchSeverity = (sync = {}) => {
  const gaps = sync?.gaps || {}

  const pointsGap = Math.abs(toNum(gaps?.points))
  const goalsForGap = Math.abs(toNum(gaps?.goalsFor))
  const goalsAgainstGap = Math.abs(toNum(gaps?.goalsAgainst))

  if (pointsGap >= 6 || goalsForGap >= 8 || goalsAgainstGap >= 8) return 'high'
  if (pointsGap >= 3 || goalsForGap >= 4 || goalsAgainstGap >= 4) return 'medium'
  if (pointsGap > 0 || goalsForGap > 0 || goalsAgainstGap > 0) return 'low'

  return 'none'
}

const buildReliability = ({
  source = {},
  calculation = {},
  coverage = {},
  sync = {},
}) => {
  const mismatchSeverity = resolveMismatchSeverity(sync)
  const isGamesSource = source?.source === 'games'

  if (isGamesSource) {
    const played = coverage?.played || {}

    return {
      id: played?.isFull ? 'gamesFullCoverage' : 'gamesPartialCoverage',
      label: played?.label || 'נתוני משחקים',
      sourceLabel: calculation?.sourceLabel || 'נתוני משחקים',
      description:
        played?.text ||
        'החישוב מבוסס על המשחקים שקיימים בדאטה בלבד',
      color: played?.color || 'primary',
      icon: played?.isFull ? 'verified' : 'info',
      mismatchSeverity,
    }
  }

  return {
    id: 'teamOfficialData',
    label: 'נתוני קבוצה',
    sourceLabel: calculation?.sourceLabel || 'נתוני קבוצה',
    description: 'החישוב מבוסס על נתוני הקבוצה בלבד, ללא ערבוב עם נתוני המשחקים',
    color: source?.isReady ? 'primary' : 'warning',
    icon: source?.isReady ? 'verified' : 'info',
    mismatchSeverity,
  }
}

const buildTargetRow = ({
  id,
  title,
  projected,
  target,
  benchmark,
  direction = 'higher',
  icon,
}) => {
  if (!hasValue(target) && !hasValue(benchmark)) return null

  const actualTarget = hasValue(target) ? target : benchmark

  const progressPct =
    direction === 'lower'
      ? calcLowerProgress(projected, actualTarget)
      : calcHigherProgress(projected, actualTarget)

  const status = resolveTargetStatus({
    projected,
    target: actualTarget,
    direction,
  })

  return {
    id,
    title,
    projected: round1(projected),
    target: hasValue(target) ? round1(target) : null,
    benchmark: hasValue(benchmark) ? round1(benchmark) : null,
    targetSource: hasValue(target) ? 'target' : 'benchmark',
    progressPct,
    status,
    color: resolveProgressColor(progressPct),
    direction,
    icon,
  }
}

const getTargetPositionFromTargets = (targets = {}) => {
  if (hasValue(targets?.targetPosition)) return targets.targetPosition
  if (hasValue(targets?.values?.position)) return targets.values.position

  return null
}

const getTargetPositionModeFromTargets = (targets = {}) => {
  return targets?.targetPositionMode || ''
}

const buildForecast = ({
  source = {},
  calculation = {},
  coverage = {},
  sync = {},
  targets = {},
  forecastLevel = null,
  benchmarkLevel = null,
}) => {
  const targetPositionMode = getTargetPositionModeFromTargets(targets)
  const targetPosition = getTargetPositionFromTargets(targets)

  const level = buildLevelView(forecastLevel)
  const targetLevel = buildLevelView(benchmarkLevel)

  return {
    source: source?.source || calculation?.source || 'team',
    sourceLabel: calculation?.sourceLabel || source?.sourceLabel || '',

    projectedPoints: round1(source?.projectedTotalPoints),
    level,
    targetLevel,

    targetPositionMode,
    targetPosition,

    color: resolveForecastColor({
      forecastLevel,
      targetLevel: benchmarkLevel,
      targetPositionMode,
      targetPosition,
    }),

    coverage,

    reliability: buildReliability({
      source,
      calculation,
      coverage,
      sync,
    }),

    subtitle:
      source?.source === 'games'
        ? 'לפי קצב המשחקים המעודכנים בדאטה'
        : 'לפי קצב נתוני הקבוצה הנוכחיים',
  }
}

export const buildTeamGamesTargetProgress = ({
  source = {},
  calculation = {},
  coverage = {},
  sync = {},
  targets = {},
  benchmarkLevel = null,
  forecastLevel = null,
} = {}) => {
  const values = targets?.values || {}

  const rows = [
    buildTargetRow({
      id: 'points',
      title: 'נקודות',
      projected: source?.projectedTotalPoints,
      target: values?.points,
      benchmark: benchmarkLevel?.targetPoints,
      direction: 'higher',
      icon: 'points',
    }),
    buildTargetRow({
      id: 'goalsFor',
      title: 'שערי זכות',
      projected: source?.projectedGoalsFor,
      target: values?.goalsFor,
      benchmark: benchmarkLevel?.targetGoalsFor,
      direction: 'higher',
      icon: 'goal',
    }),
    buildTargetRow({
      id: 'goalsAgainst',
      title: 'שערי חובה',
      projected: source?.projectedGoalsAgainst,
      target: values?.goalsAgainst,
      benchmark: benchmarkLevel?.targetGoalsAgainst,
      direction: 'lower',
      icon: 'defense',
    }),
  ].filter(Boolean)

  return {
    hasTargets: Boolean(targets?.hasTargets || rows.length),
    forecast: buildForecast({
      source,
      calculation,
      coverage,
      sync,
      targets,
      forecastLevel,
      benchmarkLevel,
    }),
    rows,
    emptyText: EMPTY,
  }
}
