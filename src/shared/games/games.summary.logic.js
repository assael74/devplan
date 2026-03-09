// shared/games/games.summary.logic.js

const safe = (v) => (v == null ? '' : String(v))

export const n = (v) => {
  const x = Number(v)
  return Number.isFinite(x) ? x : 0
}

export const aggSummary = (rows) => {
  const total = Array.isArray(rows) ? rows.length : 0
  const byType = {
    league: 0,
    cup: 0,
    friendly: 0,
    training: 0,
    other: 0,
  }

  let wins = 0
  let draws = 0
  let losses = 0
  let points = 0
  let gf = 0
  let ga = 0

  for (const x of Array.isArray(rows) ? rows : []) {
    const t = safe(x?.type).trim().toLowerCase()

    if (t === 'league' || t === 'cup' || t === 'friendly' || t === 'training') {
      byType[t] += 1
    } else {
      byType.other += 1
    }

    const r = safe(x?.result).trim().toLowerCase()
    if (r === 'win') wins += 1
    else if (r === 'draw') draws += 1
    else if (r === 'loss') losses += 1

    points += n(x?.points)
    gf += n(x?.goalsFor)
    ga += n(x?.goalsAgainst)
  }

  return {
    total,
    wins,
    draws,
    losses,
    points,
    gf,
    ga,
    byType,
  }
}
