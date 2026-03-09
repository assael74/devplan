// src/shared/tags/tags.parenting.js
import { safeId, safeStr } from './tags.normalize'

export function buildTagsIndex(tags) {
  const arr = Array.isArray(tags) ? tags : []
  return new Map(arr.map((t) => [safeId(t?.id), t]).filter(([id]) => !!id))
}

export function buildChildrenCountById1(tags) {
  const arr = Array.isArray(tags) ? tags : []
  const m = new Map()
  arr.forEach((t) => {
    const pid = safeId(t?.parentId)
    if (!pid) return
    m.set(pid, (m.get(pid) || 0) + 1)
  })
  return m
}

// ✅ NEW MODEL: parent candidates are ONLY groups
export function buildParentOptions({
  tags,
  currentTagId = '',
  tagType = '',
  includeArchived = false,
  mapToOption = null,
}) {
  const list = Array.isArray(tags) ? tags : []
  const type = safeStr(tagType).trim()
  const selfId = safeId(currentTagId)

  const base = list
    .filter((t) => !!safeId(t?.id))
    .filter((t) => (includeArchived ? true : t?.isActive !== false))
    .filter((t) => (type ? safeStr(t?.tagType).trim() === type : true))
    .filter((t) => safeStr(t?.kind).trim() === 'group') // ✅ only categories
    .filter((t) => (selfId ? safeId(t?.id) !== selfId : true))

  const mapper =
    mapToOption ||
    ((t) => ({
      id: safeId(t.id),
      value: safeId(t.id),
      label: t.tagName || t.slug || safeId(t.id),
      labelH: t.tagName || t.slug || safeId(t.id),
      idIcon: t.iconId || 'tags',
      color: t.color || '',
      tagType: safeStr(t.tagType).trim(),
      isActive: t?.isActive !== false,
      kind: 'group',
    }))

  return base.map(mapper)
}
