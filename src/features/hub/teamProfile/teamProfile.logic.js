// src/features/hub/teamProfile/teamProfile.logic.js

import { useCallback, useMemo } from 'react'
import { useCoreData } from '../../coreData/CoreDataProvider.js'
import { buildTaskFabContext } from '../../../ui/actions/buildTaskFabContext.js'
import { getTabFromUrl } from './teamProfile.routes'
import {
  buildTeamProfileData,
} from './sharedLogic/profileData/index.js'
import {
  findProfileEntityById,
  resolveProfilePageState,
} from '../sharedProfile/logic/profileModel.shared.js'
import useProfileRouteModel from '../sharedProfile/logic/useProfileRouteModel.js'

export default function useTeamProfilePageModel() {
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
    tags,
    loading,
    error,
  } = useCoreData()

  const entity = useMemo(() => {
    return findProfileEntityById({
      rows: teams,
      id: params.teamId,
    })
  }, [teams, params.teamId])

  const context = useMemo(() => {
    if (!entity) return {}

    return {
      club: findProfileEntityById({
        rows: clubs,
        id: entity.clubId,
      }),
      teams: teams || [],
      clubs: clubs || [],
      players: players || [],
      roles: roles || [],
      tags: tags || [],
    }
  }, [entity, teams, clubs, players, roles, tags])

  const profileData = useMemo(() => {
    if (!entity) return null

    return buildTeamProfileData({
      team: entity,
      calculationMode: 'games',
    })
  }, [entity])

  const taskContext = useMemo(() => {
    return buildTaskFabContext({
      location,
      area: 'team',
      mode: tab,
      extra: context,
    })
  }, [location, tab, context])

  const counts = useMemo(() => {
    if (!entity) return {}

    return {
      games: entity?.teamGames?.length || 0,
      meetings: entity?.teamMeetings?.length || 0,
    }
  }, [entity])

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
    context,
    taskContext,
    counts,
    profileData,
  }
}
