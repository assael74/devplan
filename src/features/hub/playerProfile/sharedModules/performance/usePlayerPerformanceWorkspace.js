// src/features/hub/playerProfile/sharedModules/performance/usePlayerPerformanceWorkspace.js

import { useEffect, useMemo, useState } from 'react'
import { usePlayerPerformanceData } from '../../sharedLogic/performance/usePlayerPerformanceData.js'
import { buildPerformanceReport, getMetricGameValue, INITIAL_REPORT_FILTERS } from '../../sharedLogic/performance/performance.metrics.logic.js'
import { buildPositionComparison, getPlayerStandardPosition } from '../../sharedLogic/performance/performance.comparison.logic.js'
import { usePlayerGamesStatsActions } from '../games/model/usePlayerGamesStatsActions.js'

export default function usePlayerPerformanceWorkspace({ entity, context, performanceInsightsRequest = 0 }) {
  const data = usePlayerPerformanceData(entity, context)
  const [view, setView] = useState('games')
  const [filters, setFilters] = useState(INITIAL_REPORT_FILTERS)
  const [target, setTarget] = useState('age')
  const [selectedGameId, setSelectedGameId] = useState('')
  const [normalizedGameId, setNormalizedGameId] = useState('')
  const [position, setPosition] = useState(() => getPlayerStandardPosition(entity))
  const [percentile, setPercentile] = useState('p50')
  const [trendMetric, setTrendMetric] = useState('passes')
  const [statsFormLoading, setStatsFormLoading] = useState(false)
  const [statsFormLoadingText, setStatsFormLoadingText] = useState('')

  const report = useMemo(() => buildPerformanceReport({ player: data.player, filters, target }), [data.player, filters, target])
  const comparison = useMemo(() => buildPositionComparison({
    games: report.measuredGames,
    positionId: position,
    minutes: target === 'age' ? 90 : Number(target),
    percentile,
    family: filters.family,
  }), [report.measuredGames, position, target, percentile, filters.family])

  const activeGame = report.games.find(game => game.id === selectedGameId) || report.measuredGames[0] || report.games[0] || null
  const normalizedGame = report.measuredGames.find(game => game.id === normalizedGameId) || null
  const liveTeam = context?.team || data.player?.team || null
  const stats = usePlayerGamesStatsActions({
    livePlayer: data.player,
    liveTeam,
    contextPlayers: Array.isArray(context?.players) ? context.players : [],
    statsFormLoadingApi: { setStatsFormLoading, setStatsFormLoadingText },
  })

  useEffect(() => {
    if (performanceInsightsRequest > 0) setView('normalized')
  }, [performanceInsightsRequest])

  const changeView = next => {
    if (next === 'compare' && target === 'age') setTarget('90')
    setView(next)
  }

  const changeFilters = patch => setFilters(current => ({ ...current, ...patch }))
  const hasCopyValues = view === 'normalized' && normalizedGame
    ? report.metrics.some(metric => getMetricGameValue(normalizedGame, metric, target).value !== null)
    : view === 'games'
    ? Boolean(activeGame?.measured)
    : view === 'compare'
      ? comparison.some(metric => metric.actual !== null)
      : (view === 'normalized' ? report.normalizedMetrics : report.rawMetrics).some(metric => metric.value !== null)

  return {
    ...data, report, comparison, activeGame, normalizedGame, setNormalizedGameId, liveTeam, stats,
    view, changeView, filters, changeFilters, resetFilters: () => setFilters(INITIAL_REPORT_FILTERS),
    target, setTarget, setSelectedGameId, position, setPosition, percentile, setPercentile,
    trendMetric, setTrendMetric, statsFormLoading, statsFormLoadingText,
    canCopy: hasCopyValues && !data.loading && !data.refreshing && !data.error,
  }
}
