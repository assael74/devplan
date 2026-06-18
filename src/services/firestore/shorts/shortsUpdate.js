// src/services/firestore/shorts/shortsUpdate.js

import { doc, runTransaction, Timestamp } from 'firebase/firestore'
import { db } from '../../firebase/firebase.js'

import { shortsRefs } from './shorts.refs.js'
import { validateRequired, debugLog, logObjects } from './shortsDebug.utils.js'
import { SHORTS_DEBUG } from './shortsDebug.config.js'
import { trackShortsTransaction } from '../usage/trackShortsTransaction.js'

const ERR = {
  noShortKey: '[shortsUpdate] shortKey is required',
  noShortKeys: '[shortsUpdate] shortKeys is required',
  noId: '[shortsUpdate] id is required',
  noPatch: '[shortsUpdate] patch must be an object',
  unknownShortKey: key => `[shortsUpdate] Unknown shortKey "${key}"`,
}

const ensureId = id => {
  if (!id) throw new Error(ERR.noId)
}

const ensureShortKey = shortKey => {
  if (!shortKey) throw new Error(ERR.noShortKey)
}

const ensureShortKeys = shortKeys => {
  if (!Array.isArray(shortKeys) || shortKeys.length === 0) {
    throw new Error(ERR.noShortKeys)
  }
}

const ensurePatch = patch => {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) {
    throw new Error(ERR.noPatch)
  }
}

const resolveRefMeta = shortKey => {
  const [group, docName] = String(shortKey || '').split('.')
  const meta = shortsRefs?.[group]?.[docName]

  if (!meta?.collection || !meta?.docId) {
    throw new Error(ERR.unknownShortKey(shortKey))
  }

  return meta
}

const buildDocRef = meta => doc(db, meta.collection, meta.docId)

const normalizeList = data => (
  Array.isArray(data?.list) ? data.list : []
)

const stampUpdated = item => {
  const now = Timestamp.now()
  const createdAt = item?.createdAt ?? now

  return {
    ...item,
    createdAt,
    updatedAt: now,
  }
}

/**
 * replace=false:
 * ממזג את ה-patch עם האובייקט הקיים.
 *
 * replace=true:
 * מחליף את האובייקט כולו.
 */
const planUpdate = ({
  list,
  id,
  patch,
  replace,
  createIfMissing,
  shortKey,
}) => {
  const index = list.findIndex(item => item?.id === id)

  if (index === -1) {
    if (!createIfMissing) {
      return {
        nextList: list,
        updated: 0,
        created: 0,
        before: list.length,
        after: list.length,
      }
    }

    const base = replace
      ? { ...patch, id }
      : { id, ...patch }

    const nextItem = stampUpdated(base)

    validateRequired(shortKey, nextItem)

    const nextList = [...list, nextItem]

    return {
      nextList,
      updated: 0,
      created: 1,
      before: list.length,
      after: nextList.length,
    }
  }

  const current = list[index] || {}

  const merged = replace
    ? { ...patch, id }
    : { ...current, ...patch, id }

  const nextItem = stampUpdated(merged)

  validateRequired(shortKey, nextItem)

  const nextList = list.slice()
  nextList[index] = nextItem

  return {
    nextList,
    updated: 1,
    created: 0,
    before: list.length,
    after: nextList.length,
  }
}

const logStart = (tag, payload) => {
  debugLog(tag, {
    ...payload,
    mode: SHORTS_DEBUG.dryRun ? 'DRY_RUN' : 'WRITE',
  })
}

const trackUsagePlans = ({
  plans,
  action,
  entityId,
  dryRun,
}) => {
  for (const plan of plans || []) {
    const hasWrite = plan.updated > 0 || plan.created > 0

    trackShortsTransaction({
      shortKey: plan.shortKey,
      action,

      readsCount: 1,
      writesCount: !dryRun && hasWrite ? 1 : 0,

      readPayload: plan.data,
      writePayload:
        !dryRun && hasWrite
          ? {
              ...plan.data,
              list: plan.nextList,
            }
          : null,

      meta: {
        entityId,
        updated: plan.updated,
        created: plan.created,
        dryRun,
      },
    })
  }
}

/**
 * עדכון אותו patch במספר shortKeys.
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
    docs: shortKeys.map((shortKey, index) => ({
      shortKey,
      docPath: `${metas[index].collection}/${metas[index].docId}`,
    })),
    patch: SHORTS_DEBUG.logPayload
      ? patch
      : '[payload hidden]',
  })

  let usagePlans = []

  const res = await runTransaction(db, async tx => {
    const plans = []

    let updatedDocs = 0
    let createdDocs = 0

    for (let index = 0; index < refs.length; index += 1) {
      const ref = refs[index]
      const shortKey = shortKeys[index]
      const meta = metas[index]

      const snap = await tx.get(ref)
      const data = snap.exists() ? snap.data() : {}
      const list = normalizeList(data)

      if (SHORTS_DEBUG.enabled && SHORTS_DEBUG.logObjects) {
        logObjects(
          `UPDATE_MANY:list:before:${shortKey}`,
          list
        )
      }

      const {
        nextList,
        updated,
        created,
        before,
        after,
      } = planUpdate({
        list,
        id,
        patch,
        replace,
        createIfMissing,
        shortKey,
      })

      if (updated > 0) updatedDocs += 1
      if (created > 0) createdDocs += 1

      plans.push({
        ref,
        data,
        nextList,
        shortKey,
        updated,
        created,
      })

      debugLog('UPDATE_MANY:plan', {
        shortKey,
        docPath: `${meta.collection}/${meta.docId}`,
        before,
        after,
        updated,
        created,
      })
    }

    if (
      requireAllUpdated &&
      updatedDocs !== shortKeys.length
    ) {
      throw new Error(
        `[shortsUpdate] id=${id} was not updated in all docs ` +
        `(updated ${updatedDocs}/${shortKeys.length})`
      )
    }

    if (
      requireAnyUpdated &&
      updatedDocs === 0 &&
      createdDocs === 0
    ) {
      throw new Error(
        `[shortsUpdate] id=${id} not found ` +
        '(and createIfMissing=false)'
      )
    }

    usagePlans = plans

    if (SHORTS_DEBUG.dryRun) {
      debugLog('UPDATE_MANY:dry-run', {
        id,
        updatedDocs,
        createdDocs,
      })

      return {
        id,
        updatedDocs,
        createdDocs,
        dryRun: true,
      }
    }

    for (const plan of plans) {
      if (plan.updated > 0 || plan.created > 0) {
        tx.set(
          plan.ref,
          {
            ...plan.data,
            list: plan.nextList,
          },
          {
            merge: true,
          }
        )

        debugLog('UPDATE_MANY:write', {
          shortKey: plan.shortKey,
          updated: plan.updated,
          created: plan.created,
        })
      }
    }

    return {
      id,
      updatedDocs,
      createdDocs,
      dryRun: false,
    }
  })

  trackUsagePlans({
    plans: usagePlans,
    action: 'updateShortItemsById',
    entityId: id,
    dryRun: res.dryRun,
  })

  debugLog('UPDATE_MANY:commit:done', res)

  return res
}

/**
 * עדכון shortKey יחיד.
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
 * מאפשר patch שונה לכל shortKey,
 * בתוך טרנזקציה אחת.
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

  if (
    !patchesByShortKey ||
    typeof patchesByShortKey !== 'object' ||
    Array.isArray(patchesByShortKey)
  ) {
    throw new Error(
      '[shortsUpdate] patchesByShortKey must be an object'
    )
  }

  const shortKeys = Object.keys(patchesByShortKey)

  ensureShortKeys(shortKeys)

  for (const shortKey of shortKeys) {
    ensurePatch(patchesByShortKey[shortKey])
  }

  const metas = shortKeys.map(resolveRefMeta)
  const refs = metas.map(buildDocRef)

  logStart('UPDATE_MAP:start', {
    id,
    count: shortKeys.length,
    replace,
    createIfMissing,
    shortKeys,
    payload: SHORTS_DEBUG.logPayload
      ? patchesByShortKey
      : '[payload hidden]',
  })

  let usagePlans = []

  const res = await runTransaction(db, async tx => {
    const plans = []

    let updatedDocs = 0
    let createdDocs = 0

    for (let index = 0; index < refs.length; index += 1) {
      const ref = refs[index]
      const shortKey = shortKeys[index]
      const meta = metas[index]
      const patch = patchesByShortKey[shortKey]

      const snap = await tx.get(ref)
      const data = snap.exists() ? snap.data() : {}
      const list = normalizeList(data)

      const {
        nextList,
        updated,
        created,
        before,
        after,
      } = planUpdate({
        list,
        id,
        patch,
        replace,
        createIfMissing,
        shortKey,
      })

      if (updated > 0) updatedDocs += 1
      if (created > 0) createdDocs += 1

      plans.push({
        ref,
        data,
        nextList,
        shortKey,
        updated,
        created,
      })

      debugLog('UPDATE_MAP:plan', {
        shortKey,
        docPath: `${meta.collection}/${meta.docId}`,
        before,
        after,
        updated,
        created,
      })
    }

    if (
      requireAllUpdated &&
      updatedDocs !== shortKeys.length
    ) {
      throw new Error(
        `[shortsUpdate] id=${id} was not updated in all docs ` +
        `(updated ${updatedDocs}/${shortKeys.length})`
      )
    }

    if (
      requireAnyUpdated &&
      updatedDocs === 0 &&
      createdDocs === 0
    ) {
      throw new Error(
        `[shortsUpdate] id=${id} not found ` +
        '(and createIfMissing=false)'
      )
    }

    usagePlans = plans

    if (SHORTS_DEBUG.dryRun) {
      debugLog('UPDATE_MAP:dry-run', {
        id,
        updatedDocs,
        createdDocs,
      })

      return {
        id,
        updatedDocs,
        createdDocs,
        dryRun: true,
        shortKeys,
      }
    }

    for (const plan of plans) {
      if (plan.updated > 0 || plan.created > 0) {
        tx.set(
          plan.ref,
          {
            ...plan.data,
            list: plan.nextList,
          },
          {
            merge: true,
          }
        )

        debugLog('UPDATE_MAP:write', {
          shortKey: plan.shortKey,
          updated: plan.updated,
          created: plan.created,
        })
      }
    }

    return {
      id,
      updatedDocs,
      createdDocs,
      dryRun: false,
      shortKeys,
    }
  })

  trackUsagePlans({
    plans: usagePlans,
    action: 'updateShortItemsByIdMap',
    entityId: id,
    dryRun: res.dryRun,
  })

  debugLog('UPDATE_MAP:commit:done', res)

  return res
}
