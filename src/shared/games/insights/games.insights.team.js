// shared/games/insights/games.insights.team.js

import {
  buildResultBreakdown,
  buildGoalsSummary,
  buildGroupedInsights,
  buildRecentWindow,
  buildStreaks,
} from './games.insights.shared.js'

export const buildTeamCoreInsights = (leaguePlayedGames) => {
  return {
    result: buildResultBreakdown(leaguePlayedGames),
    goals: buildGoalsSummary(leaguePlayedGames),
  }
}

export const buildTeamHomeOrAwayInsights = (leaguePlayedGames) => {
  const grouped = buildGroupedInsights(leaguePlayedGames)

  return {
    byHomeOrAway: grouped.byHomeOrAway,
  }
}

export const buildTeamTypeInsights = (leaguePlayedGames) => {
  const grouped = buildGroupedInsights(leaguePlayedGames)

  return {
    byType: grouped.byType,
  }
}

export const buildTeamDifficultyInsights = (leaguePlayedGames) => {
  const grouped = buildGroupedInsights(leaguePlayedGames)

  return {
    byDifficulty: grouped.byDifficulty,
  }
}

export const buildTeamTrendInsights = (leaguePlayedGames) => {
  return {
    recent: buildRecentWindow(leaguePlayedGames, 5),
    streaks: buildStreaks(leaguePlayedGames),
  }
}

export const buildTeamScheduleInsights = ({ upcomingGames = [], nextGame = null }) => {
  return {
    upcomingCount: Array.isArray(upcomingGames) ? upcomingGames.length : 0,
    nextGame,
  }
}
