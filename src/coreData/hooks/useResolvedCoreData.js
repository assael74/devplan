// src/coreData/hooks/useResolvedCoreData.js
import { useMemo } from 'react'
import { resolveCoreData } from '../resolvers/coreData.resolver.js'

const normalizeShorts = (shorts) => ({
  clubsShorts: shorts.clubsShorts || [],
  teamsShorts: shorts.teamsShorts || [],
  playersShorts: shorts.playersShorts || [],
  privatePlayersShorts: shorts.privatePlayersShorts || [],
  scoutingShorts: shorts.scoutingShorts || [],
  meetingsShorts: shorts.meetingsShorts || [],
  paymentsShorts: shorts.paymentsShorts || [],
  gamesShorts: shorts.gamesShorts || [],
  externalGamesShorts: shorts.externalGamesShorts || [],
  rolesShorts: shorts.rolesShorts || [],
  videosShorts: shorts.videosShorts || [],
  videoAnalysisShorts: shorts.videoAnalysisShorts || [],
})

export function useResolvedCoreData({ user, primaryLoading, shorts }) {
  return useMemo(() => {
    if (!user || primaryLoading) return null
    return resolveCoreData(normalizeShorts(shorts))
  }, [user, primaryLoading, shorts])
}
