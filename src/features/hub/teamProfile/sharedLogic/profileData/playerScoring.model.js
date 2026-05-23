// src/features/hub/teamProfile/sharedLogic/profileData/playerScoring.model.js

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

const getGameObject = row => {
  return row?.game || row || {}
}

const getGameId = row => {
  const game = getGameObject(row)

  return asText(
    row?.gameId ||
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

const pickHomeValue = ({ rowHome, gameHome }) => {
  if (rowHome != null) return rowHome

  return gameHome ?? null
}

const getGameHome = row => {
  const game = getGameObject(row)

  return pickHomeValue({
    rowHome: row?.home,
    gameHome: game?.home,
  })
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
  const date = getGameDate(row)
  const time = new Date(date).getTime()

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

const getPlayerName = ({ player, playerGame, } = {}) => {
  return (
    player?.playerFullName ||
    player?.label ||
    playerGame?.playerFullName ||
    ''
  )
}

const buildScoreRow = ({
  item,
  gameId,
  gameDate,
  gameTime,
  rival,
  round,
  home,
} = {}) => {
  const score = item?.score || {}
  const context = score?.context || {}
  const player = item?.player || {}
  const playerGame = item?.playerGame || {}
  const impactDelta = getImpactDelta(score)

  return {
    gameId,
    gameDate,
    gameTime,
    rival,
    rivel: rival,
    round,
    gameRound: round,
    gameLeagueNum: round,
    home,

    playerId: asText(item?.playerId),

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

    status: score?.status || '',
    reason: score?.reason || '',
    reasonLabel: score?.reasonLabel || '',

    reliability: score?.reliability || null,
    deltas: score?.deltas || null,

    role: context?.roleId || '',
    roleLabel: context?.roleLabel || '',
    positionLayer: context?.positionLayer || '',
    positionLabel: context?.positionLabel || '',

    score,
  }
}

const sortGameRows = rows => {
  return [...rows].sort((a, b) => {
    const ratingDiff =
      toNumber(b.ratingRaw, -999) -
      toNumber(a.ratingRaw, -999)

    if (ratingDiff !== 0) return ratingDiff

    return toNumber(b.minutes, 0) - toNumber(a.minutes, 0)
  })
}

const sortTimelineRows = rows => {
  return [...rows].sort((a, b) => {
    const timeDiff =
      toNumber(a.gameTime, 0) -
      toNumber(b.gameTime, 0)

    if (timeDiff !== 0) return timeDiff

    return String(a.gameId || '').localeCompare(String(b.gameId || ''))
  })
}

const pushToMap = ({ map, key, value }) => {
  if (!key) return

  if (!map[key]) {
    map[key] = []
  }

  map[key].push(value)
}

const buildSummary = flatScores => {
  const ratedRows = flatScores.filter(row => {
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

  return {
    scores: flatScores.length,
    ratedScores: ratedRows.length,
    avgRating,

    totalMinutes: flatScores.reduce((sum, row) => {
      return sum + toNumber(row.minutes, 0)
    }, 0),

    totalImpact: roundNumber(
      flatScores.reduce((sum, row) => {
        return sum + toNumber(row.impactDelta, 0)
      }, 0),
      2
    ),
  }
}

const buildImpactTimeline = flatScores => {
  const sortedScores = sortTimelineRows(flatScores)
  const byPlayerId = {}
  const byGameId = {}
  const cumulativeByPlayerId = {}

  sortedScores.forEach(row => {
    const playerId = asText(row?.playerId)
    const gameId = asText(row?.gameId)

    if (!playerId || !gameId) return

    const prev = toNumber(cumulativeByPlayerId[playerId], 0)
    const impactDelta = toNumber(row?.impactDelta, 0)
    const cumulativeImpact = roundNumber(prev + impactDelta, 2)

    cumulativeByPlayerId[playerId] = cumulativeImpact

    const point = {
      gameId,
      gameDate: row?.gameDate || '',
      gameTime: toNumber(row?.gameTime, 0),

      rival: row?.rival || '',
      rivel: row?.rivel || row?.rival || '',
      round: row?.round || '',
      gameRound: row?.gameRound || row?.round || '',
      gameLeagueNum: row?.gameLeagueNum || row?.round || '',
      home: row?.home ?? null,

      playerId,
      playerFullName: row?.playerFullName || '',
      photo: row?.photo || '',

      rating: row?.rating ?? null,
      ratingRaw: row?.ratingRaw ?? null,

      minutes: toNumber(row?.minutes, 0),
      goals: toNumber(row?.goals, 0),
      assists: toNumber(row?.assists, 0),

      impactDelta,
      cumulativeImpact,

      status: row?.status || '',
      reason: row?.reason || '',
      reasonLabel: row?.reasonLabel || '',
    }
    //console.log(point)

    pushToMap({
      map: byPlayerId,
      key: playerId,
      value: point,
    })

    if (!byGameId[gameId]) {
      byGameId[gameId] = {}
    }

    byGameId[gameId][playerId] = point
  })

  return {
    byPlayerId,
    byGameId,
  }
}

const attachImpactToGameRows = ({ byGameId, impactByGameId }) => {
  Object.keys(byGameId).forEach(gameId => {
    const gameModel = byGameId[gameId]
    const gameImpact = impactByGameId[gameId] || {}

    const rows = Array.isArray(gameModel?.rows)
      ? gameModel.rows
      : emptyArray

    byGameId[gameId] = {
      ...gameModel,

      rows: rows.map(row => {
        const impact = gameImpact?.[row.playerId] || null

        return {
          ...row,
          cumulativeImpact: impact?.cumulativeImpact ?? 0,
          impactPoint: impact,
        }
      }),
    }
  })

  return byGameId
}

export const buildTeamPlayerScoringModel = ({ team, games, calculationMode = 'games', coachAssessments = {} } = {}) => {
  const safeGames = Array.isArray(games) ? games : emptyArray
  //console.log(games)
  const byGameId = {}
  const byPlayerId = {}
  const flatScores = []

  safeGames.forEach(row => {
    const gameId = getGameId(row)
    const gameDate = getGameDate(row)
    const gameTime = getGameTime(row)
    const rival = getGameRival(row)
    const round = getGameRound(row)
    const home = getGameHome(row)

    const scores = buildGamePlayerScores({
      row,
      team,
      calculationMode,
      coachAssessments,
    })

    const rows = sortGameRows(
      (Array.isArray(scores) ? scores : emptyArray)
        .map(item => buildScoreRow({
          item,
          gameId,
          gameDate,
          gameTime,
          rival,
          round,
          home,
        }))
    )

    byGameId[gameId] = {
      gameId,
      gameDate,
      gameTime,
      game: row,
      rows,

      summary: buildSummary(rows),
    }

    rows.forEach(scoreRow => {
      flatScores.push(scoreRow)

      pushToMap({
        map: byPlayerId,
        key: scoreRow.playerId,
        value: scoreRow,
      })
    })
  })

  const impact = buildImpactTimeline(flatScores)

  const gameScoresByGameId = attachImpactToGameRows({
    byGameId,
    impactByGameId: impact.byGameId,
  })

  return {
    flatScores,
    byGameId: gameScoresByGameId,
    byPlayerId,

    impact,

    summary: buildSummary(flatScores),

    meta: {
      calculationMode,
      gamesCount: safeGames.length,
      scoresCount: flatScores.length,
      source: 'teamProfile.playerScoring',
      hasImpactTimeline: true,
    },
  }
}

export const buildTeamLightScoring = buildTeamPlayerScoringModel
