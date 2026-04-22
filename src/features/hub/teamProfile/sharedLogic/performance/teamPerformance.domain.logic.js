// teamProfile/sharedLogic/performance/TeamPerformance.domain.logic.js

import playerImage from '../../../../../ui/core/images/playerImage.jpg'

const n = (v) => {
  const x = Number(v)
  return Number.isFinite(x) ? x : 0
}
const s = (v) => (v == null ? '' : String(v))
const round0 = (v) => (v == null ? null : Math.round(n(v)))

const calcUsable = (row, stats) => {
  if (row && typeof row.usable === 'boolean') return row.usable
  const st = stats || {}
  return n(st.gamesCount) > 0 || n(st.timePlayed) > 0 || n(st.gameDurationTotal) > 0
}

export const resolveTeamPerformanceDomain = (rowsInput) => {
  const rows = Array.isArray(rowsInput) ? rowsInput : []
  const totalCount = rows.length

  let usedCount = 0
  let sumGoals = 0
  let sumAssists = 0
  let sumMinutes = 0
  let sumTotalTime = 0

  // האם יש לפחות שחקן אחד שאפשר לנרמל אצלו (על בסיס meta שמגיע מה-pack)
  let canNormalizeAny = false

  const normalizedRows = rows.map((r, idx) => {
    const stats = r?.stats || {}
    const statsNorm = r?.statsNorm || null
    const statsMeta = r?.statsMeta || {}

    const usable = calcUsable(r, stats)
    if (usable) usedCount += 1

    sumGoals += n(stats.goals)
    sumAssists += n(stats.assists)
    sumMinutes += n(stats.timePlayed)
    sumTotalTime += n(stats.gameDurationTotal)

    if (statsMeta?.canNormalize === true) canNormalizeAny = true

    return {
      id: s(r?.id) || String(idx),
      name: s(r?.name) || 'שחקן',
      photo: s(r?.photo) || playerImage,
      positions: Array.isArray(r?.positions) ? r.positions : [],
      stats,
      statsNorm,
      statsMeta,
      usable,
    }
  })

  const coverageRate = totalCount ? usedCount / totalCount : 0

  return {
    meta: {
      playersTotalCount: totalCount,
      playersUsedCount: usedCount,
      coverageRate,
      canNormalizeAny,
    },
    stats: {
      goals: round0(sumGoals),
      assists: round0(sumAssists),
      minutesPlayed: round0(sumMinutes),
      totalGameTime: round0(sumTotalTime),
    },
    rows: normalizedRows,
  }
}
