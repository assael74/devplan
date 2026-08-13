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

const PROFILE_BY_ID = SCOUT_PROFILES.reduce((map, profile) => {
  map[profile.id] = profile
  return map
}, {})

const COMBINATION_BY_ID = SCOUT_PROFILE_COMBINATIONS.reduce((map, combination) => {
  map[combination.id] = combination
  return map
}, {})

export const createEmptyScoutReliability = () => ({
  level: '',
  score: null,
  label: '',
  factors: [],
})

export const createEmptyPlayerScoutProfile = () => ({
  id: '',
  label: '',
  group: '',
  interest: '',
  score: null,
  reliability: createEmptyScoutReliability(),
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
  scoutContext: null,
  spotlights: [],
  opportunity: null,
  requiredReview: [],
  matchedRules: [],
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
  reliability: createEmptyScoutReliability(),
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
  hasProfiles: false,
  hasCombination: false,
})

const resolveCatalogProfile = profileId => PROFILE_BY_ID[profileId] || null

const resolveCatalogCombination = combinationId => COMBINATION_BY_ID[combinationId] || null

const cleanReliabilityValue = value => {
  if (
    value === null ||
    value === undefined ||
    typeof value === 'object'
  ) {
    return ''
  }

  return cleanDomainValue(value)
}

export const normalizeScoutReliability = reliability => {
  const source = reliability && typeof reliability === 'object'
    ? reliability
    : {}

  return {
    level: cleanReliabilityValue(
      source.level ||
      source.reliabilityLevel ||
      source.profileReliability ||
      reliability
    ),
    score: toDomainNumber(
      source.score !== undefined ? source.score : source.reliabilityScore
    ),
    label: cleanReliabilityValue(source.label),
    factors: toDomainArray(source.factors),
  }
}

export const normalizePlayerScoutProfile = profile => {
  const source = profile && typeof profile === 'object' ? profile : {}
  const profileId = cleanDomainValue(source.profileId || source.id)
  const catalogProfile = resolveCatalogProfile(profileId) || {}
  const reliabilitySource = source.reliability || {
    level: source.reliabilityLevel || source.profileReliability,
    score: source.reliabilityScore,
    factors: source.reliabilityFactors,
  }

  return {
    ...createEmptyPlayerScoutProfile(),
    id: profileId,
    label: cleanDomainValue(
      source.profileLabel || source.label || catalogProfile.label || profileId
    ),
    group: cleanDomainValue(source.group || catalogProfile.group),
    interest: cleanDomainValue(
      source.interestLevel || source.interest || catalogProfile.interest
    ),
    score: toDomainNumber(
      source.score !== undefined ? source.score : source.profileScore
    ),
    reliability: normalizeScoutReliability(reliabilitySource),
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
    scoutContext: source.scoutContext && typeof source.scoutContext === 'object'
      ? source.scoutContext
      : null,
    spotlights: toDomainArray(source.spotlights),
    opportunity: source.opportunity && typeof source.opportunity === 'object'
      ? source.opportunity
      : null,
    requiredReview: toDomainArray(source.requiredReview || source.reviews),
    matchedRules: toDomainArray(source.matchedRules),
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
  )

  return {
    id: combinationId,
    idIcon: cleanDomainValue(source.idIcon || catalogCombination.idIcon),
    label: cleanDomainValue(source.label || catalogCombination.label || combinationId),
    group: cleanDomainValue(source.group || catalogCombination.group),
    interest: cleanDomainValue(source.interest || catalogCombination.interest),
    description: cleanDomainValue(
      source.description || catalogCombination.description
    ),
    profileIds,
  }
}

const buildDerivedCombinations = profiles => buildScoutProfileCombinations({
  signals: profiles.map(profile => ({ profileId: profile.id })),
}).map(normalizePlayerScoutCombination)

const mergeCombinations = ({ profiles, combinations, combinationIds }) => {
  const values = [
    ...toDomainArray(combinations),
    ...toDomainArray(combinationIds),
    ...buildDerivedCombinations(profiles),
  ].map(normalizePlayerScoutCombination)

  const seen = new Set()
  return values.filter(combination => {
    if (!combination.id || seen.has(combination.id)) return false
    seen.add(combination.id)
    return true
  })
}

const buildDisplay = ({ profiles, combinations }) => {
  const primaryProfile = profiles[0] || null
  const primaryCombination = combinations[0] || null

  if (primaryCombination) {
    return {
      type: 'combination',
      id: primaryCombination.id,
      label: primaryCombination.label,
      score: primaryProfile && primaryProfile.score !== undefined ? primaryProfile.score : null,
      reliability: primaryProfile?.reliability || createEmptyScoutReliability(),
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
    reliability: primaryProfile.reliability,
    baseProfiles: [],
  }
}

export const normalizePlayerScout = ({
  profiles = [],
  combinations = [],
  combinationIds = [],
  profileIds = [],
  searchIds = [],
} = {}) => {
  const normalizedProfiles = toDomainArray(profiles)
    .map(normalizePlayerScoutProfile)
    .filter(profile => profile.id)
  const normalizedCombinations = mergeCombinations({
    profiles: normalizedProfiles,
    combinations,
    combinationIds,
  })

  return {
    profiles: normalizedProfiles,
    profileIds: uniqueDomainValues([
      ...normalizedProfiles.map(profile => profile.id),
      ...toDomainArray(profileIds),
    ]),
    primaryProfile: normalizedProfiles[0] || null,
    secondaryProfile: normalizedProfiles[1] || null,
    combinations: normalizedCombinations,
    combinationIds: uniqueDomainValues([
      ...normalizedCombinations.map(combination => combination.id),
      ...toDomainArray(combinationIds),
    ]),
    searchIds: uniqueDomainValues(searchIds),
    primaryCombination: normalizedCombinations[0] || null,
    display: buildDisplay({
      profiles: normalizedProfiles,
      combinations: normalizedCombinations,
    }),
    hasProfiles: normalizedProfiles.length > 0,
    hasCombination: normalizedCombinations.length > 0,
  }
}
