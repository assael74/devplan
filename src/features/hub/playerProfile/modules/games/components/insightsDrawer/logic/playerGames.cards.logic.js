// playerProfile/modules/games/components/insightsDrawer/logic/playerGames.cards.logic.js

import {
  buildPlayerGamesTopStats,
  buildPlayerGamesCards,
} from './playerGames.cards.result.js'

import {
  buildHomeAwayInsightItems,
  buildDifficultyInsightItems,
  buildFeedInsightItems,
  buildTypeInsightItems,
} from './playerGames.cards.grouped.js'

export {
  buildPlayerGamesTopStats,
  buildPlayerGamesCards,
  buildHomeAwayInsightItems,
  buildDifficultyInsightItems,
  buildFeedInsightItems,
  buildTypeInsightItems,
}

export const buildPlayerGamesDrawerViewModel = (insights) => {
  const summary = insights?.summary || {}

  return {
    topStats: buildPlayerGamesTopStats(summary),
    cards: buildPlayerGamesCards(summary),
    homeAwayItems: buildHomeAwayInsightItems(summary),
    difficultyItems: buildDifficultyInsightItems(summary),
    typeItems: buildTypeInsightItems(summary),
    feedItems: buildFeedInsightItems(insights),
  }
}
