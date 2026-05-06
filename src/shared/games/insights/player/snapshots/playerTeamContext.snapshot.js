// shared/games/insights/player/snapshots/playerTeamContext.snapshot.js

import {
  buildResultBreakdown,
  filterLeaguePlayedGames,
} from '../../games.insights.shared.js'

import {
  calcPercent,
  roundNumber,
  toNumber,
} from '../../team/common/index.js'

import {
  getPlayerWithWithoutReliability,
} from '../common/index.js'

const safeArray = (value) => {
  return Array.isArray(value) ? value : []
}

const normalizeId = (value) => {
  return String(value || '').trim()
}

const getRowId = (row = {}) => {
  return normalizeId(
    row?.id ||
      row?.gameId ||
      row?.matchId ||
      row?.fixtureId ||
      row?.game?.id ||
      row?.game?.gameId ||
      row?.game?.matchId
  )
}

const buildGameIdSet = (rows = []) => {
  return new Set(
    safeArray(rows)
      .map(getRowId)
      .filter(Boolean)
  )
}

const buildContextResult = (rows = []) => {
  const result = buildResultBreakdown(rows)

  return {
    games: result.totalPlayed,
    points: result.points,
    maxPoints: result.maxPoints,
    pointsRate: result.pointsPct,
    pointsPerGame: result.ppg,
    wins: result.wins,
    draws: result.draws,
    losses: result.losses,
  }
}

const buildDifficultyContext = ({
  playerRows,
  teamRows,
}) => {
  const teamByDifficulty = {}
  const playerByDifficulty = {}

  for (const row of safeArray(teamRows)) {
    const key = normalizeId(row?.difficulty || 'unknown') || 'unknown'

    if (!teamByDifficulty[key]) teamByDifficulty[key] = []
    teamByDifficulty[key].push(row)
  }

  for (const row of safeArray(playerRows)) {
    const key = normalizeId(row?.difficulty || 'unknown') || 'unknown'

    if (!playerByDifficulty[key]) playerByDifficulty[key] = []
    playerByDifficulty[key].push(row)
  }

  const ids = ['easy', 'equal', 'hard']

  return ids.map((id) => {
    const playerResult = buildContextResult(playerByDifficulty[id] || [])
    const teamResult = buildContextResult(teamByDifficulty[id] || [])

    return {
      id,
      player: playerResult,
      team: teamResult,
      pointsRateGap: roundNumber(
        playerResult.pointsRate - teamResult.pointsRate,
        1
      ),
      minutes: safeArray(playerByDifficulty[id]).reduce((sum, row) => {
        return sum + toNumber(row?.timePlayed, 0)
      }, 0),
    }
  })
}

export function buildPlayerTeamContextSnapshot({
  playerLeagueGames = [],
  teamLeagueGames = [],
} = {}) {
  const playerGameIds = buildGameIdSet(playerLeagueGames)

  const withPlayer = safeArray(teamLeagueGames).filter((row) => {
    return playerGameIds.has(getRowId(row))
  })

  const withoutPlayer = safeArray(teamLeagueGames).filter((row) => {
    return !playerGameIds.has(getRowId(row))
  })

  const withResult = buildContextResult(withPlayer)
  const withoutResult = buildContextResult(withoutPlayer)
  const teamResult = buildContextResult(teamLeagueGames)

  const reliability = getPlayerWithWithoutReliability({
    withGames: withResult.games,
    withoutGames: withoutResult.games,
  })

  return {
    withPlayer: withResult,
    withoutPlayer: withoutResult,
    team: teamResult,

    pointsRateGap: roundNumber(
      withResult.pointsRate - withoutResult.pointsRate,
      1
    ),

    pointsPerGameGap: roundNumber(
      withResult.pointsPerGame - withoutResult.pointsPerGame,
      2
    ),

    pointsShareOfTeam: calcPercent(withResult.points, teamResult.points),

    difficulty: buildDifficultyContext({
      playerRows: playerLeagueGames,
      teamRows: teamLeagueGames,
    }),

    reliability,

    meta: {
      hasWithData: withResult.games > 0,
      hasWithoutData: withoutResult.games > 0,
      hasEnoughData: reliability.canUseStrongFlag,
    },
  }
}
