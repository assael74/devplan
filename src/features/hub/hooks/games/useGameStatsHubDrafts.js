// src/features/hub/hooks/games/useGameStatsHubDrafts.js

import React from 'react'

const getGameId = game => {
  return (
    game?.id ||
    game?.gameId ||
    game?.game?.id ||
    game?.game?.gameId ||
    ''
  )
}

const getSaveModelGameId = saveModel => {
  return saveModel?.payload?.gameId || saveModel?.draft?.gameId || ''
}

export const useGameStatsHubDrafts = () => {
  const [editingStatsGame, setEditingStatsGame] = React.useState(null)
  const [activeLoadedDraft, setActiveLoadedDraft] = React.useState(null)
  const [statsFormDraftsByGameId, setStatsFormDraftsByGameId] = React.useState({})
  const [statsPayloadsByGameId, setStatsPayloadsByGameId] = React.useState({})

  const activeStatsGameId = getGameId(editingStatsGame)

  const activeStatsFormDraft = activeStatsGameId
    ? activeLoadedDraft || statsFormDraftsByGameId[activeStatsGameId] || null
    : null

  const openStatsGame = React.useCallback((game, loadedDraft = null) => {
    setActiveLoadedDraft(loadedDraft || null)
    setEditingStatsGame(game || null)
  }, [])

  const closeStatsForm = React.useCallback(() => {
    setActiveLoadedDraft(null)
    setEditingStatsGame(null)
  }, [])

  const saveStatsDraft = React.useCallback(saveModel => {
    const payload = saveModel?.payload
    const draft = saveModel?.draft
    const gameId = getSaveModelGameId(saveModel)

    if (!gameId) return

    setStatsPayloadsByGameId(prev => ({
      ...prev,
      [gameId]: payload,
    }))

    setStatsFormDraftsByGameId(prev => ({
      ...prev,
      [gameId]: draft,
    }))

    setActiveLoadedDraft(null)
    setEditingStatsGame(null)
  }, [])

  const saveStatsPayload = React.useCallback(payload => {
    const gameId = payload?.gameId
    if (!gameId || !payload) return

    setStatsPayloadsByGameId(prev => ({
      ...prev,
      [gameId]: payload,
    }))
  }, [])

  const clearStatsDraft = React.useCallback(gameId => {
    if (!gameId) return

    setStatsFormDraftsByGameId(prev => {
      const next = { ...prev }
      delete next[gameId]
      return next
    })
  }, [])

  const completeStatsFirestoreSave = React.useCallback(saveModel => {
    const payload = saveModel?.payload
    const gameId = getSaveModelGameId(saveModel)

    if (!gameId || !payload) return

    saveStatsPayload(payload)
    clearStatsDraft(gameId)
    setActiveLoadedDraft(null)
    setEditingStatsGame(null)
  }, [saveStatsPayload, clearStatsDraft])

  const deleteStatsDraft = React.useCallback(gameId => {
    if (!gameId) return

    setStatsPayloadsByGameId(prev => {
      const next = { ...prev }
      delete next[gameId]
      return next
    })

    setStatsFormDraftsByGameId(prev => {
      const next = { ...prev }
      delete next[gameId]
      return next
    })

    setActiveLoadedDraft(null)
    setEditingStatsGame(null)
  }, [])

  return {
    editingStatsGame,
    activeStatsFormDraft,
    statsFormDraftsByGameId,
    statsPayloadsByGameId,

    openStatsGame,
    closeStatsForm,

    saveStatsDraft,
    saveStatsPayload,
    clearStatsDraft,
    completeStatsFirestoreSave,
    deleteStatsDraft,
  }
}
