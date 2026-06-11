// src/shared/videos/videoSort.logic.js

import { VIDEO_TAGGING_STATUS, resolveVideoTaggingStatus } from './videoStatus.logic.js'

const toMs = value => {
  if (!value) return 0
  if (typeof value === 'number') return value
  if (value?.seconds) return value.seconds * 1000
  if (typeof value?.toMillis === 'function') return value.toMillis()

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const statusRank = status => {
  if (status === VIDEO_TAGGING_STATUS.NEEDS_TAGGING) return 0
  if (status === VIDEO_TAGGING_STATUS.PARTIAL) return 1
  return 2
}

export const VIDEO_SORT_OPTIONS = [
  { id: 'needs_tagging_first', label: 'דורש אפיון תחילה' },
  { id: 'updated_desc', label: 'עודכן לאחרונה' },
  { id: 'created_desc', label: 'נוצר לאחרונה' },
  { id: 'title_asc', label: 'שם' },
]

export function sortVideosNeedsTaggingFirst(items = []) {
  return [...items].sort((a, b) => {
    const ar = statusRank(resolveVideoTaggingStatus(a))
    const br = statusRank(resolveVideoTaggingStatus(b))

    if (ar !== br) return ar - br

    const au = toMs(a?.updatedAt) || toMs(a?.createdAt)
    const bu = toMs(b?.updatedAt) || toMs(b?.createdAt)

    return bu - au
  })
}

export function sortVideosByOption(items = [], sortId = 'needs_tagging_first') {
  const arr = Array.isArray(items) ? [...items] : []

  if (sortId === 'needs_tagging_first') {
    return sortVideosNeedsTaggingFirst(arr)
  }

  if (sortId === 'created_desc') {
    return arr.sort((a, b) => toMs(b?.createdAt) - toMs(a?.createdAt))
  }

  if (sortId === 'title_asc') {
    return arr.sort((a, b) =>
      String(a?.title || a?.name || '').localeCompare(
        String(b?.title || b?.name || ''),
        'he'
      )
    )
  }

  return arr.sort((a, b) => {
    const au = toMs(a?.updatedAt) || toMs(a?.createdAt)
    const bu = toMs(b?.updatedAt) || toMs(b?.createdAt)

    return bu - au
  })
}
