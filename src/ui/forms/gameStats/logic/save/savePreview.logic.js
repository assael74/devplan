// src/ui/forms/gameStats/logic/save/savePreview.logic.js

const getStatsCount = row => {
  return Object.keys(row?.stats || {}).length
}

const sumStatsFields = rows => {
  return rows.reduce((sum, row) => {
    return sum + getStatsCount(row)
  }, 0)
}

const getTimeValue = (source, key) => {
  const value = source && source[key]
  if (value === null || value === undefined || value === '') return null

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

export const buildGameStatsSavePreview = payload => {
  const playerStats = Array.isArray(payload?.playerStats)
    ? payload.playerStats
    : []

  const selectedPlayerIds = Array.isArray(payload?.selectedPlayerIds)
    ? payload.selectedPlayerIds
    : []

  const selectedPlayersCount = selectedPlayerIds.length
  const savedPlayersCount = playerStats.length
  const skippedPlayersCount = Math.max(selectedPlayersCount - savedPlayersCount, 0)
  const statsFieldsCount = sumStatsFields(playerStats)

  const mode = payload?.gameStatsDocId ? 'update' : 'create'
  const scope = payload?.meta?.scope
  const isPlayerScope = scope === 'player' || scope === 'privatePlayer'
  const playerId = payload?.meta?.editablePlayerId || payload?.meta?.playerId || selectedPlayerIds[0]
  const timeSource = isPlayerScope
    ? playerStats.find(row => row.playerId === playerId)
    : payload?.meta

  return {
    mode,
    modeLabel: mode === 'update'
      ? 'עדכון מסמך סטטיסטיקה קיים'
      : 'יצירת מסמך סטטיסטיקה חדש',

    gameId: payload?.gameId || '',
    teamId: payload?.teamId || '',
    status: payload?.status || 'draft',
    isPlayerScope,

    selectedPlayersCount,
    savedPlayersCount,
    skippedPlayersCount,

    selectedParamsCount: payload?.selectedParmIds?.length || 0,
    statsFieldsCount,

    gameDuration: getTimeValue(payload, 'gameDuration'),
    timePlayed: getTimeValue(timeSource, 'timePlayed'),
    timeVideoStats: getTimeValue(timeSource, 'timeVideoStats'),

    hasDataToSave: savedPlayersCount > 0 && statsFieldsCount > 0,
  }
}
