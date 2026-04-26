// videoHub/components/general/editGeneralDrawer/logic/videoEditDrawer.logic.js

const normalizeIds = (arr) =>
  (Array.isArray(arr) ? arr : [])
    .map((x) => String(x ?? '').trim())
    .filter(Boolean)

const normalizeIdsKey = (arr) => normalizeIds(arr).sort().join('|')

export function buildInitialDraft(video) {
  const v = video || {}

  return {
    id: v.id || '',
    name: v.name || v.title || '',
    notes: v.notes || '',
    tagIds: normalizeIds(v.tagIds || v.tags || []),
    raw: v,
  }
}

export function getIsDirty(draft, initial) {
  const t1 = normalizeIdsKey(draft?.tagIds)
  const t2 = normalizeIdsKey(initial?.tagIds)

  return (
    (draft?.name || '') !== (initial?.name || '') ||
    (draft?.notes || '') !== (initial?.notes || '') ||
    t1 !== t2
  )
}

export function buildPatch(draft, initial) {
  const out = {}

  const name1 = draft?.name || ''
  const name2 = initial?.name || ''
  if (name1 !== name2) out.name = name1

  const notes1 = draft?.notes || ''
  const notes2 = initial?.notes || ''
  if (notes1 !== notes2) out.notes = notes1

  const t1 = normalizeIdsKey(draft?.tagIds)
  const t2 = normalizeIdsKey(initial?.tagIds)
  if (t1 !== t2) out.tagIds = normalizeIds(draft?.tagIds)

  return out
}
