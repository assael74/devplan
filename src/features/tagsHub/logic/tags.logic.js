// src/features/tagsHub/tags.logic.js

import { safeStr, safeId, normalizeTags as normalizeTagsShared } from '../../../shared/tags/tags.normalize'

export const TAGS_SORT_OPTIONS = [
  {
    id: 'order',
    label: 'סדר ידני',
    idIcon: 'sort',
    defaultDirection: 'asc',
  },
  {
    id: 'name',
    label: 'שם תג',
    idIcon: 'tags',
    defaultDirection: 'asc',
  },
  {
    id: 'usage',
    label: 'כמות שימושים',
    idIcon: 'analytics',
    defaultDirection: 'desc',
  },
]

export const TAGS_DEFAULT_SORT = {
  by: 'order',
  direction: 'asc',
}

export function getTagsSortLabel(sortBy) {
  const opt = TAGS_SORT_OPTIONS.find((x) => x.id === sortBy)
  return opt?.label || TAGS_SORT_OPTIONS[0].label
}

export function sortTagsList(tags, sort) {
  const list = Array.isArray(tags) ? [...tags] : []
  const by = sort?.by || TAGS_DEFAULT_SORT.by
  const direction = sort?.direction || TAGS_DEFAULT_SORT.direction
  const factor = direction === 'desc' ? -1 : 1

  list.sort((a, b) => {
    if (by === 'name') {
      return safeStr(a?.tagName).localeCompare(safeStr(b?.tagName), 'he') * factor
    }

    if (by === 'usage') {
      return ((Number(a?.useCount) || 0) - (Number(b?.useCount) || 0)) * factor
    }

    const orderDiff = ((Number(a?.order) || 0) - (Number(b?.order) || 0)) * factor
    if (orderDiff !== 0) return orderDiff

    return safeStr(a?.tagName).localeCompare(safeStr(b?.tagName), 'he')
  })

  return list
}

export function normalizeTags(list = []) {
  return normalizeTagsShared(list)
}

export function filterTags(tags, uiFilters) {
  const f = uiFilters || {}
  const q = safeStr(f.q).trim().toLowerCase()
  const type = safeStr(f.tagType).trim()
  const showArchived = Boolean(f.showArchived)
  const hierarchy = safeStr(f.hierarchy || 'all').trim()

  const list = Array.isArray(tags) ? tags : []

  return list.filter((t) => {
    if (!showArchived && t?.isActive === false) return false
    if (type && type !== 'all' && safeStr(t?.tagType).trim() !== type) return false

    // model-aware hierarchy
    if (hierarchy === 'parents') {
      if (t?.kind !== 'group') return false
    } else if (hierarchy === 'children') {
      if (t?.kind !== 'tag') return false
    }

    if (q) {
      const hay = `${safeStr(t?.tagName)} ${safeStr(t?.slug)} ${safeStr(t?.tagType)}`.toLowerCase()
      if (!hay.includes(q)) return false
    }

    return true
  })
}

export function sortByOrderThenName(arr) {
  const a = Array.isArray(arr) ? [...arr] : []
  a.sort((x, y) => {
    const d = (Number(x?.order) || 0) - (Number(y?.order) || 0)
    if (d !== 0) return d
    return safeStr(x?.tagName).localeCompare(safeStr(y?.tagName), 'he')
  })
  return a
}

export function buildTagsSections(tags, opts = {}) {
  const list = Array.isArray(tags) ? tags : []
  const {
    sort = TAGS_DEFAULT_SORT,
    typeKeys = {
      general: ['general', 'videos', 'videoGeneral'],
      analysis: ['analysis', 'videoAnalysis'],
    },
  } = opts

  const keyOfType = (tagType) => {
    const tt = safeStr(tagType).trim()
    if (typeKeys.analysis.includes(tt)) return 'analysis'
    if (typeKeys.general.includes(tt)) return 'general'
    return 'other'
  }

  const byId = new Map()
  list.forEach((t) => byId.set(safeId(t?.id), t))

  const initSection = () => ({
    groups: [],
    childrenByGroupId: new Map(),
    orphans: [],
    usageByGroupId: new Map(),
    childrenCountByGroupId: new Map(),
  })

  const sections = {
    general: initSection(),
    analysis: initSection(),
    other: initSection(),
  }

  for (const t of list) {
    const secKey = keyOfType(t?.tagType)
    if (t?.kind === 'group') sections[secKey].groups.push(t)
  }

  for (const t of list) {
    if (t?.kind !== 'tag') continue
    const secKey = keyOfType(t?.tagType)
    const pid = safeId(t?.parentId)

    const parent = pid ? byId.get(pid) : null
    const validParent = parent && parent.kind === 'group'

    if (!pid || !validParent) {
      sections[secKey].orphans.push(t)
      continue
    }

    if (!sections[secKey].childrenByGroupId.has(pid)) sections[secKey].childrenByGroupId.set(pid, [])
    sections[secKey].childrenByGroupId.get(pid).push(t)
  }

  for (const k of Object.keys(sections)) {
    const s = sections[k]

    s.groups = sortTagsList(s.groups, sort)
    s.orphans = sortTagsList(s.orphans, sort)

    for (const [gid, children] of s.childrenByGroupId.entries()) {
      const sorted = sortTagsList(children, sort)
      s.childrenByGroupId.set(gid, sorted)

      s.childrenCountByGroupId.set(gid, sorted.length)
      const usage = sorted.reduce((acc, x) => acc + (Number(x?.useCount) || 0), 0)
      s.usageByGroupId.set(gid, usage)
    }
  }

  return sections
}

export function buildEditMeta(tag, tags) {
  const t = tag || {}
  const list = Array.isArray(tags) ? tags : []
  const byId = new Map(list.map((x) => [safeId(x?.id), x]))

  if (t.kind === 'group') {
    const gid = safeId(t.id)
    let children = 0
    let usage = 0
    for (const x of list) {
      if (x?.kind !== 'tag') continue
      if (safeId(x?.parentId) !== gid) continue
      children += 1
      usage += Number(x?.useCount) || 0
    }
    return { children, usage }
  }

  // tag (child)
  const pid = safeId(t.parentId)
  const parent = pid ? byId.get(pid) : null
  return { children: 0, usage: Number(t?.useCount) || 0, parentName: safeStr(parent?.tagName).trim() }
}
