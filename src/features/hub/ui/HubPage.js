// src/features/hub/ui/HubPage.js
import React, { useMemo, useCallback } from 'react'
import { Sheet, Typography, Box, CircularProgress } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import PreviewPanel from '../components/PreviewPanel'
import PlayersLayout from '../components/layout/PlayersLayout'
import HubFabMenu from '../components/navigation/HubFabMenu'
import HubToolbar from '../components/navigation/HubToolbar'

import PlayersListPane from '../components/lists/players/PlayersListPane.js'
import PrivatesListPane from '../components/lists/privates/PrivatesListPane.js'
import TeamsListPane from '../components/lists/teams/TeamsListPane.js'
import ClubsList from '../components/lists/clubs/ClubsList.js'
import HubStaffList from '../components/lists/staff/HubStaffList.js'
import HubScoutingList from '../components/lists/scout/HubScoutingList.js'

import { useCoreData } from '../../coreData/CoreDataProvider.js'
import { useHubState } from '../domain/hub.state'
import { hubPageSx } from './hubPage.sx'
import { buildRoutesByType, buildCountsByType } from './hub.routes'
import { useCreateModal } from '../../../ui/forms/create/CreateModalProvider'
import {
  buildTabsMeta,
  buildContextFromSelection,
  buildCreateHandlers,
} from './HubPage.helpers'

const supportedPreviewTypes = new Set(['club', 'team', 'player', 'staff', 'scout'])

function isPrivatePlayer(player) {
  return player?.playerSource === 'private' || player?.isPrivatePlayer === true
}

export default function HubPage() {
  const navigate = useNavigate()
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

  const handlers = useMemo(() => {
    return buildCreateHandlers({
      openCreate,
      context,
      s,
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

  const list = useMemo(() => {
    if (s.mode === s.MODE.CLUBS) {
      return (
        <ClubsList
          clubs={clubs || []}
          onSelect={(club) =>
            s.handleSelectClub({ clubId: club.id, clubName: club.clubName })
          }
          selectedId={s.previewSelection?.type === 'club' ? s.previewSelection.data?.id : null}
        />
      )
    }

    if (s.mode === s.MODE.TEAMS) {
      return (
        <TeamsListPane
          teams={teams || []}
          onSelect={(team) =>
            s.handleSelectTeam(
              { teamId: team.id, teamName: team.teamName },
              { clubId: team.clubId }
            )
          }
          selectedId={s.previewSelection?.type === 'team' ? s.previewSelection.data?.id : null}
        />
      )
    }

    if (s.mode === s.MODE.PLAYERS) {
      return (
        <PlayersListPane
          players={clubPlayers}
          onSelect={s.handleSelectPlayer}
          selectedId={s.previewSelection?.type === 'player' ? s.previewSelection.data?.id : null}
          onOpenActions={s.handleOpenActions}
        />
      )
    }

    if (s.mode === s.MODE.STAFF) {
      return <HubStaffList rows={s.staffRows} onSelect={s.handleSelectStaff} />
    }

    if (s.mode === s.MODE.PRIVATES) {
      return (
        <PrivatesListPane
          players={privatePlayers}
          onSelect={s.handleSelectPlayer}
          selectedId={s.previewSelection?.type === 'player' ? s.previewSelection.data?.id : null}
          onOpenActions={s.handleOpenActions}
        />
      )
    }

    if (s.mode === s.MODE.SCOUTING) {
      return <HubScoutingList rows={s.scoutRows} onSelect={s.handleSelectScout} />
    }

    return null
  }, [
    s,
    clubs,
    teams,
    clubPlayers,
    privatePlayers,
    s.mode,
    s.previewSelection,
    s.staffRows,
    s.scoutRows,
  ])

  const preview = supportedPreviewTypes.has(s.previewSelection?.type) ? (
    <PreviewPanel
      selection={s.previewSelection}
      routesByType={{ [s.previewSelection?.type]: routes }}
      countsByType={countsByType}
      onOpenRoute={(route) => route && navigate(route)}
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

  return (
    <Sheet sx={hubPageSx.page}>
      <HubToolbar
        mode={s.mode}
        onModeChange={handleModeChange}
        query={s.query}
        onQueryChange={s.setQuery}
        counts={s.counts}
        tabsMeta={tabsMeta}
      />

      <PlayersLayout list={list} preview={preview} />

      <HubFabMenu
        mode={s.mode}
        context={context}
        handlers={handlers}
        permissions={s.permissions}
      />
    </Sheet>
  )
}
