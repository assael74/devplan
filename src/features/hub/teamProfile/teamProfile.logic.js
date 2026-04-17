// features/hub/teamProfile/teamProfile.logic.js

import { useMemo } from 'react'
import { useLocation, useParams, useSearchParams, Navigate } from 'react-router-dom'
import { Sheet, Typography, Box, CircularProgress } from '@mui/joy'

import { useCoreData } from '../../coreData/CoreDataProvider.js'
import { buildTaskFabContext } from '../../../ui/actions/buildTaskFabContext.js'
import { getTabFromUrl } from './teamProfile.routes'

function buildLoadingNode() {
  return (
    <Sheet sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size="sm" />
        <Typography level="body-sm">טוען קבוצה…</Typography>
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

export default function useTeamProfilePageModel() {
  const location = useLocation()
  const { teamId, tabKey } = useParams()
  const [sp] = useSearchParams()

  const {
    players,
    teams,
    clubs,
    roles,
    tags,
    loading,
    error,
  } = useCoreData()

  const rawTab = useMemo(() => {
    const fromParam = String(tabKey || '').trim()
    if (fromParam) return fromParam

    const fromQuery = String(sp.get('tab') || '').trim()
    return fromQuery
  }, [tabKey, sp])

  const tab = useMemo(() => {
    return getTabFromUrl({
      tabKeyParam: tabKey,
      searchParams: sp,
    })
  }, [tabKey, sp])

  const selectedTab = useMemo(() => {
    return rawTab ? tab : ''
  }, [rawTab, tab])

  const entity = useMemo(() => {
    return (teams || []).find((item) => String(item.id) === String(teamId)) || null
  }, [teams, teamId])

  const context = useMemo(() => {
    if (!entity) return {}

    return {
      club: (clubs || []).find((club) => String(club.id) === String(entity.clubId)) || null,
      teams: teams || [],
      clubs: clubs || [],
      players: players || [],
      roles: roles || [],
      tags: tags || [],
    }
  }, [entity, teams, clubs, players, roles, tags])

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
    context,
    taskContext,
    counts,
  }
}
