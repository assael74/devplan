// videoHub/components/general/editGeneralDrawer/logic/videoEditDrawer.logic.js

const normalizeIds = arr =>
  (Array.isArray(arr) ? arr : [])
    .map(x => String(x ?? '').trim())
    .filter(Boolean)

const normalizeIdsKey = arr => normalizeIds(arr).sort().join('|')

const safeStr = value => String(value ?? '').trim()

function normalizeCategoryIds({ primaryCategoryId, categoryIds }) {
  const primary = safeStr(primaryCategoryId)
  const ids = normalizeIds(categoryIds)

  if (!primary) return ids

  return Array.from(new Set([primary, ...ids]))
}

export function buildInitialDraft(video) {
  const v = video || {}
  const primaryCategoryId = safeStr(v.primaryCategoryId)
  const categoryIds = normalizeCategoryIds({
    primaryCategoryId,
    categoryIds: v.categoryIds,
  })

  return {
    id: v.id || '',
    name: v.name || v.title || '',
    notes: v.notes || v.description || '',
    primaryCategoryId,
    categoryIds,
    tagIds: normalizeIds(v.tagIds || v.tags || []),
    raw: v,
  }
}

export function getIsDirty(draft, initial) {
  const draftTags = normalizeIdsKey(draft?.tagIds)
  const initialTags = normalizeIdsKey(initial?.tagIds)

  const draftCategories = normalizeIdsKey(draft?.categoryIds)
  const initialCategories = normalizeIdsKey(initial?.categoryIds)

  return (
    safeStr(draft?.name) !== safeStr(initial?.name) ||
    safeStr(draft?.notes) !== safeStr(initial?.notes) ||
    safeStr(draft?.primaryCategoryId) !== safeStr(initial?.primaryCategoryId) ||
    draftCategories !== initialCategories ||
    draftTags !== initialTags
  )
}

export function buildPatch(draft, initial) {
  const out = {}

  const name1 = safeStr(draft?.name)
  const name2 = safeStr(initial?.name)
  if (name1 !== name2) out.name = name1

  const notes1 = safeStr(draft?.notes)
  const notes2 = safeStr(initial?.notes)
  if (notes1 !== notes2) out.notes = notes1

  const primary1 = safeStr(draft?.primaryCategoryId)
  const primary2 = safeStr(initial?.primaryCategoryId)
  if (primary1 !== primary2) out.primaryCategoryId = primary1 || null

  const nextCategoryIds = normalizeCategoryIds({
    primaryCategoryId: draft?.primaryCategoryId,
    categoryIds: draft?.categoryIds,
  })

  const prevCategoryIds = normalizeCategoryIds({
    primaryCategoryId: initial?.primaryCategoryId,
    categoryIds: initial?.categoryIds,
  })

  if (normalizeIdsKey(nextCategoryIds) !== normalizeIdsKey(prevCategoryIds)) {
    out.categoryIds = nextCategoryIds
  }

  const t1 = normalizeIdsKey(draft?.tagIds)
  const t2 = normalizeIdsKey(initial?.tagIds)
  if (t1 !== t2) out.tagIds = normalizeIds(draft?.tagIds)

  return out
}
