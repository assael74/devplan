// features/playersDatabase/components/profilesPage/list/logic/documents.logic.js

import { clean, unique } from '../../logic/utils.js'
import { getProfileTeams } from '../../logic/profiles.logic.js'
import { resolveProfileLabel } from './scout.logic.js'

const resolveNullableValue = value =>
  value !== undefined && value !== null ? value : null

const omitProfile = (map = {}, removedId) =>
  Object.entries(map).reduce((result, [profileId, value]) => {
    const currentProfileId = clean(profileId)

    if (currentProfileId !== removedId) {
      result[currentProfileId] = value
    }

    return result
  }, {})

export const buildProfileDocumentsCacheKey = ({
  profileId,
  profileIds = [],
  teams = [],
  selectionKey = '',
}) => {
  const teamKey = teams
    .map(team =>
      clean(
        team?.teamSeasonKey ||
          team?.teamSlotId ||
          team?.id
      )
    )
    .filter(Boolean)
    .join('|')

  const profilesKey = Array.from(
    new Set(profileIds.map(clean).filter(Boolean))
  )
    .sort()
    .join('|')

  return [clean(profileId), profilesKey, teamKey, clean(selectionKey)].join('::')
}

export const buildProfileDocumentsSelectionKey = ({
  profileIds = [],
  selectionRows = [],
} = {}) => {
  const profilesKey = Array.from(
    new Set((Array.isArray(profileIds) ? profileIds : []).map(clean).filter(Boolean))
  )
    .sort()
    .join('|')

  const rowsKey = Array.from(
    new Set(
      (Array.isArray(selectionRows) ? selectionRows : [])
        .map(row => clean(row?.id || row?.leagueId || row?.birthYear))
        .filter(Boolean)
    )
  )
    .sort()
    .join('|')

  return [profilesKey, rowsKey].join('::')
}

export const getProfileDocumentTeams = (profile, selectionRows = []) => {
  const sourceRows = Array.isArray(selectionRows) && selectionRows.length
    ? selectionRows
    : [profile]

  const teams = sourceRows.flatMap(row => getProfileTeams(row))

  return Array.from(
    teams.reduce((map, team) => {
      const key = clean(team?.teamSeasonKey || team?.teamSlotId || team?.id)
      if (!key || map.has(key)) return map
      map.set(key, {
        ...team,
        teamSeasonKey: key,
      })
      return map
    }, new Map()).values()
  )
}

export const invalidateProfileDocumentsCache = (
  cache,
  profileId
) => {
  const prefix = `${clean(profileId)}::`

  Array.from(cache.keys()).forEach(key => {
    if (key.startsWith(prefix)) {
      cache.delete(key)
    }
  })
}

export const mergeLoadedPlayerRows = rows =>
  Array.from(
    rows
      .reduce((map, row) => {
        const key = clean(row.searchDocId || row.id)

        if (!key) return map

        const existing = map.get(key)

        if (!existing) {
          map.set(key, {
            ...row,
            matchedProfileIds: unique([row.profileId]),
            matchedProfileLabels: unique([
              row.profileLabel,
            ]),
          })

          return map
        }

        map.set(key, {
          ...existing,
          ...row,
          matchedProfileIds: unique([
            ...(existing.matchedProfileIds || []),
            row.profileId,
          ]),
          matchedProfileLabels: unique([
            ...(existing.matchedProfileLabels || []),
            row.profileLabel,
          ]),
        })

        return map
      }, new Map())
      .values()
  )

export const stripProfileFromLoadedRow = (
  row = {},
  profileId = ''
) => {
  const removedId = clean(profileId)

  const rawScoutProfileIds = unique(
    (row.rawScoutProfileIds || []).filter(
      id => clean(id) !== removedId
    )
  )
  const eligibleScoutProfileIds = unique(
    (row.eligibleScoutProfileIds || []).filter(
      id => clean(id) !== removedId
    )
  )
  const scoutProfileIds = unique(
    (row.scoutProfileIds || []).filter(
      id => clean(id) !== removedId
    )
  )

  const rawScoutProfiles = omitProfile(
    row.rawScoutProfiles,
    removedId
  )
  const eligibleScoutProfiles = omitProfile(
    row.eligibleScoutProfiles,
    removedId
  )
  const scoutProfiles = omitProfile(
    row.scoutProfiles,
    removedId
  )

  const matchedProfileIds = unique([
    ...scoutProfileIds,
    ...rawScoutProfileIds,
  ])

  const rowWithProfiles = {
    ...row,
    scoutProfiles,
    eligibleScoutProfiles,
    rawScoutProfiles,
  }

  const matchedProfileLabels = matchedProfileIds.map(id =>
    resolveProfileLabel(rowWithProfiles, id)
  )

  const primaryProfileId =
    scoutProfileIds[0] ||
    eligibleScoutProfileIds[0] ||
    rawScoutProfileIds[0] ||
    ''

  const primarySummary =
    scoutProfiles[primaryProfileId] ||
    eligibleScoutProfiles[primaryProfileId] ||
    rawScoutProfiles[primaryProfileId] ||
    {}

  const rawPrimaryProfile =
    rawScoutProfiles[rawScoutProfileIds[0]] || {}

  const eligiblePrimaryProfile =
    eligibleScoutProfiles[eligibleScoutProfileIds[0]] || {}

  const reliabilityScore =
    primarySummary.reliability?.score !== undefined &&
    primarySummary.reliability?.score !== null
      ? primarySummary.reliability.score
      : primarySummary.reliabilityScore

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
    profileLabel: primaryProfileId
      ? primarySummary.profileLabel ||
        primarySummary.label ||
        resolveProfileLabel(rowWithProfiles, primaryProfileId)
      : '',
    bestRawScoutProfileId: rawScoutProfileIds[0] || '',
    bestRawScoutProfileLabel:
      rawPrimaryProfile.profileLabel ||
      rawPrimaryProfile.label ||
      '',
    bestRawScoutScore: resolveNullableValue(
      rawPrimaryProfile.score
    ),
    bestEligibleScoutProfileId:
      eligibleScoutProfileIds[0] || '',
    bestEligibleScoutProfileLabel:
      eligiblePrimaryProfile.profileLabel ||
      eligiblePrimaryProfile.label ||
      '',
    bestEligibleScoutScore: resolveNullableValue(
      eligiblePrimaryProfile.score
    ),
    bestScoutProfileId: primaryProfileId,
    bestScoutProfileLabel:
      primarySummary.profileLabel ||
      primarySummary.label ||
      '',
    bestScoutScore: resolveNullableValue(
      primarySummary.score
    ),
    bestScoutReliabilityLevel:
      primarySummary.reliability?.level ||
      primarySummary.reliabilityLevel ||
      '',
    bestScoutReliabilityScore: resolveNullableValue(
      reliabilityScore
    ),
  }
}
