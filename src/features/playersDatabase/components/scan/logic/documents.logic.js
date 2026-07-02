// src/features/playersDatabase/components/scan/logic/documents.logic.js

import { resolveProfileLabel } from './scout.logic.js'
import { clean, unique } from './utils.js'

export const buildProfileDocumentsCacheKey = ({ profileId, profileIds = [], teams = [] }) => {
  const teamKey = teams.map(team => clean(team?.teamSeasonKey || team?.teamSlotId || team?.id)).filter(Boolean).join('|')
  return [clean(profileId), [...new Set(profileIds.map(clean).filter(Boolean))].sort().join('|'), teamKey].join('::')
}

export const invalidateProfileDocumentsCache = (cache, profileId) => {
  const prefix = `${clean(profileId)}::`
  Array.from(cache.keys()).forEach(key => {
    if (key.startsWith(prefix)) cache.delete(key)
  })
}

export const mergeLoadedPlayerRows = rows => Array.from(rows.reduce((map, row) => {
  const key = clean(row.searchDocId || row.id)
  if (!key) return map
  const existing = map.get(key)

  if (!existing) {
    map.set(key, { ...row, matchedProfileIds: unique([row.profileId]), matchedProfileLabels: unique([row.profileLabel]) })
    return map
  }

  map.set(key, {
    ...existing,
    ...row,
    matchedProfileIds: unique([...(existing.matchedProfileIds || []), row.profileId]),
    matchedProfileLabels: unique([...(existing.matchedProfileLabels || []), row.profileLabel]),
  })
  return map
}, new Map()).values())

const omitProfile = (map = {}, removedId) => Object.entries(map).reduce((acc, [profileId, value]) => {
  if (clean(profileId) !== removedId) acc[clean(profileId)] = value
  return acc
}, {})

export const stripProfileFromLoadedRow = (row = {}, profileId = '') => {
  const removedId = clean(profileId)
  const rawScoutProfileIds = unique((row.rawScoutProfileIds || []).filter(id => clean(id) !== removedId))
  const eligibleScoutProfileIds = unique((row.eligibleScoutProfileIds || []).filter(id => clean(id) !== removedId))
  const scoutProfileIds = unique((row.scoutProfileIds || []).filter(id => clean(id) !== removedId))
  const rawScoutProfiles = omitProfile(row.rawScoutProfiles, removedId)
  const eligibleScoutProfiles = omitProfile(row.eligibleScoutProfiles, removedId)
  const scoutProfiles = omitProfile(row.scoutProfiles, removedId)
  const matchedProfileIds = unique([...scoutProfileIds, ...rawScoutProfileIds])
  const rowWithProfiles = { ...row, scoutProfiles, eligibleScoutProfiles, rawScoutProfiles }
  const matchedProfileLabels = matchedProfileIds.map(id => resolveProfileLabel(rowWithProfiles, id))
  const primaryProfileId = scoutProfileIds[0] || eligibleScoutProfileIds[0] || rawScoutProfileIds[0] || ''
  const primarySummary = scoutProfiles[primaryProfileId] || eligibleScoutProfiles[primaryProfileId] || rawScoutProfiles[primaryProfileId] || {}

  return {
    ...row,
    rawScoutProfileIds,
    rawScoutProfiles,
    eligibleScoutProfileIds,
    eligibleScoutProfiles,
    scoutProfileIds,
    scoutProfiles,
    matchedProfileIds,
    matchedProfileLabels,
    profileId: primaryProfileId,
    profileLabel: primaryProfileId ? primarySummary.profileLabel || primarySummary.label || resolveProfileLabel(row, primaryProfileId) : '',
    bestRawScoutProfileId: rawScoutProfileIds[0] || '',
    bestRawScoutProfileLabel: rawScoutProfiles[rawScoutProfileIds[0]]?.profileLabel || rawScoutProfiles[rawScoutProfileIds[0]]?.label || '',
    bestRawScoutScore: rawScoutProfiles[rawScoutProfileIds[0]]?.score ?? null,
    bestEligibleScoutProfileId: eligibleScoutProfileIds[0] || '',
    bestEligibleScoutProfileLabel: eligibleScoutProfiles[eligibleScoutProfileIds[0]]?.profileLabel || eligibleScoutProfiles[eligibleScoutProfileIds[0]]?.label || '',
    bestEligibleScoutScore: eligibleScoutProfiles[eligibleScoutProfileIds[0]]?.score ?? null,
    bestScoutProfileId: primaryProfileId,
    bestScoutProfileLabel: primarySummary.profileLabel || primarySummary.label || '',
    bestScoutScore: primarySummary.score ?? null,
    bestScoutReliabilityLevel: primarySummary.reliability?.level || primarySummary.reliabilityLevel || '',
    bestScoutReliabilityScore: primarySummary.reliability?.score ?? primarySummary.reliabilityScore ?? null,
  }
}
