// src/features/hub/hooks/games/useGameHubUpdate.js

import { useUpdateAction } from '../../../../ui/domains/entityActions/updateAction.js'

function isExternalGame(game = {}) {
  return game?.gameSource === 'external' || game?.isExternalGame === true
}

function buildGameName(game = {}) {
  return (
    [game?.rivel || game?.rival || game?.rivalName || game?.opponent, game?.gameDate]
      .filter(Boolean)
      .join(' ') ||
    game?.name ||
    'משחק'
  )
}

export function useGameHubUpdate(active) {
  const regularGameUpdate = useUpdateAction({
    routerEntityType: 'games',
    snackEntityType: 'game',
    id: active?.id,
    entityName: buildGameName(active),
    requireAnyUpdated: true,
  })

  const externalGameUpdate = useUpdateAction({
    routerEntityType: 'externalGames',
    snackEntityType: 'game',
    id: active?.id,
    entityName: buildGameName(active),
    requireAnyUpdated: true,
  })

  const run = (type, patch, meta) => {
    const baseGame = meta?.game || active || {}
    const externalMode =
      meta?.routerEntityType === 'externalGames' ||
      meta?.gameSource === 'external' ||
      meta?.isExternalGame === true ||
      isExternalGame(baseGame)

    const update = externalMode ? externalGameUpdate : regularGameUpdate
    const gameId = meta?.gameId || active?.id

    return update.runUpdate(patch, {
      ...meta,
      id: gameId,
      gameId,
      createIfMissing: meta?.createIfMissing ?? false,
    })
  }

  return {
    run,
    pending: regularGameUpdate.pending || externalGameUpdate.pending,
  }
}
