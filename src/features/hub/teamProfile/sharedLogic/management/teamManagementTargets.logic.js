// teamProfile/sharedLogic/management/teamManagementTargets.logic.js

const safeNum = (v, fallback = 0) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

export function calcActualSuccessRate(pointsValue, leagueRoundValue) {
  const points = Number(pointsValue)
  const leagueRound = Number(leagueRoundValue)

  if (!Number.isFinite(points) || !Number.isFinite(leagueRound) || leagueRound <= 0) {
    return ''
  }

  return Math.round((points / (leagueRound * 3)) * 100)
}

export function calcAchievementRate(actual, target, direction = 'higher') {
  const a = Number(actual)
  const t = Number(target)

  if (!Number.isFinite(a) || !Number.isFinite(t) || t <= 0) return ''

  const raw =
    direction === 'lower'
      ? (t / Math.max(a, 1)) * 100
      : (a / t) * 100

  return Math.min(100, Math.round(raw))
}

export function buildTargetsSummary(team) {
  const summary = team?.teamPerformance?.summary || {}
  const hasTargets = Boolean(team?.targets?.hasTargets)

  return {
    hasTargets,
    activeTargetsCount: safeNum(summary.activeTargetsCount),
    metTargetsCount: safeNum(summary.metTargetsCount),
  }
}
