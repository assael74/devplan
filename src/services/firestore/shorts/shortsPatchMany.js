// src/services/firestore/shorts/shortsPatchMany.js

import { doc, runTransaction } from 'firebase/firestore'
import { db } from '../../firebase/firebase.js'

import { shortsRefs } from './shorts.refs.js'
import { debugLog } from './shortsDebug.utils.js'
import { SHORTS_DEBUG } from './shortsDebug.config.js'
import { trackShortsTransaction } from '../usage/trackShortsTransaction.js'

const ERR = {
  noShortKeys: '[shortsPatchMany] shortKeys is required',
  noIds: '[shortsPatchMany] ids is required',
  noPatch: '[shortsPatchMany] patch is required',
}

const ensureShortKeys = shortKeys => {
  if (!Array.isArray(shortKeys) || shortKeys.length === 0) {
    throw new Error(ERR.noShortKeys)
  }
}

const ensureIds = ids => {
  if (!Array.isArray(ids) || ids.filter(Boolean).length === 0) {
    throw new Error(ERR.noIds)
  }
}

const ensurePatch = patch => {
  const isObject =
    patch &&
    typeof patch === 'object' &&
    !Array.isArray(patch)

  const isFunction =
    typeof patch === 'function'

  if (!isObject && !isFunction) {
    throw new Error(ERR.noPatch)
  }
}

const resolveRefMeta = shortKey => {
  const [group, docName] =
    String(shortKey || '').split('.')

  const meta =
    shortsRefs?.[group]?.[docName]

  if (!meta?.collection || !meta?.docId) {
    throw new Error(
      `[shortsPatchMany] Unknown shortKey "${shortKey}"`
    )
  }

  return meta
}

const buildDocRef = meta =>
  doc(db, meta.collection, meta.docId)

const normalizeList = data =>
  Array.isArray(data?.list)
    ? data.list
    : []

const resolvePatch = ({
  patch,
  item,
  shortKey,
}) => {
  if (typeof patch === 'function') {
    return patch({
      item,
      shortKey,
    }) || {}
  }

  return patch || {}
}

const shouldPatchItem = ({
  item,
  idSet,
  where,
}) => {
  if (!item?.id) return false
  if (!idSet.has(item.id)) return false

  if (typeof where === 'function') {
    return where(item)
  }

  return true
}

const trackUsagePlans = ({
  plans,
  ids,
  dryRun,
}) => {
  for (const plan of plans || []) {
    const hasWrite =
      plan.patched > 0

    trackShortsTransaction({
      shortKey: plan.shortKey,
      action: 'patchShortItemsByIds',

      readsCount: 1,
      writesCount:
        !dryRun && hasWrite
          ? 1
          : 0,

      readPayload: plan.data,

      writePayload:
        !dryRun && hasWrite
          ? {
              ...plan.data,
              list: plan.nextList,
            }
          : null,

      meta: {
        ids,
        patched: plan.patched,
        dryRun,
      },
    })
  }
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

  const cleanIds =
    Array.from(
      new Set(
        ids.filter(Boolean)
      )
    )

  const idSet =
    new Set(cleanIds)

  const metas =
    shortKeys.map(resolveRefMeta)

  const refs =
    metas.map(buildDocRef)

  debugLog('PATCH_MANY_IDS:start', {
    ids: cleanIds,
    idsCount: cleanIds.length,
    count: shortKeys.length,

    mode: SHORTS_DEBUG.dryRun
      ? 'DRY_RUN'
      : 'WRITE',

    docs: shortKeys.map(
      (shortKey, index) => ({
        shortKey,
        docPath:
          `${metas[index].collection}/${metas[index].docId}`,
      })
    ),
  })

  let usagePlans = []

  const res = await runTransaction(
    db,
    async tx => {
      const plans = []

      let foundDocs = 0
      let totalPatched = 0

      for (
        let index = 0;
        index < refs.length;
        index += 1
      ) {
        const ref = refs[index]
        const shortKey = shortKeys[index]
        const meta = metas[index]

        const snap =
          await tx.get(ref)

        const data =
          snap.exists()
            ? snap.data()
            : {}

        const list =
          normalizeList(data)

        let patched = 0

        const nextList =
          list.map(item => {
            const shouldPatch =
              shouldPatchItem({
                item,
                idSet,
                where,
              })

            if (!shouldPatch) {
              return item
            }

            const patchValue =
              resolvePatch({
                patch,
                item,
                shortKey,
              })

            patched += 1

            return {
              ...item,
              ...patchValue,
            }
          })

        if (patched > 0) {
          foundDocs += 1
        }

        totalPatched += patched

        plans.push({
          ref,
          data,
          nextList,
          shortKey,
          patched,
        })

        debugLog(
          'PATCH_MANY_IDS:plan',
          {
            shortKey,
            docPath:
              `${meta.collection}/${meta.docId}`,
            before: list.length,
            after: nextList.length,
            patched,
          }
        )
      }

      if (
        requireAnyPatched &&
        foundDocs === 0
      ) {
        throw new Error(
          '[shortsPatchMany] ids not patched in any list'
        )
      }

      usagePlans = plans

      if (SHORTS_DEBUG.dryRun) {
        debugLog(
          'PATCH_MANY_IDS:dry-run',
          {
            ids: cleanIds,
            foundDocs,
            totalPatched,
          }
        )

        return {
          ids: cleanIds,
          foundDocs,
          totalPatched,
          dryRun: true,
        }
      }

      for (const plan of plans) {
        if (plan.patched <= 0) {
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

        debugLog(
          'PATCH_MANY_IDS:write',
          {
            shortKey:
              plan.shortKey,
            patched:
              plan.patched,
          }
        )
      }

      return {
        ids: cleanIds,
        foundDocs,
        totalPatched,
        dryRun: false,
      }
    }
  )

  trackUsagePlans({
    plans: usagePlans,
    ids: cleanIds,
    dryRun: res.dryRun,
  })

  debugLog(
    'PATCH_MANY_IDS:commit:done',
    res
  )

  return res
}
