// src/features/playersDatabase/services/write/searchIndex/player/playerSeasonIndex.scout.js

import { adaptPlayerScoutEngineResult } from '../../../../domain/index.js'
import { clean } from '../../leagues/leagueDoc.js'
import { uniqueCleanValues } from './playerSeasonIndex.identity.js'

const toNullableNumber = value => (
  Number.isFinite(Number(value))
    ? Number(value)
    : null
)

const REMOVED_SCOUT_PROFILE_IDS = new Set([
  'single_engine',
  'lineup_banker',
  'pro_anchor',
])

export const normalizeScoutSignalsForIndex = player => {
  const scoutSignals = Array.isArray(player?.scoutSignals)
    ? player.scoutSignals
    : []

  const scoutProfiles = Array.isArray(player?.scoutProfiles)
    ? player.scoutProfiles
    : []

  const sourceProfiles = scoutSignals.length > 0
    ? scoutSignals
    : scoutProfiles

  return sourceProfiles
    .filter(profile => clean(profile?.profileId || profile?.id))
    .map(profile => ({
      ...profile,
      profileId: clean(profile.profileId || profile.id),
      profileStrength: profile.profileStrength || null,
      score: toNullableNumber(profile.score),
    }))
}

export const buildScoutProfileIds = scoutSignals => (
  uniqueCleanValues(
    (Array.isArray(scoutSignals) ? scoutSignals : [])
      .map(signal => clean(signal?.profileId))
      .filter(profileId => !REMOVED_SCOUT_PROFILE_IDS.has(profileId))
  )
)

export const buildScoutCombinationIds = ({
  scoutSignals = [],
  scoutCombinations = [],
} = {}) => adaptPlayerScoutEngineResult({
  signals: Array.isArray(scoutSignals) ? scoutSignals : [],
  combinations: Array.isArray(scoutCombinations) ? scoutCombinations : [],
}).combinationIds

export const buildScoutProfileSearchIds = ({
  scoutProfileIds = [],
  scoutCombinationIds = [],
} = {}) => uniqueCleanValues([
  ...scoutProfileIds,
  ...scoutCombinationIds,
])

const buildProfileIndexFields = ({ prefix, profile }) => ({
  [`${prefix}ScoutProfileId`]: clean(profile?.id),
  [`${prefix}ScoutProfileStrengthDepthPct`]: toNullableNumber(
    profile?.profileStrength?.depthPct
  ),
  [`${prefix}ScoutWarnings`]: uniqueCleanValues(profile?.warnings),
  [`${prefix}ScoutScore`]: toNullableNumber(profile?.score),
})

export const buildPlayerScoutIndexFields = player => {
  const opportunity = player?.scoutOpportunity || null
  const scoutSignals = opportunity?.profilesRemoved === true
    ? []
    : normalizeScoutSignalsForIndex(player)
  const profilesRemoved = opportunity?.profilesRemoved === true
  const scout = adaptPlayerScoutEngineResult({
    signals: scoutSignals,
    combinations: profilesRemoved
      ? []
      : Array.isArray(player?.scoutCombinations)
        ? player.scoutCombinations
        : [],
    scoutEvidence: profilesRemoved
      ? []
      : Array.isArray(player?.scoutEvidence)
        ? player.scoutEvidence
        : [],
    profileCaseStrength: profilesRemoved
      ? null
      : player?.scoutProfileCaseStrength || null,
    profileHierarchy: profilesRemoved
      ? null
      : player?.scoutProfileHierarchy || null,
    opportunity,
  })
  const primaryProfile = scout.primaryProfile
  const secondaryProfile = scout.secondaryProfile
  const signalPreliminaryProfileIds = scoutSignals
    .filter(signal => (
      clean(signal?.profileIdentity || signal?.identity).toLowerCase() === 'preliminary'
    ))
    .map(signal => clean(signal?.profileId || signal?.id))
    .filter(Boolean)
  const scoutPreliminaryProfileIds = uniqueCleanValues([
    ...(Array.isArray(scout?.preliminaryProfileIds)
      ? scout.preliminaryProfileIds
      : []),
    ...(Array.isArray(scout?.profileHierarchy?.preliminaryProfileIds)
      ? scout.profileHierarchy.preliminaryProfileIds
      : []),
    ...signalPreliminaryProfileIds,
  ])
  const preliminaryProfileIdSet = new Set(scoutPreliminaryProfileIds)
  const scoutProfileIds = uniqueCleanValues(scout.profileIds)
    .filter(profileId => !preliminaryProfileIdSet.has(profileId))
  const scoutCombinationIds = scout.combinationIds
  const nearestProfile = opportunity?.profilesRemoved === true
    ? null
    : (
        player?.scoutProfileProgression?.nearestProfile ||
        (Array.isArray(player?.scoutCandidateSignals)
          ? player.scoutCandidateSignals[0]
          : null)
      )

  return {
    ...buildProfileIndexFields({
      prefix: 'primary',
      profile: primaryProfile,
    }),
    primaryScoutInterestLevel: clean(primaryProfile?.interest),
    primaryScoutTeamGateMode: clean(
      primaryProfile?.scoutContext?.teamGate?.mode
    ),
    nearScoutProfileId: clean(nearestProfile?.profileId),
    nearScoutProfileDistancePct: toNullableNumber(nearestProfile?.distancePct),
    nearScoutProfileTrend: clean(nearestProfile?.trend),
    scoutEffectiveImmediacyStatus: clean(opportunity?.effectiveActionStatus),
    scoutEngineVersion: clean(player?.scoutEngineVersion),
    ...buildProfileIndexFields({
      prefix: 'secondary',
      profile: secondaryProfile,
    }),
    scoutProfileIds,
    scoutPreliminaryProfileIds,
    scoutCombinationIds,
    scoutProfileSearchIds: buildScoutProfileSearchIds({
      scoutProfileIds,
      scoutCombinationIds,
    }),
  }
}
