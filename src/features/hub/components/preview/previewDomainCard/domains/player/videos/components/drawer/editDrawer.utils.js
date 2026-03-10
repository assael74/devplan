// previewDomainCard/domains/Player/videos/components/drawer/editDrawer.utils.js

export const safe = (v) => (v == null ? '' : String(v))

const asArr = (v) => (Array.isArray(v) ? v : [])

export function buildInitialDraft(video) {
  const source = video || {}

  return {
    id: source?.id || '',
    name: safe(source?.name).trim(),
    notes: safe(source?.notes).trim(),
    link: safe(source?.link || '').trim(),
    month: source?.month ?? '',
    year: source?.year ?? '',
    tagIds: asArr(source?.tagIds).filter(Boolean),
    raw: source,
  }
}

export function buildPatch(draft, initial) {
  const next = {}

  if (draft.name !== initial.name) next.name = draft.name || ''
  if (draft.notes !== initial.notes) next.notes = draft.notes || ''
  if (draft.link !== initial.link) next.link = draft.link || ''
  if (draft.month !== initial.month) next.month = draft.month === '' ? '' : Number(draft.month)
  if (draft.year !== initial.year) next.year = draft.year === '' ? '' : Number(draft.year)

  const nextTags = Array.isArray(draft.tagIds) ? draft.tagIds : []
  const prevTags = Array.isArray(initial.tagIds) ? initial.tagIds : []

  if (JSON.stringify(nextTags) !== JSON.stringify(prevTags)) {
    next.tagIds = nextTags
  }

  return next
}

export function getIsDirty(draft, initial) {
  return (
    draft.name !== initial.name ||
    draft.notes !== initial.notes ||
    draft.link !== initial.link ||
    draft.month !== initial.month ||
    draft.year !== initial.year ||
    JSON.stringify(draft.tagIds || []) !== JSON.stringify(initial.tagIds || [])
  )
}
