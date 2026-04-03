// src/features/players/playerProfile/PlayerProfilePage.js
import React, { useMemo } from 'react'
import { useParams, useSearchParams, Navigate } from 'react-router-dom'
import { Sheet, Typography, Box, CircularProgress } from '@mui/joy'

import { useCoreData } from '../../coreData/CoreDataProvider.js'
import ProfileShell from '../../hub/sharedProfile/ProfileShell'

import { getTabFromUrl } from './playerProfile.routes'
import PlayerHeader from './components/PlayerHeader'
import PlayerNav from './components/PlayerNav'
import PlayerModules from './components/PlayerModules'
import PlayerProfileFab from './components/PlayerProfileFab'

export default function PlayerProfilePage() {
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
    const p = (players || []).find((x) => String(x.id) === String(playerId)) || null
    if (!p) return null

    return {
      ...p,
    }
  }, [players, playerId])

  const isProject = entity?.type === 'project'

  const tagsById = useMemo(() => {
    if (!Array.isArray(tags)) return null
    return Object.fromEntries(tags.map((t) => [String(t.id), t]))
  }, [tags])

  const tab = useMemo(
    () => getTabFromUrl({ tabKeyParam: tabKey, searchParams: sp, isProject }),
    [tabKey, sp, isProject]
  )

  const context = useMemo(() => {
    if (!entity) return {}

    return {
      team: teams?.find((t) => String(t.id) === String(entity.teamId)) || null,
      club: clubs?.find((c) => String(c.id) === String(entity.clubId)) || null,
      teams,
      clubs,
      players,
      roles,
      tags,
      tagsById,
    }
  }, [entity, teams, clubs, players, roles, tags, tagsById])

  const counts = useMemo(() => {
    if (!entity) return {}

    return {
      games: entity.performances?.length || 0,
      meetings: entity.meetings?.length || 0,
      payments: entity.payments?.length || 0,
    }
  }, [entity])

  if (loading) {
    return (
      <Sheet sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size="sm" />
          <Typography level="body-sm">טוען שחקן…</Typography>
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
      entity={entity}
      context={context}
      tab={tab}
      entityType={entity}
      headerProps={{ counts }}
      HeaderComp={PlayerHeader}
      NavComp={PlayerNav}
      RendererComp={PlayerModules}
      FabComp={PlayerProfileFab}
    />
  )
}
