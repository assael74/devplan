// ui/domains/video/videoAnalysis/mobile/sharedLogic/videoDisplay.utils.js

const safe = (value) => (value == null ? '' : String(value))

export function getVideoDateLabel(video, fallback = '—') {
  const monthLabel = safe(video?.monthLabel)
  if (monthLabel) return monthLabel

  const ym = safe(video?.ym)
  if (!ym) return safe(fallback)

  return formatYmToHebrewLabel(ym, fallback)
}

function formatYmToHebrewLabel(value, fallback = '—') {
  const raw = safe(value)
  if (!raw) return safe(fallback)

  const normalized = raw
    .replace('/', '-')
    .replace('_', '-')
    .trim()

  let year = ''
  let month = ''

  if (/^\d{4}-\d{1,2}$/.test(normalized)) {
    const parts = normalized.split('-')
    year = parts[0]
    month = parts[1]
  } else if (/^\d{1,2}-\d{4}$/.test(normalized)) {
    const parts = normalized.split('-')
    month = parts[0]
    year = parts[1]
  } else if (/^\d{6}$/.test(normalized)) {
    year = normalized.slice(0, 4)
    month = normalized.slice(4, 6)
  } else {
    return raw
  }

  const monthNumber = Number(month)

  if (!year || !Number.isFinite(monthNumber) || monthNumber < 1 || monthNumber > 12) {
    return raw
  }

  const monthNames = [
    '',
    'ינואר',
    'פברואר',
    'מרץ',
    'אפריל',
    'מאי',
    'יוני',
    'יולי',
    'אוגוסט',
    'ספטמבר',
    'אוקטובר',
    'נובמבר',
    'דצמבר',
  ]

  return `${monthNames[monthNumber]} ${year}`
}

export function getVideoTitle(video, fallback = 'קטע וידאו') {
  return safe(video?.name || video?.title || fallback)
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
