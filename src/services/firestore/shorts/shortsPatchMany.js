// src/services/firestore/shorts/shortsPatchMany.js

import { doc, runTransaction } from 'firebase/firestore'
import { db } from '../../firebase/firebase.js'

import { shortsRefs } from './shorts.refs.js'
import { debugLog } from './shortsDebug.utils.js'
import { SHORTS_DEBUG } from './shortsDebug.config.js'

const ERR = {
  noShortKeys: '[shortsPatchMany] shortKeys is required',
  noIds: '[shortsPatchMany] ids is required',
  noPatch: '[shortsPatchMany] patch is required',
}

const ensureShortKeys = shortKeys => {
  if (!Array.isArray(shortKeys) || shortKeys.length === 0) throw new Error(ERR.noShortKeys)
}

const ensureIds = ids => {
  if (!Array.isArray(ids) || ids.filter(Boolean).length === 0) throw new Error(ERR.noIds)
}

const ensurePatch = patch => {
  const isObj = patch && typeof patch === 'object' && !Array.isArray(patch)
  const isFn = typeof patch === 'function'
  if (!isObj && !isFn) throw new Error(ERR.noPatch)
}

const resolveRefMeta = shortKey => {
  const [group, docName] = String(shortKey || '').split('.')
  const meta = shortsRefs?.[group]?.[docName]

  if (!meta?.collection || !meta?.docId) {
    throw new Error(`[shortsPatchMany] Unknown shortKey "${shortKey}"`)
  }

  return meta
}

const buildDocRef = meta => doc(db, meta.collection, meta.docId)

const normalizeList = data => (Array.isArray(data?.list) ? data.list : [])

const resolvePatch = ({ patch, item, shortKey }) => {
  if (typeof patch === 'function') return patch({ item, shortKey }) || {}
  return patch || {}
}

const shouldPatchItem = ({ item, idSet, where }) => {
  if (!item?.id) return false
  if (!idSet.has(item.id)) return false
  if (typeof where === 'function') return where(item)
  return true
}

export async function patchShortItemsByIds({
  shortKeys,
  ids,
  patch,
  where,
  requireAnyPatched = true,
}) {
  ensureShortKeys(shortKeys)
  ensureIds(ids)
  ensurePatch(patch)

  const cleanIds = Array.from(new Set(ids.filter(Boolean)))
  const idSet = new Set(cleanIds)

  const metas = shortKeys.map(resolveRefMeta)
  const refs = metas.map(buildDocRef)

  debugLog('PATCH_MANY_IDS:start', {
    ids: cleanIds,
    idsCount: cleanIds.length,
    count: shortKeys.length,
    mode: SHORTS_DEBUG.dryRun ? 'DRY_RUN' : 'WRITE',
    docs: shortKeys.map((k, i) => ({
      shortKey: k,
      docPath: `${metas[i].collection}/${metas[i].docId}`,
    })),
  })

  const res = await runTransaction(db, async tx => {
    const plans = []
    let foundDocs = 0
    let totalPatched = 0

    for (let i = 0; i < refs.length; i++) {
      const ref = refs[i]
      const shortKey = shortKeys[i]
      const meta = metas[i]

      const snap = await tx.get(ref)
      const data = snap.exists() ? snap.data() : {}
      const list = normalizeList(data)

      let patched = 0

      const nextList = list.map(item => {
        if (!shouldPatchItem({ item, idSet, where })) return item

        const patchValue = resolvePatch({ patch, item, shortKey })
        patched += 1

        return {
          ...item,
          ...patchValue,
        }
      })

      if (patched > 0) foundDocs += 1
      totalPatched += patched

      plans.push({ ref, data, nextList, shortKey, patched })

      debugLog('PATCH_MANY_IDS:plan', {
        shortKey,
        docPath: `${meta.collection}/${meta.docId}`,
        before: list.length,
        after: nextList.length,
        patched,
      })
    }

    if (requireAnyPatched && foundDocs === 0) {
      throw new Error('[shortsPatchMany] ids not patched in any list')
    }

    if (SHORTS_DEBUG.dryRun) {
      debugLog('PATCH_MANY_IDS:dry-run', { ids: cleanIds, foundDocs, totalPatched })
      return { ids: cleanIds, foundDocs, totalPatched, dryRun: true }
    }

    for (const p of plans) {
      if (p.patched > 0) {
        tx.set(p.ref, { ...p.data, list: p.nextList }, { merge: true })
        debugLog('PATCH_MANY_IDS:write', { shortKey: p.shortKey, patched: p.patched })
      }
    }

    return { ids: cleanIds, foundDocs, totalPatched, dryRun: false }
  })

  debugLog('PATCH_MANY_IDS:commit:done', res)
  return res
}
