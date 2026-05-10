// teamProfile/sharedLogic/games/insightsLogic/viewModel/tooltips/squadMetricTooltip.model.js

import {
  formatActual,
  formatStatus,
  formatTarget,
} from '../../../../../../../../ui/patterns/insights/utils/index.js'

import {
  toNum,
} from '../common/index.js'

function getPlayerName(player = {}) {
  return (
    player.playerName ||
    player.name ||
    player.playerFullName ||
    player.playerShortName ||
    player.id ||
    player.playerId ||
    'שחקן'
  )
}

function getGoalsText(player = {}) {
  const goals = toNum(player.goals)

  return `${getPlayerName(player)} · ${goals} שערים`
}

function getMinutesText(player = {}) {
  const minutes = toNum(player.timePlayed)

  return `${getPlayerName(player)} · ${minutes} דקות`
}

function getStartsText(player = {}) {
  const starts = toNum(player.starts)

  return `${getPlayerName(player)} · ${starts} פתיחות`
}

function buildPlayerItem(player, formatter) {
  return {
    id: player.playerId || player.id || getPlayerName(player),
    text: formatter(player),
  }
}

function buildPlayerItems(players = [], formatter) {
  if (!Array.isArray(players)) return []

  return players.map((player) => {
    return buildPlayerItem(player, formatter)
  })
}

function getScorersProfile(brief = {}) {
  return brief?.metrics?.scorersProfile || {}
}

function getScorerRows(brief = {}) {
  const profile = getScorersProfile(brief)

  if (Array.isArray(profile.rows)) return profile.rows

  return []
}

function getUsageMetrics(data = {}) {
  return data?.squadUsageMetrics || {}
}

function getUsageSource(data, rowId) {
  const usage = getUsageMetrics(data)

  if (rowId === 'players500Pct') {
    return {
      players: usage.players500,
      basis: `שחקנים עם לפחות ${usage.minuteTargets?.players500 || 500} דקות`,
      count: usage.players500Count,
      formatter: getMinutesText,
    }
  }

  if (rowId === 'players1000Pct') {
    return {
      players: usage.players1000,
      basis: `שחקנים עם לפחות ${usage.minuteTargets?.players1000 || 1000} דקות`,
      count: usage.players1000Count,
      formatter: getMinutesText,
    }
  }

  if (rowId === 'players1500Pct') {
    return {
      players: usage.players1500,
      basis: `שחקנים עם לפחות ${usage.minuteTargets?.players1500 || 1500} דקות`,
      count: usage.players1500Count,
      formatter: getMinutesText,
    }
  }

  if (rowId === 'players2000Pct') {
    return {
      players: usage.players2000,
      basis: `שחקנים עם לפחות ${usage.minuteTargets?.players2000 || 2000} דקות`,
      count: usage.players2000Count,
      formatter: getMinutesText,
    }
  }

  if (rowId === 'players20StartsPct') {
    return {
      players: usage.players20Starts,
      basis: 'שחקנים עם 20+ פתיחות בהרכב',
      count: usage.players20StartsCount,
      formatter: getStartsText,
    }
  }

  if (rowId === 'top14MinutesPct') {
    return {
      players: usage.top14,
      basis: 'דקות טופ 14 מתוך סך דקות השחקנים',
      count: 14,
      formatter: getMinutesText,
    }
  }

  return {
    players: [],
    basis: 'נתוני שימוש בסגל',
    count: null,
    formatter: getMinutesText,
  }
}

function getAttackSource(row, brief) {
  const scorers = getScorerRows(brief)

  if (row?.id === 'uniqueScorers') {
    return {
      players: scorers,
      basis: 'כל השחקנים שכבשו לפחות שער אחד',
      count: scorers.length,
      formatter: getGoalsText,
    }
  }

  if (row?.id === 'scorers3Plus') {
    const players = scorers.filter((player) => {
      return toNum(player.goals) >= 3
    })

    return {
      players,
      basis: 'שחקנים עם 3+ שערים',
      count: players.length,
      formatter: getGoalsText,
    }
  }

  if (row?.id === 'scorers5Plus') {
    const players = scorers.filter((player) => {
      return toNum(player.goals) >= 5
    })

    return {
      players,
      basis: 'שחקנים עם 5+ שערים',
      count: players.length,
      formatter: getGoalsText,
    }
  }

  if (row?.id === 'scorers10Plus') {
    const players = scorers.filter((player) => {
      return toNum(player.goals) >= 10
    })

    return {
      players,
      basis: 'שחקנים עם 10+ שערים',
      count: players.length,
      formatter: getGoalsText,
    }
  }

  if (row?.id === 'topScorerDependencyPct') {
    const players = scorers.slice(0, 1)

    return {
      players,
      basis: 'שערי הכובש המוביל מתוך כלל שערי הכובשים',
      count: players.length,
      formatter: getGoalsText,
    }
  }

  if (row?.id === 'top3DependencyPct') {
    const players = scorers.slice(0, 3)

    return {
      players,
      basis: 'שערי שלושת הכובשים המובילים מתוך כלל שערי הכובשים',
      count: players.length,
      formatter: getGoalsText,
    }
  }

  if (row?.id === 'oneGoalScorersPct') {
    const players = scorers.filter((player) => {
      return toNum(player.goals) === 1
    })

    return {
      players,
      basis: 'כובשים עם שער אחד בלבד',
      count: players.length,
      formatter: getGoalsText,
    }
  }

  return {
    players: [],
    basis: 'נתוני כובשים',
    count: null,
    formatter: getGoalsText,
  }
}

function buildBaseRows(row) {
  return [
    {
      id: 'actual',
      label: 'בפועל',
      value: formatActual(row),
    },
    {
      id: 'target',
      label: 'יעד',
      value: formatTarget(row),
    },
    {
      id: 'status',
      label: 'סטטוס',
      value: formatStatus(row),
    },
  ]
}

function addBasisRow(rows, source) {
  if (!source?.basis) return

  rows.push({
    id: 'basis',
    label: 'בסיס חישוב',
    value: source.basis,
  })
}

function addCountRow(rows, source) {
  if (source?.count === null || source?.count === undefined) return

  rows.push({
    id: 'count',
    label: 'כמות',
    value: `${source.count} שחקנים`,
  })
}

function addFixedSquadRow(rows, data) {
  const size = data?.squadUsageMetrics?.fixedSquadSize

  if (!size) return

  rows.push({
    id: 'squadSize',
    label: 'מכנה',
    value: `${size} שחקני סגל קבועים`,
  })
}

function addPlayerRows(rows, source) {
  const items = buildPlayerItems(source.players, source.formatter)

  if (!items.length) return

  rows.push({
    id: 'players',
    label: 'שחקנים',
    items,
  })
}

export function buildUsageMetricTooltipModel(row, data) {
  const source = getUsageSource(data, row?.id)
  const rows = buildBaseRows(row)

  addBasisRow(rows, source)
  addCountRow(rows, source)
  addFixedSquadRow(rows, data)
  addPlayerRows(rows, source)

  return {
    title: row?.label || 'מדד סגל',
    rows,
  }
}

export function buildAttackMetricTooltipModel(row, brief) {
  const source = getAttackSource(row, brief)
  const rows = buildBaseRows(row)

  addBasisRow(rows, source)
  addCountRow(rows, source)
  addPlayerRows(rows, source)

  return {
    title: row?.label || 'מדד התקפי',
    rows,
  }
}
