// src/services/firestore/shorts/shortsDebug.utils.js
import { SHORTS_DEBUG } from './shortsDebug.config.js'
import { shortsSchema } from './shorts.schema.js'

export const getSchema = (shortKey) => shortsSchema?.[shortKey] || null

export const validateRequired = (shortKey, item) => {
  const schema = getSchema(shortKey)
  if (!schema?.required?.length) return

  const missing = schema.required.filter(
    (k) => item?.[k] === undefined || item?.[k] === null || item?.[k] === ''
  )

  if (missing.length) {
    throw new Error(
      `[shortsSchema] Missing required fields for "${shortKey}": ${missing.join(', ')}`
    )
  }
}

export const debugLog = (label, payload) => {
  if (!SHORTS_DEBUG.enabled) return
  console.groupCollapsed(`🟡 ShortsDebug | ${label}`)
  console.log(payload)
  console.groupEnd()
}

export const logListSize = (label, listSize) => {
  if (!SHORTS_DEBUG.enabled || !SHORTS_DEBUG.logListSize) return
  debugLog(label, { listSize })
}

export const logObjects = (label, list) => {
  if (!SHORTS_DEBUG.enabled || !SHORTS_DEBUG.logObjects) return

  if (!Array.isArray(list)) {
    console.warn(`[ShortsDebug] ${label} – value is not an array`, list)
    return
  }

  console.groupCollapsed(`🟡 ShortsDebug | ${label} (items: ${list.length})`)
  list.forEach((item, idx) => console.log(`[${idx}]`, item))
  console.groupEnd()
}
