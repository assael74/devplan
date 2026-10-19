// src/ui/patterns/scout/scoutPriorityPlacement.js

const MARGIN = 16
const GAP = 4
const PANEL_WIDTH = 352
const MIN_WIDTH = 260

export const resolveScoutPriorityPlacement = ({
  anchor,
  protectedArea = anchor,
  viewport,
  panelHeight = 300,
}) => {
  const leftSpace = Math.max(0, protectedArea.left - MARGIN - GAP)
  const rightSpace = Math.max(0, viewport.width - protectedArea.right - MARGIN - GAP)
  const canPlaceLeft = leftSpace >= MIN_WIDTH
  const canPlaceRight = rightSpace >= MIN_WIDTH
  const leftDistance = anchor.left - protectedArea.left
  const rightDistance = protectedArea.right - anchor.right

  if (!canPlaceLeft && !canPlaceRight) return { drawer: true }

  const side = canPlaceLeft && (!canPlaceRight || leftDistance <= rightDistance) ? 'left' : 'right'
  const available = side === 'left' ? leftSpace : rightSpace

  const width = Math.min(PANEL_WIDTH, available)
  const height = Math.min(panelHeight, viewport.height - MARGIN * 2)
  const anchorY = (anchor.top + anchor.bottom) / 2
  const top = Math.max(MARGIN, Math.min(anchorY - height / 2, viewport.height - MARGIN - height))
  const left = side === 'left' ? protectedArea.left - GAP - width : protectedArea.right + GAP
  const arrowTop = Math.max(16, Math.min(anchorY - top, height - 16))

  return {
    drawer: false,
    side,
    width,
    top,
    left,
    arrowTop,
  }
}

export const readScoutPriorityPlacement = (anchorEl, panelHeight, sourceColumn = '') => {
  const anchor = anchorEl.getBoundingClientRect()
  const row = anchorEl.closest('tr')
  const badges = row ? [...row.querySelectorAll('[data-scout-priority]')] : [anchorEl]
  const cells = badges.map(badge => (badge.closest('td') || badge).getBoundingClientRect())
  const sourceValue = sourceColumn && row
    ? row.querySelector(`[data-column="${sourceColumn}"] [data-cell-value]`)
    : null
  if (sourceValue) cells.push(sourceValue.closest('td').getBoundingClientRect())
  const windowView = anchorEl.ownerDocument.defaultView

  return resolveScoutPriorityPlacement({
    anchor,
    protectedArea: {
      left: Math.min(anchor.left, ...cells.map(cell => cell.left)),
      right: Math.max(anchor.right, ...cells.map(cell => cell.right)),
    },
    viewport: { width: windowView.innerWidth, height: windowView.innerHeight },
    panelHeight,
  })
}
