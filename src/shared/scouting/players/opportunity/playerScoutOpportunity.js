// src/shared/scouting/players/opportunity/playerScoutOpportunity.js

import {
  PLAYER_SCOUT_EXPOSURE_LEVEL,
} from './playerOpportunity.model.js'

import {
  buildPlayerAutomaticImmediacy,
} from './playerAutomaticImmediacy.js'

import {
  buildPlayerManualImmediacy,
  resolvePlayerEffectiveImmediacy,
} from './playerManualImmediacy.js'

const EXPOSURE_RANK = {
  [PLAYER_SCOUT_EXPOSURE_LEVEL.UNKNOWN]: 0,
  [PLAYER_SCOUT_EXPOSURE_LEVEL.LOW]: 1,
  [PLAYER_SCOUT_EXPOSURE_LEVEL.MEDIUM]: 2,
  [PLAYER_SCOUT_EXPOSURE_LEVEL.HIGH]: 3,
}

const mergeUnique = (values = []) => {
  return [...new Set(values.filter(Boolean))]
}

const getExposureLevel = (signals = []) => {
  return signals.reduce((current, signal) => {
    const clubStrengthLevel = Number(
      signal?.metrics?.clubStrengthLevel || signal?.metrics?.clubLevel || 0
    )
    let incoming = PLAYER_SCOUT_EXPOSURE_LEVEL.UNKNOWN

    if (clubStrengthLevel > 0 && clubStrengthLevel <= 1.5) {
      incoming = PLAYER_SCOUT_EXPOSURE_LEVEL.HIGH
    } else if (clubStrengthLevel >= 2 && clubStrengthLevel <= 2.5) {
      incoming = PLAYER_SCOUT_EXPOSURE_LEVEL.MEDIUM
    } else if (clubStrengthLevel >= 3) {
      incoming = PLAYER_SCOUT_EXPOSURE_LEVEL.LOW
    }
    const currentRank = EXPOSURE_RANK[current] || 0
    const incomingRank = EXPOSURE_RANK[incoming] || 0

    return incomingRank > currentRank ? incoming : current
  }, PLAYER_SCOUT_EXPOSURE_LEVEL.UNKNOWN)
}

export const buildPlayerScoutOpportunity = ({
  signals = [],
  candidateSignals = [],
  combinations = [],
  profileCaseStrength = {},
  playerTrajectory = null,
  futureCompetitionPath = null,
  immediacyContext = {},
  currentSeasonKey = '',
  currentSeasonStatus = '',
  manualImmediacyDecision = null,
} = {}) => {
  const safeSignals = Array.isArray(signals) ? signals : []
  const safeCandidateSignals = Array.isArray(candidateSignals) ? candidateSignals : []
  const automaticImmediacy = buildPlayerAutomaticImmediacy({
    signals: safeSignals,
    candidateSignals: safeCandidateSignals,
    combinations,
    profileCaseStrength,
    playerTrajectory,
    futureCompetitionPath,
    immediacyContext,
    currentSeasonKey,
    currentSeasonStatus,
  })
  const manualImmediacy = buildPlayerManualImmediacy({
    decision: manualImmediacyDecision,
  })
  const effectiveImmediacy = resolvePlayerEffectiveImmediacy({
    automaticImmediacy,
    manualImmediacy,
  })

  return {
    effectiveActionStatus: effectiveImmediacy.effectiveActionStatus,
    baseActionStatus: automaticImmediacy.baseActionStatus,
    automaticActionStatus: automaticImmediacy.automaticActionStatus,
    manualActionStatus: effectiveImmediacy.manualActionStatus,
    hasManualDecision: effectiveImmediacy.hasManualDecision,
    profilesRemoved: effectiveImmediacy.profilesRemoved,
    manualDecision: manualImmediacy,
    source: automaticImmediacy.source,
    boostScore: automaticImmediacy.boostScore,
    reductionScore: automaticImmediacy.reductionScore,
    netScore: automaticImmediacy.netScore,
    boosts: automaticImmediacy.boosts,
    reductions: automaticImmediacy.reductions,
    signalPersistence: automaticImmediacy.signalPersistence,
    exposureLevel: getExposureLevel(safeSignals),
    reasons: [
      ...automaticImmediacy.boosts.map(boost => boost.id),
      ...automaticImmediacy.reductions.map(reduction => reduction.id),
    ],
    profileIds: mergeUnique(safeSignals.map(signal => signal.profileId)),
    candidateProfileIds: mergeUnique(safeCandidateSignals.map(signal => signal.profileId)),
    bestProfileId: profileCaseStrength.primaryProfileId || safeSignals[0]?.profileId || '',
  }
}
