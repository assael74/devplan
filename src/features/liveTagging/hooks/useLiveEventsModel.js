// src/features/liveTagging/hooks/useLiveEventsModel.js

import React from 'react'

import {
  buildLiveEvent,
  getClockSnapshot,
} from '../../../shared/liveTagging/index.js'

import {
  buildEventsListModel,
  clearPendingTag,
  setSelectedZone,
} from '../logic/index.js'

const buildSessionFromSelection = ({ session, selection, selectedTeamId }) => ({
  ...session,
  gameId: selection.gameId,
  teamId: selectedTeamId || '',
})

export function useLiveEventsModel({
  ready,
  session,
  selection,
  selectedTeamId,
  clock,
  tagState,
  setTagState,
  players,
  clearSaveMessages,
  resetClockForSession,
}) {
  const [events, setEvents] = React.useState([])

  const eventsModel = buildEventsListModel({ events, players })
  const hasEvents = events.length > 0

  const resetCurrentSession = React.useCallback(() => {
    setEvents([])
    resetClockForSession()
    setTagState(prev => clearPendingTag(prev))
  }, [resetClockForSession, setTagState])

  const handleZoneClick = React.useCallback(zoneNumber => {
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
      playerId: selection.playerId || null,
      actionId: nextState.selectedActionId,
      zoneNumber,
      clock: getClockSnapshot(clock),
    })

    setEvents(prev => [event, ...prev])
    clearSaveMessages()

    window.setTimeout(() => {
      setTagState(prev => clearPendingTag(prev))
    }, 180)
  }, [ready, tagState, session, selection, selectedTeamId, clock, setTagState, clearSaveMessages])

  const handleDeleteLastEvent = React.useCallback(() => {
    setEvents(prev => prev.slice(1))
    clearSaveMessages()
  }, [clearSaveMessages])

  const handleCancelSession = React.useCallback(() => {
    resetCurrentSession()
    clearSaveMessages()
  }, [resetCurrentSession, clearSaveMessages])

  return {
    events,
    setEvents,
    eventsModel,
    hasEvents,

    resetCurrentSession,

    handleZoneClick,
    handleDeleteLastEvent,
    handleCancelSession,
  }
}
