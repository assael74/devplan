// teamProfile/sharedLogic/games/insightsLogic/squad/squad.metrics.js

import { getPlayedRows } from '../rows/gameRows.selectors.js'

import {
  EMPTY,
  toNum,
  resolveProgressColor,
} from '../common/view.shared.js'

import { getGamePlayers } from './squad.gamePlayers.js'

import {
  buildPlayersMap,
  getActiveSquadPlayers,
} from './squad.players.js'

import {
  collectPlayerStats,
  enrichPlayerStat,
  sortByStat,
} from './squad.stats.js'

import { buildScorersMetrics } from './squad.scorers.js'
import { buildSquadUsageMetrics } from './squad.usage.js'

const roundPct = (count, total) => {
  const c = toNum(count)
  const t = toNum(total)

  if (!t) return 0
  return Math.round((c / t) * 100)
}

const buildMetric = ({
  id,
  title,
  count,
  total,
  icon,
  players = [],
  emptyText = 'אין נתונים להצגה',
}) => {
  const pct = roundPct(count, total)

  return {
    id,
    title,
    count,
    total,
    pct,
    value: `${pct}%`,
    display: total > 0 ? `${count}/${total}` : EMPTY,
    subValue: total > 0 ? `${count}/${total} שחקנים` : emptyText,
    color: resolveProgressColor(pct),
    icon,
    players,
  }
}

const buildCoverage = ({
  playedRows = [],
  gamesWithPlayersCount = 0,
}) => {
  const playedGamesCount = playedRows.length
  const pct = roundPct(gamesWithPlayersCount, playedGamesCount)

  let label = 'לא זמין'
  let color = 'neutral'

  if (playedGamesCount > 0 && pct === 100) {
    label = 'גבוה'
    color = 'success'
  } else if (pct >= 80) {
    label = 'טוב'
    color = 'primary'
  } else if (pct >= 50) {
    label = 'חלקי'
    color = 'warning'
  } else if (pct > 0) {
    label = 'נמוך'
    color = 'danger'
  }

  return {
    playedGamesCount,
    gamesWithPlayersCount,
    pct,
    label,
    color,
    text:
      playedGamesCount > 0
        ? `נתוני שחקנים קיימים ב־${gamesWithPlayersCount}/${playedGamesCount} משחקים`
        : 'אין משחקים ששוחקו לבדיקה',
  }
}

export const buildTeamGamesSquadMetrics = ({
  team = {},
  games = {},
} = {}) => {
  const activePlayers = getActiveSquadPlayers(team)
  const activePlayersCount = activePlayers.length
  const playersMap = buildPlayersMap(activePlayers)

  const playedRows = getPlayedRows(games)
  const gamesWithPlayersCount = playedRows.filter((row) => {
    return getGamePlayers(row).length > 0
  }).length

  const statsByPlayerId = collectPlayerStats(playedRows)
  const allPlayerStats = Object.values(statsByPlayerId).map((stat) =>
    enrichPlayerStat(stat, playersMap)
  )

  const scorers = sortByStat(
    allPlayerStats.filter((item) => toNum(item?.goals) > 0),
    'goals'
  )

  const assisters = sortByStat(
    allPlayerStats.filter((item) => toNum(item?.assists) > 0),
    'assists'
  )

  const contributors = sortByStat(
    allPlayerStats.filter((item) => {
      return toNum(item?.goals) > 0 || toNum(item?.assists) > 0
    }),
    'goals'
  )

  const starters = sortByStat(
    allPlayerStats.filter((item) => toNum(item?.starts) > 0),
    'starts'
  )

  const usedPlayers = sortByStat(
    allPlayerStats.filter((item) => toNum(item?.appearances) > 0),
    'appearances'
  )

  const scorersMetrics = buildScorersMetrics(scorers)
  const squadUsageMetrics = buildSquadUsageMetrics({
    allPlayerStats,
    leagueGameTime: team?.leagueGameTime,
  })

  const rows = [
    buildMetric({
      id: 'squadScorersRate',
      title: 'פיזור כובשים',
      count: scorers.length,
      total: activePlayersCount,
      icon: 'goal',
      players: scorers,
      emptyText: 'אין כובשים רשומים',
    }),
    buildMetric({
      id: 'squadAssistersRate',
      title: 'פיזור מבשלים',
      count: assisters.length,
      total: activePlayersCount,
      icon: 'assist',
      players: assisters,
      emptyText: 'אין מבשלים רשומים',
    }),
    buildMetric({
      id: 'squadGoalContributorsRate',
      title: 'מעורבות התקפית',
      count: contributors.length,
      total: activePlayersCount,
      icon: 'attack',
      players: contributors,
      emptyText: 'אין מעורבים בשערים',
    }),
    buildMetric({
      id: 'squadStartersRate',
      title: 'פיזור שחקני הרכב',
      count: starters.length,
      total: activePlayersCount,
      icon: 'isStart',
      players: starters,
      emptyText: 'אין שחקני הרכב רשומים',
    }),
    buildMetric({
      id: 'squadUsedPlayersRate',
      title: 'פיזור שחקנים ששולבו',
      count: usedPlayers.length,
      total: activePlayersCount,
      icon: 'isSquad',
      players: usedPlayers,
      emptyText: 'אין שחקנים ששולבו',
    }),
  ]

  return {
    activePlayersCount,
    playedGamesCount: playedRows.length,

    rows,

    coverage: buildCoverage({
      playedRows,
      gamesWithPlayersCount,
    }),

    scorersMetrics,
    squadUsageMetrics,

    players: {
      scorers,
      assisters,
      contributors,
      starters,
      usedPlayers,
      all: allPlayerStats,
    },

    emptyText:
      activePlayersCount > 0
        ? 'אין נתוני סגל להצגה'
        : 'לא נמצאו שחקני סגל פעילים',
  }
}
