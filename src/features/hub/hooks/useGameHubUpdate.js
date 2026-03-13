// src/features/hub/hooks/useGameHubUpdate.js

import { useUpdateAction } from '../../../ui/domains/entityActions/updateAction.js'

export function useGameHubUpdate(active) {
  const gameUpdate = useUpdateAction({
    routerEntityType: 'games',
    snackEntityType: 'game',
    id: active?.id,
    entityName:
      [active?.rivel || active?.rivalName || active?.opponent, active?.gameDate]
        .filter(Boolean)
        .join(' ') ||
      active?.name ||
      'משחק',
    requireAnyUpdated: true,
  })

  const run = (type, patch, meta) => {
    const gameId = meta?.gameId || active?.id

    return gameUpdate.runUpdate(patch, {
      ...meta,
      id: gameId,
      gameId,
      createIfMissing: meta?.createIfMissing ?? false,
    })
  }

  return { run, pending: gameUpdate.pending }
}
