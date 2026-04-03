// src/features/hub/hooks/players/usePlayerHubUpdate.js

import { useMemo } from 'react'
import { useUpdateAction } from '../../../../ui/domains/entityActions/updateAction.js'

function isPrivatePlayer(player = {}) {
  return player?.playerSource === 'private' || player?.isPrivatePlayer === true
}

function buildPlayerName(player = {}) {
  return (
    [player?.playerFirstName, player?.playerLastName].filter(Boolean).join(' ') ||
    player?.fullName ||
    player?.name ||
    'שחקן'
  )
}

export function usePlayerHubUpdate(active) {
  const activeId = active?.id || null
  const activeName = useMemo(() => buildPlayerName(active), [active])
  const activeIsPrivate = useMemo(() => isPrivatePlayer(active), [active])

  const regularPlayerUpdate = useUpdateAction({
    routerEntityType: 'players',
    snackEntityType: 'player',
    id: activeId,
    entityName: activeName,
    requireAnyUpdated: true,
  })

  const privatePlayerUpdate = useUpdateAction({
    routerEntityType: 'privates',
    snackEntityType: 'player',
    id: activeId,
    entityName: activeName,
    requireAnyUpdated: true,
  })

  const run = (patch = {}, meta = {}) => {
    const targetPlayer = meta?.player || active || null
    const targetId = meta?.playerId || meta?.id || targetPlayer?.id || activeId || null

    const targetIsPrivate =
      meta?.routerEntityType === 'privates' ||
      meta?.forcePrivate === true ||
      isPrivatePlayer(targetPlayer) ||
      (!targetPlayer && activeIsPrivate)

    const updateApi = targetIsPrivate ? privatePlayerUpdate : regularPlayerUpdate
    const routerEntityType = targetIsPrivate ? 'privates' : 'players'

    return updateApi.runUpdate(patch, {
      ...meta,
      id: targetId,
      playerId: targetId,
      routerEntityType,
      createIfMissing: meta?.createIfMissing ?? false,
    })
  }

  return {
    run,
    pending: regularPlayerUpdate.pending || privatePlayerUpdate.pending,
    isPrivateRoute: activeIsPrivate,
  }
}
