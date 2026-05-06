// teamProfile/sharedLogic/games/insightsLogic/squad/squad.usage.js

import { toNum } from '../common/index.js'
import { sortByStat } from './squad.stats.js'

export const FIXED_SQUAD_SIZE = 22
export const BASE_GAME_TIME = 90

export const scaleMinuteTarget = (baseMinutes, leagueGameTime) => {
  const gameTime = toNum(leagueGameTime)

  if (!gameTime) return baseMinutes

  return Math.round(baseMinutes * (gameTime / BASE_GAME_TIME))
}

const roundPct = (count, total) => {
  const c = toNum(count)
  const t = toNum(total)

  if (!t) return 0
  return Math.round((c / t) * 100)
}

export const buildSquadUsageMetrics = ({
  allPlayerStats = [],
  leagueGameTime = BASE_GAME_TIME,
} = {}) => {
  const rows = Array.isArray(allPlayerStats) ? allPlayerStats : []

  const playersWithMinutes = rows.filter((player) => {
    return toNum(player?.timePlayed) > 0
  })

  const totalMinutes = playersWithMinutes.reduce((sum, player) => {
    return sum + toNum(player?.timePlayed)
  }, 0)

  const byMinutes = sortByStat(playersWithMinutes, 'timePlayed')
  const top14 = byMinutes.slice(0, 14)

  const minuteTargets = {
    players500: scaleMinuteTarget(500, leagueGameTime),
    players1000: scaleMinuteTarget(1000, leagueGameTime),
    players1500: scaleMinuteTarget(1500, leagueGameTime),
    players2000: scaleMinuteTarget(2000, leagueGameTime),
  }

  const players500 = byMinutes.filter((player) => {
    return toNum(player?.timePlayed) >= minuteTargets.players500
  })

  const players1000 = byMinutes.filter((player) => {
    return toNum(player?.timePlayed) >= minuteTargets.players1000
  })

  const players1500 = byMinutes.filter((player) => {
    return toNum(player?.timePlayed) >= minuteTargets.players1500
  })

  const players2000 = byMinutes.filter((player) => {
    return toNum(player?.timePlayed) >= minuteTargets.players2000
  })

  const players20Starts = rows.filter((player) => {
    return toNum(player?.starts) >= 20
  })

  const top14Minutes = top14.reduce((sum, player) => {
    return sum + toNum(player?.timePlayed)
  }, 0)

  return {
    fixedSquadSize: FIXED_SQUAD_SIZE,
    leagueGameTime: toNum(leagueGameTime) || BASE_GAME_TIME,
    baseGameTime: BASE_GAME_TIME,
    minuteTargets,

    hasData: totalMinutes > 0,

    totalMinutes,
    top14Minutes,
    top14,

    players500,
    players1000,
    players1500,
    players2000,
    players20Starts,

    players500Count: players500.length,
    players1000Count: players1000.length,
    players1500Count: players1500.length,
    players2000Count: players2000.length,
    players20StartsCount: players20Starts.length,

    players500Pct: roundPct(players500.length, FIXED_SQUAD_SIZE),
    players1000Pct: roundPct(players1000.length, FIXED_SQUAD_SIZE),
    players1500Pct: roundPct(players1500.length, FIXED_SQUAD_SIZE),
    players2000Pct: roundPct(players2000.length, FIXED_SQUAD_SIZE),
    players20StartsPct: roundPct(players20Starts.length, FIXED_SQUAD_SIZE),
    top14MinutesPct: roundPct(top14Minutes, totalMinutes),
  }
}
