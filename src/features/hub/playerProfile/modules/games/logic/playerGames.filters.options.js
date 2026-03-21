import {
  buildStaticOptions,
  buildIndicatorsFromConfig,
} from '../../../../../../shared/games/games.options.logic.js'

import {
  PLAYER_GAMES_OPTION_CONFIG,
  PLAYER_GAMES_INDICATOR_CONFIG,
} from './playerGames.filters.constants.js'

export const buildPlayerGamesOptions = (rows) => {
  return PLAYER_GAMES_OPTION_CONFIG.reduce((acc, config) => {
    acc[config.id] = buildStaticOptions(
      config.source,
      rows,
      config.getRowValue,
      config.hideEmpty
    )
    return acc
  }, {})
}

export const buildPlayerGamesIndicators = (filters) => {
  return buildIndicatorsFromConfig({
    filters,
    searchKey: 'search',
    searchIcon: 'search',
    config: PLAYER_GAMES_INDICATOR_CONFIG,
  })
}
