// src/services/firestore/shorts/shortsCreate.js
import { doc, runTransaction, Timestamp } from 'firebase/firestore'
import { db } from '../../firebase/firebase.js'

import { shortsRefs } from './shorts.refs.js'
import { validateRequired, debugLog, logObjects } from './shortsDebug.utils.js'
import { SHORTS_DEBUG } from './shortsDebug.config.js'

const ensureCreateArgs = (shortKey, item) => {
  if (!shortKey) throw new Error('[shortsCreate] shortKey is required')
  if (!item || typeof item !== 'object') throw new Error('[shortsCreate] item must be an object')
  if (!item.id) throw new Error(`[shortsCreate] item.id is required for ${shortKey}`)
}

const resolveRefMeta = (shortKey) => {
  const [group, docName] = String(shortKey || '').split('.')
  const meta = shortsRefs[group][docName]
  if (!meta?.collection || !meta?.docId) throw new Error(`[shortsCreate] Unknown shortKey "${shortKey}"`)
  return meta
}

const buildDocRef = (meta) => doc(db, meta.collection, meta.docId)

const logCreateStart = (shortKey, meta, item) => {
  debugLog('CREATE:start', {
    shortKey,
    docPath: `${meta.collection}/${meta.docId}`,
    item: SHORTS_DEBUG.logPayload ? item : '[payload hidden]',
    mode: SHORTS_DEBUG.dryRun ? 'DRY_RUN' : 'WRITE',
  })
}

const readDocList = async (tx, ref) => {
  const snap = await tx.get(ref)
  const data = snap.exists() ? snap.data() : {}
  const list = Array.isArray(data.list) ? data.list : []
  return { data, list }
}

const assertNotExistsById = (list, id, shortKey) => {
  const exists = list.some((x) => x?.id === id)
  if (exists) throw new Error(`[shortsCreate] Item already exists (id=${id}) in ${shortKey}`)
}

const stampItem = (item) => {
  const now = Timestamp.now()
  return { ...item, createdAt: item.createdAt ?? now, updatedAt: now }
}

const writeNextList = (tx, ref, data, nextList) => {
  tx.set(ref, { ...data, list: nextList }, { merge: true })
}

export async function createShort({ shortKey, item }) {
  ensureCreateArgs(shortKey, item)
  validateRequired(shortKey, item)

  const meta = resolveRefMeta(shortKey)
  const ref = buildDocRef(meta)

  logCreateStart(shortKey, meta, item)

  const res = await runTransaction(db, async (tx) => {
    const { data, list } = await readDocList(tx, ref)

    // keep existing logger behavior
    if (SHORTS_DEBUG.enabled && SHORTS_DEBUG.logListSize) debugLog('CREATE:before', { listSize: list.length })
    logObjects('CREATE:list:before', list)

    assertNotExistsById(list, item.id, shortKey)

    const stamped = stampItem(item)
    const nextList = [...list, stamped]

    if (SHORTS_DEBUG.enabled && SHORTS_DEBUG.logListSize) debugLog('CREATE:after', { listSize: nextList.length })
    logObjects('CREATE:list:after', nextList)

    if (SHORTS_DEBUG.dryRun) {
      debugLog('CREATE:dry-run', {
        message: 'Firestore write skipped (SHORTS_DEBUG.dryRun=true)',
        docPath: `${meta.collection}/${meta.docId}`,
      })
      return { shortKey, id: item.id, dryRun: true }
    }

    writeNextList(tx, ref, data, nextList)
    debugLog('CREATE:write:queued', { shortKey, id: item.id })
    return { shortKey, id: item.id, dryRun: false }
  })

  debugLog('CREATE:commit:done', res)
  return res
}
