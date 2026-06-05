// src/features/liveTagging/hooks/useLiveTaggingPanelModel.js

import React from 'react'

import {
  buildInitialSelection,
  buildLiveTaggingStatsSaveModel,
  canUseLiveTagging,
  clearPendingTag,
  getSelectedGame,
  hasGameStatsPointer,
  resolveSelectionTeamId,
  setSelectionGameId,
  setSelectionPlayerId,
  setSelectionSubjectType,
  setSelectionTeamId,
} from '../logic/index.js'

import { useCoreData } from '../../coreData/CoreDataProvider.js'
import { useGameStatsHubUpdate } from '../../hub/hooks/games/useGameStatsHubUpdate.js'

import { useLiveActionsModel } from './useLiveActionsModel.js'
import { useLiveClockModel } from './useLiveClockModel.js'
import { useLiveEventsModel } from './useLiveEventsModel.js'
import { useLiveTaggingDrafts } from './useLiveTaggingDrafts.js'

const DEMO_SESSION = {
  sessionId: 'demo_session',
}

const getCoreList = value => {
  return Array.isArray(value) ? value : []
}

const getErrorText = error => {
  if (!error) return ''
  if (typeof error === 'string') return error

  return error.message || 'שגיאה בשמירת Live Tagging'
}

export function useLiveTaggingPanelModel({ clubId = '', session = DEMO_SESSION } = {}) {
  const {
    players: corePlayers,
    teams: coreTeams,
    games: coreGames,
    clubs: coreClubs,
    loading,
    error,
  } = useCoreData()

  const {
    runCreate,
    runPrivatePlayerSave,
    runTeamOnlyCreate,
    pending,
    error: saveError,
  } = useGameStatsHubUpdate()

  const players = getCoreList(corePlayers)
  const teams = getCoreList(coreTeams)
  const games = getCoreList(coreGames)
  const clubs = getCoreList(coreClubs)

  const [selection, setSelection] = React.useState(() => buildInitialSelection())
  const [localSaveError, setLocalSaveError] = React.useState('')
  const [saveSuccessText, setSaveSuccessText] = React.useState('')

  const selectedTeamId = resolveSelectionTeamId({ selection, players })
  const selectedGame = getSelectedGame(games, selection.gameId)
  const hasExistingStats = hasGameStatsPointer(selectedGame)

  const ready =
    canUseLiveTagging(selection, players) &&
    !loading &&
    !error &&
    !hasExistingStats &&
    !pending

  const resolvedClubId =
    clubId ||
    teams.find(team => team.id === selectedTeamId)?.clubId ||
    ''

  const saveBlockedMessage = hasExistingStats
    ? 'למשחק הזה כבר קיימת סטטיסטיקה רשמית. Live Tagging יוצר סשן חדש בלבד ולא עורך נתונים קיימים.'
    : ''

  const visibleSaveError = localSaveError || getErrorText(saveError)

  const clearSaveMessages = React.useCallback(() => {
    setLocalSaveError('')
    setSaveSuccessText('')
  }, [])

  const {
    clock,
    setClock,
    headerModel,

    resetClockForSession,

    handleToggleClock,
    handleResetClock,
    handleSetClockTime,
    handleToggleSpeed,
  } = useLiveClockModel({ ready })

  const {
    tagState,
    setTagState,
    actionsState,
    setActionsState,
    actionsSettingsOpen,

    visibleActions,
    selectedAction,
    selectedBaseAction,
    selectedBaseActionId,

    tagFlowStep,
    tagFlowOpen,

    clearPendingAction,

    handleBaseActionClick,
    handleQualityClick,
    handleBackToQuality,
    handleCloseTaggingFlow,

    handleOpenActionsSettings,
    handleCloseActionsSettings,
    handleToggleActionPair,
    handleResetActionPairs,
  } = useLiveActionsModel({
    ready,
    clearSaveMessages,
  })

  const {
    events,
    setEvents,
    eventsModel,
    hasEvents,

    resetCurrentSession,

    handleZoneClick,
    handleDeleteLastEvent,
    handleCancelSession,
  } = useLiveEventsModel({
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
  })

  const {
    draftsByKey,
    currentDraftKey,
    currentDraft,
    hasCurrentDraft,

    deleteCurrentDraft,

    handleSaveDraft,
    handleLoadDraft,
    handleDeleteDraft,
  } = useLiveTaggingDrafts({
    session,
    selection,
    setSelection,
    selectedTeamId,
    events,
    setEvents,
    clock,
    setClock,
    tagState,
    setTagState,
    actionsState,
    setActionsState,
    hasEvents,
    clearSaveMessages,
    setLocalSaveError,
    setSaveSuccessText,
    resetCurrentSession,
  })

  const clearSelectionPendingState = React.useCallback(() => {
    clearPendingAction()
    clearSaveMessages()
  }, [clearPendingAction, clearSaveMessages])

  const handleSubjectTypeChange = React.useCallback(value => {
    setSelection(prev => setSelectionSubjectType(prev, value))
    clearSelectionPendingState()
  }, [clearSelectionPendingState])

  const handlePlayerChange = React.useCallback(value => {
    setSelection(prev => setSelectionPlayerId(prev, value))
    clearSelectionPendingState()
  }, [clearSelectionPendingState])

  const handleTeamChange = React.useCallback(value => {
    setSelection(prev => setSelectionTeamId(prev, value))
    clearSelectionPendingState()
  }, [clearSelectionPendingState])

  const handleGameChange = React.useCallback(value => {
    setSelection(prev => setSelectionGameId(prev, value))
    clearSelectionPendingState()
  }, [clearSelectionPendingState])

  const handleClearLiveWork = React.useCallback(() => {
    clearSaveMessages()

    if (hasCurrentDraft) {
      handleDeleteDraft()
      return
    }

    if (hasEvents) {
      handleCancelSession()
    }
  }, [
    clearSaveMessages,
    hasCurrentDraft,
    handleDeleteDraft,
    hasEvents,
    handleCancelSession,
  ])

  const handleFinishSession = React.useCallback(async () => {
    clearSaveMessages()

    const saveModel = buildLiveTaggingStatsSaveModel({
      events,
      selection,
      players,
      games,
      sessionId: session.sessionId,
    })

    if (!saveModel.ok) {
      setLocalSaveError(saveModel.error)
      return
    }

    try {
      if (saveModel.route === 'privatePlayerSave') {
        await runPrivatePlayerSave(saveModel.payload)
      } else if (saveModel.route === 'teamOnlyCreate') {
        await runTeamOnlyCreate(saveModel.payload)
      } else {
        await runCreate(saveModel.payload)
      }

      deleteCurrentDraft()
      resetCurrentSession()
      setTagState(prev => clearPendingTag(prev))
      setSaveSuccessText('ה־Live Tagging נשמר כסטטיסטיקה רשמית והטיוטה המקומית נוקתה')
    } catch (err) {
      setLocalSaveError(getErrorText(err))
    }
  }, [
    clearSaveMessages,
    events,
    selection,
    players,
    games,
    session,
    runPrivatePlayerSave,
    runTeamOnlyCreate,
    runCreate,
    deleteCurrentDraft,
    resetCurrentSession,
    setTagState,
  ])

  return {
    players,
    teams,
    games,
    clubs,

    loading,
    error,
    pending,
    saveError,

    clock,
    events,
    selection,
    tagState,
    actionsState,
    actionsSettingsOpen,

    selectedTeamId,
    selectedGame,
    selectedAction,
    selectedBaseAction,
    selectedBaseActionId,

    tagFlowStep,
    tagFlowOpen,

    hasExistingStats,
    hasEvents,
    ready,

    currentDraftKey,
    currentDraft,
    draftsByKey,
    hasCurrentDraft,

    resolvedClubId,
    visibleActions,
    headerModel,
    eventsModel,

    saveBlockedMessage,
    visibleSaveError,
    saveSuccessText,

    selectionDisabled: loading || Boolean(error) || pending,

    handleToggleClock,
    handleResetClock,
    handleSetClockTime,
    handleToggleSpeed,

    handleSubjectTypeChange,
    handlePlayerChange,
    handleTeamChange,
    handleGameChange,

    handleBaseActionClick,
    handleQualityClick,
    handleBackToQuality,
    handleCloseTaggingFlow,

    handleZoneClick,
    handleDeleteLastEvent,
    handleCancelSession,

    handleSaveDraft,
    handleLoadDraft,
    handleDeleteDraft,
    handleClearLiveWork,
    handleFinishSession,

    handleOpenActionsSettings,
    handleCloseActionsSettings,
    handleToggleActionPair,
    handleResetActionPairs,
  }
}
