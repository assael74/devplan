// teamProfile/sharedLogic/games/moduleLogic/teamGames.filters.options.js

import {
  buildStaticOptions,
  buildIndicatorsFromConfig,
} from '../../../../../../shared/games/games.options.logic.js'

import {
  TEAM_GAMES_OPTION_CONFIG,
  TEAM_GAMES_INDICATOR_CONFIG,
} from './teamGames.filters.constants.js'

export const buildTeamGamesOptions = (rows) => {
  return TEAM_GAMES_OPTION_CONFIG.reduce((acc, config) => {
    acc[config.id] = buildStaticOptions(
      config.source,
      rows,
      config.getRowValue,
      config.hideEmpty
    )
    return acc
  }, {})
}

export const buildTeamGamesIndicators = (filters) => {
  return buildIndicatorsFromConfig({
    filters,
    searchKey: 'search',
    searchIcon: 'search',
    config: TEAM_GAMES_INDICATOR_CONFIG,
  })
}
