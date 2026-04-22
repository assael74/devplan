// teamProfile/sharedLogic/performance/teamPerformance.packs.logic.js

import {
  buildNewFilteredStats,
  buildNewFilteredStatsByGroup,
} from '../../../../../shared/performance/logic/perf.aggregate.logic'

import { resolveTeamPerformanceDomain } from './teamPerformance.domain.logic.js'

const toNum0 = (v) => {
  const x = Number(v)
  return Number.isFinite(x) ? x : 0
}

const pickTeamPlayers = (team) => {
  const t = team || {}
  return (Array.isArray(t.teamPlayers) && t.teamPlayers) || (Array.isArray(t.players) && t.players) || []
}

const pickTeamGames = (team) => {
  const t = team || {}
  return (Array.isArray(t.teamGames) && t.teamGames) || []
}

const buildPlayerName = (p) =>
  [p?.playerFirstName, p?.playerLastName].filter(Boolean).join(' ').trim() || p?.name || '—'

const isUsableStats = (stats) => {
  const s = stats || {}
  return toNum0(s.gamesCount) > 0 || toNum0(s.timePlayed) > 0
}

const mapPlayerGameToAggRow = (player, pg) => {
  const p = player || {}
  const x = pg || {}

  const st = x.stats || {}
  const g = x.game || {}

  const type = g.type
  const recorded = toNum0(st.timeVideoStats)
  const timePlayed = st.timePlayed != null ? st.timePlayed : null
  const gameDuration = g.gameDuration != null ? g.gameDuration : null

  return {
    playerId: String(p.id || p.playerId || ''),
    playerName: buildPlayerName(p),
    photo: p.photo || null,
    positions: Array.isArray(p.positions) ? p.positions : [],
    type,
    game: { type },
    stats: {
      ...st,
      timeVideoStats: recorded,
      gameDuration,
      timePlayed,
    },
  }
}

const mapTeamGameToAggRow = (tg) => {
  const x = tg || {}
  const st = x?.stats && typeof x.stats === 'object' ? x.stats : {}
  const g = x?.game && typeof x.game === 'object' ? x.game : {}

  const type = x.type || g.type || 'all'
  const recorded = toNum0(st.teamVideoTime) // teamVideoTime -> timeVideoStats for pack
  const gameDuration = g.gameDuration != null ? g.gameDuration : null

  return {
    type,
    game: { type },
    stats: {
      ...st,
      timeVideoStats: recorded,
      gameDuration,
      timePlayed: st.timePlayed ?? st.totalMinutes ?? st.minutes ?? st.timePlay ?? null,
    },
  }
}

export function buildTeamPackFromEntity(entity, statsParm, statsFilters) {
  const team = entity || {}
  const teamGames = pickTeamGames(team)
  const rows = (teamGames || []).map(mapTeamGameToAggRow)

  const pack = buildNewFilteredStats(rows, statsParm, statsFilters, {
    statsKey: 'stats',
    recordedMinutesKey: 'timeVideoStats',
    gameDurationKeyInStats: 'gameDuration',
  })

  return {
    scope: 'team',
    teamGames,
    filteredStatsParm: pack?.filteredStatsParm || [],
    fullStatsRaw: pack?.newFullStatsRaw || pack?.newFullStats || {},
    fullStatsNorm: pack?.newFullStatsNorm || null,
    statsMeta: pack?.statsMeta || {},
  }
}

export function buildPlayersPackFromEntity(entity, statsParm, statsFilters) {
  const team = entity || {}
  const players = pickTeamPlayers(team)

  const allRows = []
  ;(players || []).forEach((p) => {
    const arr = Array.isArray(p?.playerGames) ? p.playerGames : []
    arr.forEach((pg) => {
      const row = mapPlayerGameToAggRow(p, pg)
      if (row?.playerId) allRows.push(row)
    })
  })

  const packs = buildNewFilteredStatsByGroup(allRows, statsParm, statsFilters, {
    groupKey: 'playerId',
    statsKey: 'stats',
    recordedMinutesKey: 'timeVideoStats',
    gameDurationKeyInStats: 'gameDuration',
  })

  const perPlayer = (packs || []).map((p) => {
    const statsRaw = p?.newFullStatsRaw || p?.newFullStats || {}
    const statsNorm = p?.newFullStatsNorm || null
    const statsMeta = p?.statsMeta || {}

    return {
      id: String(p.playerId || p.id || ''),
      name: p.playerName || '—',
      photo: p.photo || null,
      positions: p.positions || [],
      stats: statsRaw || {},
      statsNorm,
      statsMeta,
      usable: isUsableStats(statsRaw || {}),
    }
  })

  const domain = resolveTeamPerformanceDomain(perPlayer)

  return {
    scope: 'players',
    players,
    allPlayerGameRowsCount: allRows.length,
    perPlayer,
    domain,
  }
}
