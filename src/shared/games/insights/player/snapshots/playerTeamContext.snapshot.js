// shared/games/insights/player/snapshots/playerTeamContext.snapshot.js

import {
  buildResultBreakdown,
} from '../../games.insights.shared.js'

import {
  calcPercent,
  roundNumber,
  toNumber,
} from '../../team/common/index.js'

import {
  getPlayerWithWithoutReliability,
} from '../common/index.js'

const DIFFICULTY_LEVELS = [
  {
    id: 'easy',
    label: 'יריבה נוחה',
  },
  {
    id: 'equal',
    label: 'יריבה שווה',
  },
  {
    id: 'hard',
    label: 'יריבה קשה',
  },
]

const safeArray = (value) => {
  return Array.isArray(value) ? value : []
}

const normalizeId = (value) => {
  return String(value || '').trim()
}

const getRowId = ({ row = {} } = {}) => {
  return normalizeId(
    row.id ||
      row.gameId ||
      row.game?.id ||
      row.game?.gameId
  )
}

const buildGameIdSet = ({ rows = [] } = {}) => {
  return new Set(
    safeArray(rows)
      .map((row) => getRowId({ row }))
      .filter(Boolean)
  )
}

const sumBy = ({
  rows = [],
  key,
} = {}) => {
  return safeArray(rows).reduce((sum, row) => {
    return sum + toNumber(row?.[key], 0)
  }, 0)
}

const buildContextResult = ({ rows = [] } = {}) => {
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

const getDifficultyId = ({ row = {} } = {}) => {
  return String(row.difficulty || row.game?.difficulty || '')
}

const isSameDifficulty = ({
  row = {},
  difficultyId,
} = {}) => {
  return getDifficultyId({ row }) === difficultyId
}

const getDifficultyRows = ({
  rows = [],
  difficultyId,
} = {}) => {
  return safeArray(rows).filter((row) => {
    return isSameDifficulty({
      row,
      difficultyId,
    })
  })
}

const hasPlayerPlayed = ({ row = {} } = {}) => {
  return toNumber(row.timePlayed, 0) > 0
}

const getPlayedPlayerRows = ({ rows = [] } = {}) => {
  return safeArray(rows).filter((row) => {
    return hasPlayerPlayed({ row })
  })
}

const buildDifficultyBucket = ({
  difficulty,
  playerPlayedRows,
  teamRows,
  playerGameIds,
} = {}) => {
  const difficultyId = difficulty.id

  const teamDifficultyRows = getDifficultyRows({
    rows: teamRows,
    difficultyId,
  })

  const playerDifficultyRows = getDifficultyRows({
    rows: playerPlayedRows,
    difficultyId,
  })

  const withPlayerRows = teamDifficultyRows.filter((row) => {
    return playerGameIds.has(getRowId({ row }))
  })

  const withoutPlayerRows = teamDifficultyRows.filter((row) => {
    return !playerGameIds.has(getRowId({ row }))
  })

  const withPlayer = buildContextResult({
    rows: withPlayerRows,
  })

  const withoutPlayer = buildContextResult({
    rows: withoutPlayerRows,
  })

  const team = buildContextResult({
    rows: teamDifficultyRows,
  })

  const pointsRateGap = roundNumber(
    withPlayer.pointsRate - withoutPlayer.pointsRate,
    1
  )

  const pointsPerGameGap = roundNumber(
    withPlayer.pointsPerGame - withoutPlayer.pointsPerGame,
    2
  )

  const minutes = sumBy({
    rows: playerDifficultyRows,
    key: 'timePlayed',
  })

  return {
    id: difficulty.id,
    label: difficulty.label,

    withPlayer,
    withoutPlayer,
    team,

    // compat
    player: withPlayer,
    playerGames: withPlayer.games,
    playerPoints: withPlayer.points,
    playerMaxPoints: withPlayer.maxPoints,
    playerPointsRate: withPlayer.pointsRate,
    playerPointsPerGame: withPlayer.pointsPerGame,

    teamGames: team.games,
    teamPoints: team.points,
    teamMaxPoints: team.maxPoints,
    teamPointsRate: team.pointsRate,
    teamPointsPerGame: team.pointsPerGame,

    withoutPlayerGames: withoutPlayer.games,
    withoutPlayerPoints: withoutPlayer.points,
    withoutPlayerMaxPoints: withoutPlayer.maxPoints,
    withoutPlayerPointsRate: withoutPlayer.pointsRate,
    withoutPlayerPointsPerGame: withoutPlayer.pointsPerGame,

    pointsRateGap,
    pointsPerGameGap,
    minutes,

    games: {
      withPlayer: withPlayerRows,
      withoutPlayer: withoutPlayerRows,
      player: playerDifficultyRows,
      team: teamDifficultyRows,
    },
  }
}

const buildDifficultyContext = ({
  playerRows = [],
  teamRows = [],
} = {}) => {
  const playerPlayedRows = getPlayedPlayerRows({
    rows: playerRows,
  })

  const playerGameIds = buildGameIdSet({
    rows: playerPlayedRows,
  })

  return DIFFICULTY_LEVELS.map((difficulty) => {
    return buildDifficultyBucket({
      difficulty,
      playerPlayedRows,
      teamRows,
      playerGameIds,
    })
  })
}

const buildWithWithoutRows = ({
  playerLeagueGames = [],
  teamLeagueGames = [],
} = {}) => {
  const playerGameIds = buildGameIdSet({
    rows: playerLeagueGames,
  })

  const withPlayer = safeArray(teamLeagueGames).filter((row) => {
    return playerGameIds.has(getRowId({ row }))
  })

  const withoutPlayer = safeArray(teamLeagueGames).filter((row) => {
    return !playerGameIds.has(getRowId({ row }))
  })

  return {
    withPlayer,
    withoutPlayer,
  }
}

export function buildPlayerTeamContextSnapshot({
  playerLeagueGames = [],
  teamLeagueGames = [],
} = {}) {
  const rows = buildWithWithoutRows({
    playerLeagueGames,
    teamLeagueGames,
  })

  const withResult = buildContextResult({
    rows: rows.withPlayer,
  })

  const withoutResult = buildContextResult({
    rows: rows.withoutPlayer,
  })

  const teamResult = buildContextResult({
    rows: teamLeagueGames,
  })

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

    pointsShareOfTeam: calcPercent(
      withResult.points,
      teamResult.points
    ),

    difficulty: buildDifficultyContext({
      playerRows: playerLeagueGames,
      teamRows: teamLeagueGames,
    }),

    games: {
      withPlayer: rows.withPlayer,
      withoutPlayer: rows.withoutPlayer,
      team: teamLeagueGames,
      player: playerLeagueGames,
    },

    reliability,

    meta: {
      hasWithData: withResult.games > 0,
      hasWithoutData: withoutResult.games > 0,
      hasEnoughData: reliability.canUseStrongFlag,
    },
  }
}
