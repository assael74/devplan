import { debugLog } from '../../../../services/firestore/shorts/shortsDebug.utils.js'
import { SHORTS_DEBUG } from '../../../../services/firestore/shorts/shortsDebug.config.js'

export async function canDeleteClub({ clubId, entityName }) {
  // TODO: להוסיף בדיקות תלויות אמיתיות (teams.clubId / players.clubId וכו')
  const policy = { canDelete: true, reason: null }

  if (SHORTS_DEBUG.enabled) {
    debugLog('CAN_DELETE:club', { clubId, entityName, policy })
  }

  return policy
}
