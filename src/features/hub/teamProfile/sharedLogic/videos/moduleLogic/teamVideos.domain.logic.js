// src/features/hub/teamProfile/sharedLogic/videos/moduleLogic/teamVideos.domain.logic.js

import {
  getMonthKey,
  getMonthLabel,
  resolveVideosDomain,
} from '../../../../domain/videos/index.js'

export { getMonthKey, getMonthLabel }

export function resolveTeamVideosDomain(entity, filters = {}, deps = {}) {
  return resolveVideosDomain(entity, filters, deps)
}
