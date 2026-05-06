// shared/games/insights/player/common/playerGameTime.js

import {
  calcPercent,
  roundNumber,
  toNumber,
} from '../../team/common/index.js'

export const DEFAULT_LEAGUE_GAME_TIME = 90

export function resolveLeagueGameTime({
  team,
  player,
  fallback = DEFAULT_LEAGUE_GAME_TIME,
} = {}) {
  const fromTeam = toNumber(team?.leagueGameTime, 0)

  if (fromTeam > 0) return fromTeam

  const fromPlayerTeam = toNumber(player?.team?.leagueGameTime, 0)

  if (fromPlayerTeam > 0) return fromPlayerTeam

  return fallback
}

export function calcMinutesPossible({
  gamesCount,
  leagueGameTime,
}) {
  const count = toNumber(gamesCount, 0)
  const gameTime = toNumber(leagueGameTime, DEFAULT_LEAGUE_GAME_TIME)

  if (count <= 0 || gameTime <= 0) return 0

  return count * gameTime
}

export function calcMinutesPct({
  minutesPlayed,
  minutesPossible,
}) {
  return calcPercent(minutesPlayed, minutesPossible)
}

export function calcPerLeagueGameTime({
  value,
  minutesPlayed,
  leagueGameTime,
  digits = 2,
}) {
  const v = toNumber(value, 0)
  const minutes = toNumber(minutesPlayed, 0)
  const gameTime = toNumber(leagueGameTime, DEFAULT_LEAGUE_GAME_TIME)

  if (minutes <= 0 || gameTime <= 0) return 0

  return roundNumber((v / minutes) * gameTime, digits)
}

export function calcPlayerGameTimeSummary({
  playerGamesCount,
  teamGamesCount,
  minutesPlayed,
  starts,
  leagueGameTime,
}) {
  const gamesIncluded = toNumber(playerGamesCount, 0)
  const teamGamesTotal = toNumber(teamGamesCount, 0)
  const playedMinutes = toNumber(minutesPlayed, 0)
  const startsCount = toNumber(starts, 0)

  const minutesPossible = calcMinutesPossible({
    gamesCount: teamGamesTotal,
    leagueGameTime,
  })

  return {
    leagueGameTime,

    teamGamesTotal,
    gamesIncluded,
    gamesPct: calcPercent(gamesIncluded, teamGamesTotal),

    minutesPlayed: playedMinutes,
    minutesPossible,
    minutesPct: calcMinutesPct({
      minutesPlayed: playedMinutes,
      minutesPossible,
    }),

    starts: startsCount,
    startsPctFromPlayed: calcPercent(startsCount, gamesIncluded),
    startsPctFromTeamGames: calcPercent(startsCount, teamGamesTotal),
  }
}
