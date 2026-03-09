// videoHub/components/general/editGeneralDrawer/videoGeneralEditDrawer.logic.js
const normalizeIds = (arr) =>
  (Array.isArray(arr) ? arr : [])
    .map((x) => String(x ?? '').trim())
    .filter(Boolean)

const normalizeIdsKey = (arr) => normalizeIds(arr).sort().join('|')

export function buildOriginal(video) {
  const v = video || {}
  return {
    name: v.name || '',
    notes: v.notes || '',
    tagIds: normalizeIds(v.tagIds || []),
  }
}

export function isDirty(draft, original) {
  const t1 = normalizeIdsKey(draft?.tagIds)
  const t2 = normalizeIdsKey(original?.tagIds)

  return (
    (draft?.name || '') !== (original?.name || '') ||
    (draft?.notes || '') !== (original?.notes || '') ||
    t1 !== t2
  )
}

export function buildPatch(draft, original) {
  const out = {}

  const name1 = draft?.name || ''
  const name2 = original?.name || ''
  if (name1 !== name2) out.name = name1

  const notes1 = draft?.notes || ''
  const notes2 = original?.notes || ''
  if (notes1 !== notes2) out.notes = notes1

  const t1 = normalizeIdsKey(draft?.tagIds)
  const t2 = normalizeIdsKey(original?.tagIds)
  if (t1 !== t2) out.tagIds = normalizeIds(draft?.tagIds)

  return out
}
