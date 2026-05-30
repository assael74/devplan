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

export const buildPlayerStatsProgress = ({ player, row, fields }) => {
  const total = fields.length

  const filled = fields.filter(field => {
    return isFieldFilled({ field, row })
  }).length

  const rate = total > 0 ? Math.round((filled / total) * 100) : 0

  return {
    playerId: player.playerId,
    name: player.name,
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
  const players = draft?.players || []
  const selectedPlayerIds = draft?.selectedPlayerIds || []
  const rows = draft?.playerStats || []

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
