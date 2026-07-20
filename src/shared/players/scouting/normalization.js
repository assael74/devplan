// src/shared/players/scouting/normalization.js

export const PLAYER_SCOUT_NORMALIZATION_MODE = {
  AUTO: 'auto',
  RAW: 'raw',
  PROJECTED: 'projected',
}

const toNum = (value, fallback = 0) => {
  if (value === null || value === undefined || value === '') return fallback

  const nextValue = Number(value)
  return Number.isFinite(nextValue) ? nextValue : fallback
}

const pickNum = (...values) => {
  for (const value of values) {
    const nextValue = toNum(value, null)
    if (Number.isFinite(nextValue)) return nextValue
  }

  return 0
}

const hasValue = value =>
  value !== null && value !== undefined && value !== ''

const roundNumber = (value, digits = 3) => {
  const nextValue = Number(value)
  if (!Number.isFinite(nextValue)) return 0

  const factor = 10 ** digits
  return Math.round(nextValue * factor) / factor
}

const capNumber = (value, maxValue) => {
  const nextValue = toNum(value)
  const nextMax = toNum(maxValue)

  return nextMax > 0 ? Math.min(nextValue, nextMax) : nextValue
}

const getLeagueTotalRound = ({ team = {}, season = {} } = {}) =>
  pickNum(
    team.leagueTotalRound,
    team.leagueNumGames,
    team.totalLeagueGames,
    season.leagueTotalRound,
    season.leagueNumGames
  )

const getTeamGamesPlayed = ({ team = {}, player = {} } = {}) =>
  pickNum(
    team.gamesPlayed,
    team.playedGames,
    team.games,
    team.teamGamesCount,
    team.teamGamePlayed,
    team.teamStats?.teamGamePlayed,
    player.teamGames,
    player.leagueGames
  )

const getLeagueGameTime = ({ team = {}, player = {} } = {}) =>
  pickNum(team.leagueGameTime, team.gameTime, player.gameTime, 90)

const getTeamGoals = team =>
  pickNum(team.goalsFor, team.leagueGoalsFor, team.teamGoals, team.teamStats?.goalsFor)

const projectValue = ({ value, factor, maxValue = 0 } = {}) =>
  roundNumber(capNumber(toNum(value) * factor, maxValue), 3)

export const buildPlayerScoutNormalization = ({
  player = {},
  team = {},
  season = {},
  mode = PLAYER_SCOUT_NORMALIZATION_MODE.AUTO,
} = {}) => {
  const leagueTotalRound = getLeagueTotalRound({ team, season })
  const teamGamesPlayed = getTeamGamesPlayed({ team, player })
  const leagueGameTime = getLeagueGameTime({ team, player })
  const fullSeasonMinutes = leagueTotalRound * leagueGameTime
  const rawStats = {
    games: pickNum(player.games, player.gamesPlayed, player.appearances, player.matches, player.apps),
    goals: pickNum(player.goals, player.leagueGoals),
    yellowCards: pickNum(player.yellowCards, player.cardsYellow, player.yc),
    minutes: pickNum(player.minutes, player.totalMinutes, player.playedMinutes),
    starts: pickNum(player.starts, player.lineupStarts, player.started),
    subIn: pickNum(player.subIn, player.subbedIn, player.substituteApps),
    subOut: pickNum(player.subOut, player.subbedOut, player.substitutedOut),
    goalGames: pickNum(player.goalGames, player.gamesWithGoals, player.scoringGames),
  }
  const canProject =
    mode !== PLAYER_SCOUT_NORMALIZATION_MODE.RAW &&
    leagueTotalRound > 0 &&
    teamGamesPlayed > 0 &&
    teamGamesPlayed < leagueTotalRound
  const factor = canProject
    ? roundNumber(leagueTotalRound / teamGamesPlayed, 6)
    : 1
  const projectedStats = canProject
    ? {
        games: projectValue({ value: rawStats.games, factor, maxValue: leagueTotalRound }),
        goals: projectValue({ value: rawStats.goals, factor }),
        yellowCards: projectValue({ value: rawStats.yellowCards, factor }),
        minutes: projectValue({ value: rawStats.minutes, factor, maxValue: fullSeasonMinutes }),
        starts: projectValue({ value: rawStats.starts, factor, maxValue: leagueTotalRound }),
        subIn: projectValue({ value: rawStats.subIn, factor, maxValue: leagueTotalRound }),
        subOut: projectValue({ value: rawStats.subOut, factor, maxValue: leagueTotalRound }),
        goalGames: projectValue({ value: rawStats.goalGames, factor, maxValue: leagueTotalRound }),
      }
    : rawStats

  return {
    applied: canProject,
    mode,
    factor,
    leagueTotalRound,
    teamGamesPlayed,
    leagueGameTime,
    fullSeasonMinutes,
    rawStats,
    projectedStats,
  }
}

export const buildNormalizedPlayerScoutInput = ({
  player = {},
  team = {},
  season = {},
  mode = PLAYER_SCOUT_NORMALIZATION_MODE.AUTO,
} = {}) => {
  const normalization = buildPlayerScoutNormalization({
    player,
    team,
    season,
    mode,
  })
  const stats = normalization.projectedStats
  const teamGoals = getTeamGoals(team)
  const projectedTeamGoals = normalization.applied
    ? roundNumber(teamGoals * normalization.factor, 3)
    : teamGoals
  const playerInput = {
    ...player,
    games: stats.games,
    gamesPlayed: stats.games,
    appearances: stats.games,
    goals: stats.goals,
    leagueGoals: stats.goals,
    yellowCards: stats.yellowCards,
    minutes: stats.minutes,
    totalMinutes: stats.minutes,
    playedMinutes: stats.minutes,
    starts: stats.starts,
    lineupStarts: stats.starts,
    subIn: stats.subIn,
    subbedIn: stats.subIn,
    subOut: stats.subOut,
    subbedOut: stats.subOut,
    goalGames: stats.goalGames,
    scoutRawStats: normalization.rawStats,
    scoutProjectedStats: normalization.projectedStats,
    scoutNormalization: normalization,
  }
  const teamInput = {
    ...team,
    games: normalization.applied ? normalization.leagueTotalRound : normalization.teamGamesPlayed,
    gamesPlayed: normalization.applied ? normalization.leagueTotalRound : normalization.teamGamesPlayed,
    playedGames: normalization.applied ? normalization.leagueTotalRound : normalization.teamGamesPlayed,
    teamGamesCount: normalization.applied ? normalization.leagueTotalRound : normalization.teamGamesPlayed,
    leagueGameTime: normalization.leagueGameTime,
    goalsFor: projectedTeamGoals,
    leagueGoalsFor: projectedTeamGoals,
    teamGoals: projectedTeamGoals,
  }

  return {
    player: playerInput,
    team: teamInput,
    normalization,
  }
}
