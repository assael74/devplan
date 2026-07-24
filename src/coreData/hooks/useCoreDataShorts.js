// src/coreData/hooks/useCoreDataShorts.js
import { useMemo } from 'react'

export function useCoreDataShorts({
  clubsShorts,
  teamsShorts,
  playersShorts,
  privatePlayersShorts,
  scoutingShorts,
  meetingsShorts,
  paymentsShorts,
  gamesShorts,
  externalGamesShorts,
  rolesShorts,
  videosShorts,
  videoAnalysisShorts,
}) {
  return useMemo(
    () => ({
      clubsShorts,
      teamsShorts,
      playersShorts,
      privatePlayersShorts,
      scoutingShorts,
      meetingsShorts,
      paymentsShorts,
      gamesShorts,
      externalGamesShorts,
      rolesShorts,
      videosShorts,
      videoAnalysisShorts,
    }),
    [
      clubsShorts,
      teamsShorts,
      playersShorts,
      privatePlayersShorts,
      scoutingShorts,
      meetingsShorts,
      paymentsShorts,
      gamesShorts,
      externalGamesShorts,
      rolesShorts,
      videosShorts,
      videoAnalysisShorts,
    ]
  )
}
