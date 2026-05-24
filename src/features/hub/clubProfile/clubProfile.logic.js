// features/hub/clubProfile/clubProfile.logic.js

import { useMemo } from 'react'
import { useLocation, useParams, useSearchParams, Navigate } from 'react-router-dom'
import { Sheet, Typography, Box, CircularProgress } from '@mui/joy'

import { useCoreData } from '../../coreData/CoreDataProvider.js'

import { buildTaskFabContext } from '../../../ui/actions/buildTaskFabContext.js'
import { getTabFromUrl } from './clubProfile.routes'

import {
  buildClubProfileData,
} from './sharedLogic/index.js'

function buildLoadingNode() {
  return (
    <Sheet sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size="sm" />
        <Typography level="body-sm">טוען מועדון ...</Typography>
      </Box>
    </Sheet>
  )
}

function buildErrorNode() {
  return (
    <Sheet sx={{ p: 2 }}>
      <Typography level="body-sm">שגיאה בטעינת נתונים</Typography>
    </Sheet>
  )
}

function buildMissingNode() {
  return <Navigate to="/hub" replace />
}

export default function useClubProfilePageModel() {
  const location = useLocation()
  const { clubId, tabKey } = useParams()
  const [sp] = useSearchParams()

  const {
    players,
    teams,
    clubs,
    roles,
    loading,
    error,
  } = useCoreData()

  const tab = useMemo(() => {
    return getTabFromUrl({
      tabKeyParam: tabKey,
      searchParams: sp,
    })
  }, [tabKey, sp])

  const entity = useMemo(() => {
    return (clubs || []).find((club) => String(club.id) === String(clubId)) || null
  }, [clubs, clubId])

  const profileData = useMemo(() => {
    if (!entity) return null

    return buildClubProfileData({
      club: entity,
      teams: teams || [],
      players: players || [],
      calculationMode: 'games',
    })
  }, [entity, teams, players])

  const rawTab = useMemo(() => {
    const fromParam = String(tabKey || '').trim()
    if (fromParam) return fromParam

    const fromQuery = String(sp.get('tab') || '').trim()
    return fromQuery
  }, [tabKey, sp])

  const selectedTab = useMemo(() => {
    return rawTab ? tab : ''
  }, [rawTab, tab])

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

  if (loading) {
    return {
      state: 'loading',
      loadingNode: buildLoadingNode(),
    }
  }

  if (error) {
    return {
      state: 'error',
      errorNode: buildErrorNode(),
    }
  }

  if (!entity) {
    return {
      state: 'missing',
      missingNode: buildMissingNode(),
    }
  }

  return {
    state: 'ready',
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
