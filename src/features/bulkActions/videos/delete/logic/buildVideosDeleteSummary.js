// src/features/bulkActions/videos/delete/logic/buildVideosDeleteSummary.js

import {
  VIDEO_TAGGING_STATUS,
} from '../../../../../shared/video/index.js'

const asArray = value => (Array.isArray(value) ? value : [])

const safeString = value => String(value ?? '').trim()

const getTaggingStatus = video => {
  return safeString(
    video?.taggingStatus ||
    video?.status
  )
}

const hasAssignment = video => {
  return Boolean(
    safeString(video?.objectType) ||
    safeString(video?.contextType) ||
    safeString(video?.teamId) ||
    safeString(video?.playerId) ||
    safeString(video?.meetingId)
  )
}

const hasPrimaryCategory = video => {
  return Boolean(
    safeString(video?.primaryCategory)
  )
}

export function buildVideosDeleteSummary(videos = []) {
  const rows = asArray(videos)

  return rows.reduce(
    (summary, video) => {
      const status = getTaggingStatus(video)

      summary.totalVideos += 1

      if (status === VIDEO_TAGGING_STATUS.NEEDS_TAGGING) {
        summary.needsTagging += 1
      }

      if (status === VIDEO_TAGGING_STATUS.PARTIAL) {
        summary.partial += 1
      }

      if (
        status &&
        status !== VIDEO_TAGGING_STATUS.NEEDS_TAGGING &&
        status !== VIDEO_TAGGING_STATUS.PARTIAL
      ) {
        summary.tagged += 1
      }

      if (hasAssignment(video)) {
        summary.assigned += 1
      }

      if (hasPrimaryCategory(video)) {
        summary.withCategory += 1
      }

      return summary
    },
    {
      totalVideos: 0,
      needsTagging: 0,
      partial: 0,
      tagged: 0,
      assigned: 0,
      withCategory: 0,
    }
  )
}
