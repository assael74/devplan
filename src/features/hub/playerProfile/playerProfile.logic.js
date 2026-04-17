// features/hub/playerProfile/playerProfile.logic.js

import { useMemo } from 'react'
import { useLocation, useParams, useSearchParams, Navigate } from 'react-router-dom'
import { Sheet, Typography, Box, CircularProgress } from '@mui/joy'

import { useCoreData } from '../../coreData/CoreDataProvider.js'
import { buildTaskFabContext } from '../../../ui/actions/buildTaskFabContext.js'
import { getTabFromUrl } from './playerProfile.routes'

function buildLoadingNode() {
  return (
    <Sheet sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size="sm" />
        <Typography level="body-sm">טוען שחקן…</Typography>
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

export default function usePlayerProfilePageModel() {
  const location = useLocation()
  const { playerId, tabKey } = useParams()
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

  const entity = useMemo(() => {
    return (players || []).find((item) => String(item.id) === String(playerId)) || null
  }, [players, playerId])

  const isProject = entity?.type === 'project'

  const tagsById = useMemo(() => {
    if (!Array.isArray(tags)) return null
    return Object.fromEntries(tags.map((item) => [String(item.id), item]))
  }, [tags])

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
      isProject,
    })
  }, [tabKey, sp, isProject])

  const selectedTab = useMemo(() => {
    return rawTab ? tab : ''
  }, [rawTab, tab])

  const context = useMemo(() => {
    if (!entity) return {}

    return {
      team: (teams || []).find((team) => String(team.id) === String(entity.teamId)) || null,
      club: (clubs || []).find((club) => String(club.id) === String(entity.clubId)) || null,
      teams: teams || [],
      clubs: clubs || [],
      players: players || [],
      roles: roles || [],
      tags: tags || [],
      tagsById,
    }
  }, [entity, teams, clubs, players, roles, tags, tagsById])

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
      games: entity?.performances?.length || 0,
      meetings: entity?.meetings?.length || 0,
      payments: entity?.payments?.length || 0,
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
    isProject,
    entity,
    context,
    taskContext,
    counts,
  }
}
