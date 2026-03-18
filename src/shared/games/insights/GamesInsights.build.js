// shared/games/insights/GamesInsights.build.js

import { buildGamesView } from '../games.view.logic.js'

import {
  buildTeamCoreInsights,
  buildTeamVenueInsights,
  buildTeamTypeInsights,
  buildTeamDifficultyInsights,
  buildTeamTrendInsights,
  buildTeamScheduleInsights,
  buildTeamUiCards,
} from './games.insights.team.js'

import {
  buildPlayerParticipationInsights,
  buildPlayerScoringInsights,
  buildPlayerStartingVsBenchInsights,
  buildPlayerVenueInsights,
  buildPlayerTypeInsights,
  buildPlayerRecentInsights,
  buildPlayerUiCards,
} from './games.insights.player.js'

import { buildTeamFeedItems, buildPlayerFeedItems } from './games.insights.feed.js'

export const buildTeamGamesInsights = ({ rows = [], normalizeRow }) => {
  const view = buildGamesView(rows, normalizeRow)
  const playedGames = view.playedGames || []

  const core = buildTeamCoreInsights(playedGames)
  const venue = buildTeamVenueInsights(playedGames)
  const type = buildTeamTypeInsights(playedGames)
  const difficulty = buildTeamDifficultyInsights(playedGames)
  const trend = buildTeamTrendInsights(playedGames)
  const schedule = buildTeamScheduleInsights({
    upcomingGames: view.upcomingGames,
    nextGame: view.nextGame,
  })

  const cards = buildTeamUiCards({
    success: core.success,
    recent: trend.recent,
    streaks: trend.streaks,
    nextGame: view.nextGame,
    byVenue: venue.byVenue,
    byType: type.byType,
  })

  const feed = buildTeamFeedItems({
    recent: trend.recent,
    streaks: trend.streaks,
    byVenue: venue.byVenue,
  })

  return {
    domain: 'teamGames',
    state: view.state,
    rows: view.rows,
    playedGames: view.playedGames,
    upcomingGames: view.upcomingGames,
    nextGame: view.nextGame,

    summary: {
      all: view.summary,
      played: view.summaryPlayed,
      core,
      grouped: {
        byVenue: venue.byVenue,
        byType: type.byType,
        byDifficulty: difficulty.byDifficulty,
      },
      trends: trend,
      schedule,
    },

    ui: {
      cards,
      feed,
      chips: [],
    },
  }
}

export const buildPlayerGamesInsights = ({ player, rows = [], normalizeRow }) => {
  const view = buildGamesView(rows, normalizeRow)
  const playedGames = view.playedGames || []

  const participation = buildPlayerParticipationInsights({ player, playedGames })
  const scoring = buildPlayerScoringInsights(playedGames)
  const splits = buildPlayerStartingVsBenchInsights(playedGames)
  const venue = buildPlayerVenueInsights(playedGames)
  const type = buildPlayerTypeInsights(playedGames)
  const recent = buildPlayerRecentInsights(playedGames)

  const cards = buildPlayerUiCards({
    participation,
    scoring,
    recent,
  })

  const feed = buildPlayerFeedItems({
    participation,
    scoring,
  })

  return {
    domain: 'playerGames',
    state: view.state,
    rows: view.rows,
    playedGames: view.playedGames,
    upcomingGames: view.upcomingGames,
    nextGame: view.nextGame,

    summary: {
      all: view.summary,
      played: view.summaryPlayed,
      participation,
      scoring,
      splits,
      grouped: {
        byVenue: venue.byVenue,
        byType: type.byType,
        byDifficulty: type.byDifficulty,
      },
      recent,
    },

    ui: {
      cards,
      feed,
      chips: [],
    },
  }
}
