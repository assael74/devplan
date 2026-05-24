// src/features/hub/playerProfile/sharedLogic/profileData/playerScoring.model.js

import {
  buildGamePlayerScores,
} from '../../../../../shared/players/scoring/index.js'

import {
  roundNumber,
  toNumber,
} from '../../../../../shared/players/scoring/scoring.utils.js'

const emptyArray = []

const asText = value => {
  return value == null ? '' : String(value).trim()
}

const getPlayerId = player => {
  return asText(player?.playerId || player?.id)
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

const getGameRival = row => {
  const game = getGameObject(row)

  return asText(
    row?.rival ||
      row?.rivel ||
      game?.rival ||
      game?.rivel ||
      ''
  )
}

const getGameRound = row => {
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

const getGameHome = row => {
  const game = getGameObject(row)

  return row?.home ?? game?.home ?? null
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

const getScoreRating = score => {
  const rating = toNumber(score?.rating, null)

  return Number.isFinite(rating)
    ? rating
    : null
}

const getImpactDelta = score => {
  const rating = getScoreRating(score)
  const minutes = toNumber(score?.context?.timePlayed, 0)
  const gameMinutes = toNumber(score?.context?.gameMinutes, 90)
  const baseRating = toNumber(score?.baseRating, 6)

  if (!Number.isFinite(rating) || gameMinutes <= 0) {
    return 0
  }

  return roundNumber(
    (rating - baseRating) * (minutes / gameMinutes),
    2
  )
}

const getPlayerName = ({ player, playerGame } = {}) => {
  return (
    player?.playerFullName ||
    player?.label ||
    playerGame?.playerFullName ||
    ''
  )
}

const findPlayerScoreItem = ({ scores, playerId }) => {
  return (Array.isArray(scores) ? scores : emptyArray).find(item => {
    return asText(item?.playerId) === playerId
  }) || null
}

const buildScoreRow = ({
  item,
  game,
  playerId,
  cumulativeImpact,
} = {}) => {
  const score = item?.score || {}
  const context = score?.context || {}
  const player = item?.player || {}
  const playerGame = item?.playerGame || {}
  const impactDelta = getImpactDelta(score)

  const nextCumulativeImpact = roundNumber(
    toNumber(cumulativeImpact, 0) + toNumber(impactDelta, 0),
    2
  )

  return {
    gameId: getGameId(game),
    gameDate: getGameDate(game),
    gameTime: getGameTime(game),

    rival: getGameRival(game),
    rivel: getGameRival(game),

    round: getGameRound(game),
    gameRound: getGameRound(game),
    gameLeagueNum: getGameRound(game),

    home: getGameHome(game),

    playerId,

    player,
    playerGame,

    playerFullName: getPlayerName({
      player,
      playerGame,
    }),

    photo: player?.photo || '',

    minutes: toNumber(context?.timePlayed, 0),
    goals: toNumber(context?.goals, 0),
    assists: toNumber(context?.assists, 0),
    involvement: toNumber(context?.involvement, 0),

    rating: getScoreRating(score),
    ratingRaw: getScoreRating(score),

    impactDelta,
    cumulativeImpact: nextCumulativeImpact,
    tva: nextCumulativeImpact,

    status: score?.status || '',
    reason: score?.reason || '',
    reasonLabel: score?.reasonLabel || '',

    reliability: score?.reliability || null,
    deltas: score?.deltas || null,
    flags: score?.flags || null,

    role: context?.roleId || '',
    roleLabel: context?.roleLabel || '',

    positionLayer: context?.positionLayer || '',
    positionLabel: context?.positionLabel || '',

    context,
    teamGameExpectations: score?.teamGameExpectations || null,
    expectations: score?.expectations || null,
    targets: score?.targets || null,

    score,
    game,
  }
}

const buildSummary = rows => {
  const ratedRows = rows.filter(row => {
    return Number.isFinite(toNumber(row.ratingRaw, null))
  })

  const avgRating = ratedRows.length
    ? roundNumber(
        ratedRows.reduce((sum, row) => {
          return sum + toNumber(row.ratingRaw, 0)
        }, 0) / ratedRows.length,
        2
      )
    : null

  const totalImpact = roundNumber(
    rows.reduce((sum, row) => {
      return sum + toNumber(row.impactDelta, 0)
    }, 0),
    2
  )

  return {
    scores: rows.length,
    ratedScores: ratedRows.length,
    ratedGames: ratedRows.length,

    avgRating,
    rating: avgRating,
    ratingRaw: avgRating,

    totalMinutes: rows.reduce((sum, row) => {
      return sum + toNumber(row.minutes, 0)
    }, 0),

    goals: rows.reduce((sum, row) => {
      return sum + toNumber(row.goals, 0)
    }, 0),

    assists: rows.reduce((sum, row) => {
      return sum + toNumber(row.assists, 0)
    }, 0),

    involvement: rows.reduce((sum, row) => {
      return sum + toNumber(row.involvement, 0)
    }, 0),

    totalImpact,
    cumulativeImpact: totalImpact,
    tva: totalImpact,
  }
}

const buildByGameId = rows => {
  return rows.reduce((acc, row) => {
    if (row?.gameId) {
      acc[row.gameId] = row
    }

    return acc
  }, {})
}

const sortGamesAsc = games => {
  return [...games].sort((a, b) => {
    const timeDiff = getGameTime(a) - getGameTime(b)

    if (timeDiff !== 0) return timeDiff

    return getGameId(a).localeCompare(getGameId(b))
  })
}

export const buildPlayerScoringModel = ({
  player,
  team,
  games,
  calculationMode = 'games',
  coachAssessments = {},
} = {}) => {
  const playerId = getPlayerId(player)
  const safeGames = sortGamesAsc(
    Array.isArray(games) ? games : emptyArray
  )

  let cumulativeImpact = 0

  const rows = safeGames.reduce((acc, game) => {
    const scores = buildGamePlayerScores({
      row: game,
      team,
      calculationMode,
      coachAssessments,
    })

    const item = findPlayerScoreItem({
      scores,
      playerId,
    })

    if (!item) return acc

    const row = buildScoreRow({
      item,
      game,
      playerId,
      cumulativeImpact,
    })

    cumulativeImpact = toNumber(
      row?.cumulativeImpact,
      cumulativeImpact
    )

    acc.push(row)

    return acc
  }, [])

  const byGameId = buildByGameId(rows)
  const summary = buildSummary(rows)

  return {
    rows,
    points: rows,
    byGameId,

    summary,

    trend: {
      points: rows,
      byGameId,
    },

    meta: {
      ready: true,
      source: 'playerProfile.playerScoring',
      calculationMode,
      gamesCount: safeGames.length,
      scoresCount: rows.length,
      ratedGames: summary.ratedGames || 0,
      hasTrend: rows.length > 0,
    },
  }
}

export const buildPlayerLightScoring = buildPlayerScoringModel
