import {
  TEAM_GAMES_OPTION_CONFIG,
  TEAM_GAMES_INDICATOR_CONFIG,
} from './teamGames.filters.constants.js'
import { findConstItem } from './teamGames.filters.enrich.js'

const safeArray = (v) => (Array.isArray(v) ? v : [])

export const buildStaticOptions = (constArr, rows, getRowValue) => {
  const list = safeArray(constArr)
  const baseRows = safeArray(rows)

  return list.map((item) => {
    const count = baseRows.filter((row) => getRowValue(row) === item.id).length

    return {
      id: item.id,
      value: item.id,
      label: item?.labelH || item?.id || '',
      idIcon: item?.idIcon || '',
      count,
    }
  })
}

export const buildTeamGamesOptions = (rows) => {
  return TEAM_GAMES_OPTION_CONFIG.reduce((acc, config) => {
    const items = buildStaticOptions(config.source, rows, config.getRowValue)
    acc[config.id] = config.hideEmpty ? items.filter((item) => item.count > 0) : items
    return acc
  }, {})
}

export const buildTeamGamesIndicators = (filters) => {
  const indicators = []

  if (filters?.search) {
    indicators.push({
      id: 'search',
      type: 'search',
      label: filters.search,
      idIcon: 'search',
    })
  }

  TEAM_GAMES_INDICATOR_CONFIG.forEach((config) => {
    const value = filters?.[config.key]
    if (!value) return

    const item = findConstItem(config.source, value)

    indicators.push({
      id: config.id,
      type: config.key,
      label: item?.labelH || value,
      idIcon: item?.idIcon || config.fallbackIcon,
    })
  })

  return indicators
}
