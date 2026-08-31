// src/features/playersDatabase/domain/narrative/narrativeScoutContract.js

import { SCOUT_REVIEW } from '../../../../shared/scouting/players/ids.js'

export const NARRATIVE_SCOUT_CONTRACT_VERSION = 3

const clean = value => String(value || '').trim()

const toNullableNumber = value => {
  if (value === null || value === undefined || value === '') return null

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const toArray = value => Array.isArray(value) ? value : []

const buildProfile = profile => {
  if (!profile || typeof profile !== 'object') return null

  const id = clean(profile.id || profile.profileId)
  if (!id) return null

  return {
    id,
    label: clean(profile.label || profile.profileLabel),
    group: clean(profile.group),
    profileIdentity: clean(profile.profileIdentity || profile.identity).toLowerCase(),
    score: toNullableNumber(profile.score),
    profileStrength: profile.profileStrength && typeof profile.profileStrength === 'object'
      ? profile.profileStrength
      : null,
    profileDepth: profile.profileDepth && typeof profile.profileDepth === 'object'
      ? profile.profileDepth
      : null,
    matchEvidence: toArray(profile.matchEvidence),
    requiredReview: toArray(profile.requiredReview || profile.reviews),
    warnings: toArray(profile.warnings),
    positionContext: clean(profile.positionContext),
    scoutContext: profile.scoutContext && typeof profile.scoutContext === 'object'
      ? profile.scoutContext
      : null,
  }
}


const orderProfiles = ({ profiles, hierarchy }) => {
  const orderedIds = Array.isArray(hierarchy?.orderedProfileIds)
    ? hierarchy.orderedProfileIds.map(clean).filter(Boolean)
    : []
  const primaryProfileId = clean(hierarchy?.primaryProfileId)
  const supportingIds = Array.isArray(hierarchy?.supportingProfileIds)
    ? hierarchy.supportingProfileIds.map(clean).filter(Boolean)
    : []
  const preferredIds = orderedIds.length
    ? orderedIds
    : [primaryProfileId, ...supportingIds].filter(Boolean)

  if (!preferredIds.length) return profiles

  const byId = new Map(profiles.map(profile => [profile.id, profile]))
  const ordered = preferredIds.map(id => byId.get(id)).filter(Boolean)
  const included = new Set(ordered.map(profile => profile.id))

  return [
    ...ordered,
    ...profiles.filter(profile => !included.has(profile.id)),
  ]
}

const resolveNearProfileLabel = ({ progression, candidateSignals }) => {
  const nearest = progression?.nearestProfile || null
  const profileId = clean(nearest?.profileId || nearest?.id)
  if (!profileId) return ''

  const candidate = toArray(candidateSignals).find(signal => (
    clean(signal?.profileId || signal?.id) === profileId
  ))

  return clean(candidate?.profileLabel || candidate?.label)
}

const buildNearProfile = ({ progression, candidateSignals }) => {
  const nearest = progression?.nearestProfile || null
  if (!nearest || typeof nearest !== 'object') return null

  const profileId = clean(nearest.profileId || nearest.id)
  if (!profileId) return null

  return {
    profileId,
    profileLabel: resolveNearProfileLabel({
      progression,
      candidateSignals,
    }),
    distance: toNullableNumber(nearest.distance),
    distancePct: toNullableNumber(nearest.distancePct),
    status: clean(nearest.status),
    trend: clean(nearest.trend),
    distanceDelta: toNullableNumber(nearest.distanceDelta),
    distanceDeltaPct: toNullableNumber(nearest.distanceDeltaPct),
  }
}

const buildImmediacy = opportunity => {
  const source = opportunity && typeof opportunity === 'object' ? opportunity : {}
  const manualDecision = source.manualDecision && typeof source.manualDecision === 'object'
    ? source.manualDecision
    : null

  return {
    effectiveActionStatus: clean(source.effectiveActionStatus),
    automatic: {
      baseActionStatus: clean(source.baseActionStatus),
      actionStatus: clean(source.automaticActionStatus),
      source: clean(source.source),
      boostScore: toNullableNumber(source.boostScore),
      reductionScore: toNullableNumber(source.reductionScore),
      netScore: toNullableNumber(source.netScore),
      boosts: toArray(source.boosts),
      reductions: toArray(source.reductions),
      evaluations: toArray(source.evaluations),
      exposureLevel: clean(source.exposureLevel),
    },
    manual: {
      hasDecision: Boolean(source.hasManualDecision || manualDecision?.hasDecision),
      actionStatus: clean(source.manualActionStatus || manualDecision?.actionStatus),
      reason: clean(manualDecision?.reason),
      note: clean(manualDecision?.note),
      decidedAt: manualDecision?.decidedAt || null,
      seasonKey: clean(manualDecision?.seasonKey),
      profileIds: toArray(manualDecision?.profileIds),
    },
  }
}

const buildPersistence = opportunity => {
  const source = opportunity?.signalPersistence && typeof opportunity.signalPersistence === 'object'
    ? opportunity.signalPersistence
    : {}

  return {
    profile: source.profileRepeat && typeof source.profileRepeat === 'object'
      ? source.profileRepeat
      : null,
    combination: source.combinationRepeat && typeof source.combinationRepeat === 'object'
      ? source.combinationRepeat
      : null,
    signalDecay: source.decay && typeof source.decay === 'object'
      ? source.decay
      : null,
    reasons: toArray(source.reasons),
  }
}


const isFullStatsLoadMeasurement = measurement => {
  if (!measurement || typeof measurement !== 'object') return false

  const loadType = clean(measurement.loadType)
  if (loadType && loadType !== 'full_stats_load') return false

  return Boolean(
    clean(measurement.snapshotKey) &&
    clean(measurement.engineVersion) &&
    Array.isArray(measurement.profileStates)
  )
}

const buildClosingGap = ({ progression, measurements }) => {
  const nearest = progression?.nearestProfile || null
  const previous = measurements?.previous || null
  const current = measurements?.current || null
  const trend = clean(nearest?.trend)
  const hasFullStatsPair = isFullStatsLoadMeasurement(previous) &&
    isFullStatsLoadMeasurement(current)

  if (!nearest || !hasFullStatsPair || !trend || trend === 'unknown') return null

  return {
    profileId: clean(nearest.profileId || nearest.id),
    profileLabel: clean(nearest.profileLabel || nearest.label),
    status: clean(nearest.status),
    trend,
    previousDistance: toNullableNumber(nearest.previousDistance),
    previousDistancePct: toNullableNumber(nearest.previousDistancePct),
    distance: toNullableNumber(nearest.distance),
    distancePct: toNullableNumber(nearest.distancePct),
    distanceDelta: toNullableNumber(nearest.distanceDelta),
    distanceDeltaPct: toNullableNumber(nearest.distanceDeltaPct),
    basedOn: 'two_full_stats_loads',
    previousCapturedAt: previous.capturedAt || null,
    currentCapturedAt: current.capturedAt || null,
  }
}

const buildOpenQuestions = ({ verification, playerReview, profiles }) => {
  const questions = []

  toArray(profiles).forEach(profile => {
    if (!toArray(profile?.requiredReview).includes(SCOUT_REVIEW.PROFILE_RELEVANCE)) return

    const profileId = clean(profile?.id || profile?.profileId)
    if (profileId) questions.push(`${SCOUT_REVIEW.PROFILE_RELEVANCE}:${profileId}`)
  })
  const missingChecks = toArray(verification?.missingChecks)

  missingChecks.forEach(check => {
    const value = clean(check?.questionId || check?.id || check)
    if (value) questions.push(value)
  })

  const nextBestCheck = clean(
    verification?.nextBestCheck?.questionId ||
    verification?.nextBestCheck?.id ||
    verification?.nextBestCheck
  )
  if (nextBestCheck) questions.push(nextBestCheck)

  if (playerReview && typeof playerReview === 'object') {
    Object.entries(playerReview).forEach(([field, review]) => {
      const status = clean(review?.status || review?.value).toLowerCase()
      if (!status || status === 'unknown') questions.push(field)
    })
  }

  return [...new Set(questions)]
}

export const buildNarrativeScoutContract = (scout = {}) => {
  const source = scout && typeof scout === 'object' ? scout : {}
  const profiles = orderProfiles({
    profiles: toArray(source.profiles)
      .map(buildProfile)
      .filter(Boolean),
    hierarchy: source.profileHierarchy,
  })
  const progression = source.profileProgression && typeof source.profileProgression === 'object'
    ? source.profileProgression
    : null
  const verification = source.verification && typeof source.verification === 'object'
    ? source.verification
    : null
  const playerReview = source.playerReview && typeof source.playerReview === 'object'
    ? source.playerReview
    : null
  const measurements = source.statsLoadMeasurements && typeof source.statsLoadMeasurements === 'object'
    ? source.statsLoadMeasurements
    : null

  const hierarchy = source.profileHierarchy && typeof source.profileHierarchy === 'object'
    ? source.profileHierarchy
    : {}
  const primaryProfileId = clean(hierarchy.primaryProfileId)
  const primaryProfile = primaryProfileId
    ? profiles.find(profile => profile.id === primaryProfileId) || null
    : null
  const resolveProfilesByIds = ids => toArray(ids)
    .map(clean)
    .filter(Boolean)
    .map(profileId => profiles.find(profile => profile.id === profileId) || null)
    .filter(Boolean)
  const supportingProfiles = resolveProfilesByIds(hierarchy.supportingProfileIds)
  const professionalProfiles = resolveProfilesByIds(hierarchy.professionalProfileIds)
  const opportunityProfiles = resolveProfilesByIds(hierarchy.opportunityProfileIds)
  const preliminaryProfiles = resolveProfilesByIds(hierarchy.preliminaryProfileIds)

  return {
    contractVersion: NARRATIVE_SCOUT_CONTRACT_VERSION,
    profiles: {
      primary: primaryProfile,
      supporting: supportingProfiles,
      professional: professionalProfiles,
      opportunity: opportunityProfiles,
      preliminary: preliminaryProfiles,
      near: buildNearProfile({
        progression,
        candidateSignals: source.candidateSignals,
      }),
    },
    profileCaseStrength: source.profileCaseStrength && typeof source.profileCaseStrength === 'object'
      ? source.profileCaseStrength
      : null,
    scoutEvidence: toArray(source.evidence),
    playerInterest: source.playerInterest && typeof source.playerInterest === 'object'
      ? source.playerInterest
      : null,
    immediacy: buildImmediacy(source.opportunity),
    persistence: buildPersistence(source.opportunity),
    progression,
    trajectory: source.trajectory && typeof source.trajectory === 'object'
      ? source.trajectory
      : null,
    transferContext: source.transferContext && typeof source.transferContext === 'object'
      ? source.transferContext
      : null,
    measurements,
    measurementEvents: toArray(source.statsLoadMeasurementHistoryEvents),
    closingGap: buildClosingGap({
      progression,
      measurements,
    }),
    futureCompetition: source.futureCompetitionPath && typeof source.futureCompetitionPath === 'object'
      ? source.futureCompetitionPath
      : null,
    playerReview,
    verification,
    openQuestions: buildOpenQuestions({
      verification,
      playerReview,
      profiles,
    }),
    engineVersion: clean(source.engineVersion),
  }
}
