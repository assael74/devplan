// teamProfile/desktop/modules/players/components/sections/ui/positionsCell.ui.js

const emptyArray = []

export const getPrimaryPosition = (row = {}) => {
  const positions = Array.isArray(row?.positions) ? row.positions : emptyArray
  const primary = row?.primaryPosition || row?.generalPosition?.primaryPosition || ''

  return positions.includes(primary) ? primary : ''
}

export const getMainPosition = (row = {}) => {
  const positions = Array.isArray(row?.positions) ? row.positions : emptyArray

  return getPrimaryPosition(row) || positions[0] || ''
}

export const buildPositionsCellModel = row => {
  const positions = Array.isArray(row?.positions) ? row.positions : emptyArray
  const mainPosition = getMainPosition(row)

  const extraCount = mainPosition
    ? Math.max(positions.filter(pos => pos !== mainPosition).length, 0)
    : 0

  return {
    mainPosition,
    extraCount,
    generalPositionLabel: row?.generalPosition?.layerLabel || '',
    generalPositionIcon: row?.generalPosition?.layerKey || 'layers',
    isEmpty: !mainPosition,
  }
}
