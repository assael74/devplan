// src/features/hub/playerProfile/playerProfile.logic.js

import { useMemo } from 'react'
import { useLocation, useParams, useSearchParams } from 'react-router-dom'
import { useCoreData } from '../../coreData/CoreDataProvider.js'
import { buildTaskFabContext } from '../../../ui/actions/buildTaskFabContext.js'
import { getTabFromUrl } from './playerProfile.routes'
import {
  buildPlayerProfileData,
} from './sharedLogic/profileData/index.js'
import {
  buildProfileTagsById,
  findProfileEntityById,
  resolveProfilePageState,
  resolveProfileRawTab,
  resolveProfileSelectedTab,
} from '../sharedProfile/logic/profileModel.shared.js'

export default function usePlayerProfilePageModel() {
  const location = useLocation()
  const { playerId, tabKey } = useParams()
  const [searchParams] = useSearchParams()

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
      rows: players,
      id: playerId,
    })
  }, [players, playerId])

  const isProject = entity?.type === 'project'
  const isPrivatePlayer = entity?.isPrivatePlayer === true

  const tagsById = useMemo(() => {
    return buildProfileTagsById(tags)
  }, [tags])

  const team = useMemo(() => {
    return findProfileEntityById({
      rows: teams,
      id: entity?.teamId,
    })
  }, [teams, entity?.teamId])

  const context = useMemo(() => {
    if (!entity) return {}

    return {
      team,
      club: findProfileEntityById({
        rows: clubs,
        id: entity?.clubId,
      }),
      teams: teams || [],
      clubs: clubs || [],
      players: players || [],
      roles: roles || [],
      tags: tags || [],
      tagsById,
    }
  }, [entity, team, clubs, teams, players, roles, tags, tagsById])

  const profileData = useMemo(() => {
    if (!entity) return null

    return buildPlayerProfileData({
      player: entity,
      team,
      calculationMode: 'games',
    })
  }, [entity, team])

  const rawTab = useMemo(() => {
    return resolveProfileRawTab({
      tabKey,
      searchParams,
    })
  }, [tabKey, searchParams])

  const tab = useMemo(() => {
    return getTabFromUrl({
      tabKeyParam: tabKey,
      searchParams,
      isProject,
    })
  }, [tabKey, searchParams, isProject])

  const selectedTab = useMemo(() => {
    return resolveProfileSelectedTab({
      rawTab,
      tab,
    })
  }, [rawTab, tab])

  const taskContext = useMemo(() => {
    return buildTaskFabContext({
      location,
      area: 'player',
      mode: tab,
      extra: context,
    })
  }, [location, tab, context])

  const counts = useMemo(() => {
    if (!entity) return {}

    return {
      games:
        profileData?.games?.counts?.playedPlayerGames ||
        entity?.performances?.length ||
        0,
      meetings: entity?.meetings?.length || 0,
      payments: entity?.payments?.length || 0,
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
    isProject,
    isPrivatePlayer,
    entity,
    context,
    profileData,
    taskContext,
    counts,
  }
}
