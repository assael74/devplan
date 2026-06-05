// src/features/liveTagging/hooks/useLiveTaggingDrafts.js

import React from 'react'

import {
  buildInitialClock,
} from '../../../shared/liveTagging/index.js'

import {
  buildInitialLiveActionsState,
  buildInitialSelection,
  buildInitialTaggingState,
} from '../logic/index.js'

const liveDraftsStore = {}

const clean = value => {
  return String(value ?? '').trim()
}

const getDraftSubjectId = selection => {
  return clean(selection?.playerId || selection?.teamId)
}

const getLiveDraftKey = selection => {
  const subjectType = clean(selection?.subjectType)
  const gameId = clean(selection?.gameId)
  const subjectId = getDraftSubjectId(selection)

  if (!subjectType || !gameId || !subjectId) return ''

  return `${subjectType}_${gameId}_${subjectId}`
}

const cloneDraftsStore = () => {
  return { ...liveDraftsStore }
}

const buildLiveDraft = ({
  key,
  session,
  selection,
  selectedTeamId,
  events,
  clock,
  tagState,
  actionsState,
}) => ({
  id: key,
  key,
  sessionId: session?.sessionId || '',
  subjectType: selection?.subjectType || '',
  playerId: selection?.playerId || '',
  teamId: selectedTeamId || selection?.teamId || '',
  gameId: selection?.gameId || '',
  selection,
  events,
  clock,
  tagState,
  actionsState,
  status: 'draft',
  updatedAt: Date.now(),
})

export function useLiveTaggingDrafts({
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
}) {
  const [draftsByKey, setDraftsByKey] = React.useState(() => cloneDraftsStore())

  const currentDraftKey = getLiveDraftKey(selection)
  const currentDraft = currentDraftKey ? draftsByKey[currentDraftKey] : null
  const hasCurrentDraft = Boolean(currentDraft)

  const syncDrafts = React.useCallback(updater => {
    const next = updater({ ...liveDraftsStore })

    Object.keys(liveDraftsStore).forEach(key => {
      delete liveDraftsStore[key]
    })

    Object.entries(next).forEach(([key, value]) => {
      liveDraftsStore[key] = value
    })

    setDraftsByKey({ ...liveDraftsStore })
  }, [])

  const deleteCurrentDraft = React.useCallback(() => {
    if (!currentDraftKey) return

    syncDrafts(prev => {
      const next = { ...prev }
      delete next[currentDraftKey]
      return next
    })
  }, [currentDraftKey, syncDrafts])

  const handleSaveDraft = React.useCallback(() => {
    clearSaveMessages()

    if (!currentDraftKey) {
      setLocalSaveError('לא ניתן לשמור טיוטה בלי בחירת אובייקט ומשחק')
      return
    }

    if (!hasEvents) {
      setLocalSaveError('אין אירועים לשמירה בטיוטה')
      return
    }

    const draft = buildLiveDraft({
      key: currentDraftKey,
      session,
      selection,
      selectedTeamId,
      events,
      clock,
      tagState,
      actionsState,
    })

    syncDrafts(prev => ({
      ...prev,
      [currentDraftKey]: draft,
    }))

    setSaveSuccessText('טיוטת Live Tagging נשמרה ב־state')
  }, [
    clearSaveMessages,
    currentDraftKey,
    hasEvents,
    session,
    selection,
    selectedTeamId,
    events,
    clock,
    tagState,
    actionsState,
    syncDrafts,
    setLocalSaveError,
    setSaveSuccessText,
  ])

  const handleLoadDraft = React.useCallback(() => {
    clearSaveMessages()

    if (!currentDraft) {
      setLocalSaveError('לא נמצאה טיוטה לבחירה הנוכחית')
      return
    }

    setSelection(currentDraft.selection || buildInitialSelection())
    setEvents(Array.isArray(currentDraft.events) ? currentDraft.events : [])
    setClock(currentDraft.clock || buildInitialClock())
    setTagState(currentDraft.tagState || buildInitialTaggingState())
    setActionsState(currentDraft.actionsState || buildInitialLiveActionsState())
    setSaveSuccessText('טיוטת Live Tagging נטענה מחדש')
  }, [
    clearSaveMessages,
    currentDraft,
    setSelection,
    setEvents,
    setClock,
    setTagState,
    setActionsState,
    setLocalSaveError,
    setSaveSuccessText,
  ])

  const handleDeleteDraft = React.useCallback(() => {
    clearSaveMessages()

    if (!currentDraftKey || !currentDraft) {
      setLocalSaveError('לא נמצאה טיוטה למחיקה')
      return
    }

    deleteCurrentDraft()
    resetCurrentSession()
    setSaveSuccessText('טיוטת Live Tagging נמחקה מה־state')
  }, [
    clearSaveMessages,
    currentDraftKey,
    currentDraft,
    deleteCurrentDraft,
    resetCurrentSession,
    setLocalSaveError,
    setSaveSuccessText,
  ])

  return {
    draftsByKey,
    currentDraftKey,
    currentDraft,
    hasCurrentDraft,

    deleteCurrentDraft,

    handleSaveDraft,
    handleLoadDraft,
    handleDeleteDraft,
  }
}
