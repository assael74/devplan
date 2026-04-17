// src/features/hub/ui/HubPage.js

// src/features/hub/ui/HubPage.js

import React, { useMemo, useCallback } from 'react'
import { Sheet, Typography, Box, CircularProgress } from '@mui/joy'
import { useTheme } from '@mui/joy/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useNavigate, useLocation } from 'react-router-dom'

import PreviewPanel from '../components/desktop/PreviewPanel'
import HubRootDesktop from '../components/desktop/HubRootDesktop'
import HubRootMobile from '../components/mobile/HubRootMobile'

import { useCoreData } from '../../coreData/CoreDataProvider.js'
import { useHubState } from '../domain/hub.state'
import { buildRoutesByType, buildCountsByType } from './hub.routes'
import { useCreateModal } from '../../../ui/forms/create/CreateModalProvider'
import {
  buildTabsMeta,
  buildContextFromSelection,
  buildCreateHandlers,
} from './HubPage.helpers'
import { buildTaskFabContext } from '../../../ui/actions/buildTaskFabContext.js'
import { buildDesktopHubList } from './buildDesktopHubList.js'
import { buildMobileHubListsProps } from './buildMobileHubListsProps.js'

const supportedPreviewTypes = new Set(['club', 'team', 'player', 'staff', 'scout'])

function isPrivatePlayer(player) {
  return player?.playerSource === 'private' || player?.isPrivatePlayer === true
}

export default function HubPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const navigate = useNavigate()
  const location = useLocation()
  const { openCreate } = useCreateModal()

  const {
    players,
    clubs,
    teams,
    roles,
    scouting,
    meetings,
    videoAnalysis,
    tags,
    loading,
    error,
  } = useCoreData()

  const clubPlayers = useMemo(
    () => (players || []).filter((player) => !isPrivatePlayer(player)),
    [players]
  )

  const privatePlayers = useMemo(
    () => (players || []).filter((player) => isPrivatePlayer(player)),
    [players]
  )

  const s = useHubState({
    corePlayers: players,
    coreClubs: clubs,
    coreTeams: teams,
    coreRoles: roles,
    coreScouting: scouting,
    coreMeetings: meetings,
  })

  const tabsMeta = useMemo(() => buildTabsMeta(s.MODE), [s.MODE])

  const routesByType = useMemo(() => buildRoutesByType(), [])
  const countsByType = useMemo(() => {
    const type = s.previewSelection?.type
    return supportedPreviewTypes.has(type) ? buildCountsByType(s.previewSelection) : {}
  }, [s.previewSelection])

  const context = useMemo(
    () => buildContextFromSelection(s.previewSelection),
    [s.previewSelection]
  )

  const taskContext = useMemo(() => {
    return buildTaskFabContext({
      location,
      area: 'hub',
      mode: s.mode,
      extra: context,
    })
  }, [location, s.mode, context])

  const handlers = useMemo(() => {
    return buildCreateHandlers({
      openCreate,
      context,
      s,
      currentMode: s.mode,
      countsByType,
      routesByType,
      navigate,
    })
  }, [openCreate, context, s, countsByType, routesByType, navigate])

  const handleModeChange = useCallback(
    (next) => {
      const nextMode = next || s.MODE.PLAYERS
      if (nextMode === s.mode) return
      s.setMode(nextMode)
    },
    [s]
  )

  const handleOpenRoute = useCallback(
    (route) => {
      if (!route) return
      navigate(route)
    },
    [navigate]
  )

  const handleSelectClub = useCallback(
    (club) => {
      s.handleSelectClub({ clubId: club.id, clubName: club.clubName })
    },
    [s]
  )

  const handleSelectTeam = useCallback(
    (team) => {
      s.handleSelectTeam(
        { teamId: team.id, teamName: team.teamName },
        { clubId: team.clubId }
      )
    },
    [s]
  )

  const previewContext = useMemo(() => {
    const selectionContext = buildContextFromSelection(s.previewSelection) || {}

    return {
      ...selectionContext,
      clubs: clubs || [],
      teams: teams || [],
      players: players || [],
      roles: roles || [],
      meetings: meetings || [],
      tags: tags || [],
      videoAnalysis: videoAnalysis || [],
    }
  }, [s.previewSelection, clubs, teams, players, roles, meetings, tags, videoAnalysis])

  const routes = useMemo(() => {
    const type = s.previewSelection?.type
    return supportedPreviewTypes.has(type) ? buildRoutesByType(s.previewSelection) : {}
  }, [s.previewSelection])

  const desktopList = useMemo(() => {
    return buildDesktopHubList({
      mode: s.mode,
      MODE: s.MODE,
      clubs: clubs || [],
      teams: teams || [],
      clubPlayers,
      privatePlayers,
      previewSelection: s.previewSelection,
      staffRows: s.staffRows,
      scoutRows: s.scoutRows,
      onSelectClub: handleSelectClub,
      onSelectTeam: handleSelectTeam,
      onSelectPlayer: s.handleSelectPlayer,
      onSelectStaff: s.handleSelectStaff,
      onSelectScout: s.handleSelectScout,
      onOpenActions: s.handleOpenActions,
    })
  }, [
    s.mode,
    s.MODE,
    s.previewSelection,
    s.staffRows,
    s.scoutRows,
    s.handleSelectPlayer,
    s.handleSelectStaff,
    s.handleSelectScout,
    s.handleOpenActions,
    clubs,
    teams,
    clubPlayers,
    privatePlayers,
    handleSelectClub,
    handleSelectTeam,
  ])

  const mobileListsProps = useMemo(() => {
    return buildMobileHubListsProps({
      MODE: s.MODE,
      clubs: clubs || [],
      teams: teams || [],
      clubPlayers,
      privatePlayers,
      staffRows: s.staffRows,
      scoutRows: s.scoutRows,
      previewSelection: s.previewSelection,
      onSelectClub: handleSelectClub,
      onSelectTeam: handleSelectTeam,
      onSelectPlayer: s.handleSelectPlayer,
      onSelectStaff: s.handleSelectStaff,
      onSelectScout: s.handleSelectScout,
      onOpenActions: s.handleOpenActions,
      onOpenRoute: handleOpenRoute,
    })
  }, [
    s.MODE,
    s.previewSelection,
    s.staffRows,
    s.scoutRows,
    s.handleSelectPlayer,
    s.handleSelectStaff,
    s.handleSelectScout,
    s.handleOpenActions,
    clubs,
    teams,
    clubPlayers,
    privatePlayers,
    handleSelectClub,
    handleSelectTeam,
    handleOpenRoute,
  ])

  const preview = supportedPreviewTypes.has(s.previewSelection?.type) ? (
    <PreviewPanel
      selection={s.previewSelection}
      routesByType={{ [s.previewSelection?.type]: routes }}
      countsByType={countsByType}
      onOpenRoute={handleOpenRoute}
      context={previewContext}
    />
  ) : (
    <Sheet variant="soft" sx={{ p: 2, borderRadius: 12 }}>
      <Typography level="title-sm">תצוגה מקדימה</Typography>
      <Typography level="body-sm" sx={{ mt: 0.5, opacity: 0.75 }}>
        בחר ישות כדי לראות פרטים.
      </Typography>
    </Sheet>
  )

  if (loading) {
    return (
      <Sheet sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size="sm" />
          <Typography level="body-sm">טוען נתונים.</Typography>
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

  if (isMobile) {
    return (
      <HubRootMobile
        mode={s.mode}
        counts={s.counts}
        tabsMeta={tabsMeta}
        onModeChange={handleModeChange}
        mobileListsProps={mobileListsProps}
      />
    )
  }

  return (
    <HubRootDesktop
      mode={s.mode}
      onModeChange={handleModeChange}
      query={s.query}
      onQueryChange={s.setQuery}
      counts={s.counts}
      tabsMeta={tabsMeta}
      list={desktopList}
      preview={preview}
      handlers={handlers}
      context={context}
      taskContext={taskContext}
      permissions={s.permissions}
    />
  )
}
