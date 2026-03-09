// src/ui/entityLifecycle/delete/canDeleteEntity.js
import { canDeletePlayer } from './canDeletePlayer.js'
import { canDeleteTeam } from './canDeleteTeam.js'
import { canDeleteClub } from './canDeleteClub.js'
import { canDeleteStaff } from './canDeleteStaff.js'

export async function canDeleteEntity({ entityType, id, entityName, shorts }) {
  console.log('[canDeleteEntity]', {
    entityType,
    id,
    entityName,
    hasShorts: !!shorts,
    shortsKeys: shorts ? Object.keys(shorts) : null,
  })
  if (entityType === 'player') {
    return canDeletePlayer({ playerId: id, entityName, shorts })
  }

  if (entityType === 'team') {
    return canDeleteTeam({ teamId: id, entityName, shorts })
  }

  if (entityType === 'club') {
    return canDeleteClub({ clubId: id, entityName, shorts })
  }

  if (entityType === 'role') return { canDelete: true, reason: null }

  return { canDelete: true, reason: null }
}
