// ui/fields/selectUi/games/logic/gameStatsAvailability.logic.js

const clean = value => String(value ?? '').trim()

export const GAME_STATS_PICKER_MODES = {
  DEFAULT: 'default',
  CREATE_STATS: 'createStats',
}

export const hasGameStatsPointer = game => {
  return Boolean(
    game?.hasStats ||
      clean(game?.statsDocId) ||
      clean(game?.gameStatsDocId)
  )
}

export const getGameStatsStatus = game => {
  return clean(game?.statsStatus) || (hasGameStatsPointer(game) ? 'saved' : 'none')
}

export const getGameStatsStatusLabel = game => {
  const status = getGameStatsStatus(game)

  if (status === 'partial') return 'סטטיסטיקה חלקית'
  if (status === 'committed') return 'סטטיסטיקה רשמית'
  if (status === 'locked') return 'סטטיסטיקה נעולה'
  if (status === 'draft') return 'טיוטה'
  if (status === 'saved') return 'סטטיסטיקה קיימת'

  return ''
}

export const getGameStatsDisabledReason = game => {
  if (!hasGameStatsPointer(game)) return ''

  const label = getGameStatsStatusLabel(game)

  return label || 'כבר קיימת סטטיסטיקה'
}

export const buildGameStatsAvailability = ({
  game,
  mode = GAME_STATS_PICKER_MODES.DEFAULT,
}) => {
  const hasStats = hasGameStatsPointer(game)
  const statsStatus = getGameStatsStatus(game)
  const statsStatusLabel = getGameStatsStatusLabel(game)

  const disabledByStats =
    mode === GAME_STATS_PICKER_MODES.CREATE_STATS &&
    hasStats

  return {
    hasStats,
    statsStatus,
    statsStatusLabel,
    disabledByStats,
    disabledReason: disabledByStats
      ? getGameStatsDisabledReason(game)
      : '',
  }
}
