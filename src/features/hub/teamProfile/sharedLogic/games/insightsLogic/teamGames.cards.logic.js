// teamProfile/sharedLogic/games/insightsLogic/teamGames.cards.logic.js

import {
  buildTeamGamesTopStats,
  buildTeamGamesCards,
} from './teamGames.cards.result.js'

import {
  buildHomeAwayInsightItems,
  buildDifficultyInsightItems,
  buildFeedInsightItems,
} from './teamGames.cards.grouped.js'

export {
  buildTeamGamesTopStats,
  buildTeamGamesCards,
  buildHomeAwayInsightItems,
  buildDifficultyInsightItems,
  buildFeedInsightItems,
}

export const buildTeamGamesDrawerViewModel = (insights) => {
  const summary = insights?.summary || {}

  return {
    topStats: buildTeamGamesTopStats(summary),
    cards: buildTeamGamesCards(summary),
    homeAwayItems: buildHomeAwayInsightItems(summary),
    difficultyItems: buildDifficultyInsightItems(summary),
    feedItems: buildFeedInsightItems(insights),
  }
}
