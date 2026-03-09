// src/features/hub/hooks/usePlayerHubUpdate.js

import { useUpdateAction } from '../../../ui/domains/entityActions/updateAction.js'

export function usePlayerHubUpdate(active) {
  const playerUpdate = useUpdateAction({
    routerEntityType: 'players',
    snackEntityType: 'player',
    id: active?.id,
    entityName:
      [active?.playerFirstName, active?.playerLastName].filter(Boolean).join(' ') ||
      active?.fullName ||
      active?.name ||
      'שחקן',
    requireAnyUpdated: true,
  })

  const run = (type, patch, meta) => {
    const update = playerUpdate
    const playerId = meta?.playerId || active?.id

    return update.runUpdate(patch, {
      ...meta,
      id: playerId,
      playerId,
      createIfMissing: false,
    })
  }

  return { run, pending: playerUpdate.pending }
}
