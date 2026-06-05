// src/features/hub/teamProfile/sharedModules/games/model/useTeamGamesStatsActions.js

import { useMemo } from 'react'

import {
  createGameStatsDraftFromDoc,
} from '../../../../../../ui/forms/gameStatsForm/logic/index.js'

import {
  getGameStatsDoc,
} from '../../../../../../services/firestore/shorts/gameStats/index.js'

import {
  useGameStatsHubDrafts,
  useGameStatsHubUpdate,
} from '../../../../hooks/games'

import {
  getCreatedStatsDocId,
  getGameId,
  getGameStatsDocId,
  isLocalDraftSave,
  mergeStatsDocId,
} from '../teamGamesStats.helpers.js'

function getLocalDraft({ gameId, statsPayloadsByGameId }) {
  if (!gameId) return null

  return statsPayloadsByGameId[gameId] || null
}

function resolveFirestoreDocId({ editingStatsGame, activeStatsFormDraft }) {
  const fromGame = getGameStatsDocId(editingStatsGame)

  if (fromGame) return fromGame
  if (!activeStatsFormDraft) return ''

  return activeStatsFormDraft.gameStatsDocId ||
    activeStatsFormDraft.statsDocId ||
    ''
}

function buildStatsDeleteAction({
  editingStatsGame,
  activeStatsFormDraft,
  statsPayloadsByGameId,
}) {
  const gameId = getGameId(editingStatsGame)

  const localDraft = getLocalDraft({
    gameId,
    statsPayloadsByGameId,
  })

  if (isLocalDraftSave(localDraft)) {
    return {
      type: 'localDraft',
      label: 'מחיקת טיוטה',
      color: 'danger',
      disabled: false,
    }
  }

  const firestoreDocId = resolveFirestoreDocId({
    editingStatsGame,
    activeStatsFormDraft,
  })

  if (firestoreDocId) {
    return {
      type: 'firestoreStats',
      label: 'מחיקת טופס סטטיסטיקה',
      color: 'danger',
      disabled: false,
    }
  }

  return null
}

function resolveDeleteGameStatsDocId({ targetGame, draft }) {
  const fromGame = getGameStatsDocId(targetGame)

  if (fromGame) return fromGame
  if (!draft) return ''

  return draft.gameStatsDocId || draft.statsDocId || ''
}

function resolveDeleteTeamId({ liveTeam, draft, targetGame }) {
  if (liveTeam && liveTeam.id) return liveTeam.id
  if (draft && draft.teamId) return draft.teamId
  if (targetGame && targetGame.teamId) return targetGame.teamId

  return ''
}

function buildLoadedDraft({ game, liveTeam, statsDoc }) {
  return createGameStatsDraftFromDoc({
    game,
    team: liveTeam,
    statsDoc,
  })
}

export function useTeamGamesStatsActions({
  liveTeam,
  enableStatsForm,
  statsFormLoadingApi,
}) {
  const {
    setStatsFormLoading,
    setStatsFormLoadingText,
  } = statsFormLoadingApi

  const {
    editingStatsGame,
    activeStatsFormDraft,
    statsPayloadsByGameId,
    openStatsGame,
    closeStatsForm,
    saveStatsDraft,
    deleteStatsDraft,
    statsFormDraftsByGameId,
    completeStatsFirestoreSave,
  } = useGameStatsHubDrafts()

  const {
    runSave: saveStatsToFirestore,
    runDelete: deleteStatsFromFirestore,
    pending: statsSavePending,
    error: statsSaveError,
  } = useGameStatsHubUpdate()

  const statsDeleteAction = useMemo(() => {
    return buildStatsDeleteAction({
      editingStatsGame,
      activeStatsFormDraft,
      statsPayloadsByGameId,
    })
  }, [editingStatsGame, activeStatsFormDraft, statsPayloadsByGameId])

  const handleSaveStats = async saveModel => {
    if (!enableStatsForm) return

    const payload = saveModel && saveModel.payload
    const draft = saveModel && saveModel.draft

    if (!payload) return

    if (isLocalDraftSave(payload)) {
      saveStatsDraft({ payload, draft })
      return
    }

    const result = await saveStatsToFirestore(payload)
    const gameStatsDocId = getCreatedStatsDocId({ result, payload })

    completeStatsFirestoreSave(
      mergeStatsDocId({ payload, draft, gameStatsDocId })
    )
  }

  const handleOpenStatsGame = async game => {
    if (!enableStatsForm) return

    const gameId = getGameId(game)

    if (gameId && statsFormDraftsByGameId[gameId]) {
      openStatsGame(game)
      return
    }

    const gameStatsDocId = getGameStatsDocId(game)

    if (!gameStatsDocId) {
      openStatsGame(game)
      return
    }

    setStatsFormLoading(true)
    setStatsFormLoadingText('טוען סטטיסטיקה שמורה...')

    try {
      const statsDoc = await getGameStatsDoc({ gameStatsDocId })

      if (!statsDoc) {
        openStatsGame(game)
        return
      }

      const loadedDraft = buildLoadedDraft({
        game,
        liveTeam,
        statsDoc,
      })

      openStatsGame(game, loadedDraft)
    } catch (err) {
      console.error('[handleOpenStatsGame] failed to load stats doc', err)
      openStatsGame(game)
    } finally {
      setStatsFormLoading(false)
      setStatsFormLoadingText('')
    }
  }

  const handleDeleteStats = async ({ draft, game, statsDeleteAction } = {}) => {
    if (!enableStatsForm) return

    const targetGame = game || editingStatsGame
    const gameId = getGameId(targetGame) || (draft && draft.gameId) || ''

    if (!gameId) return
    if (!statsDeleteAction || !statsDeleteAction.type) return

    if (statsDeleteAction.type === 'localDraft') {
      deleteStatsDraft(gameId)
      return
    }

    const gameStatsDocId = resolveDeleteGameStatsDocId({
      targetGame,
      draft,
    })

    if (!gameStatsDocId) return

    await deleteStatsFromFirestore({
      gameId,
      teamId: resolveDeleteTeamId({ liveTeam, draft, targetGame }),
      gameStatsDocId,
    })

    deleteStatsDraft(gameId)
    closeStatsForm()
  }

  return {
    editingStatsGame,
    activeStatsFormDraft,
    statsPayloadsByGameId,
    statsDeleteAction,
    statsSavePending,
    statsSaveError,

    handleOpenStatsGame,
    handleSaveStats,
    handleDeleteStats,
    closeStatsForm,
    deleteStatsDraft,
  }
}
