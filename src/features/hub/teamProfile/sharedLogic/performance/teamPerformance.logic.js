// teamProfile/sharedLogic/performance/teamPerformance.logic.js

import { buildNewFilteredStats } from '../../../../../shared/performance/logic/perf.aggregate.logic'
import { getParmKey } from '../../../../../shared/performance/logic/perf.statsParm'

const n = (v) => {
  const x = Number(v)
  return Number.isFinite(x) ? x : 0
}

function normalizePlayerStats(rawStats, fallbackGamesCount) {
  const s = rawStats && typeof rawStats === 'object' ? { ...rawStats } : {}

  // games
  if (s.gamesCount == null) s.gamesCount = s.totalGames
  if (s.gamesCount == null) s.gamesCount = fallbackGamesCount
  if (s.gamesCount == null) s.gamesCount = 0

  // minutes
  if (s.timePlayed == null) s.timePlayed = s.totalMinutes
  if (s.timePlayed == null) s.timePlayed = s.minutes
  if (s.timePlayed == null) s.timePlayed = 0

  // play rate (optional)
  if (s.playTimeRate == null) s.playTimeRate = s.playedRate

  // goals/assists
  if (s.goals == null) s.goals = 0
  if (s.assists == null) s.assists = 0

  return s
}

export function buildPlayerPackFromGames(player, statsParm) {
  var p = player || {}
  var games = Array.isArray(p.playerGames) ? p.playerGames : []

  var res = buildNewFilteredStats(
    games,
    Array.isArray(statsParm) ? statsParm : [],
    { statsParmType: 'all', type: 'all' },
    { statsKey: 'stats', recordedMinutesKey: 'timeVideoStats', gameDurationKeyInStats: 'gameDuration' }
  )

  var raw = (res && (res.newFullStatsRaw || res.newFullStats)) || {}
  var norm = res && res.newFullStatsNorm ? res.newFullStatsNorm : null
  var meta = (res && res.statsMeta) || {}

  return {
    gamesCount: games.length,
    filteredStatsParm: (res && res.filteredStatsParm) || [],
    fullStatsRaw: raw,
    fullStatsNorm: norm,
    statsMeta: meta,
  }
}

export function buildTeamPlayersRows(team, statsParm) {
  var players = pickTeamPlayers(team)
  var out = []

  for (var i = 0; i < players.length; i++) {
    var pl = players[i] || {}
    var pack = buildPlayerPackFromGames(pl, statsParm)

    var stats = normalizePlayerStats(pack.fullStatsRaw, pack.gamesCount)

    var usable = n(stats.gamesCount) > 0 || n(stats.timePlayed) > 0

    out.push({
      id: String(pl.id || pl.playerId || i),
      name: String(pl.name || '').trim() || pickPlayerNameFallback(pl),
      photo: pl.photo,
      positions: Array.isArray(pl.positions) ? pl.positions : [],
      stats,
      statsNorm: pack.fullStatsNorm,
      statsMeta: pack.statsMeta,
      usable,
      playerRef: pl,
    })
  }

  return out
}

function pickPlayerNameFallback(p) {
  var first = String(p && p.playerFirstName ? p.playerFirstName : '').trim()
  var last = String(p && p.playerLastName ? p.playerLastName : '').trim()
  var full = (first + ' ' + last).trim()
  return full || 'שחקן'
}

export function buildPlayersParmCoverage(args) {
  var players = (args && args.players) || []
  var statsParm = (args && args.statsParm) || []
  var minCount = Math.max(1, Number((args && args.minCount) || 1))

  function pickStats(pl) {
    return (pl && (pl.stats || pl.playerFullStats || pl.fullStats || pl.statsRaw || pl.statsObj)) || {}
  }

  var coverage = {}
  for (var i = 0; i < statsParm.length; i++) {
    var k = getParmKey(statsParm[i])
    if (k) coverage[k] = 0
  }

  for (var p = 0; p < players.length; p++) {
    var st = pickStats(players[p])
    for (var j = 0; j < statsParm.length; j++) {
      var k2 = getParmKey(statsParm[j])
      if (!k2) continue
      var v = st[k2]
      if (typeof v === 'number' && isFinite(v)) coverage[k2] = (coverage[k2] || 0) + 1
    }
  }

  var available = []
  for (var t = 0; t < statsParm.length; t++) {
    var k3 = getParmKey(statsParm[t])
    if (!k3) continue
    if ((coverage[k3] || 0) >= minCount) available.push(statsParm[t])
  }

  return { availableStatsParm: available, coverage: coverage, playersCount: players.length }
}

export function pickTeamPlayers(team) {
  var t = team || {}
  return (Array.isArray(t.teamPlayers) && t.teamPlayers) || (Array.isArray(t.players) && t.players) || []
}
