// features/playersDatabase/domain/adapters/playerScoutEngine.adapter.js

import { normalizePlayerScout } from '../contracts/playerScout.contract.js'

export const adaptPlayerScoutEngineResult = (result = {}) => {
  const signals = Array.isArray(result.signals) ? result.signals : []
  const combinations = Array.isArray(result.combinations) ? result.combinations : []

  return normalizePlayerScout({
    profiles: signals,
    combinations,
    profileIds: signals.map(signal => signal?.profileId).filter(Boolean),
    combinationIds: combinations
      .map(combination => combination?.combinationId || combination?.id)
      .filter(Boolean),
  })
}
