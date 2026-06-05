// src/features/hub/playerProfile/sharedModules/games/model/usePlayerGamesStatsActions.js

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
  buildPlayerStatsFormGame,
  createScopedInitialDraft,
  lockDraftToPlayer,
} from './playerGamesStatsForm.helpers.js'

import {
  buildStatsDeleteAction,
  buildStatsDeletePayload,
  getCreatedStatsDocId,
  getGameId,
  getGameStatsDocId,
  getStatsScope,
  isLocalDraftSave,
  mergeStatsDocId,
} from './playerGamesStats.helpers.js'

function getSaveModelPayload(saveModel) {
  if (!saveModel) return null

  return saveModel.payload || null
}

function getSaveModelDraft(saveModel) {
  if (!saveModel) return null

  return saveModel.draft || null
}

function resolveDeleteGameStatsDocId({
  targetGame,
  draft,
  activeStatsFormDraft,
}) {
  const fromGame = getGameStatsDocId(targetGame)

  if (fromGame) return fromGame

  if (draft && draft.gameStatsDocId) return draft.gameStatsDocId
  if (draft && draft.statsDocId) return draft.statsDocId

  if (activeStatsFormDraft && activeStatsFormDraft.gameStatsDocId) {
    return activeStatsFormDraft.gameStatsDocId
  }

  if (activeStatsFormDraft && activeStatsFormDraft.statsDocId) {
    return activeStatsFormDraft.statsDocId
  }

  return ''
}

function buildEmptyStatsFormGame({
  game,
  liveTeam,
  livePlayer,
  contextPlayers,
}) {
  return buildPlayerStatsFormGame({
    game,
    team: liveTeam,
    player: livePlayer,
    contextPlayers,
  })
}

function openInitialStatsDraft({
  game,
  liveTeam,
  livePlayer,
  contextPlayers,
  statsScope,
  openStatsGame,
}) {
  const formGame = buildEmptyStatsFormGame({
    game,
    liveTeam,
    livePlayer,
    contextPlayers,
  })

  openStatsGame(
    formGame,
    createScopedInitialDraft({
      game: formGame,
      team: liveTeam,
      player: livePlayer,
      scope: statsScope,
    })
  )
}

function openSavedDraftGame({
  game,
  liveTeam,
  livePlayer,
  contextPlayers,
  openStatsGame,
}) {
  const formGame = buildEmptyStatsFormGame({
    game,
    liveTeam,
    livePlayer,
    contextPlayers,
  })

  openStatsGame(formGame)
}

function openLoadedStatsDraft({
  game,
  liveTeam,
  livePlayer,
  contextPlayers,
  statsDoc,
  statsScope,
  openStatsGame,
}) {
  const formGame = buildPlayerStatsFormGame({
    game,
    team: liveTeam,
    player: livePlayer,
    statsDoc,
    contextPlayers,
  })

  const loadedDraft = createGameStatsDraftFromDoc({
    game: formGame,
    team: liveTeam,
    statsDoc,
  })

  openStatsGame(
    formGame,
    lockDraftToPlayer({
      draft: loadedDraft,
      player: livePlayer,
      scope: statsScope,
    })
  )
}

export function usePlayerGamesStatsActions({
  livePlayer,
  liveTeam,
  contextPlayers,
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

  const handleOpenStatsGame = async game => {
    const statsScope = getStatsScope(livePlayer)
    const gameStatsDocId = getGameStatsDocId(game)

    if (!gameStatsDocId) {
      openInitialStatsDraft({
        game,
        liveTeam,
        livePlayer,
        contextPlayers,
        statsScope,
        openStatsGame,
      })

      return
    }

    const gameId = getGameId(game)

    if (gameId && statsFormDraftsByGameId[gameId]) {
      openSavedDraftGame({
        game,
        liveTeam,
        livePlayer,
        contextPlayers,
        openStatsGame,
      })

      return
    }

    setStatsFormLoading(true)
    setStatsFormLoadingText('טוען סטטיסטיקה שמורה...')

    try {
      const statsDoc = await getGameStatsDoc({ gameStatsDocId })

      if (!statsDoc) {
        openInitialStatsDraft({
          game,
          liveTeam,
          livePlayer,
          contextPlayers,
          statsScope,
          openStatsGame,
        })

        return
      }

      openLoadedStatsDraft({
        game,
        liveTeam,
        livePlayer,
        contextPlayers,
        statsDoc,
        statsScope,
        openStatsGame,
      })
    } catch (err) {
      console.error('[handleOpenStatsGame] failed to load player stats doc', err)

      openInitialStatsDraft({
        game,
        liveTeam,
        livePlayer,
        contextPlayers,
        statsScope,
        openStatsGame,
      })
    } finally {
      setStatsFormLoading(false)
      setStatsFormLoadingText('')
    }
  }

  const handleSaveStats = async saveModel => {
    const payload = getSaveModelPayload(saveModel)
    const draft = getSaveModelDraft(saveModel)

    if (!payload) return

    if (isLocalDraftSave(payload)) {
      saveStatsDraft({ payload, draft })
      return
    }

    const result = await saveStatsToFirestore(payload)
    const gameStatsDocId = getCreatedStatsDocId({ result, payload })

    completeStatsFirestoreSave(
      mergeStatsDocId({
        payload,
        draft,
        gameStatsDocId,
      })
    )
  }

  const handleDeleteStats = async ({ draft, game, statsDeleteAction } = {}) => {
    const targetGame = game || editingStatsGame
    const gameId = getGameId(targetGame) || draft && draft.gameId || ''

    if (!gameId) return
    if (!statsDeleteAction || !statsDeleteAction.type) return

    if (statsDeleteAction.type === 'localDraft') {
      deleteStatsDraft(gameId)
      return
    }

    const gameStatsDocId = resolveDeleteGameStatsDocId({
      targetGame,
      draft,
      activeStatsFormDraft,
    })

    if (!gameStatsDocId) return

    await deleteStatsFromFirestore(
      buildStatsDeletePayload({
        gameId,
        gameStatsDocId,
        livePlayer,
        liveTeam,
        targetGame,
        draft,
        activeStatsFormDraft,
      })
    )

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
