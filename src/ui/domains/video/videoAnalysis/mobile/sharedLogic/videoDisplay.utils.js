// ui/domains/video/videoAnalysis/mobile/sharedLogic/videoDisplay.utils.js

const safe = (value) => (value == null ? '' : String(value))

export function getVideoTitle(video, fallback = 'קטע וידאו') {
  return safe(video?.name || video?.title || fallback)
}

export function getVideoDateLabel(video, fallback = '—') {
  return safe(video?.monthLabel || fallback)
}

export function getVideoTagLabel(tag, fallback = 'תג') {
  return safe(tag?.tagName || tag?.label || tag?.name || fallback)
}

export function getVideoNotes(video) {
  return safe(video?.notes || '')
}

export function getVideoHasNotes(video) {
  return getVideoNotes(video).trim().length > 0
}

export function getVisibleVideoTags(video, limit = 4) {
  const tags = Array.isArray(video?.tagsFull) ? video.tagsFull : []
  return tags.slice(0, limit)
}

export function getExtraVideoTagsCount(video, limit = 4) {
  const tags = Array.isArray(video?.tagsFull) ? video.tagsFull : []
  return Math.max(tags.length - limit, 0)
}
