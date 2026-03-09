// src/services/firestore/shorts/shortsUpdateByRouter.js
import { shortsUpdateRouterMap } from './shortsUpdateRouter.js'
import { updateShortItemsByIdMap } from './shortsUpdate.js'
import { debugLog } from './shortsDebug.utils.js'
import { SHORTS_DEBUG } from './shortsDebug.config.js'

const ERR = {
  noEntityType: '[shortsUpdateByRouter] entityType is required',
  noId: '[shortsUpdateByRouter] id is required',
  noFieldsPatch: '[shortsUpdateByRouter] fieldsPatch must be an object',
}

const ensure = (cond, msg) => {
  if (!cond) throw new Error(msg)
}

const isPlainObject = (v) => v && typeof v === 'object' && !Array.isArray(v)

const setByPath = (obj, path, value) => {
  const parts = String(path || '').split('.').filter(Boolean)
  const root = { ...obj }
  if (parts.length === 0) return root

  let cur = root
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i]
    const next = cur[k]
    cur[k] = isPlainObject(next) ? { ...next } : {}
    cur = cur[k]
  }
  cur[parts[parts.length - 1]] = value
  return root
}

const getRoute = (entityType, fieldKey) => shortsUpdateRouterMap?.[entityType]?.[fieldKey] || null

function buildUnknownRouteError({ entityType, fieldKey, fieldsPatch }) {
  const err = new Error(`[shortsUpdateByRouter] Unknown route for entityType/fieldKey (${entityType}.${fieldKey})`)
  err.code = 'ROUTER_UNKNOWN_FIELD'
  err.meta = {
    entityType,
    fieldKey,
    patchKeys: Object.keys(fieldsPatch || {}),
    availableKeys: Object.keys(shortsUpdateRouterMap?.[entityType] || {}),
    // אם אתה רוצה להסתיר ערכים, השאר רק keys
    fieldsPatch: SHORTS_DEBUG?.logPayload ? fieldsPatch : undefined,
  }
  return err
}

export async function updateByRouterFields({
  entityType,
  id,
  fieldsPatch,
  createIfMissing = false,
  requireAnyUpdated = true,
} = {}) {
  ensure(entityType, ERR.noEntityType)
  ensure(id, ERR.noId)
  ensure(fieldsPatch && typeof fieldsPatch === 'object', ERR.noFieldsPatch)
  
  const byShortKey = new Map()
  const routesUsed = []

  for (const [fieldKey, value] of Object.entries(fieldsPatch)) {
    const route = getRoute(entityType, fieldKey)

    if (!route?.shortKey || !route?.path) {
      const err = buildUnknownRouteError({ entityType, fieldKey, fieldsPatch })

      debugLog('ROUTER_UPDATE_FIELDS:unknown_route', {
        entityType,
        fieldKey,
        patchKeys: err.meta.patchKeys,
        availableKeys: err.meta.availableKeys,
      })

      throw err
    }

    const prev = byShortKey.get(route.shortKey) || {}
    const next = setByPath(prev, route.path, value)
    byShortKey.set(route.shortKey, next)

    routesUsed.push({ fieldKey, shortKey: route.shortKey, path: route.path })
  }

  const patchesByShortKey = Object.fromEntries(byShortKey.entries())
  const shortKeys = Object.keys(patchesByShortKey)

  debugLog('ROUTER_UPDATE_FIELDS:start', {
    entityType,
    id,
    shortKeys,
    createIfMissing,
    requireAnyUpdated,
    routesUsed,
    payload: SHORTS_DEBUG?.logPayload ? patchesByShortKey : '[payload hidden]',
    mode: SHORTS_DEBUG?.dryRun ? 'DRY_RUN' : 'WRITE',
  })

  const res = await updateShortItemsByIdMap({
    id,
    patchesByShortKey,
    replace: false,
    createIfMissing,
    requireAnyUpdated,
    requireAllUpdated: false,
  })

  debugLog('ROUTER_UPDATE_FIELDS:done', { ...res, entityType, shortKeys })
  return { ...res, entityType, shortKeys, routesUsed }
}
