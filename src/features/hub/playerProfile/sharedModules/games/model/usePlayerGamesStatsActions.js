// src/features/hub/playerProfile/sharedModules/games/model/usePlayerGamesStatsActions.js

import { useMemo } from 'react'

import {
  createGameStatsDraftFromDoc,
} from '../../../../../../ui/forms/gameStatsForm/logic/index.js'

import {
  buildProfileStatsDeleteAction,
  loadProfileGameStats,
  resolveStatsDocumentId,
  saveProfileGameStats,
} from '../../../../sharedProfile/logic/games/index.js'

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
    return buildProfileStatsDeleteAction({
      editingStatsGame,
      activeStatsFormDraft,
      statsPayloadsByGameId,
      getGameId,
      getGameStatsDocId,
      isLocalDraftSave,
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

    await loadProfileGameStats({
      gameStatsDocId,
      onLoadingChange: (loading, text) => {
        setStatsFormLoading(loading)
        setStatsFormLoadingText(text)
      },
      onLoaded: statsDoc => {
        openLoadedStatsDraft({
          game,
          liveTeam,
          livePlayer,
          contextPlayers,
          statsDoc,
          statsScope,
          openStatsGame,
        })
      },
      onMissing: () => {
        openInitialStatsDraft({
          game,
          liveTeam,
          livePlayer,
          contextPlayers,
          statsScope,
          openStatsGame,
        })
      },
      onError: () => {
        openInitialStatsDraft({
          game,
          liveTeam,
          livePlayer,
          contextPlayers,
          statsScope,
          openStatsGame,
        })
      },
      errorLabel: '[handleOpenStatsGame] failed to load player stats doc',
    })
  }

  const handleSaveStats = async saveModel => {
    await saveProfileGameStats({
      saveModel,
      isLocalDraftSave,
      saveStatsDraft,
      saveStatsToFirestore,
      getCreatedStatsDocId,
      mergeStatsDocId,
      completeStatsFirestoreSave,
    })
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

    const gameStatsDocId = resolveStatsDocumentId({
      game: targetGame,
      draft,
      activeDraft: activeStatsFormDraft,
      getGameStatsDocId,
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
