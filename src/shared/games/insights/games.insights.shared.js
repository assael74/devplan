// shared/games/insights/games.insights.shared.js

import { n } from '../games.summary.logic.js'
import { isPlayedGame } from '../games.player.logic.js'

export const safe = (v) => (v == null ? '' : String(v))

export const toNum = (v) => {
  const x = Number(v)
  return Number.isFinite(x) ? x : 0
}

export const pct = (part, total) => {
  const a = Number(part)
  const b = Number(total)

  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= 0) return 0
  return Math.round((a / b) * 100)
}

export const avg = (sum, total, digits = 1) => {
  const a = Number(sum)
  const b = Number(total)

  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= 0) return 0
  return Number((a / b).toFixed(digits))
}

export const perGame = (value, minutesPlayed, gameDuration = 90, digits = 2) => {
  const v = Number(value)
  const m = Number(minutesPlayed)
  const gd = Number(gameDuration)

  if (
    !Number.isFinite(v) ||
    !Number.isFinite(m) ||
    !Number.isFinite(gd) ||
    m <= 0 ||
    gd <= 0
  ) {
    return 0
  }

  return Number(((v / m) * gd).toFixed(digits))
}

export const resultLabelH = (result) => {
  const r = safe(result).trim().toLowerCase()

  if (r === 'win') return 'ניצחון'
  if (r === 'draw') return 'תיקו'
  if (r === 'loss') return 'הפסד'
  return 'לא שוחק'
}

export const resultColor = (result) => {
  const r = safe(result).trim().toLowerCase()

  if (r === 'win') return 'success'
  if (r === 'draw') return 'warning'
  if (r === 'loss') return 'danger'
  return 'neutral'
}

export const isLeagueGame = (row) => {
  return safe(row?.type).trim().toLowerCase() === 'league'
}

export const filterLeaguePlayedGames = (rows) => {
  return (Array.isArray(rows) ? rows : []).filter((row) => isPlayedGame(row) && isLeagueGame(row))
}

export const groupRows = (rows, getKey) => {
  const map = {}

  for (const row of Array.isArray(rows) ? rows : []) {
    const key = safe(getKey(row)).trim() || 'unknown'
    if (!map[key]) map[key] = []
    map[key].push(row)
  }

  return map
}

export const buildResultBreakdown = (rows) => {
  let wins = 0
  let draws = 0
  let losses = 0

  for (const row of Array.isArray(rows) ? rows : []) {
    const r = safe(row?.result).trim().toLowerCase()

    if (r === 'win') wins += 1
    else if (r === 'draw') draws += 1
    else if (r === 'loss') losses += 1
  }

  const totalPlayed = wins + draws + losses
  const points = wins * 3 + draws

  return {
    wins,
    draws,
    losses,
    totalPlayed,
    points,
    maxPoints: totalPlayed * 3,
    pointsPct: pct(points, totalPlayed * 3),
    ppg: avg(points, totalPlayed, 2),
    winPct: pct(wins, totalPlayed),
    drawPct: pct(draws, totalPlayed),
    lossPct: pct(losses, totalPlayed),
  }
}

export const buildGoalsSummary = (rows) => {
  let gf = 0
  let ga = 0
  let cleanSheets = 0
  let failedToScore = 0
  let over25 = 0
  let bothTeamsScored = 0

  const base = Array.isArray(rows) ? rows : []

  for (const row of base) {
    const goalsFor = n(row?.goalsFor)
    const goalsAgainst = n(row?.goalsAgainst)

    gf += goalsFor
    ga += goalsAgainst

    if (goalsAgainst === 0) cleanSheets += 1
    if (goalsFor === 0) failedToScore += 1
    if (goalsFor + goalsAgainst >= 3) over25 += 1
    if (goalsFor > 0 && goalsAgainst > 0) bothTeamsScored += 1
  }

  return {
    gf,
    ga,
    gd: gf - ga,
    avgGf: avg(gf, base.length),
    avgGa: avg(ga, base.length),
    avgTotalGoals: avg(gf + ga, base.length),
    cleanSheets,
    cleanSheetPct: pct(cleanSheets, base.length),
    failedToScore,
    failedToScorePct: pct(failedToScore, base.length),
    over25,
    over25Pct: pct(over25, base.length),
    bothTeamsScored,
    bothTeamsScoredPct: pct(bothTeamsScored, base.length),
  }
}

export const buildBucketInsight = (id, label, rows) => {
  const result = buildResultBreakdown(rows)
  const goals = buildGoalsSummary(rows)

  return {
    id,
    label,
    total: Array.isArray(rows) ? rows.length : 0,
    ...result,
    ...goals,
  }
}

export const buildGroupedInsights = (rows) => {
  const byHomeOrAwayMap = groupRows(rows, (row) => (row?.isHome ? 'home' : 'away'))
  const byTypeMap = groupRows(rows, (row) => row?.type || 'other')
  const byDifficultyMap = groupRows(rows, (row) => row?.difficulty || 'none')

  const byHomeOrAway = Object.entries(byHomeOrAwayMap).map(([id, group]) =>
    buildBucketInsight(id, id === 'home' ? 'בית' : 'חוץ', group)
  )

  const byType = Object.entries(byTypeMap).map(([id, group]) =>
    buildBucketInsight(id, group?.[0]?.typeH || id, group)
  )

  const byDifficulty = Object.entries(byDifficultyMap).map(([id, group]) =>
    buildBucketInsight(id, group?.[0]?.difficultyH || id, group)
  )

  return {
    byHomeOrAway,
    byType,
    byDifficulty,
  }
}

export const buildRecentWindow = (rows, size = 5) => {
  const played = (Array.isArray(rows) ? rows : []).slice(0, size)
  const result = buildResultBreakdown(played)
  const goals = buildGoalsSummary(played)

  return {
    rows: played,
    sampleSize: played.length,
    formText: played.map((row) => safe(row?.result).trim().toUpperCase().slice(0, 1)).join(''),
    ...result,
    ...goals,
  }
}

export const buildStreaks = (rows) => {
  const played = Array.isArray(rows) ? rows : []

  let bestWinStreak = 0
  let bestUnbeatenStreak = 0
  let currentStreakCount = 0
  let currentStreakType = ''

  let runningWin = 0
  let runningUnbeaten = 0

  const latest = played[0] || null

  if (latest) {
    currentStreakType = safe(latest?.result).trim().toLowerCase()

    for (const row of played) {
      const r = safe(row?.result).trim().toLowerCase()
      if (r === currentStreakType) currentStreakCount += 1
      else break
    }
  }

  for (const row of played) {
    const r = safe(row?.result).trim().toLowerCase()

    if (r === 'win') {
      runningWin += 1
      runningUnbeaten += 1
    } else if (r === 'draw') {
      runningWin = 0
      runningUnbeaten += 1
    } else {
      runningWin = 0
      runningUnbeaten = 0
    }

    if (runningWin > bestWinStreak) bestWinStreak = runningWin
    if (runningUnbeaten > bestUnbeatenStreak) bestUnbeatenStreak = runningUnbeaten
  }

  return {
    currentStreakType,
    currentStreakTypeH: resultLabelH(currentStreakType),
    currentStreakColor: resultColor(currentStreakType),
    currentStreakCount,
    bestWinStreak,
    bestUnbeatenStreak,
  }
}
