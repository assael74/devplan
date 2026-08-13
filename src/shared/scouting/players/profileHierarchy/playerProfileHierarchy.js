// src/shared/scouting/players/profileHierarchy/playerProfileHierarchy.js

const INTEREST_RANK = {
  super_interesting: 3,
  interesting: 2,
  reasonable: 1,
}

const getInterestRank = (signal) => INTEREST_RANK[signal?.interestLevel] || 0

const getProfileDepth = (signal) => {
  const depth = Number(signal?.profileDepth?.depth)
  return Number.isFinite(depth) ? depth : 0
}

const getReliabilityScore = (signal) => {
  const score = Number(signal?.reliability?.score)
  return Number.isFinite(score) ? score : 0
}

const getLegacyScore = (signal) => {
  const score = Number(signal?.score)
  return Number.isFinite(score) ? score : 0
}

export const comparePlayerScoutSignalsByHierarchy = (a, b) => {
  const interestDiff = getInterestRank(b) - getInterestRank(a)

  if (interestDiff) return interestDiff

  const depthDiff = getProfileDepth(b) - getProfileDepth(a)

  if (depthDiff) return depthDiff

  const reliabilityDiff = getReliabilityScore(b) - getReliabilityScore(a)

  if (reliabilityDiff) return reliabilityDiff

  return getLegacyScore(b) - getLegacyScore(a)
}

export const buildPlayerProfileHierarchy = ({ signals } = {}) => {
  const orderedSignals = Array.isArray(signals)
    ? [...signals].sort(comparePlayerScoutSignalsByHierarchy)
    : []
  const primarySignal = orderedSignals[0] || null

  return {
    primaryProfileId: primarySignal?.profileId || '',
    primarySignal,
    supportingProfileIds: orderedSignals.slice(1).map((signal) => signal.profileId),
    supportingSignals: orderedSignals.slice(1),
    orderedProfileIds: orderedSignals.map((signal) => signal.profileId),
  }
}
