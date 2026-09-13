import { clean, toNumber } from './playerScoutView.utils.js'
import {
  isCoreProfile,
  resolveProfileId,
  resolveProfileLabel,
} from './playerScoutProfileIdentity.js'
import {
  buildNearWhyView,
  buildWhyView,
  formatProfileDepth,
} from './playerScoutEvidence.view.js'

const buildProfileItem = (profile, hierarchySignal = null, role = 'supporting') => {
  if (!profile && !hierarchySignal) return null

  const source = profile || hierarchySignal
  const depthPct = toNumber(
    source?.profileDepth?.depthPct !== undefined
      ? source.profileDepth.depthPct
      : source?.profileStrength?.depthPct !== undefined
        ? source.profileStrength.depthPct
        : hierarchySignal?.profileDepth?.depthPct !== undefined
          ? hierarchySignal.profileDepth.depthPct
          : hierarchySignal?.profileStrength?.depthPct
  )

  return {
    id: resolveProfileId(source),
    label: resolveProfileLabel(source),
    role,
    depthPct,
    depthLabel: depthPct === null ? '' : formatProfileDepth(depthPct),
    why: buildWhyView(source),
  }
}

export const buildProfilesView = scout => {
  const profiles = Array.isArray(scout?.profiles) ? scout.profiles : []
  const hierarchy = scout?.profileHierarchy && typeof scout.profileHierarchy === 'object'
    ? scout.profileHierarchy
    : {}
  const progression = scout?.profileProgression && typeof scout.profileProgression === 'object'
    ? scout.profileProgression
    : {}
  const byId = new Map(profiles.map(profile => [resolveProfileId(profile), profile]))
  const primaryProfileId = clean(hierarchy.primaryProfileId)
  const hierarchyPrimaryProfile = byId.get(primaryProfileId) || hierarchy.primarySignal || null
  const primaryProfile = isCoreProfile(hierarchyPrimaryProfile)
    ? hierarchyPrimaryProfile
    : profiles.find(isCoreProfile) || null
  const resolvedPrimaryId = resolveProfileId(primaryProfile)
  const orderedProfileIds = Array.isArray(hierarchy.orderedProfileIds)
    ? hierarchy.orderedProfileIds.map(clean).filter(Boolean)
    : []
  const supportingProfileIds = Array.isArray(hierarchy.supportingProfileIds)
    ? hierarchy.supportingProfileIds.map(clean).filter(Boolean)
    : []
  const preliminaryProfileIds = new Set([
    ...(Array.isArray(hierarchy.preliminaryProfileIds)
      ? hierarchy.preliminaryProfileIds.map(clean).filter(Boolean)
      : []),
    ...(Array.isArray(scout?.preliminaryProfileIds)
      ? scout.preliminaryProfileIds.map(clean).filter(Boolean)
      : []),
    ...profiles
      .filter(profile => (
        clean(profile?.profileIdentity || profile?.identity).toLowerCase() === 'preliminary'
      ))
      .map(resolveProfileId)
      .filter(Boolean),
  ])
  const supportingOrder = orderedProfileIds.length
    ? orderedProfileIds.filter(profileId => !preliminaryProfileIds.has(profileId))
    : supportingProfileIds.length
      ? supportingProfileIds.filter(profileId => !preliminaryProfileIds.has(profileId))
      : profiles
          .map(resolveProfileId)
          .filter(profileId => !preliminaryProfileIds.has(profileId))
  const supportingSignals = Array.isArray(hierarchy.supportingSignals)
    ? hierarchy.supportingSignals
    : []
  const supportingSignalById = new Map(
    supportingSignals
      .map(signal => [resolveProfileId(signal), signal])
      .filter(([profileId]) => profileId)
  )
  const supporting = supportingOrder
    .filter(profileId => profileId && profileId !== resolvedPrimaryId)
    .map(profileId => buildProfileItem(
      byId.get(profileId),
      supportingSignalById.get(profileId) || null,
      'supporting'
    ))
    .filter(Boolean)
  const nearProfile = progression.nearestProfile || (Array.isArray(progression.nearProfiles)
    ? progression.nearProfiles[0]
    : null)

  return {
    primary: buildProfileItem(primaryProfile, hierarchy.primarySignal, 'primary'),
    supporting: supporting.map(profile => ({
      ...profile,
      role: 'supporting',
    })),
    near: nearProfile ? {
      id: clean(nearProfile.profileId || nearProfile.id),
      label: clean(nearProfile.profileLabel || nearProfile.label) || resolveProfileLabel(nearProfile),
      role: 'near',
      distance: toNumber(nearProfile.distance),
      distancePct: toNumber(nearProfile.distancePct),
      why: buildNearWhyView(nearProfile),
    } : null,
  }
}

