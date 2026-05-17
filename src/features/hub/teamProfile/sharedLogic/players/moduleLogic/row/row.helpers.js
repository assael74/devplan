// teamProfile/sharedLogic/players/moduleLogic/row/row.helpers.js

import { getPlayerAge } from '../../../../../../../shared/players/player.age.utils.js'

export const safe = (value) => {
  return value == null ? '' : String(value)
}

export const norm = (value) => {
  return safe(value).trim()
}

export const toArr = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean)

  const text = norm(value)

  if (!text) return []

  return text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export const countList = (value) => {
  if (Array.isArray(value)) return value.length
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (value && typeof value === 'object') return Object.keys(value).length

  return 0
}

export const pickId = (row) => {
  return row && (row.playerId || row?.player?.id || row.id) || null
}

export const pickPlayer = (row) => {
  return row && (row.player || row) || {}
}

export const pickLevel = (player, row) => {
  const value = Number(
    row?.level ??
    player?.level ??
    row?.rating ??
    player?.rating ??
    0
  )

  return Number.isFinite(value) ? value : 0
}

export const pickBirthLabel = (player, row) => {
  return (
    norm(row?.birthDay) ||
    norm(player?.birthDay) ||
    norm(row?.birth) ||
    norm(player?.birth) ||
    ''
  )
}

export const pickAge = (player, row) => {
  const direct = Number(row?.age ?? player?.age)

  if (Number.isFinite(direct)) return direct

  return getPlayerAge({
    birthDay: row?.birthDay || player?.birthDay || '',
    birth: row?.birth || player?.birth || '',
  })
}

export const buildFullName = (player, row) => {
  return (player?.playerFullName || row?.playerFullName || 'שחקן')
}

export const normalizeArgs = (rawOrArgs, maybeTeam) => {
  if (
    rawOrArgs &&
    typeof rawOrArgs === 'object' &&
    Object.prototype.hasOwnProperty.call(rawOrArgs, 'raw')
  ) {
    return {
      raw: rawOrArgs.raw,
      team: rawOrArgs.team || null,
      games: Array.isArray(rawOrArgs.games) ? rawOrArgs.games : [],
    }
  }

  return {
    raw: rawOrArgs,
    team: maybeTeam || null,
    games: [],
  }
}
