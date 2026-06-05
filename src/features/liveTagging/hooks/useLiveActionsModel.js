// src/features/liveTagging/hooks/useLiveActionsModel.js

import React from 'react'

import {
  buildInitialLiveActionsState,
  buildInitialTaggingState,
  buildSelectedLiveActionPairs,
  clearPendingTag,
  getSelectedAction,
  resetLiveActionPairs,
  toggleLiveActionPair,
} from '../logic/index.js'

const buildActionId = ({ baseActionId, side }) => {
  if (!baseActionId || !side) return ''

  return `${baseActionId}_${side}`
}

const closeTaggingFlow = prev => clearPendingTag({
  ...prev,
  selectedBaseActionId: '',
  selectedSide: '',
  flowStep: 'closed',
})

export function useLiveActionsModel({ ready, clearSaveMessages }) {
  const [tagState, setTagState] = React.useState(() => ({
    ...buildInitialTaggingState(),
    selectedBaseActionId: '',
    selectedSide: '',
    flowStep: 'closed',
  }))

  const [actionsState, setActionsState] = React.useState(() => {
    return buildInitialLiveActionsState()
  })

  const [actionsSettingsOpen, setActionsSettingsOpen] = React.useState(false)

  const visibleActions = buildSelectedLiveActionPairs(actionsState)

  const selectedBaseAction = visibleActions.find(action => {
    return action.id === tagState.selectedBaseActionId
  }) || null

  const selectedAction = getSelectedAction(tagState.selectedActionId)

  const tagFlowStep = tagState.flowStep || 'closed'
  const tagFlowOpen = tagFlowStep !== 'closed' && Boolean(selectedBaseAction)

  const clearPendingAction = React.useCallback(() => {
    setTagState(prev => closeTaggingFlow(prev))
  }, [])

  const handleBaseActionClick = React.useCallback(actionId => {
    if (!ready) return

    setTagState(prev => ({
      ...prev,
      selectedBaseActionId: actionId,
      selectedSide: '',
      selectedActionId: '',
      selectedZoneNumber: null,
      flowStep: 'quality',
    }))

    clearSaveMessages()
  }, [ready, clearSaveMessages])

  const handleQualityClick = React.useCallback(side => {
    if (!ready || !tagState.selectedBaseActionId) return

    const selectedActionId = buildActionId({
      baseActionId: tagState.selectedBaseActionId,
      side,
    })

    setTagState(prev => ({
      ...prev,
      selectedSide: side,
      selectedActionId,
      selectedZoneNumber: null,
      flowStep: 'zone',
    }))

    clearSaveMessages()
  }, [ready, tagState.selectedBaseActionId, clearSaveMessages])

  const handleBackToQuality = React.useCallback(() => {
    setTagState(prev => ({
      ...prev,
      selectedSide: '',
      selectedActionId: '',
      selectedZoneNumber: null,
      flowStep: 'quality',
    }))
  }, [])

  const handleCloseTaggingFlow = React.useCallback(() => {
    clearPendingAction()
  }, [clearPendingAction])

  const handleOpenActionsSettings = React.useCallback(() => {
    setActionsSettingsOpen(true)
  }, [])

  const handleCloseActionsSettings = React.useCallback(() => {
    setActionsSettingsOpen(false)
  }, [])

  const handleToggleActionPair = React.useCallback(actionId => {
    setActionsState(prev => toggleLiveActionPair(prev, actionId))
  }, [])

  const handleResetActionPairs = React.useCallback(() => {
    setActionsState(prev => resetLiveActionPairs(prev))
  }, [])

  return {
    tagState,
    setTagState,
    actionsState,
    setActionsState,
    actionsSettingsOpen,

    visibleActions,
    selectedAction,
    selectedBaseAction,
    selectedBaseActionId: tagState.selectedBaseActionId,

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
  }
}
