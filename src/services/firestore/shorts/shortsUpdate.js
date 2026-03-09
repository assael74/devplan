// src/services/firestore/shorts/shortsUpdate.js
import { doc, runTransaction, Timestamp } from 'firebase/firestore'
import { db } from '../../firebase/firebase.js'

import { shortsRefs } from './shorts.refs.js'
import { validateRequired, debugLog, logObjects } from './shortsDebug.utils.js'
import { SHORTS_DEBUG } from './shortsDebug.config.js'

const ERR = {
  noShortKey: '[shortsUpdate] shortKey is required',
  noShortKeys: '[shortsUpdate] shortKeys is required',
  noId: '[shortsUpdate] id is required',
  noPatch: '[shortsUpdate] patch must be an object',
  unknownShortKey: (k) => `[shortsUpdate] Unknown shortKey "${k}"`,
}

const ensureId = (id) => {
  if (!id) throw new Error(ERR.noId)
}
const ensureShortKey = (shortKey) => {
  if (!shortKey) throw new Error(ERR.noShortKey)
}
const ensureShortKeys = (shortKeys) => {
  if (!Array.isArray(shortKeys) || shortKeys.length === 0) throw new Error(ERR.noShortKeys)
}
const ensurePatch = (patch) => {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) throw new Error(ERR.noPatch)
}

const resolveRefMeta = (shortKey) => {
  const [group, docName] = String(shortKey || '').split('.')
  const meta = shortsRefs?.[group]?.[docName]
  if (!meta?.collection || !meta?.docId) throw new Error(ERR.unknownShortKey(shortKey))
  return meta
}

const buildDocRef = (meta) => doc(db, meta.collection, meta.docId)
const normalizeList = (data) => (Array.isArray(data?.list) ? data.list : [])

const stampUpdated = (item) => {
  const now = Timestamp.now()
  const createdAt = item?.createdAt ?? now
  return { ...item, createdAt, updatedAt: now }
}

/**
 * planUpdate:
 * - replace=false => merge item-level (לא מוחק שדות קיימים שלא נשלחו)
 * - replace=true  => replace item-level (מחליף item כולו)
 */
const planUpdate = ({ list, id, patch, replace, createIfMissing, shortKey }) => {
  const idx = list.findIndex((x) => x?.id === id)

  // create
  if (idx === -1) {
    if (!createIfMissing) return { nextList: list, updated: 0, created: 0, before: list.length, after: list.length }

    const base = replace ? { ...patch, id } : { id, ...patch }
    const nextItem = stampUpdated(base)
    validateRequired(shortKey, nextItem)

    const nextList = [...list, nextItem]
    return { nextList, updated: 0, created: 1, before: list.length, after: nextList.length }
  }

  // update
  const current = list[idx] || {}
  const merged = replace ? { ...patch, id } : { ...current, ...patch, id }
  const nextItem = stampUpdated(merged)
  validateRequired(shortKey, nextItem)

  const nextList = list.slice()
  nextList[idx] = nextItem
  return { nextList, updated: 1, created: 0, before: list.length, after: nextList.length }
}

const logStart = (tag, payload) => {
  debugLog(tag, { ...payload, mode: SHORTS_DEBUG.dryRun ? 'DRY_RUN' : 'WRITE' })
}

/**
 * Core: עדכון אותו patch על כמה shortKeys (אותו payload לכל docs)
 */
export async function updateShortItemsById({
  shortKeys,
  id,
  patch,
  replace = false,
  createIfMissing = false,
  requireAnyUpdated = true,
  requireAllUpdated = false,
} = {}) {
  ensureShortKeys(shortKeys)
  ensureId(id)
  ensurePatch(patch)

  const metas = shortKeys.map(resolveRefMeta)
  const refs = metas.map(buildDocRef)

  logStart('UPDATE_MANY:start', {
    id,
    count: shortKeys.length,
    replace,
    createIfMissing,
    docs: shortKeys.map((k, i) => ({
      shortKey: k,
      docPath: `${metas[i].collection}/${metas[i].docId}`,
    })),
    patch: SHORTS_DEBUG.logPayload ? patch : '[payload hidden]',
  })

  const res = await runTransaction(db, async (tx) => {
    const plans = []
    let updatedDocs = 0
    let createdDocs = 0

    for (let i = 0; i < refs.length; i++) {
      const ref = refs[i]
      const shortKey = shortKeys[i]
      const meta = metas[i]

      const snap = await tx.get(ref)
      const data = snap.exists() ? snap.data() : {}
      const list = normalizeList(data)

      if (SHORTS_DEBUG.enabled && SHORTS_DEBUG.logObjects) logObjects(`UPDATE_MANY:list:before:${shortKey}`, list)

      const { nextList, updated, created, before, after } = planUpdate({
        list,
        id,
        patch,
        replace,
        createIfMissing,
        shortKey,
      })

      if (updated > 0) updatedDocs += 1
      if (created > 0) createdDocs += 1

      plans.push({ ref, data, nextList, shortKey, meta, updated, created })

      debugLog('UPDATE_MANY:plan', {
        shortKey,
        docPath: `${meta.collection}/${meta.docId}`,
        before,
        after,
        updated,
        created,
      })
    }

    // gates
    if (requireAllUpdated && updatedDocs !== shortKeys.length) {
      throw new Error(`[shortsUpdate] id=${id} was not updated in all docs (updated ${updatedDocs}/${shortKeys.length})`)
    }
    if (requireAnyUpdated && updatedDocs === 0 && createdDocs === 0) {
      throw new Error(`[shortsUpdate] id=${id} not found (and createIfMissing=false)`)
    }

    if (SHORTS_DEBUG.dryRun) {
      debugLog('UPDATE_MANY:dry-run', { id, updatedDocs, createdDocs })
      return { id, updatedDocs, createdDocs, dryRun: true }
    }

    for (const p of plans) {
      if (p.updated > 0 || p.created > 0) {
        tx.set(p.ref, { ...p.data, list: p.nextList }, { merge: true })
        debugLog('UPDATE_MANY:write', { shortKey: p.shortKey, updated: p.updated, created: p.created })
      }
    }

    return { id, updatedDocs, createdDocs, dryRun: false }
  })

  debugLog('UPDATE_MANY:commit:done', res)
  return res
}

/**
 * Single shortKey
 */
export async function updateShortItemById({
  shortKey,
  id,
  patch,
  replace = false,
  createIfMissing = false,
  requireUpdated = false,
} = {}) {
  ensureShortKey(shortKey)
  const res = await updateShortItemsById({
    shortKeys: [shortKey],
    id,
    patch,
    replace,
    createIfMissing,
    requireAnyUpdated: requireUpdated,
    requireAllUpdated: false,
  })

  return {
    shortKey,
    id,
    updated: res.updatedDocs,
    created: res.createdDocs,
    dryRun: res.dryRun,
  }
}

/**
 * חשוב: זה מה שה־router צריך.
 * מאפשר patch שונה לכל shortKey, אבל טרנזקציה אחת לכל המסמכים יחד.
 */
export async function updateShortItemsByIdMap({
  id,
  patchesByShortKey,
  replace = false,
  createIfMissing = false,
  requireAnyUpdated = true,
  requireAllUpdated = false,
} = {}) {
  ensureId(id)
  if (!patchesByShortKey || typeof patchesByShortKey !== 'object') {
    throw new Error('[shortsUpdate] patchesByShortKey must be an object')
  }

  const shortKeys = Object.keys(patchesByShortKey)
  ensureShortKeys(shortKeys)

  // sanity: validate each patch
  for (const k of shortKeys) ensurePatch(patchesByShortKey[k])

  const metas = shortKeys.map(resolveRefMeta)
  const refs = metas.map(buildDocRef)

  logStart('UPDATE_MAP:start', {
    id,
    count: shortKeys.length,
    replace,
    createIfMissing,
    shortKeys,
    payload: SHORTS_DEBUG.logPayload ? patchesByShortKey : '[payload hidden]',
  })

  const res = await runTransaction(db, async (tx) => {
    const plans = []
    let updatedDocs = 0
    let createdDocs = 0

    for (let i = 0; i < refs.length; i++) {
      const ref = refs[i]
      const shortKey = shortKeys[i]
      const meta = metas[i]
      const patch = patchesByShortKey[shortKey]

      const snap = await tx.get(ref)
      const data = snap.exists() ? snap.data() : {}
      const list = normalizeList(data)

      const { nextList, updated, created, before, after } = planUpdate({
        list,
        id,
        patch,
        replace,
        createIfMissing,
        shortKey,
      })

      if (updated > 0) updatedDocs += 1
      if (created > 0) createdDocs += 1

      plans.push({ ref, data, nextList, shortKey, meta, updated, created })

      debugLog('UPDATE_MAP:plan', {
        shortKey,
        docPath: `${meta.collection}/${meta.docId}`,
        before,
        after,
        updated,
        created,
      })
    }

    if (requireAllUpdated && updatedDocs !== shortKeys.length) {
      throw new Error(`[shortsUpdate] id=${id} was not updated in all docs (updated ${updatedDocs}/${shortKeys.length})`)
    }
    if (requireAnyUpdated && updatedDocs === 0 && createdDocs === 0) {
      throw new Error(`[shortsUpdate] id=${id} not found (and createIfMissing=false)`)
    }

    if (SHORTS_DEBUG.dryRun) {
      debugLog('UPDATE_MAP:dry-run', { id, updatedDocs, createdDocs })
      return { id, updatedDocs, createdDocs, dryRun: true, shortKeys }
    }

    for (const p of plans) {
      if (p.updated > 0 || p.created > 0) {
        tx.set(p.ref, { ...p.data, list: p.nextList }, { merge: true })
        debugLog('UPDATE_MAP:write', { shortKey: p.shortKey, updated: p.updated, created: p.created })
      }
    }

    return { id, updatedDocs, createdDocs, dryRun: false, shortKeys }
  })

  debugLog('UPDATE_MAP:commit:done', res)
  return res
}
