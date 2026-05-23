// teamProfile/sharedLogic/games/moduleLogic/teamGames.performance.logic.js

const emptyArray = []
const BELOW_EXPECTATION_LIMIT = 5.95

const LRM = '\u200E'

export const formatGamePerfLtr = value => {
  return `${LRM}${value}`
}

export const toGamePerfNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === '') {
    return fallback
  }

  const n = Number(value)

  return Number.isFinite(n) ? n : fallback
}

export const asGamePerfText = value => {
  return value == null ? '' : String(value).trim()
}

export const getGameId = game => {
  const source = game?.game || game || {}

  return asGamePerfText(
    game?.gameId ||
      game?.id ||
      game?._id ||
      source?.id ||
      source?.gameId ||
      ''
  )
}

export const formatGamePerfRating = value => {
  const n = toGamePerfNumber(value, null)

  if (!Number.isFinite(n)) return '—'

  return formatGamePerfLtr(n.toFixed(1))
}

export const formatGamePerfSigned = value => {
  const n = toGamePerfNumber(value, null)

  if (!Number.isFinite(n)) return '—'

  if (n > 0) {
    return formatGamePerfLtr(`+${n.toFixed(2)}`)
  }

  return formatGamePerfLtr(n.toFixed(2))
}

export const getGamePerfTone = rating => {
  const value = toGamePerfNumber(rating, null)

  if (!Number.isFinite(value)) return 'neutral'
  if (value >= 6.5) return 'success'
  if (value >= 6) return 'primary'
  if (value >= 5.7) return 'warning'

  return 'danger'
}

export const getGameImpactTone = value => {
  const n = toGamePerfNumber(value, null)

  if (!Number.isFinite(n)) return 'neutral'
  if (n >= 0) return 'success'
  if (n >= -0.5) return 'warning'

  return 'danger'
}

export const hasGamePerfRating = row => {
  return Number.isFinite(Number(row?.ratingRaw))
}

export const getGamePerfPlayerLabel = row => {
  return (
    row?.playerFullName ||
    row?.player?.playerFullName ||
    row?.player?.label ||
    'שחקן'
  )
}

export const getGamePerfRows = playerPerformance => {
  return Array.isArray(playerPerformance?.rows)
    ? playerPerformance.rows
    : emptyArray
}

export const getRatedGamePerfRows = playerPerformance => {
  return getGamePerfRows(playerPerformance).filter(hasGamePerfRating)
}

export const sortGamePerfRows = rows => {
  const safeRows = Array.isArray(rows) ? rows : emptyArray

  return [...safeRows].sort((a, b) => {
    const ratingDiff =
      toGamePerfNumber(b.ratingRaw, -999) -
      toGamePerfNumber(a.ratingRaw, -999)

    if (ratingDiff !== 0) return ratingDiff

    return (
      toGamePerfNumber(b.minutes, 0) -
      toGamePerfNumber(a.minutes, 0)
    )
  })
}

export const getBestGamePerfRow = rows => {
  const sortedRows = sortGamePerfRows(rows)

  return sortedRows.length
    ? sortedRows[0]
    : null
}

export const isBelowGameExpectation = row => {
  const rating = toGamePerfNumber(row?.ratingRaw, null)

  return (
    Number.isFinite(rating) &&
    rating > 0 &&
    rating < BELOW_EXPECTATION_LIMIT
  )
}

export const getLowGamePerfRow = rows => {
  const safeRows = Array.isArray(rows) ? rows : emptyArray
  const lowRows = safeRows.filter(isBelowGameExpectation)

  if (!lowRows.length) return null

  return [...lowRows].sort((a, b) => {
    return (
      toGamePerfNumber(a.ratingRaw, 999) -
      toGamePerfNumber(b.ratingRaw, 999)
    )
  })[0]
}

export const buildGameTeamPerformanceModel = ({ teamGameScore } = {}) => {
  const rating = toGamePerfNumber(
    teamGameScore?.ratingRaw ??
      teamGameScore?.rating ??
      teamGameScore?.teamRatingRaw ??
      teamGameScore?.teamRating,
    null
  )

  const matchImpact = toGamePerfNumber(
    teamGameScore?.matchImpact ??
      teamGameScore?.impactDelta,
    null
  )

  const cumulativeImpact = toGamePerfNumber(
    teamGameScore?.cumulativeImpact ??
      teamGameScore?.cumulativeTva ??
      teamGameScore?.tva,
    null
  )

  return {
    rating,
    matchImpact,
    cumulativeImpact,

    ratingText: formatGamePerfRating(rating),
    matchImpactText: formatGamePerfSigned(matchImpact),
    cumulativeImpactText: formatGamePerfSigned(cumulativeImpact),

    ratingTone: getGamePerfTone(rating),
    matchImpactTone: getGameImpactTone(matchImpact),
    cumulativeImpactTone: getGameImpactTone(cumulativeImpact),

    hasRating: Number.isFinite(Number(rating)),
    hasMatchImpact: Number.isFinite(Number(matchImpact)),
    hasCumulativeImpact: Number.isFinite(Number(cumulativeImpact)),

    score: teamGameScore?.score || null,
    row: teamGameScore || null,
  }
}

export const buildGamePlayersPerformanceModel = playerPerformance => {
  const rows = sortGamePerfRows(getGamePerfRows(playerPerformance))
  const ratedRows = getRatedGamePerfRows(playerPerformance)

  const bestRow = getBestGamePerfRow(ratedRows)
  const lowRow = getLowGamePerfRow(ratedRows)

  const avgRating = Number.isFinite(Number(playerPerformance?.summary?.avgRating))
    ? playerPerformance.summary.avgRating
    : null

  const ratedCount = toGamePerfNumber(
    playerPerformance?.summary?.ratedScores,
    ratedRows.length
  )

  const totalMinutes = toGamePerfNumber(
    playerPerformance?.summary?.totalMinutes,
    0
  )

  return {
    rows,
    ratedRows,
    bestRow,
    lowRow,

    avgRating,
    ratedCount,
    totalMinutes,

    hasRows: rows.length > 0,
    hasRatedRows: ratedRows.length > 0,

    labels: {
      best: bestRow ? getGamePerfPlayerLabel(bestRow) : '',
      low: lowRow ? getGamePerfPlayerLabel(lowRow) : '',
    },
  }
}

export const buildGamePerformanceDetailsModel = ({ teamGameScore, playerPerformance } = {}) => {
  const players = buildGamePlayersPerformanceModel(playerPerformance)

  return {
    ...players,

    players,

    team: buildGameTeamPerformanceModel({
      teamGameScore,
    }),
  }
}
