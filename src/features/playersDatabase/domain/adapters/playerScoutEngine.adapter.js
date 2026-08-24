// src/features/playersDatabase/domain/adapters/playerScoutEngine.adapter.js

import { normalizePlayerScout } from '../contracts/playerScout.contract.js'

export const adaptPlayerScoutEngineResult = (result = {}) => {
  const signals = Array.isArray(result.signals) ? result.signals : []
  const combinations = Array.isArray(result.combinations) ? result.combinations : []
  const trajectory = result.playerTrajectory || result.trajectory || null

  return normalizePlayerScout({
    profiles: signals,
    combinations,
    profileIds: signals.map(signal => signal?.profileId).filter(Boolean),
    combinationIds: combinations
      .map(combination => combination?.combinationId || combination?.id)
      .filter(Boolean),
    candidateSignals: result.candidateSignals,
    evidence: result.scoutEvidence,
    spotlights: result.spotlights,
    opportunity: result.opportunity,
    verification: result.verification,
    profileProgression: result.profileProgression,
    profileHierarchy: result.profileHierarchy,
    profileCaseStrength: result.profileCaseStrength,
    playerInterest: result.playerInterest,
    playerReview: result.playerReview,
    futureCompetitionPath: result.futureCompetitionPath,
    trajectory,
    transferContext: result.transferContext || trajectory?.latestTransfer || null,
    engineVersion: result.engineVersion,
  })
}
