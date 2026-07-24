// src/features/hub/teamProfile/sharedLogic/trainings/trainings.domain.logic.js

import { resolveTrainingsDomain } from '../../../sharedProfile/logic/trainings/index.js'

export function resolveTeamTrainingsDomain(team, filters = {}, deps = {}) {
  return resolveTrainingsDomain(team, filters, deps)
}
