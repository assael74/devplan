// src/features/hub/teamProfile/TeamProfilePage.js

import React, { useMemo } from 'react'
import { useNavigate, useLocation, useParams, useSearchParams, Navigate } from 'react-router-dom'
import { Sheet, Typography, Box, CircularProgress } from '@mui/joy'

import { useCoreData } from '../../coreData/CoreDataProvider.js'
import { buildTaskFabContext } from '../../../ui/actions/buildTaskFabContext.js'
import ProfileShell from '../../hub/sharedProfile/ProfileShell'

import { getTabFromUrl } from './teamProfile.routes'
import TeamHeader from './components/TeamHeader'
import TeamNav from './components/TeamNav'
import TeamModules from './components/TeamModules'
import TeamProfileFab from './components/TeamProfileFab'

export default function TeamProfilePage() {
  const navigate = useNavigate()
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

  const tab = useMemo(
    () => getTabFromUrl({ tabKeyParam: tabKey, searchParams: sp }),
    [tabKey, sp]
  )

  const entity = useMemo(() => {
    const t = (teams || []).find((x) => String(x.id) === String(teamId)) || null
    if (!t) return null

    return {
      ...t,
    }
  }, [teams, teamId])

  const context = useMemo(() => {
    if (!entity) return {}

    return {
      club: clubs?.find((c) => String(c.id) === String(entity.clubId)) || null,
      teams,
      clubs,
      players,
      roles,
      tags,
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
      games: entity.teamGames?.length || 0,
      meetings: entity.teamMeetings?.length || 0,
    }
  }, [entity])

  if (loading) {
    return (
      <Sheet sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size="sm" />
          <Typography level="body-sm">טוען קבוצה…</Typography>
        </Box>
      </Sheet>
    )
  }

  if (error) {
    return (
      <Sheet sx={{ p: 2 }}>
        <Typography level="body-sm">שגיאה בטעינת נתונים</Typography>
      </Sheet>
    )
  }

  if (!entity) return <Navigate to="/hub" replace />

  return (
    <ProfileShell
      tab={tab}
      entity={entity}
      context={context}
      entityType={entity}
      taskContext={taskContext}
      headerProps={{ counts }}
      HeaderComp={TeamHeader}
      NavComp={TeamNav}
      RendererComp={TeamModules}
      FabComp={TeamProfileFab}
    />
  )
}
