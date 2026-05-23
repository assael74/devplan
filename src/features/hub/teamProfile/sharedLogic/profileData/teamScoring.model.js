// src/features/hub/teamProfile/sharedLogic/profileData/teamScoring.model.js

import {
  buildTeamMatchScore,
  buildTeamSeasonScore,
} from '../../../../../shared/teams/scoring/index.js'

const emptyArray = []

const BASE_RATING = 6

const asText = value => {
  return value == null ? '' : String(value).trim()
}

const toNumber = (value, fallback = null) => {
  if (value === null || value === undefined || value === '') {
    return fallback
  }

  const n = Number(value)

  return Number.isFinite(n) ? n : fallback
}

const roundNumber = (value, digits = 2) => {
  const n = Number(value)

  if (!Number.isFinite(n)) return null

  const factor = 10 ** digits
  return Math.round(n * factor) / factor
}

const getGameObject = row => {
  return row?.game || row || {}
}

const getGameId = row => {
  const game = getGameObject(row)

  return asText(
    row?.gameId ||
      row?.id ||
      game?.id ||
      game?.gameId ||
      ''
  )
}

const getGameDate = row => {
  const game = getGameObject(row)

  return (
    row?.gameDate ||
    game?.gameDate ||
    row?.date ||
    game?.date ||
    ''
  )
}

const getGameTime = row => {
  const time = new Date(getGameDate(row)).getTime()

  return Number.isFinite(time) ? time : 0
}

const getRival = row => {
  const game = getGameObject(row)

  return asText(
    row?.rival ||
      row?.rivel ||
      game?.rival ||
      game?.rivel ||
      ''
  )
}

const getRound = row => {
  const game = getGameObject(row)

  return asText(
    row?.gameLeagueNum ||
      row?.gameRound ||
      row?.leagueRound ||
      game?.gameLeagueNum ||
      game?.gameRound ||
      game?.leagueRound ||
      ''
  )
}

const getHome = row => {
  const game = getGameObject(row)

  return row?.home ?? game?.home ?? null
}

const getSportingDirectorAssessment = row => {
  const game = getGameObject(row)

  return (
    row?.sportingDirectorAssessment ??
    game?.sportingDirectorAssessment ??
    ''
  )
}

const sortGamesAsc = games => {
  return [...games].sort((a, b) => {
    const timeDiff = getGameTime(a) - getGameTime(b)

    if (timeDiff !== 0) return timeDiff

    return getGameId(a).localeCompare(getGameId(b))
  })
}

const buildGameScoreItem = ({ team, row }) => {
  const score = buildTeamMatchScore({
    team,
    game: row,
    sportingDirectorAssessment: getSportingDirectorAssessment(row),
  })

  return {
    game: row,
    gameId: getGameId(row),
    gameDate: getGameDate(row),
    gameTime: getGameTime(row),
    rival: getRival(row),
    rivel: getRival(row),
    round: getRound(row),
    gameRound: getRound(row),
    gameLeagueNum: getRound(row),
    home: getHome(row),
    score,
  }
}

const buildGameScoreRow = ({
  item,
  previousTva,
}) => {
  const score = item?.score || {}
  const rating = toNumber(score?.rating, null)

  const ratingRaw = toNumber(
    score?.ratingRaw ?? score?.rating,
    null
  )

  const isRated = score?.isReady === true && Number.isFinite(rating)

  const matchImpact = isRated
    ? roundNumber(rating - BASE_RATING, 2)
    : null

  const cumulativeImpact = isRated
    ? roundNumber(previousTva + matchImpact, 2)
    : roundNumber(previousTva, 2)

  const context = score?.context || {}

  return {
    gameId: item?.gameId || '',
    gameDate: item?.gameDate || '',
    gameTime: item?.gameTime || 0,

    rival: item?.rival || '',
    rivel: item?.rivel || item?.rival || '',
    round: item?.round || '',
    gameRound: item?.gameRound || item?.round || '',
    gameLeagueNum: item?.gameLeagueNum || item?.round || '',
    home: item?.home ?? null,

    rating,
    ratingRaw,

    teamRating: rating,
    teamRatingRaw: ratingRaw,

    matchImpact,
    impactDelta: matchImpact,

    cumulativeImpact,
    cumulativeTva: cumulativeImpact,
    tva: cumulativeImpact,

    pointsPaceDelta: roundNumber(
      toNumber(context?.actualPoints, 0) -
        toNumber(context?.expectedPointsForGame, 0),
      2
    ),

    goalsForDelta: roundNumber(
      toNumber(context?.goalsFor, 0) -
        toNumber(context?.gameTargets?.targetGoalsForPerGame, 0),
      2
    ),

    goalsAgainstDelta: roundNumber(
      toNumber(context?.gameTargets?.targetGoalsAgainstPerGame, 0) -
        toNumber(context?.goalsAgainst, 0),
      2
    ),

    actualPoints: toNumber(context?.actualPoints, 0),
    expectedPoints: toNumber(context?.expectedPointsForGame, 0),

    actualGoalsFor: toNumber(context?.goalsFor, 0),
    expectedGoalsFor: toNumber(context?.gameTargets?.targetGoalsForPerGame, 0),

    actualGoalsAgainst: toNumber(context?.goalsAgainst, 0),
    expectedGoalsAgainst: toNumber(context?.gameTargets?.targetGoalsAgainstPerGame, 0),

    status: score?.status || '',
    reason: score?.reason || '',
    reasonLabel: score?.reasonLabel || '',

    reliability: score?.reliability || null,
    deltas: score?.deltas || null,
    flags: score?.flags || null,
    context,
    expectations: score?.expectations || null,

    score,
    game: item?.game || null,
  }
}

const buildTimeline = scoreItems => {
  let cumulative = 0

  return scoreItems.map(item => {
    const row = buildGameScoreRow({
      item,
      previousTva: cumulative,
    })

    if (Number.isFinite(Number(row?.matchImpact))) {
      cumulative = toNumber(row?.cumulativeImpact, cumulative)
    }

    return row
  })
}

const buildByGameId = rows => {
  return rows.reduce((acc, row) => {
    if (row?.gameId) {
      acc[row.gameId] = row
    }

    return acc
  }, {})
}

export const buildTeamScoringModel = ({
  team,
  games,
  calculationMode = 'games',
} = {}) => {
  const safeGames = Array.isArray(games) ? games : emptyArray
  const sortedGames = sortGamesAsc(safeGames)

  const scoreItems = sortedGames.map(row => {
    return buildGameScoreItem({
      team,
      row,
    })
  })

  const seasonScore = buildTeamSeasonScore({
    scores: scoreItems,
  })

  const timeline = buildTimeline(scoreItems)
  const byGameId = buildByGameId(timeline)

  return {
    ...seasonScore,

    scores: scoreItems,
    rows: timeline,
    points: timeline,
    byGameId,

    trend: {
      points: timeline,
      byGameId,
    },

    meta: {
      ready: true,
      source: 'teamProfile.teamScoring',
      calculationMode,
      gamesCount: safeGames.length,
      scoresCount: scoreItems.length,
      ratedGames: seasonScore?.ratedGames || 0,
      hasTrend: timeline.length > 0,
    },
  }
}
