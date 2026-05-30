// src/ui/forms/gameStatsForm/logic/core/form.helpers.js

export const toNumber = value => {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

export const getGameTitle = game => {
  return game?.rival || game?.rivel || game?.opponent || 'משחק ללא יריבה'
}

export const getPlayerId = player => {
  return player?.playerId || player?.id || ''
}

export const getPlayerName = player => {
  return player?.playerFullName || player?.fullName || player?.name || 'שחקן ללא שם'
}

export const isPlayerStarting = player => {
  return Boolean(player?.isStarting || player?.onStart)
}

export const isPlayerInSquad = player => {
  return Boolean(player?.onSquad || player?.isSelected || player?.inSquad)
}
