// features/hub/clubProfile/ClubProfilePage.js
import React, { useMemo } from 'react'
import { useParams, useSearchParams, Navigate } from 'react-router-dom'
import { Sheet, Typography, Box, CircularProgress } from '@mui/joy'

import { useCoreData } from '../../coreData/CoreDataProvider.js'
import ProfileShell from '../../hub/sharedProfile/ProfileShell'

import { getTabFromUrl } from './clubProfile.routes'
import ClubHeader from './components/ClubHeader'
import ClubNav from './components/ClubNav'
import ClubModules from './components/ClubModules'
import ClubProfileFab from './components/ClubProfileFab'

export default function ClubProfilePage() {
  const { clubId, tabKey } = useParams()
  const [sp] = useSearchParams()

  const {
    players,
    teams,
    clubs,
    videos,
    roles,
    performances,
    abilities,
    tags,
    loading,
    error,
  } = useCoreData()

  const tab = useMemo(
    () => getTabFromUrl({ tabKeyParam: tabKey, searchParams: sp }),
    [tabKey, sp]
  )

  const baseClub = useMemo(() => {
    return (clubs || []).find((t) => String(t.id) === String(clubId)) || null
  }, [clubs, clubId])

  const entity = useMemo(() => {
    if (!baseClub) return null
    const cid = String(baseClub.id)

    return {
      ...baseClub,
    }
  }, [baseClub])

  const context = useMemo(() => {
    if (!entity) return {}
    return {
      club: clubs?.find((c) => String(c.id) === String(entity.clubId)) || null,
      teams: teams,
      clubs: clubs,
      players: players,
      roles: roles,
    }
  }, [entity, teams, clubs, players, roles, tags])

  const counts = useMemo(() => {
    if (!entity) return {}
    return {
      teams: entity.teams?.length || 0,
    }
  }, [entity])

  if (loading) {
    return (
      <Sheet sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size="sm" />
          <Typography level="body-sm">טוען מועדון ...</Typography>
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
      HeaderComp={ClubHeader}
      NavComp={ClubNav}
      RendererComp={ClubModules}
      FabComp={ClubProfileFab}
    />
  )
}
