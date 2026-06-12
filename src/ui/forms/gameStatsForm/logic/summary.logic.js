// src/ui/forms/gameStatsForm/logic/summary.logic.js

const hasValue = value => {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim() !== ''
  if (typeof value === 'number') return Number.isFinite(value)
  if (typeof value === 'boolean') return true

  return false
}

const isFieldFilled = ({ field, row }) => {
  if (!row) return false

  if (field.type === 'triplet') {
    return hasValue(row[field.totalKey]) || hasValue(row[field.successKey])
  }

  return hasValue(row[field.id])
}

const isPlayerScopeDraft = draft => {
  if (!draft) return false
  if (draft.scope === 'player') return true

  const meta = draft.meta || {}

  return meta.scope === 'player'
}

const getEditablePlayerId = draft => {
  if (!draft) return ''

  const meta = draft.meta || {}

  return (
    draft.editablePlayerId ||
    meta.editablePlayerId ||
    meta.playerId ||
    ''
  )
}

const hasPositiveValue = value => {
  const num = Number(value)

  return Number.isFinite(num) && num > 0
}

const getRegularFieldValue = ({ field, row }) => {
  return formatSummaryValue(row[field.id])
}

const getTripletFieldValue = ({ field, row }) => {
  const total = row[field.totalKey]
  const success = row[field.successKey]
  const rate = row[field.rateKey]

  if (!hasPositiveValue(total)) return '—'

  return `${formatSummaryValue(success)}/${formatSummaryValue(total)} · ${formatSummaryValue(rate)}%`
}

export const buildPlayerStatsProgress = ({ player, row, fields }) => {
  const total = fields.length

  const filled = fields.filter(field => {
    return isFieldFilled({ field, row })
  }).length

  const rate = total > 0 ? Math.round((filled / total) * 100) : 0

  return {
    playerId: player.playerId,
    name: player.name,
    photo: player.photo || '',
    isStarting: player.isStarting,
    timePlayed: player.timePlayed,
    filled,
    total,
    rate,
    isEmpty: filled === 0,
    isComplete: total > 0 && filled >= total,
    isPartial: filled > 0 && filled < total,
  }
}

export const buildStatsSummaryRows = ({ draft, fields }) => {
  const players = draft && Array.isArray(draft.players) ? draft.players : []
  const selectedPlayerIds = draft && Array.isArray(draft.selectedPlayerIds)
    ? draft.selectedPlayerIds
    : []

  const rows = draft && Array.isArray(draft.playerStats)
    ? draft.playerStats
    : []

  return selectedPlayerIds.map(playerId => {
    const player = players.find(item => item.playerId === playerId)
    const row = rows.find(item => item.playerId === playerId)

    return buildPlayerStatsProgress({
      player: player || { playerId, name: 'שחקן' },
      row,
      fields,
    })
  })
}

export const buildStatsSummaryTotals = summaryRows => {
  const totalPlayers = summaryRows.length
  const completedPlayers = summaryRows.filter(row => row.isComplete).length
  const partialPlayers = summaryRows.filter(row => row.isPartial).length
  const emptyPlayers = summaryRows.filter(row => row.isEmpty).length

  const totalFields = summaryRows.reduce((sum, row) => sum + row.total, 0)
  const filledFields = summaryRows.reduce((sum, row) => sum + row.filled, 0)

  const completionRate = totalFields > 0
    ? Math.round((filledFields / totalFields) * 100)
    : 0

  return {
    totalPlayers,
    completedPlayers,
    partialPlayers,
    emptyPlayers,
    totalFields,
    filledFields,
    completionRate,
  }
}

export const isLockedSummaryRow = ({ row, draft }) => {
  if (!isPlayerScopeDraft(draft)) return false

  const editablePlayerId = getEditablePlayerId(draft)

  return Boolean(editablePlayerId) && row.playerId !== editablePlayerId
}

export const getSummaryRowStats = ({ draft, playerId }) => {
  const rows = draft && Array.isArray(draft.playerStats)
    ? draft.playerStats
    : []

  return rows.find(row => row.playerId === playerId) || {}
}

export const getSummaryFieldLabel = field => {
  if (field.type === 'triplet') return field.label || field.id

  return (
    (field.parm && field.parm.statsParmShortName) ||
    (field.parm && field.parm.statsParmName) ||
    field.id ||
    ''
  )
}

export const formatSummaryValue = value => {
  if (value === null || value === undefined || value === '') return '—'

  const num = Number(value)

  if (Number.isFinite(num)) {
    return Number.isInteger(num) ? String(num) : num.toFixed(1)
  }

  return String(value)
}

export const getSummaryFieldValue = ({ field, row }) => {
  if (field.type === 'triplet') {
    return getTripletFieldValue({ field, row })
  }

  return getRegularFieldValue({ field, row })
}

export const getSummaryFieldType = field => {
  if (field.statsParmType) return field.statsParmType
  if (field.parm && field.parm.statsParmType) return field.parm.statsParmType

  return 'general'
}
