// src/coreData/CoreDataProvider.js
import React, { createContext, useContext, useMemo } from 'react'
import { mergeShorts } from './resolvers/mergeShorts.js'
import { useAuth } from '../features/auth/index.js'
import { buildCoreDataStatus } from './coreData.status.js'
import { useCoreDataSources } from './hooks/useCoreDataSources.js'
import { buildCoreDataContextValue } from './coreData.contextValue.js'
import { useCoreDataPatchEntity } from './hooks/useCoreDataPatchEntity.js'
import { useResolvedCoreData } from './hooks/useResolvedCoreData.js'
import { useCoreDataShorts } from './hooks/useCoreDataShorts.js'

const CoreDataContext = createContext(null)

const resolveAccessRoles = (rolesShorts) => {
  if (!Array.isArray(rolesShorts)) return []
  return mergeShorts(rolesShorts, 'rolesInfo', ['rolesContact'], 'id')
}

export function CoreDataProvider({ children }) {
  const { user } = useAuth()

  const {
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
    sourceErrors,
    setters,
  } = useCoreDataSources(user)

  const patchEntity = useCoreDataPatchEntity(setters)

  const status = useMemo(
    () =>
      buildCoreDataStatus({
        user,
        shorts: {
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
        },
        sourceErrors,
      }),
    [
      user,
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
      sourceErrors,
    ]
  )

  const {
    loading,
    accessLoading,
    primaryLoading,
    secondaryLoading,
    summaryLoading,
    accessReady,
    primaryReady,
    secondaryReady,
    summaryReady,
    coreReady,
    readiness,
    sources: sourceStatus,
    sourceHealth,
    failedSources,
    errorCount,
    hasSourceErrors,
    error,
  } = status

  const accessRoles = useMemo(() => resolveAccessRoles(rolesShorts), [rolesShorts])

  const shorts = useCoreDataShorts({
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
  })

  const resolvedCoreData = useResolvedCoreData({
    user,
    primaryLoading,
    shorts,
  })

  const value = useMemo(
    () =>
      buildCoreDataContextValue({
        user,
        status,
        shorts,
        sourceErrors,
        patchEntity,
        resolvedCoreData,
        accessRoles,
      }),
    [
      user,
      status,
      shorts,
      sourceErrors,
      patchEntity,
      resolvedCoreData,
      accessRoles,
    ]
  )

  return <CoreDataContext.Provider value={value}>{children}</CoreDataContext.Provider>
}

export function useCoreData() {
  const ctx = useContext(CoreDataContext)
  if (!ctx) throw new Error('useCoreData must be used within CoreDataProvider')
  return ctx
}
