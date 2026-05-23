// teamProfile/sharedLogic/games/moduleLogic/teamGames.filters.options.js

import {
  buildStaticOptions,
  buildIndicatorsFromConfig,
} from '../../../../../../shared/games/games.options.logic.js'

import {
  TEAM_GAMES_OPTION_CONFIG,
  TEAM_GAMES_INDICATOR_CONFIG,
  TEAM_GAME_IMPACT_FILTER,
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
  const indicators = buildIndicatorsFromConfig({
    filters,
    searchKey: 'search',
    searchIcon: 'search',
    config: TEAM_GAMES_INDICATOR_CONFIG,
  })

  const impact = TEAM_GAME_IMPACT_FILTER[filters?.impactKey]

  if (impact) {
    indicators.push({
      id: 'impact',
      key: 'impactKey',
      label: impact.label,
      idIcon: impact.idIcon,
      icon: impact.idIcon,
      color: impact.color,
    })
  }

  if (filters?.onlyPlayed) {
    indicators.push({
      id: 'onlyPlayed',
      key: 'onlyPlayed',
      label: 'רק משחקים ששוחקו',
      idIcon: 'upcoming',
      icon: 'upcoming',
      color: 'success',
    })
  }

  return indicators
}
