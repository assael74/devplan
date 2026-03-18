// src/shared/players/player.name.utils.js

export const getPlayerFullName = (player) => {
  const first = player?.playerFirstName || ''
  const last = player?.playerLastName || ''

  return [first, last].filter(Boolean).join(' ')
}
