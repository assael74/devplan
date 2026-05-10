// playerProfile/sharedLogic/games/insightsDrawer/tooltip/opportunity.tooltip.js

import {
  getFullDateIl,
} from '../../../../../../../shared/format/dateUtiles.js'

import {
  numRow,
  pctRow,
  row,
  tooltip,
} from './tooltip.shared.js'

const safeArray = (value) => {
  return Array.isArray(value) ? value.filter(Boolean) : []
}

const toNum = (value, fallback = 0) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

const getMetrics = (brief = {}) => {
  return brief?.metrics || {}
}

const getUsage = (brief = {}) => {
  const metrics = getMetrics(brief)

  return metrics.usage || metrics
}

const getRole = (brief = {}) => {
  const metrics = getMetrics(brief)

  return metrics.role || metrics.targetRole || {}
}

const getPosition = (brief = {}) => {
  const metrics = getMetrics(brief)

  return metrics.position || {}
}

const getGameRows = (gamesData) => {
  if (Array.isArray(gamesData)) {
    return safeArray(gamesData)
  }

  if (Array.isArray(gamesData?.leaguePlayedGames)) {
    return safeArray(gamesData.leaguePlayedGames)
  }

  if (Array.isArray(gamesData?.playedGames)) {
    return safeArray(gamesData.playedGames)
  }

  if (Array.isArray(gamesData?.rows)) {
    return safeArray(gamesData.rows)
  }

  return []
}

const getGameObject = (row = {}) => {
  return row?.game || row
}

const getGameName = (row = {}) => {
  const game = getGameObject(row)

  return (
    row.rivel ||
    game.rivel ||
    row.rival ||
    game.rival ||
    'יריבה'
  )
}

const getGameDateValue = (row = {}) => {
  return row?.game?.gameDate || row?.gameDate || ''
}

const getGameDateTime = (row = {}) => {
  const value = getGameDateValue(row)
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 0

  return date.getTime()
}

const sortByDateAsc = (rows = []) => {
  return safeArray(rows).slice().sort((a, b) => {
    return getGameDateTime(a) - getGameDateTime(b)
  })
}

const getGameDate = (row = {}) => {
  return getFullDateIl(getGameDateValue(row))
}

const getMinutesValue = (row = {}) => {
  return toNum(row?.timePlayed)
}

const getStartValue = (row = {}) => {
  return row?.isStarting === true || row?.onStart === true
}

const buildGameText = ({ row, extra }) => {
  const opponent = getGameName(row)
  const date = getGameDate(row)
  const dateText = date && date !== '—' ? ` · ${date}` : ''

  return `${opponent}${dateText} · ${extra}`
}

const buildPlayedItems = (gamesData) => {
  return sortByDateAsc(getGameRows(gamesData))
    .filter((row) => getMinutesValue(row) > 0)
    .map((row) => ({
      id: row.id || row.gameId || `${getGameName(row)}_played`,
      text: buildGameText({
        row,
        extra: `${getMinutesValue(row)} דקות`,
      }),
    }))
}

const buildStartItems = (gamesData) => {
  return sortByDateAsc(getGameRows(gamesData))
    .filter(getStartValue)
    .map((row) => ({
      id: row.id || row.gameId || `${getGameName(row)}_start`,
      text: buildGameText({
        row,
        extra: 'פתח בהרכב',
      }),
    }))
}

const addItemsRow = ({ rows, id, label, items }) => {
  if (!Array.isArray(items) || !items.length) return

  rows.push({
    id,
    label,
    items,
  })
}

const buildMinutesTooltip = ({ brief, gamesData }) => {
  const usage = getUsage(brief)
  const role = getRole(brief)

  const rows = [
    pctRow({
      id: 'actual',
      label: 'בפועל',
      value: usage.minutesPct,
    }),
    numRow({
      id: 'minutesPlayed',
      label: 'דקות משחק',
      value: usage.minutesPlayed,
      suffix: 'דקות',
    }),
    numRow({
      id: 'minutesPossible',
      label: 'מכנה',
      value: usage.minutesPossible,
      suffix: 'דקות אפשריות',
    }),
    numRow({
      id: 'teamGames',
      label: 'משחקי קבוצה',
      value: usage.teamGamesTotal,
      suffix: 'משחקים',
    }),
    numRow({
      id: 'gameTime',
      label: 'זמן משחק',
      value: usage.leagueGameTime || 90,
      suffix: 'דקות',
    }),
    row({
      id: 'role',
      label: 'מעמד',
      value: role.label || 'לא הוגדר',
    }),
    row({
      id: 'basis',
      label: 'בסיס חישוב',
      value: 'דקות משחק / דקות אפשריות בקבוצה',
    }),
  ]

  addItemsRow({
    rows,
    id: 'playedGames',
    label: 'משחקים בהם שותף',
    items: buildPlayedItems(gamesData),
  })

  return tooltip({
    title: 'פירוט אחוז דקות',
    rows,
  })
}

const buildStartsTooltip = ({ brief, gamesData }) => {
  const usage = getUsage(brief)
  const role = getRole(brief)

  const rows = [
    pctRow({
      id: 'actual',
      label: 'בפועל',
      value: usage.startsPctFromTeamGames,
    }),
    numRow({
      id: 'starts',
      label: 'פתח בהרכב',
      value: usage.starts,
      suffix: 'משחקים',
    }),
    numRow({
      id: 'teamGames',
      label: 'מכנה',
      value: usage.teamGamesTotal,
      suffix: 'משחקי קבוצה',
    }),
    pctRow({
      id: 'startsFromPlayed',
      label: 'מתוך משחקיו',
      value: usage.startsPctFromPlayed,
    }),
    row({
      id: 'role',
      label: 'מעמד',
      value: role.label || 'לא הוגדר',
    }),
    row({
      id: 'basis',
      label: 'בסיס חישוב',
      value: 'פתיחות / משחקי ליגה של הקבוצה',
    }),
  ]

  addItemsRow({
    rows,
    id: 'startGames',
    label: 'משחקים בהם פתח',
    items: buildStartItems(gamesData),
  })

  return tooltip({
    title: 'פירוט פתיחות בהרכב',
    rows,
  })
}

const buildGamesTooltip = ({ brief, gamesData }) => {
  const usage = getUsage(brief)
  const position = getPosition(brief)

  const rows = [
    pctRow({
      id: 'actual',
      label: 'בפועל',
      value: usage.gamesPct,
    }),
    numRow({
      id: 'gamesIncluded',
      label: 'משחקים ששיחק',
      value: usage.gamesIncluded,
      suffix: 'משחקים',
    }),
    numRow({
      id: 'teamGames',
      label: 'משחקי קבוצה',
      value: usage.teamGamesTotal,
      suffix: 'משחקים',
    }),
    row({
      id: 'position',
      label: 'עמדה',
      value: position.layerLabel || 'לא הוגדרה',
    }),
    row({
      id: 'basis',
      label: 'בסיס חישוב',
      value: 'משחקים שבהם השחקן שותף / משחקי ליגה של הקבוצה',
    }),
  ]

  addItemsRow({
    rows,
    id: 'playedGames',
    label: 'משחקים בהם שותף',
    items: buildPlayedItems(gamesData),
  })

  return tooltip({
    title: 'פירוט שותפות במשחקים',
    rows,
  })
}

const buildAvgMinutesTooltip = ({ brief, gamesData }) => {
  const usage = getUsage(brief)

  const rows = [
    numRow({
      id: 'actual',
      label: 'בפועל',
      value: usage.avgMinutes,
      digits: 1,
      suffix: 'דקות',
    }),
    numRow({
      id: 'minutesPlayed',
      label: 'דקות משחק',
      value: usage.minutesPlayed,
      suffix: 'דקות',
    }),
    numRow({
      id: 'gamesIncluded',
      label: 'משחקים ששיחק',
      value: usage.gamesIncluded,
      suffix: 'משחקים',
    }),
    row({
      id: 'basis',
      label: 'בסיס חישוב',
      value: 'דקות משחק / משחקים שבהם השחקן שותף',
    }),
  ]

  addItemsRow({
    rows,
    id: 'playedGames',
    label: 'משחקים בהם שותף',
    items: buildPlayedItems(gamesData),
  })

  return tooltip({
    title: 'פירוט דקות למשחק',
    rows,
  })
}

export const buildOpportunityTooltip = ({ id, brief, gamesData }) => {
  if (id === 'minutesPct') {
    return buildMinutesTooltip({
      brief,
      gamesData,
    })
  }

  if (id === 'startsPct') {
    return buildStartsTooltip({
      brief,
      gamesData,
    })
  }

  if (id === 'gamesPct') {
    return buildGamesTooltip({
      brief,
      gamesData,
    })
  }

  if (id === 'avgMinutes') {
    return buildAvgMinutesTooltip({
      brief,
      gamesData,
    })
  }

  return null
}
