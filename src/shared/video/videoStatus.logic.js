//  src/shared/videos/videoStatus.logic.js

const safeArr = value => (Array.isArray(value) ? value : value ? [value] : [])

export const VIDEO_TAGGING_STATUS = {
  NEEDS_TAGGING: 'needs_tagging',
  PARTIAL: 'partial',
  TAGGED: 'tagged',
}

export const VIDEO_TAGGING_STATUS_LABEL = {
  [VIDEO_TAGGING_STATUS.NEEDS_TAGGING]: 'דורש אפיון',
  [VIDEO_TAGGING_STATUS.PARTIAL]: 'אפיון חלקי',
  [VIDEO_TAGGING_STATUS.TAGGED]: 'מאופיין',
}

export function resolveVideoTaggingStatus(video) {
  const hasPrimaryCategory = Boolean(video?.primaryCategoryId)
  const hasTags = safeArr(video?.tagIds).filter(Boolean).length > 0

  if (!hasPrimaryCategory && !hasTags) {
    return VIDEO_TAGGING_STATUS.NEEDS_TAGGING
  }

  if (!hasPrimaryCategory || !hasTags) {
    return VIDEO_TAGGING_STATUS.PARTIAL
  }

  return VIDEO_TAGGING_STATUS.TAGGED
}

export function getVideoTaggingStatusLabel(status) {
  return VIDEO_TAGGING_STATUS_LABEL[status] || VIDEO_TAGGING_STATUS_LABEL.needs_tagging
}

export function hasVideoPrimaryCategory(video) {
  return Boolean(video?.primaryCategoryId)
}

export function hasVideoTags(video) {
  return safeArr(video?.tagIds).filter(Boolean).length > 0
}

export function getVideoMissingTaggingLabels(video) {
  const out = []

  if (!hasVideoPrimaryCategory(video)) out.push('ללא קטגוריה')
  if (!hasVideoTags(video)) out.push('ללא תגיות')

  return out
}
