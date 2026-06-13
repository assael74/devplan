// src/features/bulkActions/videos/delete/logic/buildVideosDeletePlan.js

import {
  VIDEOS_DELETE_SCOPE,
} from '../configs/videosDelete.config.js'

import {
  resolveVideosDeleteScope,
} from './resolveVideosDeleteScope.js'

import {
  buildVideosDeleteSummary,
} from './buildVideosDeleteSummary.js'

import {
  validateVideosDeletePlan,
} from './validateVideosDeletePlan.js'

const getVideoId = video => {
  return video?.id || video?.videoId || ''
}

export function buildVideosDeletePlan(params = {}) {
  const {
    videos = [],
    selectedVideoIds = [],
    scope = VIDEOS_DELETE_SCOPE.SELECTED,
  } = params

  const scopedVideos = resolveVideosDeleteScope({
    scope,
    videos,
    selectedVideoIds,
  })

  const videoIds = scopedVideos
    .map(getVideoId)
    .filter(Boolean)

  const summary = buildVideosDeleteSummary(scopedVideos)

  const basePlan = {
    scope,
    videoIds,
    videos: scopedVideos,
    summary,
    warnings: [],
    blockers: [],
  }

  const validation = validateVideosDeletePlan(basePlan)

  return {
    ...basePlan,
    warnings: validation.warnings,
    blockers: validation.blockers,
    isValid: validation.isValid,
  }
}
