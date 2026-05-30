// src/ui/forms/gameStatsForm/logic/save/savePreview.logic.js

const getStatsCount = row => {
  return Object.keys(row?.stats || {}).length
}

const sumStatsFields = rows => {
  return rows.reduce((sum, row) => {
    return sum + getStatsCount(row)
  }, 0)
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

  return {
    mode,
    modeLabel: mode === 'update'
      ? 'עדכון מסמך סטטיסטיקה קיים'
      : 'יצירת מסמך סטטיסטיקה חדש',

    gameId: payload?.gameId || '',
    teamId: payload?.teamId || '',
    status: payload?.status || 'draft',

    selectedPlayersCount,
    savedPlayersCount,
    skippedPlayersCount,

    selectedParmsCount: payload?.selectedParmIds?.length || 0,
    statsFieldsCount,

    timePlayed: payload?.meta?.timePlayed || 0,
    timeVideoStats: payload?.meta?.timeVideoStats || 0,

    hasDataToSave: savedPlayersCount > 0 && statsFieldsCount > 0,
  }
}
