// src/features/hub/clubProfile/clubProfile.logic.js

import { useCallback, useMemo } from 'react'
import { useCoreData } from '../../coreData/CoreDataProvider.js'
import { buildTaskFabContext } from '../../../ui/actions/buildTaskFabContext.js'
import { getTabFromUrl } from './clubProfile.routes'
import {
  buildClubProfileData,
} from './sharedLogic/index.js'
import {
  findProfileEntityById,
  resolveProfilePageState,
} from '../sharedProfile/logic/profileModel.shared.js'
import useProfileRouteModel from '../sharedProfile/logic/useProfileRouteModel.js'

export default function useClubProfilePageModel() {
  const resolveTab = useCallback(({ tabKeyParam, searchParams }) => {
    return getTabFromUrl({
      tabKeyParam,
      searchParams,
    })
  }, [])

  const {
    location,
    params,
    rawTab,
    tab,
    selectedTab,
  } = useProfileRouteModel({ resolveTab })

  const {
    players,
    teams,
    clubs,
    roles,
    loading,
    error,
  } = useCoreData()

  const entity = useMemo(() => {
    return findProfileEntityById({
      rows: clubs,
      id: params.clubId,
    })
  }, [clubs, params.clubId])

  const profileData = useMemo(() => {
    if (!entity) return null

    return buildClubProfileData({
      club: entity,
      teams: teams || [],
      players: players || [],
      calculationMode: 'games',
    })
  }, [entity, teams, players])

  const context = useMemo(() => {
    if (!entity) return {}

    return {
      club: entity,
      clubs: clubs || [],
      roles: roles || [],
    }
  }, [entity, clubs, roles])

  const taskContext = useMemo(() => {
    return buildTaskFabContext({
      location,
      area: 'club',
      mode: tab,
      extra: context,
    })
  }, [location, tab, context])

  const counts = useMemo(() => {
    if (!entity) return {}

    return {
      teams: profileData?.meta?.counts?.teams || 0,
      players: profileData?.meta?.counts?.players || 0,
      scoredTeams: profileData?.meta?.counts?.scoredTeams || 0,
      scoredPlayers: profileData?.meta?.counts?.scoredPlayers || 0,
    }
  }, [entity, profileData])

  const state = resolveProfilePageState({
    loading,
    error,
    entity,
  })

  if (state !== 'ready') {
    return { state }
  }

  return {
    state,
    rawTab,
    tab,
    selectedTab,
    entity,
    profileData,
    teams: profileData?.teams || [],
    players: profileData?.players || [],
    context,
    taskContext,
    counts,
  }
}
