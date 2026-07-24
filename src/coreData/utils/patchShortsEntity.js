// src/features/coreData/utils/patchShortsEntity.js
import { shortsUpdateRouter } from '../../../services/firestore/shorts/shortsUpdateRouter.js'

const splitShortKey = (shortKey) => {
  const [entityType, docName] = String(shortKey || '').split('.')
  return { entityType: entityType || null, docName: docName || null }
}

const upsertById = (list, id, patchObj) => {
  const arr = Array.isArray(list) ? list : []
  const idx = arr.findIndex((x) => String(x?.id) === String(id))
  if (idx === -1) return [...arr, { id, ...patchObj }]
  const next = [...arr]
  next[idx] = { ...next[idx], ...patchObj, id }
  return next
}

/**
 * Patches a "shorts docs array" (e.g. meetingsShorts) using the SAME router used for Firestore updates.
 * Expected shorts docs shape: [{ docName: 'meetingDate', list: [...] }, ...]
 */
export function patchShortsDocsByRouter({ entityType, shortsDocs, id, patch }) {
  if (!entityType || !id || !patch || typeof patch !== 'object') return shortsDocs
  const docsArr = Array.isArray(shortsDocs) ? shortsDocs : []

  // group updates by docName
  const byDoc = new Map()
  for (const [fieldKey, value] of Object.entries(patch)) {
    if (value === undefined) continue
    const route = shortsUpdateRouter(entityType, fieldKey)
    if (!route?.shortKey) continue

    const { docName } = splitShortKey(route.shortKey)
    if (!docName) continue

    if (!byDoc.has(docName)) byDoc.set(docName, {})
    byDoc.get(docName)[route.path || fieldKey] = value
  }

  if (byDoc.size === 0) return shortsDocs

  let changed = false
  const nextDocs = docsArr.map((doc) => {
    const docName = doc?.docName
    if (!byDoc.has(docName)) return doc

    const patchObj = byDoc.get(docName)
    const nextList = upsertById(doc?.list, id, patchObj)

    changed = true
    return { ...doc, list: nextList }
  })

  for (const [docName, patchObj] of byDoc.entries()) {
    const exists = nextDocs.some((d) => d?.docName === docName)
    if (exists) continue
    changed = true
    nextDocs.push({ docName, list: [{ id, ...patchObj }] })
  }

  return changed ? nextDocs : shortsDocs
}
