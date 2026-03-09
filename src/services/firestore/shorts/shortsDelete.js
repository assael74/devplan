// src/services/firestore/shorts/shortsDelete.js
import { doc, runTransaction } from 'firebase/firestore'
import { db } from '../../firebase/firebase.js'

import { shortsRefs } from './shorts.refs.js'
import { debugLog } from './shortsDebug.utils.js'
import { SHORTS_DEBUG } from './shortsDebug.config.js'

const ERR = {
  noShortKey: '[shortsDelete] shortKey is required',
  noShortKeys: '[shortsDelete] shortKeys is required',
  noId: '[shortsDelete] id is required',
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

const resolveRefMeta = (shortKey) => {
  const [group, docName] = String(shortKey || '').split('.')
  const meta = shortsRefs[group][docName]
  if (!meta?.collection || !meta?.docId) throw new Error(`[shortsDelete] Unknown shortKey "${shortKey}"`)
  return meta
}

const buildDocRef = (meta) => doc(db, meta.collection, meta.docId)

const normalizeList = (data) => (Array.isArray(data?.list) ? data.list : [])

const planDelete = (list, id) => {
  const before = list.length
  const nextList = list.filter((x) => x?.id !== id)
  const removed = before - nextList.length
  return { nextList, removed, before, after: nextList.length }
}

const logStart = (tag, payload) => {
  debugLog(tag, { ...payload, mode: SHORTS_DEBUG.dryRun ? 'DRY_RUN' : 'WRITE' })
}

export async function deleteShortItemsById({
  shortKeys,
  id,
  requireAnyFound = true,
  requireAllFound = false,
}) {
  ensureShortKeys(shortKeys)
  ensureId(id)

  const metas = shortKeys.map(resolveRefMeta)
  const refs = metas.map(buildDocRef)

  logStart('DELETE_MANY:start', {
    id,
    count: shortKeys.length,
    docs: shortKeys.map((k, i) => ({
      shortKey: k,
      docPath: `${metas[i].collection}/${metas[i].docId}`,
    })),
  })

  const res = await runTransaction(db, async (tx) => {
    // 1) READ + PLAN (no writes here)
    const plans = []
    let foundDocs = 0
    let totalRemoved = 0

    for (let i = 0; i < refs.length; i++) {
      const ref = refs[i]
      const shortKey = shortKeys[i]
      const meta = metas[i]

      const snap = await tx.get(ref)
      const data = snap.exists() ? snap.data() : {}
      const list = normalizeList(data)

      const { nextList, removed, before, after } = planDelete(list, id)

      if (removed > 0) foundDocs += 1
      totalRemoved += removed

      plans.push({ ref, data, nextList, shortKey, removed })

      debugLog('DELETE_MANY:plan', {
        shortKey,
        docPath: `${meta.collection}/${meta.docId}`,
        before,
        after,
        removed,
      })
    }

    // 2) VALIDATION (decision gate)
    if (requireAllFound && foundDocs !== shortKeys.length) {
      throw new Error(
        `[shortsDelete] id=${id} not found in all lists (found in ${foundDocs}/${shortKeys.length})`
      )
    }
    if (requireAnyFound && foundDocs === 0) {
      throw new Error(`[shortsDelete] id=${id} not found in any list`)
    }

    // 3) WRITE (after all reads)
    if (SHORTS_DEBUG.dryRun) {
      debugLog('DELETE_MANY:dry-run', { id, foundDocs, totalRemoved })
      return { id, foundDocs, totalRemoved, dryRun: true }
    }

    for (const p of plans) {
      if (p.removed > 0) {
        tx.set(p.ref, { ...p.data, list: p.nextList }, { merge: true })
        debugLog('DELETE_MANY:write', { shortKey: p.shortKey, removed: p.removed })
      }
    }

    return { id, foundDocs, totalRemoved, dryRun: false }
  })

  debugLog('DELETE_MANY:commit:done', res)
  return res
}

export async function deleteShortItemById({ shortKey, id, requireFound = false }) {
  ensureShortKey(shortKey)
  ensureId(id)

  const res = await deleteShortItemsById({
    shortKeys: [shortKey],
    id,
    requireAnyFound: requireFound,
    requireAllFound: false,
  })

  return {
    shortKey,
    id,
    removed: res.totalRemoved,
    dryRun: res.dryRun,
  }
}
