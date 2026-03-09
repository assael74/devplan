// ui/domains/tags/hooks/useTagPickerOptions.js
import { useMemo } from 'react'

const safeId = (v) => String(v ?? '').trim()
const safeLabel = (v) => String(v ?? '').trim()

const normalizeType = (v) => {
  const t = String(v ?? '').trim().toLowerCase()

  if (t === 'analysis' || t === 'general') return t

  if (t === 'videoanalysis' || t === 'analysisvideo') return 'analysis'
  if (t === 'videogeneral' || t === 'videageneral' || t === 'generalvideo') return 'general'

  return 'general'
}

function buildBucket({ allOptions, selectedIds, scopeType }) {
  const scoped = allOptions.filter((t) => normalizeType(t?.tagType) === scopeType)

  const tagsById = new Map()
  scoped.forEach((t) => {
    const id = safeId(t?.id)
    if (id) tagsById.set(id, t)
  })

  const ids = (Array.isArray(selectedIds) ? selectedIds : []).map(safeId).filter(Boolean)
  const selectedTags = ids.map((id) => tagsById.get(id)).filter(Boolean)

  const groupsById = new Map()
  scoped.forEach((t) => {
    if (t?.kind === 'group') {
      const id = safeId(t?.id)
      if (!id) return
      groupsById.set(id, safeLabel(t?.tagName || t?.slug || 'קטגוריה'))
    }
  })

  const sel = new Set(ids)
  const availableOptions = scoped
    .filter((t) => t?.kind === 'tag')
    .filter((t) => !sel.has(safeId(t?.id)))
    .map((t) => ({
      ...t,
      groupName: groupsById.get(safeId(t?.parentId)) || 'ללא קטגוריה',
    }))

  return { scopedOptions: scoped, tagsById, selectedTags, groupsById, availableOptions }
}

export function useTagPickerOptions({ options, selectedIds }) {
  const allOptions = useMemo(() => (Array.isArray(options) ? options : []), [options])

  const buckets = useMemo(() => {
    return {
      analysis: buildBucket({ allOptions, selectedIds, scopeType: 'analysis' }),
      general: buildBucket({ allOptions, selectedIds, scopeType: 'general' }),
    }
  }, [allOptions, selectedIds])

  return buckets
}
