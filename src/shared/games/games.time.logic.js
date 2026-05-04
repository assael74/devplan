// shared/games/games.time.logic.js

import { isGamePlayed } from './games.constants.js'

export const safe = (v) => (v == null ? '' : String(v))

export const toMs = (dateRaw, hourRaw) => {
  const d = safe(dateRaw).trim()
  if (!d) return null

  const h = safe(hourRaw).trim() || '00:00'
  const ms = Date.parse(`${d}T${h}:00`)

  return Number.isFinite(ms) ? ms : null
}

export const normalizeDate = (v) => {
  const s = safe(v).trim()
  if (!s) return ''
  if (s.length >= 10 && s.includes('-')) return s.slice(0, 10)

  return s
}

export const normalizeTime = (v) => {
  const s = safe(v).trim()
  if (!s) return ''
  if (s.length >= 5 && s.includes(':')) return s.slice(0, 5)

  return s
}

const getRowGameDateMs = (row = {}) => {
  return toMs(
    row?.game?.gameDate || row?.dateRaw,
    row?.game?.gameHour || row?.hourRaw
  )
}

export const splitPlayedUpcoming = (rows) => {
  const played = []
  const upcoming = []

  ;(rows || []).forEach((row) => {
    if (isGamePlayed(row) || isGamePlayed(row?.game)) {
      played.push(row)
      return
    }

    upcoming.push(row)
  })

  upcoming.sort((a, b) => {
    return (getRowGameDateMs(a) || 0) - (getRowGameDateMs(b) || 0)
  })

  played.sort((a, b) => {
    return (getRowGameDateMs(b) || 0) - (getRowGameDateMs(a) || 0)
  })

  return { played, upcoming }
}

export const findNextGame = (upcoming) => {
  return Array.isArray(upcoming) && upcoming.length ? upcoming[0] : null
}
