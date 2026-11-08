// src/features/hub/playerProfile/sharedLogic/performance/performance.domain.logic.js

import { statsFilterGroups } from '../../../../../shared/performance/filters/statsFilterGroups.js'
import { buildNewFilteredStats } from '../../../../../shared/performance/logic/perf.aggregate.logic.js'
import { buildPerformanceStatsModel } from '../../../../../shared/performance/logic/perf.cards.logic.js'
import { statsParm } from '../../../../../shared/stats/statsParmList.js'

export const INITIAL_PERFORMANCE_FILTERS = {
  statsParmType: 'all',
  type: 'all',
}

const asArr = (value) => (Array.isArray(value) ? value : [])
const safe = (value) => (value == null ? '' : String(value))

export function getPlayerPerformanceGames(player) {
  const games = new Map()
  const entries = asArr(player?.playerGames).length
    ? player.playerGames
    : asArr(player?.externalGames)

  for (const entry of entries) {
    const game = entry?.game || entry || {}
    const gameId = safe(entry?.gameId || game.id || game.gameId)
    if (!gameId) continue

    games.set(gameId, {
      ...game,
      id: gameId,
      referenceOnly: game.referenceOnly === true,
      statsDocId: game.statsDocId || game.gameStatsDocId || entry.statsDocId || '',
    })
  }

  const refs = asArr(player?.advancedStats?.statsGameRefs).concat(asArr(player?.statsGameRefs))
  for (const ref of refs) {
    const gameId = safe(ref.gameId)
    if (!gameId) continue

    const game = games.get(gameId) || { id: gameId, gameDate: ref.gameDate || '', referenceOnly: true }
    games.set(gameId, {
      ...game,
      statsDocId: game.statsDocId || ref.gameStatsDocId || '',
    })
  }

  return Array.from(games.values())
}

export function hydratePlayerPerformanceGames(player, statsDocs) {
  const byId = new Map(asArr(statsDocs).map(doc => [safe(doc?.id || doc?.docId), doc]))

  return getPlayerPerformanceGames(player).map(game => {
    const doc = byId.get(safe(game.statsDocId))
    if (!doc || safe(doc.gameId) !== safe(game.id)) return game

    return { ...game, playerStats: asArr(doc.playerStats) }
  })
}

export function buildPlayerPerformanceRows(player) {
  const rows = getPlayerPerformanceGames(player)
  const playerId = safe(player?.id)

  return rows
    .map((entry) => {
      const game = entry?.game || entry
      const playerStats = asArr(game?.playerStats)
      const perf = playerStats.find(item => safe(item?.playerId) === playerId)
      if (!perf) return null

      return {
        ...entry,
        id: entry?.gameId || game?.id || '',
        type: safe(entry?.type || game?.type || ''),
        gameId: entry?.gameId || game?.id || '',
        game,
        stats: {
          ...perf,
          ...(perf.stats || {}),
          timePlayed: perf.timePlayed === undefined ? null : perf.timePlayed,
          timeVideoStats: perf.timeVideoStats === undefined ? 0 : perf.timeVideoStats,
          gameDuration: game.gameDuration === undefined ? null : game.gameDuration,
        },
      }
    })
    .filter(Boolean)
}

function findFilterGroup(key) {
  return asArr(statsFilterGroups).find((group) => group?.key === key) || null
}

function buildIndicators(filters) {
  const out = []

  if (filters?.statsParmType && filters.statsParmType !== 'all') {
    const group = findFilterGroup('statsParmType')
    const option = asArr(group?.options).find((item) => item?.value === filters.statsParmType)

    out.push({
      id: 'statsParmType',
      key: 'statsParmType',
      label: option?.label || filters.statsParmType,
      idIcon: option?.idIcon || 'statsParm',
    })
  }

  if (filters?.type && filters.type !== 'all') {
    const group = findFilterGroup('type')
    const option = asArr(group?.options).find((item) => item?.value === filters.type)

    out.push({
      id: 'type',
      key: 'type',
      label: option?.label || filters.type,
      idIcon: option?.idIcon || 'league',
    })
  }

  return out
}

function buildOptions() {
  return {
    statsParmType: asArr(findFilterGroup('statsParmType')?.options),
    type: asArr(findFilterGroup('type')?.options),
  }
}

export function resolvePlayerPerformanceDomain(player, filters = INITIAL_PERFORMANCE_FILTERS) {
  const rows = buildPlayerPerformanceRows(player)

  const pack = buildNewFilteredStats(rows, statsParm, filters, {
    statsKey: 'stats',
    recordedMinutesKey: 'timeVideoStats',
    gameDurationKeyInStats: 'gameDuration',
  })

  const cardsModel = buildPerformanceStatsModel({
    fullStats: pack?.newFullStatsRaw || {},
    statsParm: pack?.filteredStatsParm || [],
  })

  const indicators = buildIndicators(filters)
  const options = buildOptions()

  return {
    rows,
    filteredStatsParm: pack?.filteredStatsParm || [],
    filteredStats: pack?.filteredStats || [],
    fullStatsRaw: pack?.newFullStatsRaw || {},
    fullStatsNorm: pack?.newFullStatsNorm || null,
    statsMeta: pack?.statsMeta || {},
    cardsModel,
    indicators,
    options,
    summary: {
      gamesCount: asArr(pack?.filteredStats).length,
      paramsCount: asArr(pack?.filteredStatsParm).length,
      activeFiltersCount: indicators.length,
    },
  }
}
