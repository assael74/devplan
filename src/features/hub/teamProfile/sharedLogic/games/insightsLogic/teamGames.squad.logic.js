// teamProfile/sharedLogic/games/insightsLogic/teamGames.squad.logic.js

import {
  getGameObject,
  getPlayedRows,
} from './teamGames.rows.shared.js'

import {
  EMPTY,
  toNum,
  resolveProgressColor,
} from './teamGames.view.shared.js'

const roundPct = (count, total) => {
  const c = toNum(count)
  const t = toNum(total)

  if (!t) return 0
  return Math.round((c / t) * 100)
}

const getPlayerId = (player = {}) => {
  return player?.id || player?.playerId || player?.uid || ''
}

const getPlayerName = (player = {}, fallback = EMPTY) => {
  const fullName = String(player?.playerFullName || '').trim()
  if (fullName) return fullName

  const shortName = String(player?.playerShortName || '').trim()
  if (shortName) return shortName

  const firstName = String(player?.playerFirstName || '').trim()
  const lastName = String(player?.playerLastName || '').trim()
  const joined = `${firstName} ${lastName}`.trim()

  return joined || fallback
}

const isActiveSquadPlayer = (player = {}) => {
  if (!player || !getPlayerId(player)) return false

  if (player?.isDeleted === true) return false
  if (player?.deleted === true) return false
  if (player?.archived === true) return false
  if (player?.isArchived === true) return false
  if (player?.isActive === false) return false
  if (player?.active === false) return false

  const status = String(player?.status || player?.playerStatus || '').toLowerCase()
  if (['inactive', 'archived', 'deleted', 'left'].includes(status)) return false

  return true
}

const buildPlayersMap = (players = []) => {
  return players.reduce((acc, player) => {
    const id = getPlayerId(player)
    if (!id) return acc

    acc[id] = player
    return acc
  }, {})
}

const getActiveSquadPlayers = (team = {}) => {
  const players = Array.isArray(team?.players) ? team.players : []
  return players.filter(isActiveSquadPlayer)
}

const getGamePlayers = (row = {}) => {
  const game = getGameObject(row)

  if (Array.isArray(row?.gamePlayers)) return row.gamePlayers
  if (Array.isArray(row?.players)) return row.players
  if (Array.isArray(row?.game?.gamePlayers)) return row.game.gamePlayers
  if (Array.isArray(row?.game?.players)) return row.game.players
  if (Array.isArray(game?.gamePlayers)) return game.gamePlayers
  if (Array.isArray(game?.players)) return game.players

  return []
}

const getGamePlayerId = (item = {}) => {
  return item?.playerId || item?.id || item?.uid || ''
}

const isStarter = (item = {}) => {
  return (
    item?.isStarting === true ||
    item?.isStarter === true ||
    item?.started === true ||
    item?.lineupStatus === 'starter'
  )
}

const isUsedPlayer = (item = {}) => {
  const timePlayed = toNum(item?.timePlayed ?? item?.minutes ?? item?.playedMinutes)

  return (
    timePlayed > 0 ||
    item?.isSelected === true ||
    item?.played === true ||
    item?.wasUsed === true ||
    isStarter(item)
  )
}

const createEmptyPlayerStat = (playerId) => {
  return {
    playerId,
    goals: 0,
    assists: 0,
    starts: 0,
    appearances: 0,
    selectedGames: 0,
    squadGames: 0,
    timePlayed: 0,
  }
}

const collectPlayerStats = (playedRows = []) => {
  const statsByPlayerId = {}

  playedRows.forEach((row) => {
    const gamePlayers = getGamePlayers(row)

    gamePlayers.forEach((item) => {
      const playerId = getGamePlayerId(item)
      if (!playerId) return

      if (!statsByPlayerId[playerId]) {
        statsByPlayerId[playerId] = createEmptyPlayerStat(playerId)
      }

      const stat = statsByPlayerId[playerId]
      const goals = toNum(item?.goals)
      const assists = toNum(item?.assists)
      const timePlayed = toNum(item?.timePlayed ?? item?.minutes ?? item?.playedMinutes)

      stat.goals += goals
      stat.assists += assists
      stat.timePlayed += timePlayed

      if (isStarter(item)) stat.starts += 1
      if (isUsedPlayer(item)) stat.appearances += 1
      if (item?.isSelected === true) stat.selectedGames += 1
      if (item?.onSquad === true) stat.squadGames += 1
    })
  })

  return statsByPlayerId
}

const enrichPlayerStat = (stat, playersMap = {}) => {
  const player = playersMap?.[stat.playerId] || {}

  return {
    ...stat,
    playerName: getPlayerName(player, stat.playerId),
    photo: player?.photo || '',
    positions: Array.isArray(player?.positions) ? player.positions : [],
    squadRole: player?.squadRole || '',
    rawPlayer: player,
  }
}

const sortByStat = (items = [], key) => {
  return [...items].sort((a, b) => {
    const diff = toNum(b[key]) - toNum(a[key])
    if (diff !== 0) return diff

    return String(a?.playerName || '').localeCompare(String(b?.playerName || ''))
  })
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

const buildScorersMetrics = (scorers = []) => {
  const rows = Array.isArray(scorers) ? scorers : []

  const totalGoalsFromScorers = rows.reduce((sum, player) => {
    return sum + toNum(player?.goals)
  }, 0)

  const uniqueScorers = rows.length

  const oneGoalScorers = rows.filter((player) => {
    return toNum(player?.goals) === 1
  }).length

  const scorers3Plus = rows.filter((player) => {
    return toNum(player?.goals) >= 3
  }).length

  const scorers5Plus = rows.filter((player) => {
    return toNum(player?.goals) >= 5
  }).length

  const scorers10Plus = rows.filter((player) => {
    return toNum(player?.goals) >= 10
  }).length

  const topScorerGoals = toNum(rows?.[0]?.goals)

  const top3ScorersGoals = rows.slice(0, 3).reduce((sum, player) => {
    return sum + toNum(player?.goals)
  }, 0)

  const topScorer = rows?.[0] || null
  const top3Scorers = rows.slice(0, 3)

  const topScorerDependencyPct = roundPct(
    topScorerGoals,
    totalGoalsFromScorers
  )

  const top3DependencyPct = roundPct(
    top3ScorersGoals,
    totalGoalsFromScorers
  )

  const oneGoalScorersPct = roundPct(
    oneGoalScorers,
    uniqueScorers
  )

  return {
    hasData: totalGoalsFromScorers > 0 || uniqueScorers > 0,

    rows,

    totalGoalsFromScorers,
    uniqueScorers,

    oneGoalScorers,
    scorers3Plus,
    scorers5Plus,
    scorers10Plus,

    topScorer,
    top3Scorers,

    topScorerGoals,
    top3ScorersGoals,

    topScorerDependencyPct,
    top3DependencyPct,
    oneGoalScorersPct,
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
