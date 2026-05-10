// teamProfile/sharedUi/insights/teamGames/sections/tooltip/SquadMetricTooltip.js

import React from 'react'

import TooltipContent from './TooltipContent.js'

import {
  formatActual,
  formatStatus,
  formatTarget,
} from '../../../../../../../../ui/patterns/insights/utils/index.js'

function toNum(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

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

function buildPlayerItems(players = [], formatter) {
  if (!Array.isArray(players)) return []

  return players.map((player) => {
    return {
      id: player.playerId || player.id || getPlayerName(player),
      text: formatter(player),
    }
  })
}

function getUsageSource(data, rowId) {
  const usage = data?.squadUsageMetrics || {}

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

function getScorersProfile(brief = {}) {
  return brief?.metrics?.scorersProfile || {}
}

function getScorerRows(brief = {}) {
  const profile = getScorersProfile(brief)
  return Array.isArray(profile.rows) ? profile.rows : []
}

function getAttackSource(row, brief) {
  const scorers = getScorerRows(brief)

  if (row?.id === 'uniqueScorers') {
    return {
      players: scorers,
      basis: 'כל השחקנים שכבשו לפחות שער אחד',
      formatter: getGoalsText,
    }
  }

  if (row?.id === 'scorers3Plus') {
    return {
      players: scorers.filter((player) => toNum(player.goals) >= 3),
      basis: 'שחקנים עם 3+ שערים',
      formatter: getGoalsText,
    }
  }

  if (row?.id === 'scorers5Plus') {
    return {
      players: scorers.filter((player) => toNum(player.goals) >= 5),
      basis: 'שחקנים עם 5+ שערים',
      formatter: getGoalsText,
    }
  }

  if (row?.id === 'scorers10Plus') {
    return {
      players: scorers.filter((player) => toNum(player.goals) >= 10),
      basis: 'שחקנים עם 10+ שערים',
      formatter: getGoalsText,
    }
  }

  if (row?.id === 'topScorerDependencyPct') {
    return {
      players: scorers.slice(0, 1),
      basis: 'שערי הכובש המוביל מתוך כלל שערי הכובשים',
      formatter: getGoalsText,
    }
  }

  if (row?.id === 'top3DependencyPct') {
    return {
      players: scorers.slice(0, 3),
      basis: 'שערי שלושת הכובשים המובילים מתוך כלל שערי הכובשים',
      formatter: getGoalsText,
    }
  }

  if (row?.id === 'oneGoalScorersPct') {
    return {
      players: scorers.filter((player) => toNum(player.goals) === 1),
      basis: 'כובשים עם שער אחד בלבד',
      formatter: getGoalsText,
    }
  }

  return {
    players: [],
    basis: 'נתוני כובשים',
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

function addBasisRow(rows, basis) {
  if (!basis) return

  rows.push({
    id: 'basis',
    label: 'בסיס חישוב',
    value: basis,
  })
}

function addCountRow(rows, source, row) {
  const count = source?.count ?? row?.count

  if (count === null || count === undefined) return

  rows.push({
    id: 'count',
    label: 'כמות',
    value: `${count} שחקנים`,
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

function addPlayersRows(rows, source) {
  const items = buildPlayerItems(source.players, source.formatter)

  if (!items.length) return

  rows.push({
    id: 'players',
    label: 'שחקנים',
    items,
  })
}

export function buildUsageMetricTooltip(row, data) {
  const source = getUsageSource(data, row?.id)
  const rows = buildBaseRows(row)

  addBasisRow(rows, source.basis)
  addCountRow(rows, source, row)
  addFixedSquadRow(rows, data)
  addPlayersRows(rows, source)

  return (
    <TooltipContent
      title={row?.label || 'מדד סגל'}
      rows={rows}
    />
  )
}

export function buildAttackMetricTooltip(row, brief) {
  const source = getAttackSource(row, brief)
  const rows = buildBaseRows(row)

  addBasisRow(rows, source.basis)
  addCountRow(rows, source, row)
  addPlayersRows(rows, source)

  return (
    <TooltipContent
      title={row?.label || 'מדד התקפי'}
      rows={rows}
    />
  )
}
