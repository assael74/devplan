// src/features/liveTagging/ui/LiveTaggingPanel.js

import React from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import {
  buildInitialClock,
  buildLiveEvent,
  formatClock,
  getClockSnapshot,
  pauseClock,
  resetClock,
  setClockTime,
  startClock,
  toggleClockSpeed,
} from '../../../shared/liveTagging/index.js'

import {
  buildEventsListModel,
  buildInitialLiveActionsState,
  buildInitialSelection,
  buildInitialTaggingState,
  buildLiveTaggingHeaderModel,
  buildSelectedLiveActionPairs,
  canUseLiveTagging,
  clearPendingTag,
  getSelectedAction,
  resolveSelectionTeamId,
  resetLiveActionPairs,
  setSelectionGameId,
  setSelectionPlayerId,
  setSelectionSubjectType,
  setSelectionTeamId,
  setSelectedAction,
  setSelectedZone,
  toggleLiveActionPair,
} from '../logic/index.js'

import { useCoreData } from '../../coreData/CoreDataProvider.js'

import { LiveActionsGrid } from './LiveActionsGrid.js'
import { LiveActionsSettingsDrawer } from './LiveActionsSettingsDrawer.js'
import { LiveClockBar } from './LiveClockBar.js'
import { LiveEventsList } from './LiveEventsList.js'
import { LiveObjectGameSelector } from './LiveObjectGameSelector.js'
import { LiveZonesDrawer } from './LiveZonesDrawer.js'
import { sx } from './sx/liveTagging.sx.js'

const DEMO_SESSION = {
  sessionId: 'demo_session',
}

const useClockTick = (running) => {
  const [, setTick] = React.useState(0)

  React.useEffect(() => {
    if (!running) return undefined

    const id = setInterval(() => {
      setTick((value) => value + 1)
    }, 300)

    return () => clearInterval(id)
  }, [running])
}

const getCoreList = (value) => {
  return Array.isArray(value) ? value : []
}

const buildSessionFromSelection = ({ session, selection, selectedTeamId }) => ({
  ...session,
  gameId: selection.gameId,
  teamId: selectedTeamId,
})

export default function LiveTaggingPanel({ clubId = '', session = DEMO_SESSION }) {
  const {
    players: corePlayers,
    teams: coreTeams,
    games: coreGames,
    clubs: coreClubs,
    loading,
    error,
  } = useCoreData()

  const players = getCoreList(corePlayers)
  const teams = getCoreList(coreTeams)
  const games = getCoreList(coreGames)
  const clubs = getCoreList(coreClubs)

  const [clock, setClock] = React.useState(() => buildInitialClock())
  const [events, setEvents] = React.useState([])
  const [selection, setSelection] = React.useState(() => buildInitialSelection())
  const [tagState, setTagState] = React.useState(() => buildInitialTaggingState())
  const [actionsState, setActionsState] = React.useState(() => {
    return buildInitialLiveActionsState()
  })
  const [actionsSettingsOpen, setActionsSettingsOpen] = React.useState(false)

  const ready = canUseLiveTagging(selection) && !loading && !error
  const visibleActions = buildSelectedLiveActionPairs(actionsState)
  const selectedAction = getSelectedAction(tagState.selectedActionId)
  const selectedTeamId = resolveSelectionTeamId({ selection, players })
  const resolvedClubId = clubId || teams.find((team) => team.id === selectedTeamId)?.clubId || ''

  useClockTick(clock?.running && ready)

  const headerModel = buildLiveTaggingHeaderModel({
    clock,
    clockText: formatClock(clock),
  })

  const eventsModel = buildEventsListModel({ events, players })

  const handleToggleClock = () => {
    if (!ready) return
    setClock((prev) => (prev?.running ? pauseClock(prev) : startClock(prev)))
  }

  const handleResetClock = () => {
    setClock((prev) => resetClock({
      period: prev?.period || 1,
      speed: prev?.speed || 1,
    }))
  }

  const handleSetClockTime = ({ minute, second }) => {
    if (!ready) return
    setClock((prev) => setClockTime({ clock: prev, minute, second }))
  }

  const handleToggleSpeed = () => {
    if (!ready) return
    setClock((prev) => toggleClockSpeed(prev))
  }

  const handleActionClick = (actionId) => {
    if (!ready) return
    setTagState((prev) => setSelectedAction(prev, actionId))
  }

  const handleCloseZones = () => {
    setTagState((prev) => clearPendingTag(prev))
  }

  const handleZoneClick = (zoneNumber) => {
    if (!ready || !tagState.selectedActionId) return

    const nextState = setSelectedZone(tagState, zoneNumber)
    const liveSession = buildSessionFromSelection({
      session,
      selection,
      selectedTeamId,
    })

    const event = buildLiveEvent({
      ...liveSession,
      subjectType: selection.subjectType,
      playerId: selection.subjectType === 'player' ? selection.playerId : null,
      actionId: nextState.selectedActionId,
      zoneNumber,
      clock: getClockSnapshot(clock),
    })

    setEvents((prev) => [event, ...prev])
    setTagState((prev) => clearPendingTag(prev))
  }

  return (
    <Sheet sx={sx.panel}>
      {error && (
        <Box sx={sx.dataErrorBox}>
          <Typography level="body-sm" color="danger">
            שגיאה בטעינת הדאטה
          </Typography>
        </Box>
      )}

      <LiveObjectGameSelector
        selection={selection}
        players={players}
        teams={teams}
        games={games}
        clubs={clubs}
        clubId={resolvedClubId}
        disabled={loading || Boolean(error)}
        onSubjectTypeChange={(value) => {
          setSelection((prev) => setSelectionSubjectType(prev, value))
          setTagState((prev) => clearPendingTag(prev))
        }}
        onPlayerChange={(value) => {
          setSelection((prev) => setSelectionPlayerId(prev, value))
          setTagState((prev) => clearPendingTag(prev))
        }}
        onTeamChange={(value) => {
          setSelection((prev) => setSelectionTeamId(prev, value))
          setTagState((prev) => clearPendingTag(prev))
        }}
        onGameChange={(value) => {
          setSelection((prev) => setSelectionGameId(prev, value))
          setTagState((prev) => clearPendingTag(prev))
        }}
      />

      <LiveClockBar
        model={headerModel}
        disabled={!ready}
        onToggle={handleToggleClock}
        onReset={handleResetClock}
        onSetTime={handleSetClockTime}
        onToggleSpeed={handleToggleSpeed}
      />

      <LiveActionsGrid
        actions={visibleActions}
        disabled={!ready}
        selectedActionId={tagState.selectedActionId}
        onActionClick={handleActionClick}
        onOpenSettings={() => setActionsSettingsOpen(true)}
      />

      <LiveEventsList
        events={eventsModel}
        onDeleteLast={() => setEvents((prev) => prev.slice(1))}
      />

      <LiveZonesDrawer
        open={ready && Boolean(selectedAction)}
        action={selectedAction}
        onClose={handleCloseZones}
        onZoneClick={handleZoneClick}
      />

      <LiveActionsSettingsDrawer
        open={actionsSettingsOpen}
        selectedActionPairIds={actionsState.selectedActionPairIds}
        onClose={() => setActionsSettingsOpen(false)}
        onToggleAction={(actionId) => {
          setActionsState((prev) => toggleLiveActionPair(prev, actionId))
        }}
        onResetActions={() => {
          setActionsState((prev) => resetLiveActionPairs(prev))
        }}
      />
    </Sheet>
  )
}
