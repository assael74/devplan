// src/features/videoHub/sharedLogic/videoHubGeneralStats.logic.js

import {
  hasVideoPrimaryCategory,
  hasVideoTags,
  resolveVideoTaggingStatus,
  VIDEO_TAGGING_STATUS,
} from '../../../shared/video/index.js'

const safeArr = value => (Array.isArray(value) ? value : [])

export function buildVideoGeneralStats(items = []) {
  const arr = safeArr(items)

  return arr.reduce(
    (acc, video) => {
      const status = resolveVideoTaggingStatus(video)

      acc.total += 1

      if (status === VIDEO_TAGGING_STATUS.NEEDS_TAGGING) {
        acc.needsTagging += 1
      }

      if (status === VIDEO_TAGGING_STATUS.PARTIAL) {
        acc.partial += 1
      }

      if (!hasVideoPrimaryCategory(video)) {
        acc.withoutCategory += 1
      }

      if (!hasVideoTags(video)) {
        acc.withoutTags += 1
      }

      return acc
    },
    {
      total: 0,
      needsTagging: 0,
      partial: 0,
      withoutCategory: 0,
      withoutTags: 0,
    }
  )
}

export function buildVideoGeneralStatsChips(items = []) {
  const stats = buildVideoGeneralStats(items)

  return [
    {
      id: 'needs_tagging',
      label: 'דורש אפיון',
      count: stats.needsTagging,
      color: 'warning',
      filterPatch: { taggingStatus: VIDEO_TAGGING_STATUS.NEEDS_TAGGING },
    },
    {
      id: 'partial',
      label: 'אפיון חלקי',
      count: stats.partial,
      color: 'warning',
      filterPatch: { taggingStatus: VIDEO_TAGGING_STATUS.PARTIAL },
    },
    {
      id: 'without_category',
      label: 'ללא קטגוריה',
      count: stats.withoutCategory,
      color: 'warning',
      filterPatch: { onlyWithoutCategory: true },
    },
    {
      id: 'without_tags',
      label: 'ללא תגיות',
      count: stats.withoutTags,
      color: 'warning',
      filterPatch: { onlyWithoutTags: true },
    },
  ]
}
