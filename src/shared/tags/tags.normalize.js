// src/shared/tags/tags.normalize.js
export const safeStr = (v) => (v == null ? '' : String(v))
export const safeId = (v) => safeStr(v).trim()

const normalizeKind = (v) => {
  const k = safeStr(v).trim()
  return k === 'group' ? 'group' : 'tag'
}

export function normalizeTag(t) {
  const x = t || {}
  const id = safeId(x.id || x.docId)

  return {
    ...x,
    id,
    kind: normalizeKind(x.kind),
    tagName: safeStr(x.tagName).trim(),
    tagType: safeStr(x.tagType).trim(),
    parentId: safeId(x.parentId),
    notes: safeStr(x.notes).trim(),
    slug: safeStr(x.slug).trim(),
    iconId: safeStr(x.iconId).trim(),
    color: safeStr(x.color).trim(),
    isActive: x.isActive !== false,
    useCount: Number.isFinite(Number(x.useCount)) ? Number(x.useCount) : 0,
    order: Number.isFinite(Number(x.order)) ? Number(x.order) : 0,
    created: safeStr(x.created),
    updatedAt: safeStr(x.updatedAt),
    archivedAt: safeStr(x.archivedAt),
  }
}

export function normalizeTags(list) {
  return (Array.isArray(list) ? list : [])
    .map(normalizeTag)
    .filter((t) => !!t.id)
}
