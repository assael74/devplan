// src/ui/entityLifecycle/delete/canDeletePlayer.js
import { debugLog } from '../../../../services/firestore/shorts/shortsDebug.utils.js'
import { SHORTS_DEBUG } from '../../../../services/firestore/shorts/shortsDebug.config.js'

export async function canDeletePlayer({ playerId, entityName }) {
  // TODO: להוסיף בדיקות תלויות אמיתיות (payments/meetings/videos וכו')
  const policy = { canDelete: true, reason: null }

  if (SHORTS_DEBUG.enabled) {
    debugLog('CAN_DELETE:player', { playerId, entityName, policy })
  }

  return policy
}
