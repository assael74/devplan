// playerProfile/sharedLogic/performance/performance.domain.logic.js

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

export function buildPlayerPerformanceRows(player) {
  const rows = asArr(player?.playerGames)
  const playerId = player?.id

  return rows
    .map((entry) => {
      const game = entry?.game || {}
      const playerStats = asArr(game?.playerStats)
      const perf = playerStats.find((item) => item?.playerId === playerId)
      if (!perf) return null

      return {
        ...entry,
        id: entry?.gameId || game?.id || '',
        type: safe(entry?.type || game?.type || ''),
        gameId: entry?.gameId || game?.id || '',
        game,
        stats: {
          ...perf,
          timePlayed: entry?.stats?.timePlayed ?? perf?.timePlayed ?? null,
          timeVideoStats: perf?.timeVideoStats ?? 0,
          gameDuration: game?.gameDuration ?? null,
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
