// src/features/hub/teamProfile/sharedLogic/videos/moduleLogic/teamVideos.filters.logic.js

import {
  VIDEO_SCOPE_OPTIONS,
  buildSeasonMonthOptions,
  createInitialVideosFilters,
  getMonthKeyLabel,
  getVideoMonthKey,
  resolveVideosFiltersDomain,
} from '../../../../sharedProfile/logic/videos/index.js'

export {
  VIDEO_SCOPE_OPTIONS,
  buildSeasonMonthOptions,
  getMonthKeyLabel,
  getVideoMonthKey,
}

export const createInitialTeamVideosFilters = createInitialVideosFilters

export function resolveTeamVideosFiltersDomain(entity, filters = {}, deps = {}) {
  return resolveVideosFiltersDomain(entity, filters, deps)
}
