// src/features/playersDatabase/domain/statsV2/playerDocumentScout.projection.js

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const toNullableNumber = value => {
  if (value === undefined || value === null || value === '') return null

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const toNumberOrDefault = (value, fallback) => {
  const number = toNullableNumber(value)
  return number === null ? fallback : number
}

const compactDefined = value => {
  if (value === undefined) return undefined

  if (Array.isArray(value)) {
    return value
      .map(compactDefined)
      .filter(item => item !== undefined)
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).reduce((result, [key, item]) => {
      const compacted = compactDefined(item)
      if (compacted !== undefined) result[key] = compacted
      return result
    }, {})
  }

  return value
}

const compactArray = value => (
  Array.isArray(value)
    ? value.map(compactDefined).filter(item => item !== undefined)
    : []
)

const compactIds = value => (
  Array.isArray(value)
    ? value.map(clean).filter(Boolean)
    : []
)

const buildCompactScoutProfiles = player => {
  const profiles = Array.isArray(player?.scoutProfiles)
    ? player.scoutProfiles
    : []

  return profiles
    .map(profile => {
      const strength = profile?.profileStrength || profile?.strength || {}
      const confidence = profile?.profileConfidence || profile?.confidence || {}

      return {
        profileId: clean(profile?.profileId || profile?.id),
        profileIdentity: clean(profile?.profileIdentity || profile?.identity),
        strength: {
          depthPct: toNullableNumber(strength.depthPct),
          baseDepthPct: toNullableNumber(strength.baseDepthPct),
          contextAdjustmentPct: toNullableNumber(strength.contextAdjustmentPct),
        },
        confidence: {
          level: clean(confidence.level),
          reason: clean(confidence.reason),
        },
        reasons: compactArray(profile?.reasons),
      }
    })
    .filter(profile => profile.profileId)
}

const buildCompactEvaluation = value => {
  if (!value || typeof value !== 'object') return null

  const id = clean(value.id)
  if (!id) return null

  return {
    id,
    result: clean(value.result),
    points: toNumberOrDefault(value.points, 0),
    reason: clean(value.reason),
    profileId: clean(value.profileId),
    details: value.details && typeof value.details === 'object'
      ? compactDefined(value.details)
      : {},
  }
}

const buildCompactSignalPersistence = value => {
  const source = value && typeof value === 'object' ? value : {}

  return {
    profileRepeat: compactDefined(source.profileRepeat || {}),
    combinationRepeat: compactDefined(source.combinationRepeat || {}),
    attackingOutputUpgrade: compactDefined(source.attackingOutputUpgrade || {}),
    decay: compactDefined(source.decay || {}),
    reasons: compactArray(source.reasons),
  }
}

const buildCompactScoutOpportunity = value => {
  if (!value || typeof value !== 'object') return null

  return {
    effectiveActionStatus: clean(value.effectiveActionStatus),
    baseActionStatus: clean(value.baseActionStatus),
    automaticActionStatus: clean(value.automaticActionStatus),
    manualActionStatus: clean(value.manualActionStatus),
    hasManualDecision: value.hasManualDecision === true,
    profilesRemoved: value.profilesRemoved === true,
    manualDecision: value.manualDecision && typeof value.manualDecision === 'object'
      ? compactDefined(value.manualDecision)
      : null,
    source: clean(value.source),
    exposureLevel: clean(value.exposureLevel),
    boostScore: toNumberOrDefault(value.boostScore, 0),
    reductionScore: toNumberOrDefault(value.reductionScore, 0),
    netScore: toNullableNumber(value.netScore),
    evaluations: (Array.isArray(value.evaluations) ? value.evaluations : [])
      .map(buildCompactEvaluation)
      .filter(Boolean),
    signalPersistence: buildCompactSignalPersistence(value.signalPersistence),
  }
}

const buildCompactScoutProfileProgression = value => {
  if (!value || typeof value !== 'object') return null

  return {
    distances: (Array.isArray(value.distances) ? value.distances : [])
      .map(item => ({
        profileId: clean(item?.profileId),
        distancePct: toNullableNumber(item?.distancePct),
        status: clean(item?.status),
        matched: item?.matched === true,
      }))
      .filter(item => item.profileId),
  }
}

const buildCompactScoutProfileHierarchy = value => {
  if (!value || typeof value !== 'object') return null

  const winners = value.exclusiveFamilyWinners && typeof value.exclusiveFamilyWinners === 'object'
    ? value.exclusiveFamilyWinners
    : {}

  return {
    primaryProfileId: clean(value.primaryProfileId),
    primaryPreliminaryProfileId: clean(value.primaryPreliminaryProfileId),
    primaryProfileIdentity: clean(value.primaryProfileIdentity),
    professionalProfileIds: compactIds(value.professionalProfileIds),
    supportingProfileIds: compactIds(value.supportingProfileIds),
    supportingEvidenceProfileIds: compactIds(value.supportingEvidenceProfileIds),
    opportunityProfileIds: compactIds(value.opportunityProfileIds),
    preliminaryProfileIds: compactIds(value.preliminaryProfileIds),
    orderedProfileIds: compactIds(value.orderedProfileIds),
    suppressedProfileIds: compactIds(value.suppressedProfileIds),
    exclusiveFamilyWinners: {
      goal_output: clean(winners.goal_output),
    },
  }
}

const buildCompactScoutPlayerInterest = value => {
  if (!value || typeof value !== 'object') return null

  return {
    interestLevel: clean(value.interestLevel),
    score: toNumberOrDefault(value.score, 0),
    maxScore: toNumberOrDefault(value.maxScore, 8),
    factors: compactArray(value.factors),
    reasons: compactArray(value.reasons),
    limitingFactors: compactArray(value.limitingFactors),
  }
}

const buildCompactScoutCombinationIds = player => {
  if (Array.isArray(player?.scoutCombinations)) {
    return compactIds(player.scoutCombinations.map(combination => combination?.id))
  }

  const source = Array.isArray(player?.scoutCombinationIds) && player.scoutCombinationIds.length > 0
    ? player.scoutCombinationIds
    : player?.combinationIds

  return compactIds(source)
}

export const buildStatsPlayerDocumentScoutSnapshot = player => ({
  scoutProfiles: buildCompactScoutProfiles(player),
  scoutCombinationIds: buildCompactScoutCombinationIds(player),
  scoutOpportunity: buildCompactScoutOpportunity(player?.scoutOpportunity),
  scoutProfileProgression: buildCompactScoutProfileProgression(
    player?.scoutProfileProgression
  ),
  scoutProfileHierarchy: buildCompactScoutProfileHierarchy(
    player?.scoutProfileHierarchy
  ),
  scoutPlayerInterest: buildCompactScoutPlayerInterest(player?.scoutPlayerInterest),
  scoutEngineVersion: clean(player?.scoutEngineVersion),
})
