// src/features/hub/teamProfile/desktop/modules/players/components/sections/ui/targetsCell.ui.js

const emptyArray = []

const isValue = value => {
  return value !== null && value !== undefined && value !== '' && value !== '—'
}

const limitItems = (items = [], limit = 4) => {
  return (Array.isArray(items) ? items : emptyArray)
    .filter(item => isValue(item?.value))
    .slice(0, limit)
}

const getTargets = row => {
  return row?.targets || {}
}

export const resolveTargetMetricKey = item => {
  const id = item?.id || ''

  if (
    id === 'goals' ||
    id === 'goalContributions' ||
    id === 'contributions'
  ) {
    return 'goals'
  }

  if (id === 'assists') return 'assists'

  if (
    id === 'goalsAgainst' ||
    id === 'playerGoalsAgainst'
  ) {
    return 'defense'
  }

  return 'neutral'
}

export const buildTargetItemModel = item => {
  return {
    ...item,
    metricKey: resolveTargetMetricKey(item),
    icon: item?.icon || 'targets',
  }
}

export const buildTargetsCellModel = row => {
  const targets = getTargets(row)
  const mainItems = limitItems(targets?.mainItems, 4).map(buildTargetItemModel)

  return {
    hasTargets: targets?.hasTargets === true,
    label: targets?.labels?.playerTarget || 'יעדי ביצוע',
    mainItems,
    viewModel: targets?.viewModel || null,
    source: targets?.source || null,
  }
}
