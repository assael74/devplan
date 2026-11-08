// src/features/hub/hooks/games/useGameStatsHubDrafts.js

import React from 'react'
import { useAuth } from '../../../../application/auth/AuthProvider.js'
import {
  getGameStatsDraftsKey,
  readGameStatsDrafts,
  writeGameStatsDrafts,
} from './gameStatsDrafts.storage.js'

const getGameId = game => {
  return game?.id || game?.gameId || game?.game?.id || game?.game?.gameId || ''
}

function buildDraftState(key) {
  const items = readGameStatsDrafts(key)

  return {
    key,
    items,
    payloads: Object.fromEntries(Object.entries(items).map(([id, item]) => [id, item.payload])),
  }
}

export const useGameStatsHubDrafts = profileKey => {
  const { user } = useAuth()
  const key = getGameStatsDraftsKey(user?.uid, profileKey)
  const initialState = React.useMemo(() => buildDraftState(key), [key])
  const [state, setState] = React.useState(initialState)
  const current = state.key === key ? state : initialState
  const stateRef = React.useRef(current)
  stateRef.current = current

  const [editing, setEditing] = React.useState(null)
  const [draftError, setDraftError] = React.useState(null)
  const activeEditing = editing?.key === key ? editing : null
  const editingStatsGame = activeEditing?.game || null
  const activeStatsGameId = getGameId(editingStatsGame)
  const statsFormDraftsByGameId = Object.fromEntries(
    Object.entries(current.items).map(([id, item]) => [id, item.draft])
  )
  const activeStatsFormDraft = activeEditing?.loadedDraft ||
    statsFormDraftsByGameId[activeStatsGameId] || null

  const updateState = React.useCallback((next, persist = false) => {
    try {
      if (persist) writeGameStatsDrafts(key, next.items)
      setDraftError(null)
      stateRef.current = next
      setState(next)
    } catch (error) {
      setDraftError(new Error('לא ניתן לעדכן את הטיוטה בדפדפן. הטופס נשאר פתוח.'))
      throw error
    }
  }, [key])

  const openStatsGame = React.useCallback((game, loadedDraft = null) => {
    setDraftError(null)
    setEditing({ key, game, loadedDraft })
  }, [key])

  const closeStatsForm = React.useCallback(() => {
    setEditing(null)
    setDraftError(null)
  }, [])

  const saveStatsDraft = React.useCallback(saveModel => {
    const { payload, draft } = saveModel || {}
    const gameId = payload?.gameId || draft?.gameId || ''
    if (!gameId || !payload || !draft) return

    const previous = stateRef.current
    updateState({
      ...previous,
      items: { ...previous.items, [gameId]: { payload, draft } },
      payloads: { ...previous.payloads, [gameId]: payload },
    }, true)
    setEditing(null)
  }, [updateState])

  const saveStatsPayload = React.useCallback(payload => {
    const gameId = payload?.gameId
    if (!gameId) return

    const previous = stateRef.current
    updateState({ ...previous, payloads: { ...previous.payloads, [gameId]: payload } })
  }, [updateState])

  const clearStatsDraft = React.useCallback(gameId => {
    const previous = stateRef.current
    if (!gameId || !previous.items[gameId]) return

    const items = { ...previous.items }
    delete items[gameId]
    updateState({ ...previous, items }, true)
  }, [updateState])

  const completeStatsFirestoreSave = React.useCallback(saveModel => {
    const payload = saveModel?.payload
    if (!payload?.gameId) return

    clearStatsDraft(payload.gameId)
    saveStatsPayload(payload)
    setEditing(null)
  }, [saveStatsPayload, clearStatsDraft])

  const deleteStatsDraft = React.useCallback(gameId => {
    if (!gameId) return

    const previous = stateRef.current
    const items = { ...previous.items }
    const payloads = { ...previous.payloads }
    delete items[gameId]
    delete payloads[gameId]
    updateState({ ...previous, items, payloads }, Boolean(previous.items[gameId]))
    setEditing(null)
  }, [updateState])

  return {
    editingStatsGame,
    activeStatsFormDraft,
    statsFormDraftsByGameId,
    statsPayloadsByGameId: current.payloads,
    draftError,
    openStatsGame,
    closeStatsForm,
    saveStatsDraft,
    saveStatsPayload,
    clearStatsDraft,
    completeStatsFirestoreSave,
    deleteStatsDraft,
  }
}
