// src/features/hub/playerProfile/sharedLogic/performance/usePlayerPerformanceData.js

import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { useAuth } from '../../../../../application/auth/AuthProvider.js'
import { loadGameStats } from '../../../../../application/actions/gameStats/loadGameStats.action.js'
import { unwrapActionResult } from '../../../../../application/shared/actionResult.js'
import {
  getPlayerPerformanceGames,
  hydratePlayerPerformanceGames,
} from './performance.domain.logic.js'

const combineQueries = results => ({
  statsDocs: results.map(result => result.data).filter(Boolean),
  loading: results.some(result => result.isPending),
  refreshing: results.some(result => result.isFetching && !result.isPending),
  error: results.find(result => result.error)?.error || null,
  refresh: () => Promise.all(results.map(result => result.refetch())),
})

export function usePlayerPerformanceData(entity, context) {
  const { user } = useAuth()
  const livePlayer = useMemo(() => {
    const players = Array.isArray(context?.players) ? context.players : []
    return players.find(player => player?.id === entity?.id &&
      Boolean(player.isPrivatePlayer) === Boolean(entity?.isPrivatePlayer)) || entity || null
  }, [entity, context?.players])

  const games = useMemo(() => getPlayerPerformanceGames(livePlayer), [livePlayer])
  const linkedGames = games.filter(game => game.statsDocId)
  const requests = Array.from(new Map(linkedGames.map(game => [game.statsDocId, game])).values())
  const result = useQueries({
    queries: requests.map(game => ({
      queryKey: ['game-stats', user?.uid, livePlayer?.playerSource, livePlayer?.id, game.statsDocId],
      enabled: Boolean(user?.uid),
      staleTime: 0,
      refetchOnMount: 'always',
      queryFn: async () => {
        const doc = unwrapActionResult(await loadGameStats({ gameStatsDocId: game.statsDocId }))
        if (!doc || String(doc.gameId) !== String(game.id)) {
          throw new Error('לא נמצאה סטטיסטיקה תואמת למשחק המקושר')
        }
        return doc
      },
    })),
    combine: combineQueries,
  })

  const player = useMemo(() => {
    if (!livePlayer) return null
    return {
      ...livePlayer,
      playerGames: hydratePlayerPerformanceGames(livePlayer, result.statsDocs),
    }
  }, [livePlayer, result.statsDocs])

  const loadedIds = new Set(result.statsDocs.map(doc => doc.id || doc.docId))
  const waitingForDocuments = requests.some(game => !loadedIds.has(game.statsDocId))

  return {
    player,
    loading: result.loading || (!result.error && waitingForDocuments),
    error: result.error,
    refreshing: result.refreshing,
    refresh: result.refresh,
  }
}
