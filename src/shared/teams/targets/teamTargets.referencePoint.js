// shared/teams/targets/teamTargets.referencePoint.js

export const TEAM_TARGET_REFERENCE_POINT_STATUS = {
  READY: 'ready',
  LOW_SAMPLE: 'low_sample',
  BLOCKED: 'blocked',
}

export const TEAM_TARGET_REFERENCE_POINT_METHOD = {
  TRIMMED_MEAN: 'trimmed_mean',
}

export const TEAM_TARGET_REFERENCE_POINT_REASON = {
  MISSING_ROWS: 'missing_rows',
  NOT_ENOUGH_USABLE_ROWS: 'not_enough_usable_rows',
}

export const TEAM_TARGET_REFERENCE_POINT_EXCLUSION = {
  MISSING_GAMES: 'missing_games',
  LOW_GAMES_SAMPLE: 'low_games_sample',
  MISSING_GOALS: 'missing_goals',
  EXTREME_POINTS_PER_GAME: 'extreme_points_per_game',
  EXTREME_GOALS_FOR_PER_GAME: 'extreme_goals_for_per_game',
  EXTREME_GOALS_AGAINST_PER_GAME: 'extreme_goals_against_per_game',
  EXTREME_TOTAL_GOALS_PER_GAME: 'extreme_total_goals_per_game',
  TRIMMED_LOW: 'trimmed_low',
  TRIMMED_HIGH: 'trimmed_high',
}

export const TEAM_TARGET_REFERENCE_POINT_CONFIG = {
  minRows: 6,
  reliableRows: 10,
  minGames: 5,
  minGamesPct: 0.25,
  trimPct: 0.1,
  stddevLimit: 2,
  thresholds: {
    minPointsPerGame: 0.15,
    maxGoalsForPerGame: 7,
    maxGoalsAgainstPerGame: 7,
    maxTotalGoalsPerGame: 9,
  },
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

const safeArray = (value) => {
  return Array.isArray(value) ? value : []
}

const average = (values = []) => {
  const numbers = values.filter((value) => Number.isFinite(value))

  if (!numbers.length) return null

  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length
}

const stddev = (values = []) => {
  const mean = average(values)
  if (!Number.isFinite(mean)) return null

  const variance = average(
    values.map((value) => {
      return (value - mean) ** 2
    })
  )

  return Number.isFinite(variance) ? Math.sqrt(variance) : null
}

const pickFirstNumber = (...values) => {
  for (const value of values) {
    const n = toNumber(value, null)
    if (Number.isFinite(n)) return n
  }

  return null
}

const getRowId = (row = {}, index = 0) => {
  return (
    row?.teamId ||
    row?.id ||
    row?.team?.id ||
    row?.name ||
    row?.teamName ||
    `row_${index + 1}`
  )
}

const getRowGames = (row = {}) => {
  return pickFirstNumber(
    row?.teamStats?.teamGamePlayed,
    row?.teamStats?.games,
    row?.gamesPlayed,
    row?.playedGames,
    row?.matchesPlayed,
    row?.games,
    row?.played,
    row?.p
  )
}

const getRowGoalsFor = (row = {}) => {
  return pickFirstNumber(
    row?.teamStats?.goalsFor,
    row?.goalsFor,
    row?.leagueGoalsFor,
    row?.gf,
    row?.goals,
    row?.for
  )
}

const getRowGoalsAgainst = (row = {}) => {
  return pickFirstNumber(
    row?.teamStats?.goalsAgainst,
    row?.goalsAgainst,
    row?.leagueGoalsAgainst,
    row?.ga,
    row?.against
  )
}

const getRowPoints = (row = {}) => {
  return pickFirstNumber(
    row?.teamStats?.points,
    row?.points,
    row?.pts
  )
}

const buildParsedRow = ({
  row,
  index,
}) => {
  const games = getRowGames(row)
  const goalsFor = getRowGoalsFor(row)
  const goalsAgainst = getRowGoalsAgainst(row)
  const points = getRowPoints(row)

  const goalsForPerGame =
    games > 0 && Number.isFinite(goalsFor)
      ? goalsFor / games
      : null

  const goalsAgainstPerGame =
    games > 0 && Number.isFinite(goalsAgainst)
      ? goalsAgainst / games
      : null

  const totalGoalsPerGame =
    Number.isFinite(goalsForPerGame) && Number.isFinite(goalsAgainstPerGame)
      ? goalsForPerGame + goalsAgainstPerGame
      : null

  const pointsPerGame =
    games > 0 && Number.isFinite(points)
      ? points / games
      : null

  return {
    id: getRowId(row, index),
    index,
    row,
    games,
    points,
    goalsFor,
    goalsAgainst,
    pointsPerGame,
    goalsForPerGame,
    goalsAgainstPerGame,
    totalGoalsPerGame,
  }
}

const getMinGames = ({
  leagueNumGames,
  config,
}) => {
  const leagueGames = toNumber(leagueNumGames, 0)
  const byPct = leagueGames
    ? Math.ceil(leagueGames * config.minGamesPct)
    : 0

  return Math.max(config.minGames, byPct)
}

const getThresholdExclusion = ({
  row,
  config,
}) => {
  const thresholds = config.thresholds || {}

  if (
    Number.isFinite(row.pointsPerGame) &&
    row.pointsPerGame < thresholds.minPointsPerGame
  ) {
    return TEAM_TARGET_REFERENCE_POINT_EXCLUSION.EXTREME_POINTS_PER_GAME
  }

  if (
    Number.isFinite(row.goalsForPerGame) &&
    row.goalsForPerGame > thresholds.maxGoalsForPerGame
  ) {
    return TEAM_TARGET_REFERENCE_POINT_EXCLUSION.EXTREME_GOALS_FOR_PER_GAME
  }

  if (
    Number.isFinite(row.goalsAgainstPerGame) &&
    row.goalsAgainstPerGame > thresholds.maxGoalsAgainstPerGame
  ) {
    return TEAM_TARGET_REFERENCE_POINT_EXCLUSION.EXTREME_GOALS_AGAINST_PER_GAME
  }

  if (
    Number.isFinite(row.totalGoalsPerGame) &&
    row.totalGoalsPerGame > thresholds.maxTotalGoalsPerGame
  ) {
    return TEAM_TARGET_REFERENCE_POINT_EXCLUSION.EXTREME_TOTAL_GOALS_PER_GAME
  }

  return ''
}

const buildExcludedRow = ({
  row,
  reason,
}) => {
  return {
    id: row.id,
    reason,
    games: row.games,
    goalsFor: row.goalsFor,
    goalsAgainst: row.goalsAgainst,
    pointsPerGame: Number.isFinite(row.pointsPerGame)
      ? roundNumber(row.pointsPerGame, 2)
      : null,
    goalsForPerGame: Number.isFinite(row.goalsForPerGame)
      ? roundNumber(row.goalsForPerGame, 2)
      : null,
    goalsAgainstPerGame: Number.isFinite(row.goalsAgainstPerGame)
      ? roundNumber(row.goalsAgainstPerGame, 2)
      : null,
    totalGoalsPerGame: Number.isFinite(row.totalGoalsPerGame)
      ? roundNumber(row.totalGoalsPerGame, 2)
      : null,
  }
}

const splitUsableRows = ({
  parsedRows,
  minGames,
  config,
}) => {
  return parsedRows.reduce((acc, row) => {
    if (!row.games) {
      acc.excludedRows.push(buildExcludedRow({
        row,
        reason: TEAM_TARGET_REFERENCE_POINT_EXCLUSION.MISSING_GAMES,
      }))
      return acc
    }

    if (row.games < minGames) {
      acc.excludedRows.push(buildExcludedRow({
        row,
        reason: TEAM_TARGET_REFERENCE_POINT_EXCLUSION.LOW_GAMES_SAMPLE,
      }))
      return acc
    }

    if (
      !Number.isFinite(row.goalsFor) ||
      !Number.isFinite(row.goalsAgainst) ||
      !Number.isFinite(row.totalGoalsPerGame)
    ) {
      acc.excludedRows.push(buildExcludedRow({
        row,
        reason: TEAM_TARGET_REFERENCE_POINT_EXCLUSION.MISSING_GOALS,
      }))
      return acc
    }

    const thresholdReason = getThresholdExclusion({
      row,
      config,
    })

    if (thresholdReason) {
      acc.excludedRows.push(buildExcludedRow({
        row,
        reason: thresholdReason,
      }))
      return acc
    }

    acc.usableRows.push(row)
    return acc
  }, {
    usableRows: [],
    excludedRows: [],
  })
}

const getRawLeagueGoalsPerMatch = (rows = []) => {
  const totals = rows.reduce((acc, row) => {
    if (
      row.games > 0 &&
      Number.isFinite(row.goalsFor) &&
      Number.isFinite(row.goalsAgainst)
    ) {
      return {
        teamGames: acc.teamGames + row.games,
        totalGoals: acc.totalGoals + row.goalsFor + row.goalsAgainst,
      }
    }

    return acc
  }, {
    teamGames: 0,
    totalGoals: 0,
  })

  if (!totals.teamGames) return null

  return totals.totalGoals / totals.teamGames
}

const getWeightedGoalsPerMatch = (rows = []) => {
  const totals = rows.reduce((acc, row) => {
    return {
      teamGames: acc.teamGames + row.games,
      totalGoals: acc.totalGoals + row.goalsFor + row.goalsAgainst,
    }
  }, {
    teamGames: 0,
    totalGoals: 0,
  })

  if (!totals.teamGames) return null

  return totals.totalGoals / totals.teamGames
}

const trimRows = ({
  rows,
  config,
}) => {
  const sorted = [...rows].sort((a, b) => {
    return a.totalGoalsPerGame - b.totalGoalsPerGame
  })

  const maxTrimEachSide = sorted.length >= config.reliableRows ? Infinity : 1
  const trimEachSide = Math.min(
    Math.floor(sorted.length * config.trimPct),
    maxTrimEachSide
  )

  if (!trimEachSide) {
    return {
      rows: sorted,
      trimmedLow: [],
      trimmedHigh: [],
      trimEachSide: 0,
    }
  }

  return {
    rows: sorted.slice(trimEachSide, sorted.length - trimEachSide),
    trimmedLow: sorted.slice(0, trimEachSide),
    trimmedHigh: sorted.slice(sorted.length - trimEachSide),
    trimEachSide,
  }
}

const buildFlags = ({
  usableRows,
  trimmedLow,
  trimmedHigh,
  config,
}) => {
  const values = usableRows
    .map((row) => row.totalGoalsPerGame)
    .filter((value) => Number.isFinite(value))

  const mean = average(values)
  const sigma = stddev(values)

  const stddevOutliers =
    Number.isFinite(mean) && Number.isFinite(sigma) && sigma > 0
      ? usableRows.filter((row) => {
          return (
            Math.abs(row.totalGoalsPerGame - mean) >
            config.stddevLimit * sigma
          )
        })
      : []

  const sorted = [...values].sort((a, b) => a - b)
  const gaps = sorted.slice(1).map((value, index) => {
    return value - sorted[index]
  })
  const avgGap = average(gaps)
  const maxGap = gaps.length ? Math.max(...gaps) : 0

  return {
    flags: [
      trimmedLow.length || trimmedHigh.length ? 'trimmed_edges' : '',
      stddevOutliers.length ? 'stddev_outlier_detected' : '',
      avgGap && maxGap > avgGap * 3 ? 'high_gap_detected' : '',
    ].filter(Boolean),
    stddev: Number.isFinite(sigma) ? roundNumber(sigma, 3) : null,
    mean: Number.isFinite(mean) ? roundNumber(mean, 3) : null,
    maxGap: Number.isFinite(maxGap) ? roundNumber(maxGap, 3) : null,
    stddevOutliers: stddevOutliers.map((row) => {
      return buildExcludedRow({
        row,
        reason: 'stddev_flag',
      })
    }),
  }
}

export const buildLeagueGoalsReferencePoint = ({
  rows,
  leagueNumGames,
  config = {},
} = {}) => {
  const activeConfig = {
    ...TEAM_TARGET_REFERENCE_POINT_CONFIG,
    ...config,
    thresholds: {
      ...TEAM_TARGET_REFERENCE_POINT_CONFIG.thresholds,
      ...(config.thresholds || {}),
    },
  }

  const sourceRows = safeArray(rows)

  if (!sourceRows.length) {
    return {
      status: TEAM_TARGET_REFERENCE_POINT_STATUS.BLOCKED,
      method: TEAM_TARGET_REFERENCE_POINT_METHOD.TRIMMED_MEAN,
      reason: TEAM_TARGET_REFERENCE_POINT_REASON.MISSING_ROWS,
      rawLeagueGoalsPerMatch: null,
      cleanLeagueGoalsPerMatch: null,
      rowsCount: 0,
      usableRowsCount: 0,
      excludedRowsCount: 0,
      excludedRows: [],
      flags: [],
    }
  }

  const parsedRows = sourceRows.map((row, index) => {
    return buildParsedRow({
      row,
      index,
    })
  })

  const minGames = getMinGames({
    leagueNumGames,
    config: activeConfig,
  })

  const split = splitUsableRows({
    parsedRows,
    minGames,
    config: activeConfig,
  })

  const rawLeagueGoalsPerMatch = getRawLeagueGoalsPerMatch(parsedRows)

  if (split.usableRows.length < activeConfig.minRows) {
    return {
      status: TEAM_TARGET_REFERENCE_POINT_STATUS.LOW_SAMPLE,
      method: TEAM_TARGET_REFERENCE_POINT_METHOD.TRIMMED_MEAN,
      reason: TEAM_TARGET_REFERENCE_POINT_REASON.NOT_ENOUGH_USABLE_ROWS,
      rawLeagueGoalsPerMatch: Number.isFinite(rawLeagueGoalsPerMatch)
        ? roundNumber(rawLeagueGoalsPerMatch, 2)
        : null,
      cleanLeagueGoalsPerMatch: Number.isFinite(rawLeagueGoalsPerMatch)
        ? roundNumber(rawLeagueGoalsPerMatch, 2)
        : null,
      rowsCount: parsedRows.length,
      usableRowsCount: split.usableRows.length,
      excludedRowsCount: split.excludedRows.length,
      minGames,
      trimPct: activeConfig.trimPct,
      trimmedLowCount: 0,
      trimmedHighCount: 0,
      excludedRows: split.excludedRows,
      flags: ['low_sample'],
    }
  }

  const trimmed = trimRows({
    rows: split.usableRows,
    config: activeConfig,
  })

  const trimmedLow = trimmed.trimmedLow.map((row) => {
    return buildExcludedRow({
      row,
      reason: TEAM_TARGET_REFERENCE_POINT_EXCLUSION.TRIMMED_LOW,
    })
  })

  const trimmedHigh = trimmed.trimmedHigh.map((row) => {
    return buildExcludedRow({
      row,
      reason: TEAM_TARGET_REFERENCE_POINT_EXCLUSION.TRIMMED_HIGH,
    })
  })

  const cleanLeagueGoalsPerMatch = getWeightedGoalsPerMatch(trimmed.rows)
  const debug = buildFlags({
    usableRows: split.usableRows,
    trimmedLow,
    trimmedHigh,
    config: activeConfig,
  })

  return {
    status: TEAM_TARGET_REFERENCE_POINT_STATUS.READY,
    method: TEAM_TARGET_REFERENCE_POINT_METHOD.TRIMMED_MEAN,
    reason: '',

    rawLeagueGoalsPerMatch: Number.isFinite(rawLeagueGoalsPerMatch)
      ? roundNumber(rawLeagueGoalsPerMatch, 2)
      : null,
    cleanLeagueGoalsPerMatch: Number.isFinite(cleanLeagueGoalsPerMatch)
      ? roundNumber(cleanLeagueGoalsPerMatch, 2)
      : null,

    rowsCount: parsedRows.length,
    usableRowsCount: split.usableRows.length,
    cleanRowsCount: trimmed.rows.length,
    excludedRowsCount:
      split.excludedRows.length + trimmedLow.length + trimmedHigh.length,

    minGames,
    trimPct: activeConfig.trimPct,
    trimmedLowCount: trimmedLow.length,
    trimmedHighCount: trimmedHigh.length,

    excludedRows: [
      ...split.excludedRows,
      ...trimmedLow,
      ...trimmedHigh,
    ],
    flags: debug.flags,
    debug: {
      mean: debug.mean,
      stddev: debug.stddev,
      maxGap: debug.maxGap,
      stddevOutliers: debug.stddevOutliers,
    },
  }
}
