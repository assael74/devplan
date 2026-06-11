//  src/shared/videos/videoNormalize.logic.js

import { getVideoPrimaryCategory } from './videoCategories.constants.js'
import { resolveVideoTaggingStatus } from './videoStatus.logic.js'

const safeStr = value => String(value ?? '').trim()
const safeArr = value => (Array.isArray(value) ? value : value ? [value] : [])

export function normalizeVideoCategoryIds(video = {}) {
  const primaryCategoryId = safeStr(video.primaryCategoryId)
  const baseIds = safeArr(video.categoryIds)
    .map(safeStr)
    .filter(Boolean)

  if (!primaryCategoryId) return baseIds

  return Array.from(new Set([primaryCategoryId, ...baseIds]))
}

export function getVideoTitle(video = {}) {
  return safeStr(video.title || video.name) || 'וידאו'
}

export function getVideoDescription(video = {}) {
  return safeStr(video.description || video.notes || video.comment)
}

export function getVideoLink(video = {}) {
  return safeStr(video.videoUrl || video.link || video.videoLink || video.url)
}

export function getVideoThumbnail(video = {}) {
  return safeStr(video.thumbnailUrl || video.thumbnail || video.thumb)
}

export function normalizeVideoForUi(video = {}) {
  const primaryCategoryId = safeStr(video.primaryCategoryId)
  const primaryCategory = getVideoPrimaryCategory(primaryCategoryId)
  const categoryIds = normalizeVideoCategoryIds(video)
  const tagIds = safeArr(video.tagIds || video.tags)
    .map(safeStr)
    .filter(Boolean)

  const normalized = {
    ...video,
    title: getVideoTitle(video),
    description: getVideoDescription(video),
    videoUrl: getVideoLink(video),
    thumbnailUrl: getVideoThumbnail(video),
    primaryCategoryId: primaryCategoryId || null,
    primaryCategory,
    categoryIds,
    tagIds,
  }

  return {
    ...normalized,
    taggingStatus: resolveVideoTaggingStatus(normalized),
  }
}
