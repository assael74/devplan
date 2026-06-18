// src/services/firestore/shorts/shortsDelete.js

import { doc, runTransaction } from 'firebase/firestore'
import { db } from '../../firebase/firebase.js'

import { shortsRefs } from './shorts.refs.js'
import { debugLog } from './shortsDebug.utils.js'
import { SHORTS_DEBUG } from './shortsDebug.config.js'
import { trackShortsTransaction } from '../usage/trackShortsTransaction.js'

const ERR = {
  noShortKey: '[shortsDelete] shortKey is required',
  noShortKeys: '[shortsDelete] shortKeys is required',
  noId: '[shortsDelete] id is required',
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

const resolveRefMeta = shortKey => {
  const [group, docName] = String(shortKey || '').split('.')
  const meta = shortsRefs?.[group]?.[docName]

  if (!meta?.collection || !meta?.docId) {
    throw new Error(
      `[shortsDelete] Unknown shortKey "${shortKey}"`
    )
  }

  return meta
}

const buildDocRef = meta =>
  doc(db, meta.collection, meta.docId)

const normalizeList = data =>
  Array.isArray(data?.list) ? data.list : []

const planDelete = (list, id) => {
  const before = list.length
  const nextList = list.filter(item => item?.id !== id)
  const removed = before - nextList.length

  return {
    nextList,
    removed,
    before,
    after: nextList.length,
  }
}

const logStart = (tag, payload) => {
  debugLog(tag, {
    ...payload,
    mode: SHORTS_DEBUG.dryRun
      ? 'DRY_RUN'
      : 'WRITE',
  })
}

const trackDeleteUsagePlans = ({
  plans,
  action,
  ids,
  dryRun,
}) => {
  for (const plan of plans || []) {
    const hasWrite = plan.removed > 0

    trackShortsTransaction({
      shortKey: plan.shortKey,
      action,

      readsCount: 1,
      writesCount:
        !dryRun && hasWrite
          ? 1
          : 0,

      logicalDeletesCount:
        plan.removed,

      readPayload:
        plan.data,

      writePayload:
        !dryRun && hasWrite
          ? {
              ...plan.data,
              list: plan.nextList,
            }
          : null,

      meta: {
        ids,
        removed: plan.removed,
        dryRun,
      },
    })
  }
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
    docs: shortKeys.map((shortKey, index) => ({
      shortKey,
      docPath:
        `${metas[index].collection}/${metas[index].docId}`,
    })),
  })

  let usagePlans = []

  const res = await runTransaction(db, async tx => {
    const plans = []

    let foundDocs = 0
    let totalRemoved = 0

    for (
      let index = 0;
      index < refs.length;
      index += 1
    ) {
      const ref = refs[index]
      const shortKey = shortKeys[index]
      const meta = metas[index]

      const snap = await tx.get(ref)
      const data = snap.exists() ? snap.data() : {}
      const list = normalizeList(data)

      const {
        nextList,
        removed,
        before,
        after,
      } = planDelete(list, id)

      if (removed > 0) {
        foundDocs += 1
      }

      totalRemoved += removed

      plans.push({
        ref,
        data,
        nextList,
        shortKey,
        removed,
      })

      debugLog('DELETE_MANY:plan', {
        shortKey,
        docPath:
          `${meta.collection}/${meta.docId}`,
        before,
        after,
        removed,
      })
    }

    if (
      requireAllFound &&
      foundDocs !== shortKeys.length
    ) {
      throw new Error(
        `[shortsDelete] id=${id} not found in all lists ` +
        `(found in ${foundDocs}/${shortKeys.length})`
      )
    }

    if (
      requireAnyFound &&
      foundDocs === 0
    ) {
      throw new Error(
        `[shortsDelete] id=${id} not found in any list`
      )
    }

    usagePlans = plans

    if (SHORTS_DEBUG.dryRun) {
      debugLog('DELETE_MANY:dry-run', {
        id,
        foundDocs,
        totalRemoved,
      })

      return {
        id,
        foundDocs,
        totalRemoved,
        dryRun: true,
      }
    }

    for (const plan of plans) {
      if (plan.removed <= 0) {
        continue
      }

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

      debugLog('DELETE_MANY:write', {
        shortKey: plan.shortKey,
        removed: plan.removed,
      })
    }

    return {
      id,
      foundDocs,
      totalRemoved,
      dryRun: false,
    }
  })

  trackDeleteUsagePlans({
    plans: usagePlans,
    action: 'deleteShortItemsById',
    ids: [id],
    dryRun: res.dryRun,
  })

  debugLog('DELETE_MANY:commit:done', res)

  return res
}

export async function deleteShortItemById({
  shortKey,
  id,
  requireFound = false,
}) {
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

export async function deleteShortItemsByIds({
  shortKeys,
  ids,
  requireAnyFound = true,
  requireAllFound = false,
}) {
  ensureShortKeys(shortKeys)

  const cleanIds = Array.from(
    new Set((ids || []).filter(Boolean))
  )

  if (!cleanIds.length) {
    return {
      ids: [],
      foundDocs: 0,
      totalRemoved: 0,
      dryRun: SHORTS_DEBUG.dryRun,
    }
  }

  const idSet = new Set(cleanIds)
  const metas = shortKeys.map(resolveRefMeta)
  const refs = metas.map(buildDocRef)

  logStart('DELETE_MANY_IDS:start', {
    ids: cleanIds,
    idsCount: cleanIds.length,
    count: shortKeys.length,
    docs: shortKeys.map((shortKey, index) => ({
      shortKey,
      docPath:
        `${metas[index].collection}/${metas[index].docId}`,
    })),
  })

  let usagePlans = []

  const res = await runTransaction(db, async tx => {
    const plans = []

    let foundDocs = 0
    let totalRemoved = 0

    for (
      let index = 0;
      index < refs.length;
      index += 1
    ) {
      const ref = refs[index]
      const shortKey = shortKeys[index]
      const meta = metas[index]

      const snap = await tx.get(ref)
      const data = snap.exists() ? snap.data() : {}
      const list = normalizeList(data)

      const before = list.length

      const nextList = list.filter(
        item => !idSet.has(item?.id)
      )

      const removed =
        before - nextList.length

      const after =
        nextList.length

      if (removed > 0) {
        foundDocs += 1
      }

      totalRemoved += removed

      plans.push({
        ref,
        data,
        nextList,
        shortKey,
        removed,
      })

      debugLog('DELETE_MANY_IDS:plan', {
        shortKey,
        docPath:
          `${meta.collection}/${meta.docId}`,
        before,
        after,
        removed,
      })
    }

    if (
      requireAllFound &&
      foundDocs !== shortKeys.length
    ) {
      throw new Error(
        '[shortsDelete] ids not found in all lists ' +
        `(found in ${foundDocs}/${shortKeys.length})`
      )
    }

    if (
      requireAnyFound &&
      foundDocs === 0
    ) {
      throw new Error(
        '[shortsDelete] ids not found in any list'
      )
    }

    usagePlans = plans

    if (SHORTS_DEBUG.dryRun) {
      debugLog('DELETE_MANY_IDS:dry-run', {
        ids: cleanIds,
        foundDocs,
        totalRemoved,
      })

      return {
        ids: cleanIds,
        foundDocs,
        totalRemoved,
        dryRun: true,
      }
    }

    for (const plan of plans) {
      if (plan.removed <= 0) {
        continue
      }

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

      debugLog('DELETE_MANY_IDS:write', {
        shortKey: plan.shortKey,
        removed: plan.removed,
      })
    }

    return {
      ids: cleanIds,
      foundDocs,
      totalRemoved,
      dryRun: false,
    }
  })

  trackDeleteUsagePlans({
    plans: usagePlans,
    action: 'deleteShortItemsByIds',
    ids: cleanIds,
    dryRun: res.dryRun,
  })

  debugLog('DELETE_MANY_IDS:commit:done', res)

  return res
}
