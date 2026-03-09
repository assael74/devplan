/// C:\projects\devplan\src\shared\stats\stats.calc.js
import { safe, n, normalizeGameType } from './stats.helpers.js'

export function getTimePlayText(timePlay, totalTime) {
  const tp = n(timePlay)
  const tt = n(totalTime)
  return `${tp > 0 ? tp : '00'} / ${tt > 0 ? tt : '00'}`
}

export function calculateFullPlayerStats(playerGames = [], typeFilter = 'all') {
  const result = {
    totalGameTime: 0,
    gamesCount: 0,
  }

  const filter = safe(typeFilter).toLowerCase().trim()

  const minutesOf = (g, stats) => {
    const v =
      stats?.timePlayed ??
      stats?.minutesPlayed ??
      g?.gameDuration ??
      g?.duration ??
      g?.minutes ??
      g?.gameTime ??
      g?.timePlay
    const m = n(v)
    return m > 0 ? m : 90
  }

  const skipKeys = new Set(['playerId', 'teamId', 'gameId', 'id', 'uid', 'name'])
  const add = (key, val) => {
    if (val == null || skipKeys.has(key)) return

    if (typeof val === 'boolean') {
      result[key] = (result[key] || 0) + (val ? 1 : 0)
      return
    }

    const x = n(val)
    if (Number.isFinite(x)) result[key] = (result[key] || 0) + x
  }

  for (const pg of Array.isArray(playerGames) ? playerGames : []) {
    // ✅ תומך בשני מבנים:
    // 1) wrapper חדש: { game, stats }
    // 2) מבנה ישן: { ...gameStats }
    const game = pg?.game ?? pg
    const stats = pg?.stats ?? pg?.gameStats?.stats ?? pg?.gameStats ?? null

    const gType = normalizeGameType(game)
    if (filter && filter !== 'all' && gType !== filter) continue

    result.totalGameTime += minutesOf(game, stats)
    result.gamesCount += 1

    if (!stats || typeof stats !== 'object') continue
    for (const [k, v] of Object.entries(stats)) add(k, v)
  }

  // success rates: xxxSuccess מול xxxTotal/xxxAttempts
  for (const key of Object.keys(result)) {
    if (!key.endsWith('Success')) continue
    const base = key.slice(0, -'Success'.length)
    const total = n(result[`${base}Total`] ?? result[`${base}Attempts`])
    result[`${base}SuccessRate`] = total > 0 ? +((n(result[key]) / total) * 100).toFixed(1) : 0
  }

  // playTimeRate
  if (result.totalGameTime > 0 && result.timePlayed != null) {
    result.playTimeRate = Math.round((n(result.timePlayed) / result.totalGameTime) * 100)
  } else {
    result.playTimeRate = 0
  }

  // defaults (יישור קו לתצוגות)
  for (const field of ['goals', 'assists', 'timePlayed']) {
    if (result[field] == null) result[field] = 0
  }

  return result
}

function normalizeOutcome(g) {
  const r = safe(g?.result || g?.outcome).toLowerCase().trim()
  if (r === 'win' || r === 'w') return 'win'
  if (r === 'draw' || r === 'd' || r === 'tie') return 'draw'
  if (r === 'loss' || r === 'l') return 'loss'
  return ''
}

function pickGameDuration(g, statsObj) {
  const v = statsObj?.gameDuration ?? g?.gameDuration ?? g?.duration ?? g?.minutes ?? 90
  const m = n(v)
  return m > 0 ? m : 90
}

function addNumericAgg(result, obj, skip = new Set()) {
  if (!obj || typeof obj !== 'object') return
  for (const [k, v] of Object.entries(obj)) {
    if (skip.has(k)) continue
    const x = n(v)
    if (Number.isFinite(x)) result[k] = (result[k] || 0) + x
  }
}

export function calculateFullTeamStats(teamGames = [], typeFilter = 'league') {
  const result = {
    gamesPlayed: 0,
    totalPlayers: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    totalGameTime: 0,
  }

  const filter = safe(typeFilter).toLowerCase().trim()

  for (const item of Array.isArray(teamGames) ? teamGames : []) {
    // ✅ תומך בשני מבנים:
    // 1) wrapper חדש: { game, stats }
    // 2) game ישן: { ... }
    const g = item?.game ?? item
    const teamStats = item?.stats ?? item?.teamStats ?? null

    const gType = normalizeGameType(g)
    if (filter && filter !== 'all' && gType !== filter) continue

    result.gamesPlayed += 1

    const duration = pickGameDuration(g, teamStats)
    result.totalGameTime += duration

    const outcome = normalizeOutcome(g)
    if (outcome === 'win') result.wins += 1
    else if (outcome === 'draw') result.draws += 1
    else if (outcome === 'loss') result.losses += 1

    // goalsFor/goalsAgainst יכולים לשבת בסטטים לקבוצה או במשחק
    result.goalsFor += n(teamStats?.goalsFor ?? g?.goalsFor)
    result.goalsAgainst += n(teamStats?.goalsAgainst ?? g?.goalsAgainst)

    // totalPlayers: אם יש playerStats על המשחק (ב-gamesWithStats)
    const ps = Array.isArray(g?.playerStats) ? g.playerStats : []
    result.totalPlayers += ps.length

    // אגרגציה של הסטטים של הקבוצה
    addNumericAgg(result, teamStats, new Set(['teamId', 'gameId', 'id', 'name']))
  }

  result.timePlayed = result.totalGameTime
  result.points = result.wins * 3 + result.draws * 1
  const maxPoints = result.gamesPlayed * 3
  result.successRate = maxPoints > 0 ? Number(((result.points / maxPoints) * 100).toFixed(1)) : 0

  return result
}

export function calculateFullScoutStats(scout, typeFilter = 'all') {
  const games = Array.isArray(scout?.games) ? scout.games : []

  const mappedGames = games.map((g) => {
    const timePlayed = n(g.timePlayed)
    const duration = n(g.gameDuration)

    let goals = 0
    if (typeof g.scored === 'number') goals = g.scored
    else if (typeof g.scored === 'boolean') goals = g.scored ? 1 : 0

    return {
      ...g,
      gameDuration: duration > 0 ? duration : 90,
      gameStats: {
        timePlayed,
        goals,
        isSelected: !!g.isSelected,
        isStarting: !!g.isStarting,
      },
    }
  })

  return calculateFullPlayerStats(mappedGames, typeFilter)
}
