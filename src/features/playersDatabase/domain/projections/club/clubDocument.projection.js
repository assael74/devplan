// Deterministic Club Document assembly. No Firestore reads/writes and no business recalculation.

import { cleanValue, pickDefinedValue, toNumberOrZero } from '../../../model/shared/value.model.js'
import { normalizeSeasonStatus } from '../../../model/shared/season.model.js'
import { buildEffectiveCompetitionProjection } from './clubCompetition.projection.js'
import {
  CLUB_COMPETITION_PROJECTION_SOURCE,
  CLUB_COMPETITION_STATUS,
} from '../../contracts/club.contract.js'

const clean = cleanValue

const replaceByKey = ({ items = [], keyGetter, nextItem }) => {
  const safeItems = Array.isArray(items) ? items : []
  const targetKey = keyGetter(nextItem)
  let replaced = false
  const nextItems = safeItems.map(item => {
    if (!targetKey || keyGetter(item) !== targetKey) return item
    replaced = true
    return nextItem
  })

  return replaced || !targetKey ? nextItems : [...nextItems, nextItem]
}


const mergeNestedObject = (existingValue, nextValue) => {
  if (nextValue === undefined) return existingValue
  if (!nextValue || typeof nextValue !== 'object' || Array.isArray(nextValue)) return nextValue

  return {
    ...(existingValue && typeof existingValue === 'object' && !Array.isArray(existingValue)
      ? existingValue
      : {}),
    ...nextValue,
  }
}

const mergeSeasonProjection = (existingSeason = {}, nextSeason = {}) => ({
  ...existingSeason,
  ...nextSeason,
  ...(nextSeason.league !== undefined
    ? { league: mergeNestedObject(existingSeason?.league, nextSeason.league) }
    : {}),
  ...(nextSeason.performance !== undefined
    ? { performance: mergeNestedObject(existingSeason?.performance, nextSeason.performance) }
    : {}),
  ...(nextSeason.scoutProfilesSummary !== undefined
    ? { scoutProfilesSummary: mergeNestedObject(existingSeason?.scoutProfilesSummary, nextSeason.scoutProfilesSummary) }
    : {}),
  ...(nextSeason.transfers !== undefined
    ? { transfers: mergeNestedObject(existingSeason?.transfers, nextSeason.transfers) }
    : {}),
})

const mergeCompetitionSeasonProjection = (existingSeason = {}, nextSeason = {}) => {
  const merged = mergeSeasonProjection(existingSeason, nextSeason)
  if (nextSeason?.competitionProjection === undefined) return merged

  const existingProjection = existingSeason?.competitionProjection || {}
  const nextProjection = nextSeason?.competitionProjection || {}
  const automatic = pickDefinedValue(
    nextProjection.automatic,
    existingProjection.automatic,
    {}
  )
  const manual = Object.prototype.hasOwnProperty.call(nextProjection, 'manual')
    ? nextProjection.manual
    : pickDefinedValue(existingProjection.manual, null)

  return {
    ...merged,
    competitionProjection: {
      ...existingProjection,
      ...nextProjection,
      automatic,
      manual,
      effective: buildEffectiveCompetitionProjection({
        automaticProjection: automatic,
        manualProjection: manual,
        seasonStatus: merged?.seasonStatus,
      }),
    },
  }
}

const upsertMergedByKey = ({ items = [], keyGetter, nextItem, mergeItem }) => {
  const safeItems = Array.isArray(items) ? items : []
  const targetKey = keyGetter(nextItem)
  let replaced = false
  const nextItems = safeItems.map(item => {
    if (!targetKey || keyGetter(item) !== targetKey) return item
    replaced = true
    return mergeItem(item, nextItem)
  })

  return replaced || !targetKey ? nextItems : [...nextItems, nextItem]
}

const seasonKey = season => clean(season?.seasonKey || season?.seasonId)
const ageGroupSeasonKey = season => {
  const key = seasonKey(season)
  const teamId = clean(season?.teamId)
  return key && teamId ? `${key}__${teamId}` : ''
}
const competitionPathSeasonKey = season => {
  const key = seasonKey(season)
  const teamId = clean(season?.teamId)
  return key && teamId ? `${key}__${teamId}` : ''
}
const ageGroupKey = ageGroup => clean(ageGroup?.ageGroupId)
const birthYearKey = path => toNumberOrZero(path?.birthYear)

export const mergeClubAgeGroupSeason = ({
  ageGroups = [],
  ageGroupId = '',
  ageGroupLabel = '',
  season = null,
} = {}) => {
  if (!season || !clean(ageGroupId)) return Array.isArray(ageGroups) ? ageGroups : []

  const existingAgeGroup = (Array.isArray(ageGroups) ? ageGroups : []).find(
    item => ageGroupKey(item) === clean(ageGroupId)
  )
  const nextAgeGroup = {
    ...(existingAgeGroup || {}),
    ageGroupId: clean(ageGroupId),
    ageGroupLabel: clean(ageGroupLabel || existingAgeGroup?.ageGroupLabel),
    seasons: upsertMergedByKey({
      items: existingAgeGroup?.seasons,
      keyGetter: ageGroupSeasonKey,
      nextItem: season,
      mergeItem: mergeSeasonProjection,
    }),
  }

  return replaceByKey({
    items: ageGroups,
    keyGetter: ageGroupKey,
    nextItem: nextAgeGroup,
  })
}

export const removeClubAgeGroupSeasonProjections = ({
  existingClub = {},
  removals = [],
} = {}) => {
  const safeRemovals = (Array.isArray(removals) ? removals : []).filter(removal => (
    clean(removal?.ageGroupId) &&
    clean(removal?.seasonKey || removal?.seasonId) &&
    clean(removal?.teamId) &&
    clean(removal?.leagueId)
  ))
  if (!safeRemovals.length) return existingClub

  const matchesRemoval = ({ ageGroupId, season }) => safeRemovals.some(removal => (
    clean(removal?.ageGroupId) === clean(ageGroupId) &&
    clean(removal?.seasonKey || removal?.seasonId) === seasonKey(season) &&
    clean(removal?.teamId) === clean(season?.teamId) &&
    clean(removal?.leagueId) === clean(season?.league?.leagueId)
  ))

  const ageGroups = (Array.isArray(existingClub?.ageGroups) ? existingClub.ageGroups : [])
    .map(ageGroup => ({
      ...ageGroup,
      seasons: (Array.isArray(ageGroup?.seasons) ? ageGroup.seasons : [])
        .filter(season => !matchesRemoval({
          ageGroupId: ageGroup?.ageGroupId,
          season,
        })),
    }))
    .filter(ageGroup => Array.isArray(ageGroup.seasons) && ageGroup.seasons.length)

  // Competition paths mirror age-group seasons.  Leaving their matching
  // season behind after a League clear/delete creates a stale projection.
  // Keep an empty path itself: it may still hold nextCompetitionPath data.
  const competitionPaths = (Array.isArray(existingClub?.competitionPaths)
    ? existingClub.competitionPaths
    : []).map(path => ({
      ...path,
      seasons: (Array.isArray(path?.seasons) ? path.seasons : [])
        .filter(season => !safeRemovals.some(removal => (
          clean(removal?.ageGroupId) === clean(season?.ageGroupId) &&
          clean(removal?.seasonKey || removal?.seasonId) === seasonKey(season) &&
          clean(removal?.teamId) === clean(season?.teamId) &&
          clean(removal?.leagueId) === clean(season?.leagueId)
        ))),
    }))

  return {
    ...existingClub,
    ageGroups,
    competitionPaths,
  }
}

// Removes only explicitly-targeted competition-path seasons that have already
// lost their matching ageGroups season. This is used as a safe recovery for
// data written before the Clear/Delete cleanup handled competition paths.
export const removeOrphanedClubCompetitionPathSeasons = ({
  existingClub = {},
  targets = [],
} = {}) => {
  const safeTargets = (Array.isArray(targets) ? targets : []).filter(target => (
    clean(target?.ageGroupId) &&
    clean(target?.seasonKey || target?.seasonId) &&
    clean(target?.teamId)
  ))
  if (!safeTargets.length) return existingClub

  const hasAgeGroupSeason = target => {
    const ageGroups = Array.isArray(existingClub?.ageGroups)
      ? existingClub.ageGroups
      : []
    return ageGroups.some(ageGroup => (
      clean(ageGroup?.ageGroupId) === clean(target?.ageGroupId) &&
      (Array.isArray(ageGroup?.seasons) ? ageGroup.seasons : []).some(season => (
        seasonKey(season) === clean(target?.seasonKey || target?.seasonId) &&
        clean(season?.teamId) === clean(target?.teamId)
      ))
    ))
  }
  return {
    ...existingClub,
    competitionPaths: (Array.isArray(existingClub?.competitionPaths)
      ? existingClub.competitionPaths
      : []).map(path => ({
      ...path,
      seasons: (Array.isArray(path?.seasons) ? path.seasons : [])
        .filter(season => {
          const target = safeTargets.find(item => (
            clean(item?.ageGroupId) === clean(season?.ageGroupId) &&
            clean(item?.seasonKey || item?.seasonId) === seasonKey(season) &&
            clean(item?.teamId) === clean(season?.teamId) &&
            (!clean(item?.leagueId) || clean(item?.leagueId) === clean(season?.leagueId))
          ))
          return !target || hasAgeGroupSeason(target)
        }),
    })),
  }
}

export const mergeClubCompetitionPath = ({
  competitionPaths = [],
  birthYear = 0,
  season = null,
  nextCompetitionPath,
} = {}) => {
  const normalizedBirthYear = toNumberOrZero(birthYear)
  if (!normalizedBirthYear) return Array.isArray(competitionPaths) ? competitionPaths : []

  const existingPath = (Array.isArray(competitionPaths) ? competitionPaths : []).find(
    item => birthYearKey(item) === normalizedBirthYear
  )
  const resolvedNextCompetitionPath = nextCompetitionPath !== undefined
    ? nextCompetitionPath
    : existingPath?.nextCompetitionPath || {
        sourceBirthYear: normalizedBirthYear - 1,
        projectedNextLeagueLevel: null,
        status: CLUB_COMPETITION_STATUS.UNKNOWN,
        source: CLUB_COMPETITION_PROJECTION_SOURCE.AUTOMATIC,
        reason: 'SOURCE_COHORT_NOT_LOADED',
        updatedAt: null,
      }

  const nextPath = {
    ...(existingPath || {}),
    birthYear: normalizedBirthYear,
    seasons: season
      ? upsertMergedByKey({
          items: existingPath?.seasons,
          keyGetter: competitionPathSeasonKey,
          nextItem: season,
          mergeItem: mergeCompetitionSeasonProjection,
        })
      : Array.isArray(existingPath?.seasons) ? existingPath.seasons : [],
    nextCompetitionPath: resolvedNextCompetitionPath,
  }

  return replaceByKey({
    items: competitionPaths,
    keyGetter: birthYearKey,
    nextItem: nextPath,
  })
}

export const buildClubDocumentProjection = ({
  existingClub = {},
  clubIdentity = {},
  ageGroupSeasonProjection = null,
  competitionPathUpdate = null,
  projectionVersion = 1,
  updatedAt = null,
} = {}) => {
  let ageGroups = Array.isArray(existingClub?.ageGroups) ? existingClub.ageGroups : []
  let competitionPaths = Array.isArray(existingClub?.competitionPaths)
    ? existingClub.competitionPaths
    : []

  if (ageGroupSeasonProjection?.season) {
    ageGroups = mergeClubAgeGroupSeason({
      ageGroups,
      ageGroupId: ageGroupSeasonProjection.ageGroupId,
      ageGroupLabel: ageGroupSeasonProjection.ageGroupLabel,
      season: ageGroupSeasonProjection.season,
    })
  }

  if (competitionPathUpdate?.birthYear) {
    competitionPaths = mergeClubCompetitionPath({
      competitionPaths,
      birthYear: competitionPathUpdate.birthYear,
      season: competitionPathUpdate.season,
      nextCompetitionPath: competitionPathUpdate.nextCompetitionPath,
    })
  }

  return {
    ...existingClub,
    clubId: clean(clubIdentity?.clubId || existingClub?.clubId || existingClub?.id),
    externalClubId: clean(clubIdentity?.externalClubId || existingClub?.externalClubId),
    name: clean(clubIdentity?.name || existingClub?.name),
    shortName: clean(clubIdentity?.shortName || existingClub?.shortName),
    sourceName: clean(clubIdentity?.sourceName || existingClub?.sourceName),
    clubUrl: clean(clubIdentity?.clubUrl || existingClub?.clubUrl),
    clubLevel: toNumberOrZero(clubIdentity?.clubLevel || existingClub?.clubLevel),
    clubStrengthLevel: Number(clubIdentity?.clubStrengthLevel || existingClub?.clubStrengthLevel) || 0,
    aliases: Array.isArray(clubIdentity?.aliases)
      ? [...clubIdentity.aliases]
      : Array.isArray(existingClub?.aliases) ? existingClub.aliases : [],
    searchAliases: Array.isArray(clubIdentity?.searchAliases)
      ? [...clubIdentity.searchAliases]
      : Array.isArray(existingClub?.searchAliases) ? existingClub.searchAliases : [],
    ageGroups,
    competitionPaths,
    projectionVersion: toNumberOrZero(projectionVersion) || 1,
    createdAt: existingClub?.createdAt || updatedAt,
    updatedAt,
  }
}

export const normalizeClubSeasonForProjection = season => ({
  ...season,
  seasonStatus: normalizeSeasonStatus(season?.seasonStatus),
})
