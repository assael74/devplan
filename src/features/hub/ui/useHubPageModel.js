// src/features/hub/ui/useHubPageModel.js

import React, { useCallback, useMemo } from 'react'
import { Sheet, Typography } from '@mui/joy'
import { useTheme } from '@mui/joy/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useLocation, useNavigate } from 'react-router-dom'

import HubControlPanel from '../controlCenter/desktop/HubControlPanel.js'
import { useCoreData } from '../../../coreData/CoreDataProvider.js'
import { useCreateModal } from '../../../ui/forms/create/CreateModalProvider'
import { buildTaskFabContext } from '../../../ui/actions/buildTaskFabContext.js'
import { HUB_MODE, useHubState } from '../domain/hub.state.js'
import { getScopeMeta, getScopeMode, getScopeModes } from '../scopes/scope.js'
import { buildCountsByType, buildRoutesByType } from './hub.routes.js'
import {
  buildContextFromSelection,
  buildCreateHandlers,
  buildTabsMeta,
} from './HubPage.helpers.js'
import { buildDesktopHubList } from './buildDesktopHubList.js'
import { buildMobileHubListsProps } from './buildMobileHubListsProps.js'

const supportedControlTypes = new Set(['club', 'team', 'player', 'scout'])

function buildEmptyControl() {
  return (
    <Sheet variant="soft" sx={{ p: 2, borderRadius: 12 }}>
      <Typography level="title-sm">מרכז שליטה</Typography>
      <Typography level="body-sm" sx={{ mt: 0.5, opacity: 0.75 }}>
        בחר ישות כדי לראות פרטים.
      </Typography>
    </Sheet>
  )
}

export function useHubPageModel({ scope }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const location = useLocation()
  const { openCreate } = useCreateModal()

  const core = useCoreData()
  const {
    players = [],
    clubs = [],
    teams = [],
    roles = [],
    scouting = [],
    meetings = [],
    videoAnalysis = [],
    tags = [],
    loading,
    error,
  } = core

  const initialMode = useMemo(() => getScopeMode(scope, HUB_MODE), [scope])

  const state = useHubState({
    corePlayers: players,
    coreClubs: clubs,
    coreTeams: teams,
    coreScouting: scouting,
    initialMode,
  })

  const scopeMeta = useMemo(() => getScopeMeta(scope), [scope])
  const allowedModes = useMemo(
    () => getScopeModes(scope, state.MODE),
    [scope, state.MODE]
  )
  const tabsMeta = useMemo(
    () => buildTabsMeta(state.MODE, allowedModes),
    [state.MODE, allowedModes]
  )

  const context = useMemo(
    () => buildContextFromSelection(state.controlSelection),
    [state.controlSelection]
  )

  const countsByType = useMemo(() => {
    const type = state.controlSelection?.type
    return supportedControlTypes.has(type)
      ? buildCountsByType(state.controlSelection)
      : {}
  }, [state.controlSelection])

  const taskContext = useMemo(() => {
    return buildTaskFabContext({
      location,
      area: 'hub',
      mode: state.mode,
      extra: context,
    })
  }, [location, state.mode, context])

  const handlers = useMemo(() => {
    return buildCreateHandlers({
      openCreate,
      context,
      s: state,
    })
  }, [openCreate, context, state])

  const handleModeChange = useCallback(
    (nextMode) => {
      const resolvedMode = nextMode || state.MODE.PLAYERS
      if (resolvedMode === state.mode) return
      state.setMode(resolvedMode)
    },
    [state]
  )

  const handleOpenRoute = useCallback(
    (route) => {
      if (!route) return

      navigate(route, {
        state: {
          returnTo: `${location.pathname}${location.search}`,
        },
      })
    },
    [location.pathname, location.search, navigate]
  )

  const handleSelectClub = useCallback(
    (club) => {
      state.handleSelectClub({ clubId: club.id, clubName: club.clubName })
    },
    [state]
  )

  const handleSelectTeam = useCallback(
    (team) => {
      state.handleSelectTeam(
        { teamId: team.id, teamName: team.teamName },
        { clubId: team.clubId }
      )
    },
    [state]
  )

  const controlContext = useMemo(() => {
    const selectionContext = buildContextFromSelection(state.controlSelection) || {}

    return {
      ...selectionContext,
      clubs,
      teams,
      players,
      roles,
      meetings,
      tags,
      videoAnalysis,
    }
  }, [state.controlSelection, clubs, teams, players, roles, meetings, tags, videoAnalysis])

  const routes = useMemo(() => {
    const type = state.controlSelection?.type
    return supportedControlTypes.has(type)
      ? buildRoutesByType(state.controlSelection)
      : {}
  }, [state.controlSelection])

  const desktopList = useMemo(() => {
    return buildDesktopHubList({
      mode: state.mode,
      MODE: state.MODE,
      clubs,
      teams,
      clubPlayers: state.clubPlayersUi,
      privatePlayers: state.privatePlayersUi,
      controlSelection: state.controlSelection,
      scoutRows: state.scoutRows,
      onSelectClub: handleSelectClub,
      onSelectTeam: handleSelectTeam,
      onSelectPlayer: state.handleSelectPlayer,
      onSelectScout: state.handleSelectScout,
      onOpenActions: state.handleOpenActions,
    })
  }, [
    state.mode,
    state.MODE,
    state.clubPlayersUi,
    state.privatePlayersUi,
    state.controlSelection,
    state.scoutRows,
    state.handleSelectPlayer,
    state.handleSelectScout,
    state.handleOpenActions,
    clubs,
    teams,
    handleSelectClub,
    handleSelectTeam,
  ])

  const mobileListsProps = useMemo(() => {
    return buildMobileHubListsProps({
      MODE: state.MODE,
      clubs,
      teams,
      clubPlayers: state.clubPlayersUi,
      privatePlayers: state.privatePlayersUi,
      scoutRows: state.scoutRows,
      controlSelection: state.controlSelection,
      onSelectClub: handleSelectClub,
      onSelectTeam: handleSelectTeam,
      onSelectPlayer: state.handleSelectPlayer,
      onSelectScout: state.handleSelectScout,
      onOpenActions: state.handleOpenActions,
      onOpenRoute: handleOpenRoute,
    })
  }, [
    state.MODE,
    state.clubPlayersUi,
    state.privatePlayersUi,
    state.controlSelection,
    state.scoutRows,
    state.handleSelectPlayer,
    state.handleSelectScout,
    state.handleOpenActions,
    clubs,
    teams,
    handleSelectClub,
    handleSelectTeam,
    handleOpenRoute,
  ])

  const control = useMemo(() => {
    const type = state.controlSelection?.type
    if (!supportedControlTypes.has(type)) return buildEmptyControl()

    return (
      <HubControlPanel
        selection={state.controlSelection}
        routesByType={{ [type]: routes }}
        countsByType={countsByType}
        onOpenRoute={handleOpenRoute}
        context={controlContext}
      />
    )
  }, [state.controlSelection, routes, countsByType, handleOpenRoute, controlContext])

  return {
    isMobile,
    loading,
    error,
    desktopProps: {
      mode: state.mode,
      title: scopeMeta.title,
      subtitle: scopeMeta.subtitle,
      onModeChange: handleModeChange,
      counts: state.counts,
      tabsMeta,
      list: desktopList,
      control,
      handlers,
      context,
      taskContext,
      permissions: state.permissions,
    },
    mobileProps: {
      mode: state.mode,
      title: scopeMeta.title,
      subtitle: scopeMeta.subtitle,
      singleMode: allowedModes.length === 1,
      onScopeBack: () => navigate('/hub'),
      counts: state.counts,
      context,
      tabsMeta,
      handlers,
      taskContext,
      permissions: state.permissions,
      onModeChange: handleModeChange,
      mobileListsProps,
    },
  }
}
