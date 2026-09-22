// src/shared/scouting/players/profileCaseStrength/playerProfileCaseStrength.js

const unique = (values = []) => [...new Set(values.filter(Boolean))]

const resolvePrimaryStrength = (profileHierarchy = {}) => {
  const primarySignal = profileHierarchy.primarySignal || null

  return primarySignal?.profileStrength || null
}

export const buildPlayerProfileCaseStrength = ({
  signals = [],
  combinations = [],
  profileHierarchy = {},
} = {}) => {
  const safeSignals = Array.isArray(signals) ? signals : []
  const safeCombinations = Array.isArray(combinations) ? combinations : []
  const allProfileIds = unique(safeSignals.map((signal) => signal.profileId))
  const preliminaryProfileIds = Array.isArray(profileHierarchy.preliminaryProfileIds)
    ? profileHierarchy.preliminaryProfileIds
    : []
  const professionalProfileIds = Array.isArray(profileHierarchy.professionalProfileIds)
    ? profileHierarchy.professionalProfileIds
    : []
  const profileIds = unique(professionalProfileIds)
  const combinationIds = unique(safeCombinations.map((combination) => combination.id))

  return {
    primaryProfileId: profileHierarchy.primaryProfileId || '',
    primaryProfileStrength: resolvePrimaryStrength(profileHierarchy),
    profileCount: profileIds.length,
    profileIds,
    allProfileIds,
    professionalProfileIds,
    preliminaryProfileIds: Array.isArray(profileHierarchy.preliminaryProfileIds)
      ? profileHierarchy.preliminaryProfileIds
      : [],
    supportingProfileIds: Array.isArray(profileHierarchy.supportingProfileIds)
      ? profileHierarchy.supportingProfileIds
      : [],
    supportingEvidenceProfileIds: Array.isArray(profileHierarchy.supportingEvidenceProfileIds)
      ? profileHierarchy.supportingEvidenceProfileIds
      : [],
    opportunityProfileIds: Array.isArray(profileHierarchy.opportunityProfileIds)
      ? profileHierarchy.opportunityProfileIds
      : [],
    hasDefinedCombination: combinationIds.length > 0,
    combinationCount: combinationIds.length,
    combinationIds,
  }
}
