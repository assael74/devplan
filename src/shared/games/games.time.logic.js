// shared/games/games.time.logic.js

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

export const splitPlayedUpcoming = (rows) => {
  const now = Date.now()
  const played = []
  const upcoming = []

  ;(rows || []).forEach((x) => {
    const ms = toMs(x?.game?.gameDate || x?.dateRaw, x?.game?.gameHour || x?.hourRaw)
    if (ms != null && ms >= now) upcoming.push(x)
    else played.push(x)
  })

  upcoming.sort(
    (a, b) =>
      (toMs(a?.game?.gameDate || a?.dateRaw, a?.game?.gameHour || a?.hourRaw) || 0) -
      (toMs(b?.game?.gameDate || b?.dateRaw, b?.game?.gameHour || b?.hourRaw) || 0)
  )
  played.sort(
    (a, b) =>
      (toMs(b?.game?.gameDate || b?.dateRaw, b?.game?.gameHour || b?.hourRaw) || 0) -
      (toMs(a?.game?.gameDate || a?.dateRaw, a?.game?.gameHour || a?.hourRaw) || 0)
  )

  return { played, upcoming }
}

export const findNextGame = (upcoming) => (Array.isArray(upcoming) && upcoming.length ? upcoming[0] : null)
