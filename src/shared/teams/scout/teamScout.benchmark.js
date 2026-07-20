// src/shared/teams/scout/teamScout.benchmark.js

export const TEAM_SCOUT_BENCHMARK_DEFAULTS = {
  baselineGames: 30,
  fallbackLevel: 4,
  lastDistinctPosition: 16,
}

const buildRows = ({ pointsPerGame, goalsForPerGame, goalsAgainstPerGame }) => {
  return pointsPerGame.map((value, index) => {
    const position = index + 1

    return {
      position,
      pointsPerGame: value,
      goalsForPerGame: goalsForPerGame[index],
      goalsAgainstPerGame: goalsAgainstPerGame[index],
    }
  })
}

export const TEAM_SCOUT_POSITION_BENCHMARKS_BY_LEVEL = {
  1: buildRows({
    pointsPerGame: [2.48, 2.34, 2.07, 1.82, 1.69, 1.55, 1.46, 1.32, 1.28, 1.21, 1.2, 1.09, 1.05, 0.9, 0.79, 0.62],
    goalsForPerGame: [2.8, 2.63, 2.18, 2.03, 1.83, 1.92, 1.64, 1.51, 1.51, 1.5, 1.46, 1.15, 1.19, 0.96, 0.98, 0.96],
    goalsAgainstPerGame: [0.76, 0.98, 1.03, 1.12, 1.33, 1.49, 1.58, 1.64, 1.71, 1.8, 1.88, 1.94, 2, 2.06, 2.12, 2.55],
  }),
  3: buildRows({
    pointsPerGame: [2.48, 2.27, 2.07, 1.93, 1.76, 1.63, 1.52, 1.38, 1.34, 1.29, 1.22, 1.18, 0.96, 0.82, 0.75, 0.63],
    goalsForPerGame: [3.23, 2.7, 2.39, 2.2, 1.86, 1.87, 1.86, 1.56, 1.77, 1.96, 1.61, 1.43, 1.22, 1.41, 1.07, 1.18],
    goalsAgainstPerGame: [0.65, 0.85, 1.12, 1.19, 1.23, 1.36, 1.37, 1.58, 1.72, 1.86, 1.95, 2.03, 2.12, 2.12, 2.12, 2.75],
  }),
  4: buildRows({
    pointsPerGame: [2.58, 2.36, 2.06, 1.86, 1.71, 1.67, 1.56, 1.47, 1.32, 1.18, 1.07, 1, 0.92, 0.91, 0.63, 0.35],
    goalsForPerGame: [3.41, 3.09, 2.83, 2.54, 2.17, 2, 1.99, 1.83, 1.44, 1.4, 1.54, 1.37, 1.31, 1.1, 1.12, 0.85],
    goalsAgainstPerGame: [0.78, 0.99, 1.16, 1.54, 1.66, 1.69, 1.71, 1.77, 1.85, 1.93, 2.06, 2.18, 2.32, 2.5, 3.26, 3.53],
  }),
}

const toNumber = (value, fallback = null) => {
  if (value === null || value === undefined || value === '') return fallback

  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const roundNumber = (value, digits = 2) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0

  return Number(n.toFixed(digits))
}

export const resolveTeamScoutBenchmarkLevel = (leagueLevel) => {
  const level = toNumber(leagueLevel)

  if (level === 1 || level === 2) return 1
  if (level === 3) return 3

  return TEAM_SCOUT_BENCHMARK_DEFAULTS.fallbackLevel
}

export const normalizeTeamScoutBenchmarkPosition = (position) => {
  const value = toNumber(position)
  if (!value || value < 1) return null

  return Math.min(
    Math.round(value),
    TEAM_SCOUT_BENCHMARK_DEFAULTS.lastDistinctPosition
  )
}

export const getTeamScoutPositionBenchmark = ({
  leagueLevel,
  position,
  leagueNumGames = TEAM_SCOUT_BENCHMARK_DEFAULTS.baselineGames,
  environmentFactor = 1,
} = {}) => {
  const benchmarkLevel = resolveTeamScoutBenchmarkLevel(leagueLevel)
  const benchmarkPosition = normalizeTeamScoutBenchmarkPosition(position)
  const rows = TEAM_SCOUT_POSITION_BENCHMARKS_BY_LEVEL[benchmarkLevel] || []
  const row = rows.find((item) => item.position === benchmarkPosition) || null
  const seasonGames = toNumber(
    leagueNumGames,
    TEAM_SCOUT_BENCHMARK_DEFAULTS.baselineGames
  )
  const factor = toNumber(environmentFactor, 1)

  if (!row || !seasonGames) return null

  const goalsForPerGame = row.goalsForPerGame * factor
  const goalsAgainstPerGame = row.goalsAgainstPerGame * factor

  return {
    sourceLevel: benchmarkLevel,
    sourcePosition: benchmarkPosition,
    requestedPosition: toNumber(position),
    leagueNumGames: seasonGames,
    environmentFactor: roundNumber(factor, 3),

    pointsPerGame: row.pointsPerGame,
    goalsForPerGame: roundNumber(goalsForPerGame, 3),
    goalsAgainstPerGame: roundNumber(goalsAgainstPerGame, 3),

    points: roundNumber(row.pointsPerGame * seasonGames, 1),
    goalsFor: roundNumber(goalsForPerGame * seasonGames, 1),
    goalsAgainst: roundNumber(goalsAgainstPerGame * seasonGames, 1),
    goalDifference: roundNumber(
      (goalsForPerGame - goalsAgainstPerGame) * seasonGames,
      1
    ),
  }
}

export const getTeamScoutBenchmarkLeagueGoalsPerTeamGame = (leagueLevel) => {
  const benchmarkLevel = resolveTeamScoutBenchmarkLevel(leagueLevel)
  const rows = TEAM_SCOUT_POSITION_BENCHMARKS_BY_LEVEL[benchmarkLevel] || []

  if (!rows.length) return null

  const total = rows.reduce((sum, row) => {
    return sum + row.goalsForPerGame + row.goalsAgainstPerGame
  }, 0)

  return roundNumber(total / (rows.length * 2), 3)
}
