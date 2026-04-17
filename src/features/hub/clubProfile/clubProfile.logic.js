// features/hub/clubProfile/clubProfile.logic.js

import { useMemo } from 'react'
import { useLocation, useParams, useSearchParams, Navigate } from 'react-router-dom'
import { Sheet, Typography, Box, CircularProgress } from '@mui/joy'

import { useCoreData } from '../../coreData/CoreDataProvider.js'
import { buildTaskFabContext } from '../../../ui/actions/buildTaskFabContext.js'
import { getTabFromUrl } from './clubProfile.routes'

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

  const context = useMemo(() => {
    if (!entity) return {}

    return {
      club: entity,
      teams: teams || [],
      clubs: clubs || [],
      players: players || [],
      roles: roles || [],
    }
  }, [entity, teams, clubs, players, roles])

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
      teams: entity?.teams?.length || 0,
    }
  }, [entity])

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
    tab,
    entity,
    context,
    taskContext,
    counts,
  }
}
