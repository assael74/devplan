// src/services/firestore/shorts/shortsCreate.js

import { doc, runTransaction, Timestamp } from 'firebase/firestore'
import isEqual from 'lodash/isEqual'
import { db } from '../../firebase/firebase.js'
import { shortsRefs } from './shorts.refs.js'
import { validateRequired, debugLog, logObjects } from './shortsDebug.utils.js'
import { SHORTS_DEBUG } from './shortsDebug.config.js'
import { trackShortsTransaction } from '../usage/trackShortsTransaction.js'

function groupCreateItems(entries) {
  const groups = new Map()

  for (const { shortKey, item } of entries) {
    if (!shortKey) throw new Error('[shortsCreate] shortKey is required')
    if (!item || typeof item !== 'object') {
      throw new Error('[shortsCreate] item must be an object')
    }
    if (!item.id) throw new Error(`[shortsCreate] item.id is required for ${shortKey}`)

    validateRequired(shortKey, item)
    if (!groups.has(shortKey)) {
      const [group, docName] = shortKey.split('.')
      const meta = shortsRefs[group]?.[docName]
      if (!meta?.collection || !meta?.docId) {
        throw new Error(`[shortsCreate] Unknown shortKey "${shortKey}"`)
      }
      groups.set(shortKey, {
        shortKey,
        docName,
        ref: doc(db, meta.collection, meta.docId),
        itemsById: new Map(),
      })
    }

    const { itemsById } = groups.get(shortKey)
    if (itemsById.has(item.id)) {
      throw new Error(`[shortsCreate] Duplicate item id=${item.id} in ${shortKey}`)
    }
    itemsById.set(item.id, item)
  }

  return Array.from(groups.values())
}

async function readCreateGroup(tx, group) {
  const snapshot = await tx.get(group.ref)
  const data = snapshot.exists() ? snapshot.data() : {}
  const list = Array.isArray(data.list) ? data.list : []
  const existing = list.filter(item => group.itemsById.has(item?.id))
  return { ...group, data, list, existing }
}

function wasCreatedByRequest({ existing, itemsById }) {
  if (existing.length !== itemsById.size) return false
  if (new Set(existing.map(item => item.id)).size !== itemsById.size) return false

  return existing.every(item => Object.entries(itemsById.get(item.id)).every(([key, value]) => (
    key === 'updatedAt' || (key === 'createdAt' && value == null) || isEqual(item[key], value)
  )))
}

export async function createShortItems({ entries, allowExisting = false }) {
  const groups = groupCreateItems(entries)
  const dryRun = SHORTS_DEBUG.dryRun
  if (!groups.length) return { dryRun }

  const now = Timestamp.now()
  const plans = await runTransaction(db, async tx => {
    const plans = await Promise.all(groups.map(group => readCreateGroup(tx, group)))
    const conflict = plans.find(plan => plan.existing.length > 0)
    // A repeated request is complete only when every intended record is present.
    const alreadyCreated = allowExisting && plans.every(wasCreatedByRequest)

    if (conflict && !alreadyCreated) {
      const { id } = conflict.existing[0]
      throw new Error(`[shortsCreate] Item already exists (id=${id}) in ${conflict.shortKey}`)
    }

    for (const plan of plans) {
      if (alreadyCreated) continue
      const items = Array.from(plan.itemsById.values(), item => ({
        ...item,
        createdAt: item.createdAt == null ? now : item.createdAt,
        updatedAt: now,
      }))
      const list = [...plan.list, ...items]
      debugLog('CREATE:plan', {
        shortKey: plan.shortKey,
        before: plan.list.length,
        after: list.length,
        dryRun,
      })
      logObjects('CREATE:list:after', list)

      if (dryRun) continue
      plan.writePayload = {
        ...plan.data,
        docName: plan.data.docName || plan.docName,
        list,
      }
      tx.set(plan.ref, plan.writePayload, { merge: true })
    }

    return plans
  })

  for (const plan of plans) {
    const itemIds = Array.from(plan.itemsById.keys())
    trackShortsTransaction({
      shortKey: plan.shortKey,
      action: 'createShort',
      readsCount: 1,
      writesCount: plan.writePayload ? 1 : 0,
      readPayload: plan.data,
      writePayload: plan.writePayload || null,
      meta: {
        ...(itemIds.length === 1 ? { itemId: itemIds[0] } : { itemIds }),
        dryRun,
      },
    })
  }

  return { dryRun }
}

export async function createShort({ shortKey, item }) {
  const { dryRun } = await createShortItems({ entries: [{ shortKey, item }] })
  return { shortKey, id: item.id, dryRun }
}
