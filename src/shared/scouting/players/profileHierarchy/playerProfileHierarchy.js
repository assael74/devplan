// src/shared/scouting/players/profileHierarchy/playerProfileHierarchy.js

import {
  SCOUT_PROFILE_IDENTITY,
} from '../ids.js'

import {
  isProfessionalScoutProfile,
} from '../profiles.js'

import {
  resolvePlayerProfileRelationships,
} from './playerProfileRelationships.js'

const resolveProfileIdentity = signal => (
  signal?.profileIdentity || signal?.identity || SCOUT_PROFILE_IDENTITY.CORE
)

const isCoreProfileSignal = signal => (
  resolveProfileIdentity(signal) === SCOUT_PROFILE_IDENTITY.CORE
)

const isPreliminaryProfileSignal = signal => (
  resolveProfileIdentity(signal) === SCOUT_PROFILE_IDENTITY.PRELIMINARY
)

const getProfileDepth = (signal) => {
  const depth = Number(signal?.profileDepth?.depth)
  return Number.isFinite(depth) ? depth : 0
}

const getLegacyScore = (signal) => {
  const score = Number(signal?.score)
  return Number.isFinite(score) ? score : 0
}

export const comparePlayerScoutSignalsByHierarchy = (a, b) => {
  const depthDiff = getProfileDepth(b) - getProfileDepth(a)

  if (depthDiff) return depthDiff

  return getLegacyScore(b) - getLegacyScore(a)
}

export const buildPlayerProfileHierarchy = ({ signals } = {}) => {
  const relationships = resolvePlayerProfileRelationships({ signals })
  const rankedSignals = [...relationships.activeSignals]
    .sort(comparePlayerScoutSignalsByHierarchy)
  const coreSignals = rankedSignals.filter(isCoreProfileSignal)
  const professionalSignals = rankedSignals.filter(isProfessionalScoutProfile)
  const preliminarySignals = rankedSignals.filter(isPreliminaryProfileSignal)
  const supportingEvidenceSignals = rankedSignals.filter(signal => (
    resolveProfileIdentity(signal) === SCOUT_PROFILE_IDENTITY.SUPPORTING
  ))
  const opportunitySignals = rankedSignals.filter(signal => (
    resolveProfileIdentity(signal) === SCOUT_PROFILE_IDENTITY.OPPORTUNITY
  ))
  const orderedSignals = [
    ...coreSignals,
    ...preliminarySignals,
    ...supportingEvidenceSignals,
    ...opportunitySignals,
  ]
  const primarySignal = orderedSignals.find(isCoreProfileSignal) || null
  const primaryPreliminarySignal = preliminarySignals[0] || null
  const primaryProfileId = primarySignal?.profileId || ''
  const supportingSignals = orderedSignals.filter(signal => (
    signal?.profileId !== primaryProfileId &&
    resolveProfileIdentity(signal) !== SCOUT_PROFILE_IDENTITY.PRELIMINARY
  ))

  return {
    primaryProfileId,
    primarySignal,
    primaryProfileIdentity: primarySignal
      ? resolveProfileIdentity(primarySignal)
      : '',
    professionalProfileIds: professionalSignals.map((signal) => signal.profileId),
    preliminaryProfileIds: preliminarySignals.map((signal) => signal.profileId),
    preliminarySignals,
    primaryPreliminaryProfileId: primaryPreliminarySignal?.profileId || '',
    primaryPreliminarySignal,
    supportingProfileIds: supportingSignals.map((signal) => signal.profileId),
    supportingSignals,
    supportingEvidenceProfileIds: supportingEvidenceSignals.map((signal) => signal.profileId),
    supportingEvidenceSignals,
    opportunityProfileIds: opportunitySignals.map((signal) => signal.profileId),
    opportunitySignals,
    orderedProfileIds: orderedSignals.map((signal) => signal.profileId),
    suppressedProfileIds: relationships.suppressedProfileIds,
    exclusiveFamilyWinners: relationships.exclusiveFamilyWinners,
  }
}
