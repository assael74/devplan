// src/features/hub/playerProfile/sharedLogic/trainings/trainings.domain.logic.js

import { resolveTrainingsDomain } from '../../../sharedProfile/logic/trainings/index.js'

export function resolvePlayerTrainingsDomain(player, filters = {}, deps = {}) {
  return resolveTrainingsDomain(player, filters, deps)
}
