// src/features/playersDatabase/services/write/searchIndex/player/playerSeasonIndex.scout.js

import { adaptPlayerScoutEngineResult } from '../../../../domain/index.js'
import { clean } from '../../leagues/leagueDoc.js'
import { uniqueCleanValues } from './playerSeasonIndex.identity.js'

const toNullableNumber = value => (
  Number.isFinite(Number(value))
    ? Number(value)
    : null
)

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
      .map(signal => signal?.profileId)
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
    profileCaseStrength: profilesRemoved
      ? null
      : player?.scoutProfileCaseStrength || null,
    opportunity,
  })
  const primaryProfile = scout.primaryProfile
  const secondaryProfile = scout.secondaryProfile
  const scoutProfileIds = scout.profileIds
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
  const transferContext = player?.scoutTransferContext || player?.scoutTrajectory?.latestTransfer || null

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
    scoutCombinationIds,
    scoutProfileSearchIds: buildScoutProfileSearchIds({
      scoutProfileIds,
      scoutCombinationIds,
    }),
  }
}
