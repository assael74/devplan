// src/coreData/hooks/useCoreDataPatchEntity.js
import { useCallback } from 'react'
import { patchShortsDocsByRouter } from '../utils/patchShortsEntity.js'

const SETTER_BY_ENTITY_TYPE = {
  players: 'setPlayersShorts',
  privates: 'setPrivatePlayersShorts',
  teams: 'setTeamsShorts',
  clubs: 'setClubsShorts',
  roles: 'setRolesShorts',
  scouting: 'setScoutingShorts',
  meetings: 'setMeetingsShorts',
  payments: 'setPaymentsShorts',
  games: 'setGamesShorts',
  externalGames: 'setExternalGamesShorts',
  videoAnalysis: 'setVideoAnalysisShorts',
  videos: 'setVideosShorts',
}

export const useCoreDataPatchEntity = setters =>
  useCallback(
    (entityType, id, patch) => {
      if (!entityType || !id || !patch) return false

      const setterName = SETTER_BY_ENTITY_TYPE[entityType]
      const setShorts = setters[setterName]

      if (typeof setShorts !== 'function') return false

      setShorts(prev =>
        patchShortsDocsByRouter({
          entityType,
          shortsDocs: prev,
          id,
          patch,
        })
      )

      return true
    },
    [setters]
  )
