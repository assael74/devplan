// playerProfile/sharedLogic/games/module/playerGames.filters.options.js

import {
  buildStaticOptions,
  buildIndicatorsFromConfig,
} from '../../../../../../shared/games/games.options.logic.js'

import {
  PLAYER_GAMES_OPTION_CONFIG,
  PLAYER_GAMES_INDICATOR_CONFIG,
  PLAYER_GAME_RATING,
} from './playerGames.filters.constants.js'

const safeArray = value => {
  return Array.isArray(value) ? value : []
}

const countByValue = ({ rows, key }) => {
  return safeArray(rows).reduce((acc, row) => {
    const value = row?.[key]

    if (value) {
      acc[value] = (acc[value] || 0) + 1
    }

    return acc
  }, {})
}

const buildRatingOptions = rows => {
  const counts = countByValue({
    rows,
    key: 'ratingKey',
  })

  return PLAYER_GAME_RATING
    .map(item => ({
      ...item,
      count: counts[item.value] || 0,
    }))
    .filter(item => item.count > 0)
}

export const buildPlayerGamesOptions = rows => {
  const options = PLAYER_GAMES_OPTION_CONFIG.reduce((acc, config) => {
    if (config.id === 'ratingOptions') return acc

    acc[config.id] = buildStaticOptions(
      config.source,
      rows,
      config.getRowValue,
      config.hideEmpty
    )

    return acc
  }, {})

  return {
    ...options,
    ratingOptions: buildRatingOptions(rows),
  }
}

export const buildPlayerGamesIndicators = filters => {
  return buildIndicatorsFromConfig({
    filters,
    searchKey: 'search',
    searchIcon: 'search',
    config: PLAYER_GAMES_INDICATOR_CONFIG,
  })
}
