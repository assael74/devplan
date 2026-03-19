// shared/games/insights/GamesInsights.build.js

import { buildGamesView } from '../games.view.logic.js'

import {
  filterLeaguePlayedGames,
} from './games.insights.shared.js'

import {
  buildTeamCoreInsights,
  buildTeamHomeOrAwayInsights,
  buildTeamTypeInsights,
  buildTeamDifficultyInsights,
  buildTeamTrendInsights,
  buildTeamScheduleInsights,
} from './games.insights.team.js'

import {
  buildPlayerParticipationInsights,
  buildPlayerScoringInsights,
  buildPlayerStartingVsBenchInsights,
  buildPlayerHomeOrAwayInsights,
  buildPlayerTypeInsights,
  buildPlayerRecentInsights,
} from './games.insights.player.js'

export const buildTeamGamesInsights = ({ rows = [], normalizeRow }) => {
  const view = buildGamesView(rows, normalizeRow)
  const leaguePlayedGames = filterLeaguePlayedGames(view.playedGames || [])

  const core = buildTeamCoreInsights(leaguePlayedGames)
  const homeOrAway = buildTeamHomeOrAwayInsights(leaguePlayedGames)
  const type = buildTeamTypeInsights(leaguePlayedGames)
  const difficulty = buildTeamDifficultyInsights(leaguePlayedGames)
  const trend = buildTeamTrendInsights(leaguePlayedGames)
  const schedule = buildTeamScheduleInsights({
    upcomingGames: view.upcomingGames,
    nextGame: view.nextGame,
  })

  return {
    domain: 'teamGames',
    state: view.state,
    rows: view.rows,
    playedGames: view.playedGames,
    leaguePlayedGames,
    upcomingGames: view.upcomingGames,
    nextGame: view.nextGame,

    summary: {
      all: view.summary,
      played: view.summaryPlayed,
      core,
      grouped: {
        byHomeOrAway: homeOrAway.byHomeOrAway,
        byType: type.byType,
        byDifficulty: difficulty.byDifficulty,
      },
      trends: trend,
      schedule,
    },
  }
}

export const buildPlayerGamesInsights = ({ player, rows = [], normalizeRow }) => {
  const view = buildGamesView(rows, normalizeRow)
  const leaguePlayedGames = filterLeaguePlayedGames(view.playedGames || [])

  const participation = buildPlayerParticipationInsights({
    player,
    playedGames: leaguePlayedGames,
  })

  const scoring = buildPlayerScoringInsights(leaguePlayedGames)
  const splits = buildPlayerStartingVsBenchInsights(leaguePlayedGames)
  const homeOrAway = buildPlayerHomeOrAwayInsights(leaguePlayedGames)
  const type = buildPlayerTypeInsights(leaguePlayedGames)
  const recent = buildPlayerRecentInsights(leaguePlayedGames)

  return {
    domain: 'playerGames',
    state: view.state,
    rows: view.rows,
    playedGames: view.playedGames,
    leaguePlayedGames,
    upcomingGames: view.upcomingGames,
    nextGame: view.nextGame,

    summary: {
      all: view.summary,
      played: view.summaryPlayed,
      participation,
      scoring,
      splits,
      grouped: {
        byHomeOrAway: homeOrAway.byHomeOrAway,
        byType: type.byType,
        byDifficulty: type.byDifficulty,
      },
      recent,
    },
  }
}
