// Club Document -> compact Clubs Master entry. Pure projection.

import { cleanValue, pickDefinedValue, toNumberOrZero } from '../../../model/shared/value.model.js'
import {
  SEASON_STATUS,
  normalizeSeasonLookupKey,
  normalizeSeasonStatus,
} from '../../../model/shared/season.model.js'
import {
  PLAYERS_DATABASE_SEASONS_CATALOG,
  PLAYERS_DATABASE_CURRENT_SEASON_KEY,
} from '../../../catalog/seasons.catalog.js'
import {
  CLUB_COMPETITION_PROJECTION_SOURCE,
  CLUB_COMPETITION_STATUS,
  normalizeClubCompetitionProjectionSource,
  normalizeClubCompetitionStatus,
} from '../../contracts/club.contract.js'

const clean = cleanValue

const compactPerformanceSide = value => {
  const priorityLevel = clean(value?.priorityLevel)
  return priorityLevel ? { priorityLevel } : undefined
}

const seasonKeyOf = season => normalizeSeasonLookupKey(
  season?.seasonKey || season?.seasonId
)

const getSeasonOrder = season => {
  const key = seasonKeyOf(season)
  const numbers = key.match(/\d+/g) || []

  if (numbers.length >= 2) {
    const first = Number(numbers[0])
    const second = Number(numbers[1])
    return (first * 10000) + second
  }

  const single = Number(numbers[0])
  return Number.isFinite(single) ? single : 0
}

const sortSeasonsNewestFirst = seasons => (
  [...(Array.isArray(seasons) ? seasons : [])].sort((left, right) => {
    const leftActive = normalizeSeasonStatus(left?.seasonStatus) !== SEASON_STATUS.COMPLETED
    const rightActive = normalizeSeasonStatus(right?.seasonStatus) !== SEASON_STATUS.COMPLETED

    if (leftActive !== rightActive) return leftActive ? -1 : 1
    return getSeasonOrder(right) - getSeasonOrder(left)
  })
)

const sortSeasonGroupsNewestFirst = groups => (
  [...groups].sort((left, right) => {
    const orderDifference = getSeasonOrder(right) - getSeasonOrder(left)
    if (orderDifference) return orderDifference
    return clean(right?.seasonKey).localeCompare(clean(left?.seasonKey))
  })
)

const buildSeasonGroups = seasons => {
  const bySeasonKey = new Map()

  ;(Array.isArray(seasons) ? seasons : []).forEach(season => {
    const seasonKey = seasonKeyOf(season)
    if (!seasonKey) return

    const group = bySeasonKey.get(seasonKey) || {
      seasonKey,
      seasons: [],
      statuses: new Set(),
    }
    group.seasons.push(season)
    group.statuses.add(normalizeSeasonStatus(season?.seasonStatus))
    bySeasonKey.set(seasonKey, group)
  })

  return sortSeasonGroupsNewestFirst([...bySeasonKey.values()])
}

const getPreviousCatalogSeasonKey = () => {
  const currentSeasonKey = normalizeSeasonLookupKey(
    PLAYERS_DATABASE_CURRENT_SEASON_KEY
  )
  const currentIndex = PLAYERS_DATABASE_SEASONS_CATALOG.findIndex(season => (
    normalizeSeasonLookupKey(season?.seasonKey || season?.seasonId) === currentSeasonKey
  ))

  return normalizeSeasonLookupKey(
    PLAYERS_DATABASE_SEASONS_CATALOG
      .slice(currentIndex + 1)
      .find(season => season?.target === 'history')
      ?.seasonKey
  )
}

// Clubs Master exposes only the two seasons defined by the seasons catalog:
// current is the catalog current season and previous is the first history season
// after it. Lifecycle status, input order and older history never replace them.
export const selectClubsMasterAgeGroupSeasons = seasons => {
  const groups = buildSeasonGroups(seasons)
  const currentCatalogSeasonKey = normalizeSeasonLookupKey(
    PLAYERS_DATABASE_CURRENT_SEASON_KEY
  )
  const previousCatalogSeasonKey = getPreviousCatalogSeasonKey()
  const current = groups.find(group => (
    group.seasonKey === currentCatalogSeasonKey
  )) || null
  const previous = groups.find(group => (
    group.seasonKey === previousCatalogSeasonKey
  )) || null

  return { current, previous }
}

const compactSeason = season => {
  if (!season) return null

  return {
    teamId: clean(season?.teamId),
    seasonId: clean(season?.seasonId),
    seasonKey: clean(season?.seasonKey),
    seasonStatus: normalizeSeasonStatus(season?.seasonStatus),
    birthYear: toNumberOrZero(season?.birthYear),
    league: {
      leagueId: clean(season?.league?.leagueId),
      leagueName: clean(season?.league?.leagueName),
      leagueLevel: Number(season?.league?.leagueLevel) || null,
    },
    performance: {
      tableRank: pickDefinedValue(season?.performance?.tableRank, null),
      points: toNumberOrZero(season?.performance?.points),
      teamGamePlayed: toNumberOrZero(season?.performance?.teamGamePlayed),
      goalsFor: toNumberOrZero(season?.performance?.goalsFor),
      goalsAgainst: toNumberOrZero(season?.performance?.goalsAgainst),
      goalsForPerGame: pickDefinedValue(season?.performance?.goalsForPerGame, null),
      goalsAgainstPerGame: pickDefinedValue(season?.performance?.goalsAgainstPerGame, null),
      ...(compactPerformanceSide(season?.performance?.offense)
        ? { offense: compactPerformanceSide(season.performance.offense) }
        : {}),
      ...(compactPerformanceSide(season?.performance?.defense)
        ? { defense: compactPerformanceSide(season.performance.defense) }
        : {}),
    },
    playersCount: toNumberOrZero(season?.playersCount),
    ...(season?.teamTaskSignals && typeof season.teamTaskSignals === 'object'
      ? {
          teamTaskSignals: {
            offense: Boolean(season.teamTaskSignals.offense),
            defense: Boolean(season.teamTaskSignals.defense),
          },
        }
      : {}),
    ...(season?.lineStructure?.lines && typeof season.lineStructure.lines === 'object'
      ? {
          lineStructure: {
            lines: {
              attack: { playersCount: toNumberOrZero(season.lineStructure.lines?.attack?.playersCount) },
              defense: { playersCount: toNumberOrZero(season.lineStructure.lines?.defense?.playersCount) },
              midfield: { playersCount: toNumberOrZero(season.lineStructure.lines?.midfield?.playersCount) },
            },
          },
        }
      : {}),
    scoutProfilesSummary: {
      total: toNumberOrZero(season?.scoutProfilesSummary?.total),
      profileCounts: season?.scoutProfilesSummary?.profileCounts &&
        typeof season.scoutProfilesSummary.profileCounts === 'object'
        ? { ...season.scoutProfilesSummary.profileCounts }
        : {},
    },
    transfers: season?.transfers || null,
  }
}

export const buildClubsMasterAgeGroupEntry = ageGroup => {
  const { current, previous } = selectClubsMasterAgeGroupSeasons(ageGroup?.seasons)
  const compactGroup = group => (group?.seasons || [])
    .map(compactSeason)
    .sort((left, right) => {
      const teamDifference = clean(left?.teamId).localeCompare(clean(right?.teamId))
      if (teamDifference) return teamDifference
      return clean(left?.league?.leagueId).localeCompare(clean(right?.league?.leagueId))
    })

  return {
    ageGroupId: clean(ageGroup?.ageGroupId),
    ageGroupLabel: clean(ageGroup?.ageGroupLabel),
    current: compactGroup(current),
    previous: compactGroup(previous),
  }
}

export const buildClubsMasterCompetitionPathEntry = path => {
  const seasons = sortSeasonsNewestFirst(path?.seasons)
  const currentSeason = seasons[0] || null
  const nextPath = path?.nextCompetitionPath || null

  return {
    birthYear: toNumberOrZero(path?.birthYear),
    currentLeagueLevel: Number(currentSeason?.leagueLevel) || null,
    projectedNextLeagueLevel: Number(nextPath?.projectedNextLeagueLevel) || null,
    status: normalizeClubCompetitionStatus(
      nextPath?.status,
      CLUB_COMPETITION_STATUS.UNKNOWN
    ),
    source: normalizeClubCompetitionProjectionSource(
      nextPath?.source,
      CLUB_COMPETITION_PROJECTION_SOURCE.AUTOMATIC
    ),
  }
}

export const buildClubsMasterClubProjection = ({
  club = {},
  updatedAt = null,
} = {}) => ({
  clubId: clean(club?.clubId || club?.id),
  externalClubId: clean(club?.externalClubId),
  clubUrl: clean(club?.clubUrl),
  name: clean(club?.name),
  shortName: clean(club?.shortName),
  clubLevel: toNumberOrZero(club?.clubLevel),
  clubStrengthLevel: Number(club?.clubStrengthLevel) || 0,
  ageGroups: (Array.isArray(club?.ageGroups) ? club.ageGroups : [])
    .map(buildClubsMasterAgeGroupEntry)
    .filter(item => item.ageGroupId),
  competitionPaths: (Array.isArray(club?.competitionPaths) ? club.competitionPaths : [])
    .map(buildClubsMasterCompetitionPathEntry)
    .filter(item => item.birthYear),
  updatedAt: updatedAt || club?.updatedAt || null,
})
