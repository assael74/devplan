// src/features/playersDatabase/domain/contracts/playerScout.contract.js

import {
  buildScoutProfileCombinations,
  SCOUT_PROFILE_COMBINATIONS,
  SCOUT_PROFILES,
} from '../../../../shared/scouting/players/index.js'
import {
  cleanDomainValue,
  toDomainArray,
  toDomainNumber,
  uniqueDomainValues,
} from './domainValue.contract.js'
import {
  buildPlayerScoutStatsLoadMeasurementHistoryEvents,
  buildPlayerScoutStatsLoadMeasurementsFromHistory,
  normalizePlayerScoutStatsLoadMeasurementHistory,
  normalizePlayerScoutStatsLoadMeasurements,
} from '../../model/playerScoutMeasurement.model.js'

const PROFILE_BY_ID = SCOUT_PROFILES.reduce((map, profile) => {
  map[profile.id] = profile
  return map
}, {})

const ACTIVE_PROFILE_ID_SET = new Set(SCOUT_PROFILES.map(profile => profile.id))

const COMBINATION_BY_ID = SCOUT_PROFILE_COMBINATIONS.reduce((map, combination) => {
  map[combination.id] = combination
  return map
}, {})

const ACTIVE_COMBINATION_ID_SET = new Set(
  SCOUT_PROFILE_COMBINATIONS.map(combination => combination.id)
)

export const createEmptyPlayerScoutProfile = () => ({
  id: '',
  label: '',
  shortLabel: '',
  group: '',
  profileIdentity: '',
  classificationState: '',
  sourcePreliminaryProfileId: '',
  reclassifiedToProfileId: '',
  reclassificationReason: '',
  score: null,
  match: {
    passed: false,
    passedRules: [],
    failedRules: [],
    reasons: [],
  },
  metrics: {},
  reviews: [],
  warnings: [],
  positionContext: '',
  profileDepth: null,
  profileStrength: null,
  profileConfidence: null,
  scoutContext: null,
  spotlights: [],
  requiredReview: [],
  matchEvidence: [],
  source: {
    engineVersion: '',
    calculatedAt: null,
  },
})

export const createEmptyPlayerScoutDisplay = () => ({
  type: 'none',
  id: '',
  label: '',
  score: null,
  baseProfiles: [],
})

export const createEmptyPlayerScout = () => ({
  profiles: [],
  profileIds: [],
  primaryProfile: null,
  secondaryProfile: null,
  combinations: [],
  combinationIds: [],
  searchIds: [],
  primaryCombination: null,
  display: createEmptyPlayerScoutDisplay(),
  candidateSignals: [],
  spotlights: [],
  verification: null,
  profileProgression: null,
  profileHierarchy: null,
  profileCaseStrength: null,
  playerInterest: null,
  playerReview: null,
  trajectory: null,
  transferContext: null,
  futureCompetitionPath: null,
  engineVersion: '',
  statsLoadMeasurements: normalizePlayerScoutStatsLoadMeasurements(),
  statsLoadMeasurementHistory: [],
  statsLoadMeasurementHistoryEvents: [],
  hasProfiles: false,
  hasCombination: false,
})

const resolveCatalogProfile = profileId => PROFILE_BY_ID[profileId] || null

const resolveCatalogCombination = combinationId => COMBINATION_BY_ID[combinationId] || null

export const normalizePlayerScoutProfile = profile => {
  const source = profile && typeof profile === 'object' ? profile : {}
  const profileId = cleanDomainValue(source.profileId || source.id)
  const catalogProfile = resolveCatalogProfile(profileId) || {}
  return {
    ...createEmptyPlayerScoutProfile(),
    id: profileId,
    label: cleanDomainValue(
      source.profileLabel || source.label || catalogProfile.label || profileId
    ),
    shortLabel: cleanDomainValue(
      source.profileShortLabel || source.shortLabel || catalogProfile.shortLabel
    ),
    group: cleanDomainValue(source.group || catalogProfile.group),
    profileIdentity: cleanDomainValue(
      source.profileIdentity || source.identity || catalogProfile.profileIdentity
    ),
    classificationState: cleanDomainValue(source.classificationState),
    sourcePreliminaryProfileId: cleanDomainValue(source.sourcePreliminaryProfileId),
    reclassifiedToProfileId: cleanDomainValue(source.reclassifiedToProfileId),
    reclassificationReason: cleanDomainValue(source.reclassificationReason),
    score: toDomainNumber(
      source.score !== undefined ? source.score : source.profileScore
    ),
    match: {
      passed: source.passed !== undefined ? Boolean(source.passed) : true,
      passedRules: toDomainArray(source.passedRules || source.match?.passedRules),
      failedRules: toDomainArray(source.failedRules || source.match?.failedRules),
      reasons: toDomainArray(source.reasons || source.match?.reasons),
    },
    metrics: source.metrics && typeof source.metrics === 'object'
      ? source.metrics
      : {},
    reviews: toDomainArray(source.reviews || catalogProfile.reviews),
    warnings: toDomainArray(source.warnings || source.profileWarnings || catalogProfile.warnings),
    positionContext: cleanDomainValue(source.positionContext),
    profileDepth: source.profileDepth && typeof source.profileDepth === 'object'
      ? source.profileDepth
      : null,
    profileStrength: (
      source.profileStrength && typeof source.profileStrength === 'object'
        ? source.profileStrength
        : source.strength && typeof source.strength === 'object'
          ? source.strength
          : null
    ),
    profileConfidence: (
      source.profileConfidence && typeof source.profileConfidence === 'object'
        ? source.profileConfidence
        : source.confidence && typeof source.confidence === 'object'
          ? source.confidence
          : null
    ),
    scoutContext: source.scoutContext && typeof source.scoutContext === 'object'
      ? source.scoutContext
      : null,
    spotlights: toDomainArray(source.spotlights),
    requiredReview: toDomainArray(source.requiredReview || source.reviews),
    matchEvidence: toDomainArray(source.matchEvidence),
    source: {
      engineVersion: cleanDomainValue(
        source.engineVersion || source.source?.engineVersion
      ),
      calculatedAt: source.calculatedAt || source.source?.calculatedAt || null,
    },
  }
}

export const normalizePlayerScoutCombination = combination => {
  const source = combination && typeof combination === 'object'
    ? combination
    : { id: combination }
  const combinationId = cleanDomainValue(source.combinationId || source.id)
  const catalogCombination = resolveCatalogCombination(combinationId) || {}
  const profileIds = uniqueDomainValues(
    source.matchedProfileIds || source.profileIds || catalogCombination.profileIds
  ).filter(profileId => ACTIVE_PROFILE_ID_SET.has(profileId))
  return {
    id: combinationId,
    idIcon: cleanDomainValue(source.idIcon || catalogCombination.idIcon),
    label: cleanDomainValue(source.label || catalogCombination.label || combinationId),
    group: cleanDomainValue(source.group || catalogCombination.group),
    description: cleanDomainValue(
      source.description || catalogCombination.description
    ),
    profileIds,
  }
}

const buildDerivedCombinations = ({ profiles }) => (
  buildScoutProfileCombinations({
    signals: profiles.map(profile => ({ profileId: profile.id })),
  }).map(normalizePlayerScoutCombination)
)

const mergeCombinations = ({
  profiles,
  combinations,
  combinationIds,
}) => {
  const profileIdSet = new Set(profiles.map(profile => profile.id))
  const values = [
    ...toDomainArray(combinations),
    ...toDomainArray(combinationIds),
    ...buildDerivedCombinations({
      profiles,
    }),
  ].map(normalizePlayerScoutCombination)

  const seen = new Set()
  return values.filter(combination => {
    if (
      !combination.id ||
      !ACTIVE_COMBINATION_ID_SET.has(combination.id) ||
      seen.has(combination.id)
    ) return false

    const catalogCombination = resolveCatalogCombination(combination.id)
    if (catalogCombination) {
      const requiredProfileIds = toDomainArray(catalogCombination.profileIds)
      const profilesMatch = requiredProfileIds.every(profileId => profileIdSet.has(profileId))

      if (!profilesMatch) return false
    }

    seen.add(combination.id)
    return true
  })
}

const buildDisplay = ({ primaryProfile, combinations }) => {
  const primaryCombination = combinations[0] || null

  if (primaryCombination) {
    return {
      type: 'combination',
      id: primaryCombination.id,
      label: primaryCombination.label,
      score: primaryProfile && primaryProfile.score !== undefined ? primaryProfile.score : null,
      profileStrength: primaryProfile?.profileStrength || null,
      baseProfiles: primaryCombination.profileIds.map(profileId => ({
        id: profileId,
        label: cleanDomainValue(PROFILE_BY_ID[profileId]?.label || profileId),
      })),
    }
  }

  if (!primaryProfile) return createEmptyPlayerScoutDisplay()

  return {
    type: 'profile',
    id: primaryProfile.id,
    label: primaryProfile.label,
    score: primaryProfile.score,
    profileStrength: primaryProfile.profileStrength || null,
    baseProfiles: [],
  }
}

export const normalizePlayerScout = ({
  profiles = [],
  combinations = [],
  combinationIds = [],
  profileIds = [],
  preliminaryProfileIds = [],
  searchIds = [],
  candidateSignals = [],
  evidence = [],
  spotlights = [],
  opportunity = null,
  verification = null,
  profileProgression = null,
  profileHierarchy = null,
  profileCaseStrength = null,
  playerInterest = null,
  playerReview = null,
  trajectory = null,
  transferContext = null,
  futureCompetitionPath = null,
  engineVersion = '',
  statsLoadMeasurements = null,
  statsLoadMeasurementHistory = [],
} = {}) => {
  const normalizedProfiles = toDomainArray(profiles)
    .map(normalizePlayerScoutProfile)
    .filter(profile => profile.id && ACTIVE_PROFILE_ID_SET.has(profile.id))
  const normalizedMeasurementHistory = normalizePlayerScoutStatsLoadMeasurementHistory(
    statsLoadMeasurementHistory
  )
  const normalizedMeasurements = normalizePlayerScoutStatsLoadMeasurements(
    statsLoadMeasurements
  )
  const resolvedMeasurements = normalizedMeasurements.current || normalizedMeasurements.previous
    ? normalizedMeasurements
    : buildPlayerScoutStatsLoadMeasurementsFromHistory(normalizedMeasurementHistory)

  const normalizedHierarchy = profileHierarchy && typeof profileHierarchy === 'object'
    ? profileHierarchy
    : null
  const hierarchyPrimaryProfileId = cleanDomainValue(normalizedHierarchy?.primaryProfileId)
  const signalPreliminaryProfileIds = toDomainArray(profiles)
    .filter(profile => (
      cleanDomainValue(profile?.profileIdentity || profile?.identity).toLowerCase() === 'preliminary'
    ))
    .map(profile => cleanDomainValue(profile?.profileId || profile?.id))
    .filter(Boolean)
  const resolvedPreliminaryProfileIds = uniqueDomainValues([
    ...toDomainArray(preliminaryProfileIds),
    ...toDomainArray(normalizedHierarchy?.preliminaryProfileIds),
    ...signalPreliminaryProfileIds,
  ])
  const preliminaryProfileIdSet = new Set(resolvedPreliminaryProfileIds)
  const suppressedProfileIds = uniqueDomainValues(
    normalizedHierarchy?.suppressedProfileIds
  )
  const suppressedProfileIdSet = new Set(suppressedProfileIds)
  const activeProfiles = normalizedProfiles.filter(profile => (
    !suppressedProfileIdSet.has(profile.id)
  ))
  const activeProfileIdSet = new Set(activeProfiles.map(profile => profile.id))
  const hierarchyProfessionalProfileIds = uniqueDomainValues(
    normalizedHierarchy?.professionalProfileIds
  ).filter(profileId => activeProfileIdSet.has(profileId))
  const hierarchyPrimaryProfile = activeProfiles.find(profile => (
    profile.id === hierarchyPrimaryProfileId &&
    profile.profileIdentity === 'core' &&
    !preliminaryProfileIdSet.has(profile.id)
  )) || null
  const fallbackPrimaryProfile = activeProfiles.find(profile => (
    profile.profileIdentity === 'core' &&
    !preliminaryProfileIdSet.has(profile.id)
  )) || null
  const primaryProfile = hierarchyPrimaryProfile || fallbackPrimaryProfile
  const primaryProfileId = primaryProfile?.id || ''
  const hierarchySecondaryProfile = hierarchyProfessionalProfileIds
    .filter(profileId => profileId !== primaryProfileId)
    .map(profileId => activeProfiles.find(profile => profile.id === profileId))
    .find(profile => (
      profile?.profileIdentity === 'core' &&
      !preliminaryProfileIdSet.has(profile.id)
    )) || null
  const fallbackSecondaryProfile = activeProfiles.find(profile => (
    profile.id !== primaryProfileId &&
    profile.profileIdentity === 'core' &&
    !preliminaryProfileIdSet.has(profile.id)
  )) || null
  const secondaryProfile = hierarchySecondaryProfile || fallbackSecondaryProfile
  const normalizedCombinations = mergeCombinations({
    profiles: activeProfiles,
    combinations,
    combinationIds,
  })

  return {
    profiles: normalizedProfiles,
    profileIds: uniqueDomainValues([
      ...activeProfiles.map(profile => profile.id),
      ...toDomainArray(profileIds).filter(profileId => (
        ACTIVE_PROFILE_ID_SET.has(profileId) &&
        !suppressedProfileIdSet.has(profileId)
      )),
    ]),
    preliminaryProfileIds: resolvedPreliminaryProfileIds,
    primaryProfile,
    secondaryProfile,
    combinations: normalizedCombinations,
    combinationIds: uniqueDomainValues(
      normalizedCombinations.map(combination => combination.id)
    ),
    searchIds: uniqueDomainValues(searchIds),
    primaryCombination: normalizedCombinations[0] || null,
    display: buildDisplay({
      primaryProfile,
      combinations: normalizedCombinations,
    }),
    candidateSignals: toDomainArray(candidateSignals),
    evidence: toDomainArray(evidence),
    spotlights: toDomainArray(spotlights),
    opportunity: opportunity && typeof opportunity === 'object'
      ? opportunity
      : null,
    verification: verification && typeof verification === 'object'
      ? verification
      : null,
    profileProgression: profileProgression && typeof profileProgression === 'object'
      ? profileProgression
      : null,
    profileHierarchy: normalizedHierarchy,
    profileCaseStrength: profileCaseStrength && typeof profileCaseStrength === 'object'
      ? profileCaseStrength
      : null,
    playerInterest: playerInterest && typeof playerInterest === 'object'
      ? playerInterest
      : null,
    playerReview: playerReview && typeof playerReview === 'object'
      ? playerReview
      : null,
    trajectory: trajectory && typeof trajectory === 'object'
      ? trajectory
      : null,
    transferContext: transferContext && typeof transferContext === 'object'
      ? transferContext
      : null,
    futureCompetitionPath: futureCompetitionPath && typeof futureCompetitionPath === 'object'
      ? futureCompetitionPath
      : null,
    engineVersion: cleanDomainValue(engineVersion),
    statsLoadMeasurements: resolvedMeasurements,
    statsLoadMeasurementHistory: normalizedMeasurementHistory,
    statsLoadMeasurementHistoryEvents: buildPlayerScoutStatsLoadMeasurementHistoryEvents(
      normalizedMeasurementHistory
    ),
    hasProfiles: normalizedProfiles.length > 0,
    hasCombination: normalizedCombinations.length > 0,
  }
}
