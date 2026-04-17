// team/performance/TeamPerformance.domain.logic.js
import { DOMAIN_STATE } from '../../../../preview.state'
import playerImage from '../../../../../../../../../ui/core/images/playerImage.jpg'

const n = (v) => {
  const x = Number(v)
  return Number.isFinite(x) ? x : 0
}

const safe = (v) => (v == null ? '' : String(v))

const round0 = (v) => (v == null ? null : Math.round(n(v)))
const round1 = (v) => (v == null ? null : Math.round(n(v) * 10) / 10)

const pickPlayerName = (p) => {
  const first = safe(p?.playerFirstName).trim()
  const last = safe(p?.playerLastName).trim()
  const full = `${first} ${last}`.trim()
  return full || safe(p?.name).trim() || 'שחקן'
}

const pickPlayerStats = (p) => {
  const s = p?.playerFullStats || p?.fullStats || p?.stats || {}
  return {
    gamesCount: n(s.gamesCount),
    goals: n(s.goals),
    assists: n(s.assists),
    timePlayed: n(s.timePlayed),
    totalGameTime: n(s.totalGameTime),
    playTimeRate: n(s.playTimeRate),
  }
}

const isPlayerUsable = (ps) => {
  // Governance: נדרש לפחות "אות" אחד משמעותי
  // (ניתן להקשיח/לרכך – אבל ככה נמנעים מ־0-ים שמנפחים כיסוי)
  return ps.gamesCount > 0 || ps.totalGameTime > 0 || ps.timePlayed > 0
}

const calcCoverage = (usedCount, totalCount) => {
  const t = n(totalCount)
  if (!t) return 0
  return usedCount / t
}

const pickInitials = (p) => {
  const first = safe(p?.playerFirstName).trim()
  const last = safe(p?.playerLastName).trim()
  const a = first ? first[0] : ''
  const b = last ? last[0] : ''
  const res = (a + b).toUpperCase().trim()
  return res || 'P'
}

export const resolveTeamPerformanceDomain = (team, items) => {
  const players = Array.isArray(items) && items.length ? items : team?.players || team?.teamPlayers || []
  const totalCount = players.length

  let usedCount = 0

  let sumGoals = 0
  let sumAssists = 0
  let sumMinutes = 0
  let sumTotalTime = 0

  let sumPlayRate = 0
  let playRateCount = 0

  const rows = players.map((p, idx) => {
    const ps = pickPlayerStats(p)
    const usable = isPlayerUsable(ps)
    if (usable) usedCount += 1

    // Aggregation (Operational KPIs)
    sumGoals += ps.goals
    sumAssists += ps.assists
    sumMinutes += ps.timePlayed
    sumTotalTime += ps.totalGameTime

    if (ps.playTimeRate > 0) {
      sumPlayRate += ps.playTimeRate
      playRateCount += 1
    }

    return {
      id: safe(p?.id) || safe(p?.playerId) || String(idx),
      name: pickPlayerName(p),
      photo: safe(p?.photo) || playerImage,
      positions: Array.isArray(p?.positions) ? p.positions : [],
      stats: ps,
      usable,
    }
  })

  const coverageRate = calcCoverage(usedCount, totalCount)

  // State policy (Executive signal)
  let state = DOMAIN_STATE.EMPTY
  if (usedCount === 0) state = DOMAIN_STATE.EMPTY
  else if (coverageRate < 0.35 || sumTotalTime === 0) state = DOMAIN_STATE.PARTIAL
  else state = DOMAIN_STATE.OK

  const playTimeRateAvg = playRateCount ? Math.round(sumPlayRate / playRateCount) : 0

  return {
    state,
    meta: {
      playersTotalCount: totalCount,
      playersUsedCount: usedCount,
      coverageRate, // 0..1
    },
    stats: {
      goals: round0(sumGoals),
      assists: round0(sumAssists),
      minutesPlayed: round0(sumMinutes),
      totalGameTime: round0(sumTotalTime),
      playTimeRateAvg, // ממוצע אחוזי משחק לשחקנים עם ערך
    },
    rows,
  }
}
