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
  const profileCaseStrength = profilesRemoved
    ? null
    : player?.scoutProfileCaseStrength || null
  const nextBestCheck = player?.scoutVerification?.nextBestCheck || null
  const isRealTransferContext = value => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return false
    }

    const fromClubId = clean(value.fromClubId)
    const toClubId = clean(value.toClubId)

    return Boolean(
      fromClubId &&
      toClubId &&
      fromClubId !== toClubId
    )
  }

  const transferContext = isRealTransferContext(player?.scoutTransferContext)
    ? player.scoutTransferContext
    : isRealTransferContext(player?.scoutTrajectory?.latestTransfer)
      ? player.scoutTrajectory.latestTransfer
      : null

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
    scoutBaseImmediacyStatus: clean(opportunity?.baseActionStatus) || 'watch',
    scoutAutomaticImmediacyStatus: clean(opportunity?.automaticActionStatus) || 'watch',
    scoutManualImmediacyStatus: clean(opportunity?.manualActionStatus),
    scoutHasManualImmediacyDecision: Boolean(opportunity?.hasManualDecision),
    scoutImmediacyBoostScore: toNullableNumber(opportunity?.boostScore) || 0,
    scoutImmediacyBoostIds: uniqueCleanValues(
      (Array.isArray(opportunity?.boosts) ? opportunity.boosts : [])
        .map(boost => boost?.id)
    ),
    scoutImmediacyReductionScore: toNullableNumber(opportunity?.reductionScore) || 0,
    scoutImmediacyReductionIds: uniqueCleanValues(
      (Array.isArray(opportunity?.reductions) ? opportunity.reductions : [])
        .map(reduction => reduction?.id)
    ),
    scoutImmediacyNetScore: toNullableNumber(opportunity?.netScore) || 0,
    scoutProfilePersistenceSeasons: Number(
      opportunity?.signalPersistence?.profileRepeat?.seasons
    ) || 0,
    scoutCombinationPersistenceSeasons: Number(
      opportunity?.signalPersistence?.combinationRepeat?.seasons
    ) || 0,
    scoutSignalDecaySeasons: Number(
      opportunity?.signalPersistence?.decay?.seasonsWithoutSignal
    ) || 0,
    scoutSignalDecayLastSeasonKey: clean(
      opportunity?.signalPersistence?.decay?.lastSignalSeasonKey
    ),
    scoutProfileCaseStrengthProfileCount: Number(profileCaseStrength?.profileCount) || 0,
    scoutProfileCaseHasCombination: Boolean(profileCaseStrength?.hasDefinedCombination),
    scoutProfileCaseCombinationIds: uniqueCleanValues(
      profileCaseStrength?.combinationIds
    ),
    scoutExposureLevel: clean(opportunity?.exposureLevel),
    scoutNextBestCheckId: clean(nextBestCheck?.questionId),
    scoutEngineVersion: clean(player?.scoutEngineVersion),
    scoutTransferMoveType: clean(transferContext?.moveType),
    scoutTransferDirection: clean(transferContext?.direction),
    scoutTransferFromClubId: clean(transferContext?.fromClubId),
    scoutTransferToClubId: clean(transferContext?.toClubId),
    scoutTransferSameSeason: Boolean(transferContext?.sameSeason),
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
