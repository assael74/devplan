// teamProfile/sharedLogic/players/viewModel/tooltips/tooltip.model.js

const emptyArray = []

const safeArr = (value) => {
  return Array.isArray(value) ? value : emptyArray
}

const getPlayerLabel = (player = {}) => {
  return (player.playerFullName || player.fullName || '')
}

const buildPlayersItems = (players = []) => {
  return safeArr(players)
    .map(getPlayerLabel)
    .filter(Boolean)
}

export const buildTooltip = ({
  title = 'מדד',
  actual = '',
  target = '',
  status = '',
  basis = '',
  listTitle = 'שחקנים',
  players = [],
} = {}) => {
  const playerItems = buildPlayersItems(players)

  const rows = [
    actual
      ? {
          id: 'actual',
          label: 'בפועל',
          value: actual,
        }
      : null,

    target
      ? {
          id: 'target',
          label: 'יעד',
          value: target,
        }
      : null,

    status
      ? {
          id: 'status',
          label: 'סטטוס',
          value: status,
        }
      : null,

    basis
      ? {
          id: 'basis',
          label: 'בסיס חישוב',
          value: basis,
        }
      : null,

    playerItems.length
      ? {
          id: 'players',
          label: listTitle,
          items: playerItems,
        }
      : null,
  ].filter(Boolean)

  return {
    title,
    rows,
  }
}
