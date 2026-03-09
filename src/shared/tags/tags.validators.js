// src/shared/tags/tags.validators.js
import { safeStr, safeId } from './tags.normalize'

const normalizeKind = (v) => (safeStr(v).trim() === 'group' ? 'group' : 'tag')

export function validateTagDraft(draft) {
  const d = draft || {}
  const errors = {}

  const name = safeStr(d.tagName).trim()
  const type = safeStr(d.tagType).trim()
  const kind = normalizeKind(d.kind)

  if (!name) errors.tagName = kind === 'group' ? 'חובה שם קטגוריה' : 'חובה שם תג'
  if (!type) errors.tagType = 'חובה סוג תג'

  const notes = safeStr(d.notes).trim()
  if (notes && notes.length > 20) errors.notes = 'עד 20 תווים'

  const parentId = safeId(d.parentId)
  const selfId = safeId(d.id)

  if (kind === 'tag') {
    if (!parentId) errors.parentId = 'חובה לבחור קטגוריה (תג אב)'
    if (parentId && parentId === selfId) errors.parentId = 'תג לא יכול להיות הורה של עצמו'
  } else {
    // group
    if (parentId) errors.parentId = 'קטגוריה לא יכולה להיות תחת הורה'
  }

  return { ok: Object.keys(errors).length === 0, errors }
}
