// src/application/shared/actionDebug.js

import { SHORTS_DEBUG } from '../../services/firestore/shorts/shortsDebug.config.js'
import { debugLog } from '../../services/firestore/shorts/shortsDebug.utils.js'

export const getActionDebugMode = () => (
  SHORTS_DEBUG && SHORTS_DEBUG.dryRun ? 'DRY_RUN' : 'WRITE'
)

export const isActionDebugEnabled = () => Boolean(
  SHORTS_DEBUG && SHORTS_DEBUG.enabled
)

export const shouldLogActionPayload = () => Boolean(
  SHORTS_DEBUG && SHORTS_DEBUG.logPayload
)

export const logActionDebug = (eventName, payload) => {
  debugLog(eventName, payload)
}
