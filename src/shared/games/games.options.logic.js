
import { findConstItem } from './games.meta.logic.js'

const safeArray = (v) => (Array.isArray(v) ? v : [])

export const buildStaticOptions = (constArr, rows, getRowValue, hideEmpty = false) => {
  const list = safeArray(constArr)
  const baseRows = safeArray(rows)

  const items = list.map((item) => {
    const count = baseRows.filter((row) => getRowValue(row) === item.id).length

    return {
      id: item.id,
      value: item.id,
      label: item?.labelH || item?.id || '',
      idIcon: item?.idIcon || '',
      color: item?.color || 'neutral',
      count,
    }
  })

  return hideEmpty ? items.filter((item) => item.count > 0) : items
}

export const buildIndicatorsFromConfig = ({
  filters,
  searchKey = 'search',
  searchIcon = 'search',
  config = [],
}) => {
  const indicators = []

  if (filters[searchKey]) {
    indicators.push({
      id: searchKey,
      type: searchKey,
      label: filters[searchKey],
      idIcon: searchIcon,
    })
  }

  config.forEach((item) => {
    const value = filters?.[item.key]
    if (!value) return

    const found = findConstItem(item.source, value)

    indicators.push({
      id: item.id,
      type: item.key,
      label: found?.labelH || value,
      idIcon: found?.idIcon || item.fallbackIcon || 'filter',
      color: found?.color || 'neutral',
    })
  })

  return indicators
}
