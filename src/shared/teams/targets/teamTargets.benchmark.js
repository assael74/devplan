// shared/teams/targets/teamTargets.benchmark.js

export const TEAM_TARGET_BENCHMARK_DEFAULTS = {
  baselineGames: 30,
  baselineGameTime: 90,
  playersOnPitch: 11,
  squadSize: 24,
}

export const TEAM_TARGET_POSITION_PROFILES = {
  top: {
    id: 'top',
    label: 'צמרת',
    rankRange: [1, 4],
  },
  midTop: {
    id: 'midTop',
    label: 'חצי עליון',
    rankRange: [5, 8],
  },
  midLow: {
    id: 'midLow',
    label: 'מרכז-תחתון',
    rankRange: [9, 13],
  },
  bottom: {
    id: 'bottom',
    label: 'תחתית',
    rankRange: [14, null],
  },
}

export const TEAM_TARGET_POSITION_PROFILE_IDS = Object.keys(
  TEAM_TARGET_POSITION_PROFILES
)

export const TEAM_POSITION_TARGET_BENCHMARKS = [
  {
    targetPosition: 1,
    targetPositionProfile: 'top',
    games: 30,
    points: 77,
    pointsPerGame: 2.58,
    successRate: 86,
    goalsFor: 102,
    goalsForPerGame: 3.41,
    goalsAgainst: 23,
    goalsAgainstPerGame: 0.78,
    goalDifference: 79,
    homeSuccessRate: 99,
    awaySuccessRate: 74,
    difficultySuccessRate: {
      lower: 89,
      equal: 83,
      higher: null,
    },
  },
  {
    targetPosition: 2,
    targetPositionProfile: 'top',
    games: 30,
    points: 71,
    pointsPerGame: 2.36,
    successRate: 79,
    goalsFor: 93,
    goalsForPerGame: 3.09,
    goalsAgainst: 30,
    goalsAgainstPerGame: 0.99,
    goalDifference: 63,
    homeSuccessRate: 81,
    awaySuccessRate: 75,
    difficultySuccessRate: {
      lower: 86,
      equal: 54,
      higher: 60,
    },
  },
  {
    targetPosition: 3,
    targetPositionProfile: 'top',
    games: 30,
    points: 62,
    pointsPerGame: 2.06,
    successRate: 69,
    goalsFor: 85,
    goalsForPerGame: 2.83,
    goalsAgainst: 35,
    goalsAgainstPerGame: 1.16,
    goalDifference: 50,
    homeSuccessRate: 66,
    awaySuccessRate: 71,
    difficultySuccessRate: {
      lower: 74,
      equal: 28,
      higher: null,
    },
  },
  {
    targetPosition: 4,
    targetPositionProfile: 'top',
    games: 30,
    points: 56,
    pointsPerGame: 1.86,
    successRate: 62,
    goalsFor: 76,
    goalsForPerGame: 2.54,
    goalsAgainst: 46,
    goalsAgainstPerGame: 1.54,
    goalDifference: 30,
    homeSuccessRate: 62,
    awaySuccessRate: 61,
    difficultySuccessRate: {
      lower: 75,
      equal: 29,
      higher: 25,
    },
  },
  {
    targetPosition: 5,
    targetPositionProfile: 'midTop',
    games: 30,
    points: 51,
    pointsPerGame: 1.71,
    successRate: 57,
    goalsFor: 65,
    goalsForPerGame: 2.17,
    goalsAgainst: 50,
    goalsAgainstPerGame: 1.66,
    goalDifference: 15,
    homeSuccessRate: 67,
    awaySuccessRate: 47,
    difficultySuccessRate: {
      lower: 77,
      equal: 54,
      higher: 11,
    },
  },
  {
    targetPosition: 6,
    targetPositionProfile: 'midTop',
    games: 30,
    points: 50,
    pointsPerGame: 1.67,
    successRate: 56,
    goalsFor: 60,
    goalsForPerGame: 2,
    goalsAgainst: 51,
    goalsAgainstPerGame: 1.71,
    goalDifference: 9,
    homeSuccessRate: 57,
    awaySuccessRate: 54,
    difficultySuccessRate: {
      lower: 70,
      equal: 47,
      higher: 23,
    },
  },
  {
    targetPosition: 7,
    targetPositionProfile: 'midTop',
    games: 30,
    points: 47,
    pointsPerGame: 1.56,
    successRate: 52,
    goalsFor: 60,
    goalsForPerGame: 1.99,
    goalsAgainst: 51,
    goalsAgainstPerGame: 1.69,
    goalDifference: 9,
    homeSuccessRate: 55,
    awaySuccessRate: 48,
    difficultySuccessRate: {
      lower: 66,
      equal: 53,
      higher: 22,
    },
  },
  {
    targetPosition: 8,
    targetPositionProfile: 'midTop',
    games: 30,
    points: 44,
    pointsPerGame: 1.47,
    successRate: 49,
    goalsFor: 55,
    goalsForPerGame: 1.83,
    goalsAgainst: 53,
    goalsAgainstPerGame: 1.77,
    goalDifference: 2,
    homeSuccessRate: 50,
    awaySuccessRate: 47,
    difficultySuccessRate: {
      lower: 72,
      equal: 24,
      higher: 17,
    },
  },
  {
    targetPosition: 9,
    targetPositionProfile: 'midLow',
    games: 30,
    points: 40,
    pointsPerGame: 1.32,
    successRate: 44,
    goalsFor: 43,
    goalsForPerGame: 1.44,
    goalsAgainst: 49,
    goalsAgainstPerGame: 1.63,
    goalDifference: -6,
    homeSuccessRate: 47,
    awaySuccessRate: 40,
    difficultySuccessRate: {
      lower: 69,
      equal: 59,
      higher: 24,
    },
  },
  {
    targetPosition: 10,
    targetPositionProfile: 'midLow',
    games: 30,
    points: 35,
    pointsPerGame: 1.18,
    successRate: 39,
    goalsFor: 42,
    goalsForPerGame: 1.4,
    goalsAgainst: 58,
    goalsAgainstPerGame: 1.93,
    goalDifference: -16,
    homeSuccessRate: 43,
    awaySuccessRate: 34,
    difficultySuccessRate: {
      lower: 73,
      equal: 46,
      higher: 17,
    },
  },
  {
    targetPosition: 11,
    targetPositionProfile: 'midLow',
    games: 30,
    points: 32,
    pointsPerGame: 1.07,
    successRate: 36,
    goalsFor: 46,
    goalsForPerGame: 1.54,
    goalsAgainst: 67,
    goalsAgainstPerGame: 2.24,
    goalDifference: -21,
    homeSuccessRate: 37,
    awaySuccessRate: 33,
    difficultySuccessRate: {
      lower: 52,
      equal: 51,
      higher: 22,
    },
  },
  {
    targetPosition: 12,
    targetPositionProfile: 'midLow',
    games: 30,
    points: 30,
    pointsPerGame: 1,
    successRate: 33,
    goalsFor: 41,
    goalsForPerGame: 1.37,
    goalsAgainst: 70,
    goalsAgainstPerGame: 2.32,
    goalDifference: -29,
    homeSuccessRate: 38,
    awaySuccessRate: 28,
    difficultySuccessRate: {
      lower: 56,
      equal: 41,
      higher: 22,
    },
  },
  {
    targetPosition: 13,
    targetPositionProfile: 'midLow',
    games: 30,
    points: 28,
    pointsPerGame: 0.92,
    successRate: 31,
    goalsFor: 39,
    goalsForPerGame: 1.31,
    goalsAgainst: 57,
    goalsAgainstPerGame: 1.91,
    goalDifference: -18,
    homeSuccessRate: 43,
    awaySuccessRate: 18,
    difficultySuccessRate: {
      lower: 67,
      equal: 51,
      higher: 56,
    },
  },
  {
    targetPosition: 14,
    targetPositionProfile: 'bottom',
    games: 30,
    points: 27,
    pointsPerGame: 0.91,
    successRate: 30,
    goalsFor: 33,
    goalsForPerGame: 1.1,
    goalsAgainst: 62,
    goalsAgainstPerGame: 2.08,
    goalDifference: -29,
    homeSuccessRate: 36,
    awaySuccessRate: 25,
    difficultySuccessRate: {
      lower: null,
      equal: 78,
      higher: 25,
    },
  },
  {
    targetPosition: 15,
    targetPositionProfile: 'bottom',
    games: 30,
    points: 19,
    pointsPerGame: 0.63,
    successRate: 21,
    goalsFor: 34,
    goalsForPerGame: 1.12,
    goalsAgainst: 98,
    goalsAgainstPerGame: 3.26,
    goalDifference: -64,
    homeSuccessRate: 27,
    awaySuccessRate: 15,
    difficultySuccessRate: {
      lower: 58,
      equal: 15,
      higher: 20,
    },
  },
  {
    targetPosition: 16,
    targetPositionProfile: 'bottom',
    games: 30,
    points: 11,
    pointsPerGame: 0.35,
    successRate: 12,
    goalsFor: 26,
    goalsForPerGame: 0.85,
    goalsAgainst: 106,
    goalsAgainstPerGame: 3.53,
    goalDifference: -81,
    homeSuccessRate: 11,
    awaySuccessRate: 12,
    difficultySuccessRate: {
      lower: 22,
      equal: 10,
      higher: 20,
    },
  },
  {
    targetPosition: 17,
    targetPositionProfile: 'bottom',
    games: 30,
    points: 15,
    pointsPerGame: 0.5,
    successRate: 16,
    goalsFor: 40,
    goalsForPerGame: 1.33,
    goalsAgainst: 103,
    goalsAgainstPerGame: 3.43,
    goalDifference: -63,
    homeSuccessRate: 21,
    awaySuccessRate: 10,
    difficultySuccessRate: {
      lower: null,
      equal: null,
      higher: null,
    },
  },
]

export const TEAM_SCORER_CATEGORY_BENCHMARKS = {
  top: {
    scorer: { target: 2, range: [1, 3] },
    doubleDigitScorer: { target: 1, range: [1, 2] },
    supportScorer: { target: 3, range: [2, 4] },
    occasionalScorer: { target: 10, range: [8, 12] },
  },
  midTop: {
    scorer: { target: 0, range: [0, 1] },
    doubleDigitScorer: { target: 2, range: [1, 3] },
    supportScorer: { target: 4, range: [3, 5] },
    occasionalScorer: { target: 10, range: [8, 12] },
  },
  midLow: {
    scorer: { target: 0, range: [0, 0] },
    doubleDigitScorer: { target: 1, range: [0, 2] },
    supportScorer: { target: 3, range: [2, 4] },
    occasionalScorer: { target: 10, range: [8, 12] },
  },
  bottom: {
    scorer: { target: 0, range: [0, 0] },
    doubleDigitScorer: { target: 0, range: [0, 1] },
    supportScorer: { target: 2, range: [1, 3] },
    occasionalScorer: { target: 10, range: [7, 12] },
  },
}

export const TEAM_SQUAD_BALANCE_BENCHMARKS = {
  top14MinutesSharePct: {
    top: {
      target: 85,
      greenRange: [80, 90],
      orangeHighRange: [90, 94],
      redHighMin: 95,
      orangeLowRange: [75, 80],
      redLowMax: 75,
    },
    midTop: {
      target: 83,
      greenRange: [78, 88],
      orangeHighRange: [88, 92],
      redHighMin: 93,
      orangeLowRange: [74, 78],
      redLowMax: 74,
    },
    midLow: {
      target: 80,
      greenRange: [75, 85],
      orangeHighRange: [85, 90],
      redHighMin: 91,
      orangeLowRange: [70, 75],
      redLowMax: 70,
    },
    bottom: {
      target: 76,
      greenRange: [70, 82],
      orangeHighRange: [82, 88],
      redHighMin: 89,
      orangeLowRange: [68, 70],
      redLowMax: 68,
    },
  },
  playersOver500Minutes: {
    target: 21,
    greenRange: [20, 23],
    orangeHighRange: [24, 25],
    redHighMin: 26,
    orangeLowRange: [18, 19],
    redLowMax: 17,
  },
  playersOver1000Minutes: {
    target: 15,
    greenRange: [13, 17],
    orangeHighRange: [18, 19],
    redHighMin: 20,
    orangeLowRange: [11, 12],
    redLowMax: 10,
  },
  playersOver1500Minutes: {
    target: 11,
    greenRange: [9, 13],
    orangeHighRange: [14, 15],
    redHighMin: 16,
    orangeLowRange: [7, 8],
    redLowMax: 6,
  },
  playersOver2000Minutes: {
    target: 9,
    greenRange: [8, 11],
    orangeHighRange: [12, 13],
    redHighMin: 14,
    orangeLowRange: [6, 7],
    redLowMax: 5,
  },
  playersOver20Starts: {
    target: 9,
    greenRange: [8, 11],
    orangeHighRange: [12, 13],
    redHighMin: 14,
    orangeLowRange: [6, 7],
    redLowMax: 5,
  },
  unallocatedMinutesSharePct: {
    target: 0,
    greenRange: [0, 8],
    orangeHighRange: [8, 12],
    redHighMin: 12,
  },
}

export const TEAM_MINUTES_THRESHOLDS = {
  meaningful: {
    id: 'meaningful',
    baselineMinutes: 500,
    shareOfSeason: 500 / (30 * 90),
  },
  rotation: {
    id: 'rotation',
    baselineMinutes: 1000,
    shareOfSeason: 1000 / (30 * 90),
  },
  core: {
    id: 'core',
    baselineMinutes: 1500,
    shareOfSeason: 1500 / (30 * 90),
  },
  anchor: {
    id: 'anchor',
    baselineMinutes: 2000,
    shareOfSeason: 2000 / (30 * 90),
  },
}

const toNumber = (value, fallback = null) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const roundNumber = (value, digits = 2) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return Number(n.toFixed(digits))
}

const average = (values = [], digits = 2) => {
  const numbers = values
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value))

  if (!numbers.length) return null

  return roundNumber(
    numbers.reduce((sum, value) => sum + value, 0) / numbers.length,
    digits
  )
}

const normalizeProfileId = (value) => {
  const id = String(value || '').trim()
  const aliases = {
    midHigh: 'midTop',
  }
  const normalizedId = aliases[id] || id

  return TEAM_TARGET_POSITION_PROFILES[normalizedId] ? normalizedId : ''
}

export const getTargetPositionProfileByRank = (rank) => {
  const n = toNumber(rank)
  if (!n) return null

  return (
    TEAM_TARGET_POSITION_PROFILE_IDS
      .map((id) => TEAM_TARGET_POSITION_PROFILES[id])
      .find((profile) => {
        const min = toNumber(profile.rankRange[0])
        const max = toNumber(profile.rankRange[1])

        if (!min) return false
        if (!max) return n >= min

        return n >= min && n <= max
      }) || null
  )
}

export const getTeamPositionBenchmarkByRank = (rank) => {
  const n = toNumber(rank)
  if (!n) return null

  return (
    TEAM_POSITION_TARGET_BENCHMARKS.find((benchmark) => {
      return benchmark.targetPosition === n
    }) || null
  )
}

export const getTeamPositionBenchmarksByProfile = (profileId) => {
  const id = normalizeProfileId(profileId)
  if (!id) return []

  return TEAM_POSITION_TARGET_BENCHMARKS.filter((benchmark) => {
    return benchmark.targetPositionProfile === id
  })
}

export const buildTeamProfileBenchmark = (profileId) => {
  const id = normalizeProfileId(profileId)
  const rows = getTeamPositionBenchmarksByProfile(id)
  const profile = TEAM_TARGET_POSITION_PROFILES[id] || null

  if (!profile || !rows.length) return null

  return {
    targetPositionProfile: id,
    profile,
    rankRange: profile.rankRange,
    positions: rows.map((row) => row.targetPosition),
    games: TEAM_TARGET_BENCHMARK_DEFAULTS.baselineGames,
    points: average(rows.map((row) => row.points), 0),
    pointsPerGame: average(rows.map((row) => row.pointsPerGame)),
    successRate: average(rows.map((row) => row.successRate), 0),
    goalsFor: average(rows.map((row) => row.goalsFor), 0),
    goalsForPerGame: average(rows.map((row) => row.goalsForPerGame)),
    goalsAgainst: average(rows.map((row) => row.goalsAgainst), 0),
    goalsAgainstPerGame: average(rows.map((row) => row.goalsAgainstPerGame)),
    goalDifference: average(rows.map((row) => row.goalDifference), 0),
    homeSuccessRate: average(rows.map((row) => row.homeSuccessRate), 0),
    awaySuccessRate: average(rows.map((row) => row.awaySuccessRate), 0),
    difficultySuccessRate: {
      lower: average(
        rows.map((row) => row.difficultySuccessRate?.lower),
        0
      ),
      equal: average(
        rows.map((row) => row.difficultySuccessRate?.equal),
        0
      ),
      higher: average(
        rows.map((row) => row.difficultySuccessRate?.higher),
        0
      ),
    },
    scorersDistribution: TEAM_SCORER_CATEGORY_BENCHMARKS[id] || null,
    squadBalance: {
      top14MinutesSharePct:
        TEAM_SQUAD_BALANCE_BENCHMARKS.top14MinutesSharePct[id] || null,
      playersOver500Minutes:
        TEAM_SQUAD_BALANCE_BENCHMARKS.playersOver500Minutes,
      playersOver1000Minutes:
        TEAM_SQUAD_BALANCE_BENCHMARKS.playersOver1000Minutes,
      playersOver1500Minutes:
        TEAM_SQUAD_BALANCE_BENCHMARKS.playersOver1500Minutes,
      playersOver2000Minutes:
        TEAM_SQUAD_BALANCE_BENCHMARKS.playersOver2000Minutes,
      playersOver20Starts:
        TEAM_SQUAD_BALANCE_BENCHMARKS.playersOver20Starts,
      unallocatedMinutesSharePct:
        TEAM_SQUAD_BALANCE_BENCHMARKS.unallocatedMinutesSharePct,
    },
  }
}

export const buildTeamPositionBenchmark = (rank) => {
  const row = getTeamPositionBenchmarkByRank(rank)
  if (!row) return null

  const id = normalizeProfileId(row.targetPositionProfile)
  const profile = TEAM_TARGET_POSITION_PROFILES[id] || null

  return {
    ...row,
    profile,
    rankRange: profile?.rankRange || [row.targetPosition, row.targetPosition],
    scorersDistribution: TEAM_SCORER_CATEGORY_BENCHMARKS[id] || null,
    squadBalance: {
      top14MinutesSharePct:
        TEAM_SQUAD_BALANCE_BENCHMARKS.top14MinutesSharePct[id] || null,
      playersOver500Minutes:
        TEAM_SQUAD_BALANCE_BENCHMARKS.playersOver500Minutes,
      playersOver1000Minutes:
        TEAM_SQUAD_BALANCE_BENCHMARKS.playersOver1000Minutes,
      playersOver1500Minutes:
        TEAM_SQUAD_BALANCE_BENCHMARKS.playersOver1500Minutes,
      playersOver2000Minutes:
        TEAM_SQUAD_BALANCE_BENCHMARKS.playersOver2000Minutes,
      playersOver20Starts:
        TEAM_SQUAD_BALANCE_BENCHMARKS.playersOver20Starts,
      unallocatedMinutesSharePct:
        TEAM_SQUAD_BALANCE_BENCHMARKS.unallocatedMinutesSharePct,
    },
  }
}

export const resolveTeamTargetBenchmark = ({
  targetPositionMode,
  targetPosition,
  targetPositionProfile,
  targetProfileId,
} = {}) => {
  if (targetPositionMode === 'exact') {
    const exact = buildTeamPositionBenchmark(targetPosition)
    if (exact) return exact
  }

  const profileId = normalizeProfileId(
    targetPositionProfile ||
      targetProfileId ||
      (targetPositionMode === 'range' ? targetPosition : '')
  )

  if (profileId) {
    return buildTeamProfileBenchmark(profileId)
  }

  if (targetPosition) {
    const exact = buildTeamPositionBenchmark(targetPosition)
    if (exact) return exact
  }

  return null
}

export const resolveTeamBenchmarkFromTeam = (team = {}) => {
  return resolveTeamTargetBenchmark({
    targetPositionMode: team?.targetPositionMode,
    targetPosition: team?.targetPosition,
    targetPositionProfile: team?.targetPositionProfile,
    targetProfileId: team?.targetProfileId,
  })
}

export const buildBenchmarkNormalizationContext = ({
  team = {},
  leagueNumGames,
  leagueGameTime,
  squadSize,
} = {}) => {
  const actualLeagueGames =
    toNumber(leagueNumGames) ||
    toNumber(team?.leagueNumGames) ||
    TEAM_TARGET_BENCHMARK_DEFAULTS.baselineGames

  const actualGameTime =
    toNumber(leagueGameTime) ||
    toNumber(team?.leagueGameTime) ||
    TEAM_TARGET_BENCHMARK_DEFAULTS.baselineGameTime

  const actualSquadSize =
    toNumber(squadSize) ||
    toNumber(team?.squadSize) ||
    TEAM_TARGET_BENCHMARK_DEFAULTS.squadSize

  return {
    baselineGames: TEAM_TARGET_BENCHMARK_DEFAULTS.baselineGames,
    baselineGameTime: TEAM_TARGET_BENCHMARK_DEFAULTS.baselineGameTime,
    playersOnPitch: TEAM_TARGET_BENCHMARK_DEFAULTS.playersOnPitch,
    leagueNumGames: actualLeagueGames,
    leagueGameTime: actualGameTime,
    squadSize: actualSquadSize,
    seasonMinutesPerPlayer: actualLeagueGames * actualGameTime,
    totalTeamMinutes:
      actualLeagueGames *
      actualGameTime *
      TEAM_TARGET_BENCHMARK_DEFAULTS.playersOnPitch,
  }
}

export const normalizeSeasonTotal = ({
  value,
  leagueNumGames,
  baselineGames = TEAM_TARGET_BENCHMARK_DEFAULTS.baselineGames,
} = {}) => {
  const n = toNumber(value)
  const games = toNumber(leagueNumGames)

  if (!n || !games) return n || 0

  return roundNumber(n * (games / baselineGames), 0)
}

export const normalizeMinutesThreshold = ({
  thresholdId,
  leagueNumGames,
  leagueGameTime,
  team,
} = {}) => {
  const threshold = TEAM_MINUTES_THRESHOLDS[thresholdId]
  if (!threshold) return 0

  const context = buildBenchmarkNormalizationContext({
    team,
    leagueNumGames,
    leagueGameTime,
  })

  return roundNumber(
    context.seasonMinutesPerPlayer * threshold.shareOfSeason,
    0
  )
}
