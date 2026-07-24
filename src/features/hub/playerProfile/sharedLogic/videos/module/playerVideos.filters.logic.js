// src/features/hub/playerProfile/sharedLogic/videos/module/playerVideos.filters.logic.js

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

export const createInitialPlayerVideosFilters = createInitialVideosFilters

export function resolvePlayerVideosFiltersDomain(entity, filters = {}, deps = {}) {
  return resolveVideosFiltersDomain(entity, filters, deps)
}
