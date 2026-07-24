// src/features/coreData/resolvers/builders/teamPerformance.builder.js

const safeNum = (v, fallback = 0) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

const safeArr = (v) => (Array.isArray(v) ? v : [])

function pickFirstNumber(...values) {
  for (const value of values) {
    const n = Number(value)
    if (Number.isFinite(n)) return n
  }

  return 0
}

function calcGap(current, target, direction = 'higher') {
  if (target === null || target === undefined || target === '') return null

  const c = safeNum(current)
  const t = safeNum(target)
  const diff = c - t

  return {
    current: c,
    target: t,
    diff,
    absDiff: Math.abs(diff),
    direction,
    isMet: direction === 'lower' ? c <= t : c >= t,
  }
}

export function buildTeamPerformanceState({
  team = {},
  teamGames = [],
  teamFullStats = null,
  targets = {},
} = {}) {
  const gamesList = safeArr(teamGames)

  const gamesCount = pickFirstNumber(
    teamFullStats?.gamesCount,
    teamFullStats?.games,
    gamesList.length
  )

  const points = pickFirstNumber(
    teamFullStats?.points,
    team?.points
  )

  const goalsFor = pickFirstNumber(
    teamFullStats?.goalsFor,
    teamFullStats?.gf,
    team?.leagueGoalsFor
  )

  const goalsAgainst = pickFirstNumber(
    teamFullStats?.goalsAgainst,
    teamFullStats?.ga,
    team?.leagueGoalsAgainst
  )

  const goalDifference = goalsFor - goalsAgainst

  const successRateFromStats = Number(teamFullStats?.successRate)
  const maxPoints = gamesCount > 0 ? gamesCount * 3 : 0

  const successRate = Number.isFinite(successRateFromStats)
    ? Math.round(successRateFromStats)
    : maxPoints > 0
      ? Math.round((points / maxPoints) * 100)
      : 0

  const position = team?.leaguePosition ?? null
  const values = targets?.values || {}

  const gaps = {
    position: calcGap(position, values.position, 'lower'),
    points: calcGap(points, values.points, 'higher'),
    successRate: calcGap(successRate, values.successRate, 'higher'),
    goalsFor: calcGap(goalsFor, values.goalsFor, 'higher'),
    goalsAgainst: calcGap(goalsAgainst, values.goalsAgainst, 'lower'),
  }

  const metCount = Object.values(gaps).filter((gap) => gap?.isMet === true).length
  const activeCount = Object.values(gaps).filter(Boolean).length

  return {
    current: {
      position,
      points,
      successRate,
      goalsFor,
      goalsAgainst,
      goalDifference,
      gamesCount,
    },

    targets: values,

    gaps,

    summary: {
      hasTargets: Boolean(targets?.hasTargets),
      activeTargetsCount: activeCount,
      metTargetsCount: metCount,
      missingTargetsCount: Math.max(0, activeCount - metCount),
    },

    source: {
      hasTeamFullStats: Boolean(teamFullStats),
      updatedFrom: 'teamPerformanceState',
    },
  }
}
