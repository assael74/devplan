// src/features/hub/playerProfile/sharedLogic/videos/module/playerVideos.domain.logic.js

import {
  getMonthKey,
  getMonthLabel,
  resolveVideosDomain,
} from '../../../../sharedProfile/logic/videos/index.js'

export { getMonthKey, getMonthLabel }

export function resolvePlayerVideosDomain(entity, filters = {}, deps = {}) {
  return resolveVideosDomain(entity, filters, deps)
}
