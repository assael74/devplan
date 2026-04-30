// features/hub/editLogic/games/entryGames/entryGame.shared.js

import { getFullDateIl } from '../../../../../shared/format/dateUtiles.js'

export const safe = (value) => (value == null ? '' : String(value))

export const clean = (value) => safe(value).trim()

export const toNum = (value) => {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

export const toNumOrEmpty = (value) => {
  if (value === '' || value == null) return ''

  const num = Number(value)
  return Number.isFinite(num) ? num : ''
}

export const toArr = (value) => {
  return Array.isArray(value) ? value : []
}

export const normalizeBool = (value) => value === true

export const getGameSource = (game) => {
  return game?.game || game || {}
}

export const getGameId = (game) => {
  const source = getGameSource(game)
  return safe(source?.id || game?.id || game?.gameId)
}

export const getPlayerId = (player) => {
  return safe(player?.id || player?.playerId)
}

export const getGamePlayers = (game) => {
  const source = getGameSource(game)
  return toArr(source?.gamePlayers)
}

export const getPlayerDisplayName = (player) => {
  return (
    clean(player?.name) ||
    [player?.playerFirstName, player?.playerLastName].filter(Boolean).join(' ').trim() ||
    [player?.firstName, player?.lastName].filter(Boolean).join(' ').trim() ||
    clean(player?.playerFullName) ||
    'שחקן'
  )
}

export const buildEntryGameMeta = (game) => {
  const source = getGameSource(game)

  const gameDate = clean(source?.gameDate || source?.dateRaw)

  return {
    id: getGameId(game),
    rival:
      clean(source?.rivel) ||
      clean(source?.rival) ||
      clean(source?.rivalName) ||
      clean(source?.opponent),
    gameDate,
    gameDateLabel: gameDate ? getFullDateIl(gameDate) : '',
    raw: source,
  }
}
