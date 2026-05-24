// clubProfile/desktop/modules/players/components/sections/ui/positionsSection.ui.js

const emptyArray = []

const asArray = value => {
  return Array.isArray(value) ? value : emptyArray
}

export const getPrimaryPosition = row => {
  const positions = asArray(row?.positions)
  const primary = row?.primaryPosition || row?.generalPosition?.primaryPosition || ''

  return positions.includes(primary) ? primary : ''
}

export const getMainPosition = row => {
  const positions = asArray(row?.positions)

  return getPrimaryPosition(row) || positions[0] || ''
}

export const buildPositionsSectionModel = row => {
  const positions = asArray(row?.positions)
  const primaryPosition = getPrimaryPosition(row)
  const mainPosition = getMainPosition(row)

  const extraCount = mainPosition
    ? Math.max(positions.filter(pos => pos !== mainPosition).length, 0)
    : 0

  return {
    mainPosition,
    primaryPosition,
    extraCount,

    generalPositionLabel: row?.generalPosition?.layerLabel || '',
    generalPositionIcon: row?.generalPosition?.layerKey || 'layers',

    isPrimary: Boolean(primaryPosition && primaryPosition === mainPosition),
    isEmpty: !mainPosition,
  }
}
