// shared/games/insights/games.insights.player.js

import { calcPlayerParticipationSummary } from '../games.player.logic.js'
import {
  buildGroupedInsights,
  buildRecentWindow,
  perGame,
  pct,
  avg,
} from './games.insights.shared.js'

const n = (v) => {
  const x = Number(v)
  return Number.isFinite(x) ? x : 0
}

export const buildPlayerParticipationInsights = ({
  player,
  playedGames,
  teamLeagueGames,
}) => {
  return calcPlayerParticipationSummary({
    player,
    rows: playedGames,
    teamRows: teamLeagueGames,
  })
}

export const buildPlayerScoringInsights = (playedGames) => {
  const base = Array.isArray(playedGames) ? playedGames : []

  const minutesPlayed = base.reduce((sum, row) => sum + n(row?.timePlayed), 0)
  const goals = base.reduce((sum, row) => sum + n(row?.goals), 0)
  const assists = base.reduce((sum, row) => sum + n(row?.assists), 0)
  const goalContribGames = base.filter((row) => n(row?.goals) > 0 || n(row?.assists) > 0).length

  const totalGameDuration = base.reduce((sum, row) => sum + n(row?.gameDuration), 0)
  const avgGameDuration = base.length ? avg(totalGameDuration, base.length, 0) : 90

  return {
    minutesPlayed,
    avgGameDuration,
    goals,
    assists,
    goalContributions: goals + assists,
    goalsPerGame: perGame(goals, minutesPlayed, avgGameDuration),
    assistsPerGame: perGame(assists, minutesPlayed, avgGameDuration),
    contributionsPerGame: perGame(goals + assists, minutesPlayed, avgGameDuration),
    goalContribGames,
    goalContribGamesPct: pct(goalContribGames, base.length),
  }
}

export const buildPlayerStartingVsBenchInsights = (playedGames) => {
  const base = Array.isArray(playedGames) ? playedGames : []

  const starters = base.filter((row) => row?.isStarting === true)
  const bench = base.filter((row) => row?.isStarting !== true)

  const buildSplit = (rows) => {
    const total = rows.length
    const minutes = rows.reduce((sum, row) => sum + n(row?.timePlayed), 0)
    const goals = rows.reduce((sum, row) => sum + n(row?.goals), 0)
    const assists = rows.reduce((sum, row) => sum + n(row?.assists), 0)
    const goalContributions = goals + assists

    const totalGameDuration = rows.reduce((sum, row) => sum + n(row?.gameDuration), 0)
    const avgGameDuration = total ? avg(totalGameDuration, total, 0) : 90

    return {
      total,
      minutes,
      avgMinutes: avg(minutes, total),
      avgGameDuration,
      goals,
      assists,
      goalContributions,
      goalsPerGame: perGame(goals, minutes, avgGameDuration),
      assistsPerGame: perGame(assists, minutes, avgGameDuration),
      contributionsPerGame: perGame(goalContributions, minutes, avgGameDuration),
    }
  }

  const start = buildSplit(starters)
  const benchResult = buildSplit(bench)

  return {
    start,
    bench: benchResult,
    comparison: {
      preferredRole:
        start.contributionsPerGame > benchResult.contributionsPerGame
          ? 'start'
          : benchResult.contributionsPerGame > start.contributionsPerGame
            ? 'bench'
            : 'equal',

      contributionsPerGameGap: Number(
        Math.abs(start.contributionsPerGame - benchResult.contributionsPerGame).toFixed(2)
      ),

      avgMinutesGap: Number(
        Math.abs((start.avgMinutes || 0) - (benchResult.avgMinutes || 0)).toFixed(1)
      ),
    },
  }
}

export const buildPlayerHomeOrAwayInsights = (playedGames) => {
  const grouped = buildGroupedInsights(playedGames)

  return {
    byHomeOrAway: grouped.byHomeOrAway,
  }
}

export const buildPlayerTypeInsights = (playedGames) => {
  const grouped = buildGroupedInsights(playedGames)

  return {
    byType: grouped.byType,
    byDifficulty: grouped.byDifficulty,
  }
}

export const buildPlayerRecentInsights = (playedGames) => {
  const recent = buildRecentWindow(playedGames, 5)
  const rows = recent.rows || []

  const goals = rows.reduce((sum, row) => sum + n(row?.goals), 0)
  const assists = rows.reduce((sum, row) => sum + n(row?.assists), 0)
  const minutes = rows.reduce((sum, row) => sum + n(row?.timePlayed), 0)
  const goalContributions = goals + assists

  const totalGameDuration = rows.reduce((sum, row) => sum + n(row?.gameDuration), 0)
  const avgGameDuration = rows.length ? avg(totalGameDuration, rows.length, 0) : 90

  return {
    ...recent,
    goals,
    assists,
    minutes,
    avgGameDuration,
    goalContributions,
    goalsPerGame: perGame(goals, minutes, avgGameDuration),
    assistsPerGame: perGame(assists, minutes, avgGameDuration),
    contributionsPerGame: perGame(goalContributions, minutes, avgGameDuration),
  }
}
