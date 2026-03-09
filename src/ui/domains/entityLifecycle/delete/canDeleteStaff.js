import { debugLog } from '../../../../services/firestore/shorts/shortsDebug.utils.js'
import { SHORTS_DEBUG } from '../../../../services/firestore/shorts/shortsDebug.config.js'

export async function canDeleteStaff({ staffId, entityName }) {
  const policy = { canDelete: true, reason: null }

  if (SHORTS_DEBUG.enabled) {
    debugLog('CAN_DELETE:staff', { staffId, entityName, policy })
  }

  return policy
}
