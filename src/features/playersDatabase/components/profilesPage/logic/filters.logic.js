// features/playersDatabase/components/profilesPage/logic/filters.logic.js

import {
  getLeagueLevelLabel,
  getLeagueRegionLabel,
} from '../../leagues/leagueUtils.js'
import { getLeagueBirthYear } from './season.logic.js'
import { clean } from './utils.js'

const normalizeRegionKey = value =>
  clean(value).replace(/\s+\d+$/u, '').trim()

const buildNorthSouthRegions = () => [
  { value: 'all', label: 'כל האזורים' },
  { value: 'north', label: 'צפון' },
  { value: 'south', label: 'דרום' },
]

export const buildYearOptions = (leagues, seasonId = '') => {
  const birthYears = leagues
    .map(league => getLeagueBirthYear(league, seasonId))
    .filter(Boolean)

  const options = Array.from(new Set(birthYears))
    .sort((a, b) => Number(a) - Number(b))
    .map(value => ({ value, label: value }))

  return [{ value: 'all', label: 'כל השנתונים' }, ...options]
}

export const buildLeagueOptions = () => [
  { value: '1', label: getLeagueLevelLabel(1), level: 1 },
  { value: '2', label: getLeagueLevelLabel(2), level: 2 },
  { value: '3', label: getLeagueLevelLabel(3), level: 3 },
  { value: '4', label: getLeagueLevelLabel(4), level: 4 },
]

export const buildRegionOptions = ({
  leagues = [],
  leagueLevel = 'all',
} = {}) => {
  const level = String(leagueLevel)

  if (level !== '3' && level !== '4') return []

  if (level === '3') return buildNorthSouthRegions()

  const options = Array.from(
    new Map(
      leagues
        .filter(league => String(league.level) === '4')
        .map(league => {
          const value = normalizeRegionKey(league.region)
          return value
            ? [value, { value, label: getLeagueRegionLabel(value) }]
            : null
        })
        .filter(Boolean)
    ).values()
  ).sort((a, b) => a.label.localeCompare(b.label, 'he'))

  return [{ value: 'all', label: 'כל האזורים' }, ...options]
}

export const getProfileChipCounts = row => ({
  playersCount: Number(row?.loadedPlayersCount) || 0,
  teamsCount: Number(row?.loadedTeamsCount) || 0,
})

export const profileMatchesRegion = (row, regionId) => {
  const targetRegionId = normalizeRegionKey(regionId)

  if (!targetRegionId || targetRegionId === 'all') return true
  if (!row) return false

  if (row.scope === 'league') {
    return normalizeRegionKey(row.league?.region || row.region) === targetRegionId
  }

  return (row.children || []).some(child =>
    normalizeRegionKey(child.league?.region || child.region) === targetRegionId
  )
}

export const filterProfilesBySearch = ({
  profiles,
  yearRows,
  leagueRows,
  searchMode,
  primaryFilter,
  selectedRegionId,
  selectedLeagueIds,
  selectedBirthYears,
}) => {
  if (searchMode === 'all') return profiles

  if (searchMode === 'year') {
    return yearRows.filter(row => {
      const primaryMatches =
        primaryFilter === 'all' ||
        row.birthYear === primaryFilter

      const leagueMatches =
        !selectedLeagueIds.length ||
        selectedLeagueIds.some(leagueId =>
          row.children?.some(child => child.leagueId === leagueId)
        )

      return (
        primaryMatches &&
        leagueMatches &&
        profileMatchesRegion(row, selectedRegionId)
      )
    })
  }

  return leagueRows.filter(row => {
    const primaryMatches =
      primaryFilter === 'all' ||
      String(row.league?.level || row.level || '') === String(primaryFilter)

    const birthYearMatches =
      !selectedBirthYears.length ||
      selectedBirthYears.includes(row.birthYear)

    return (
      primaryMatches &&
      birthYearMatches &&
      profileMatchesRegion(row, selectedRegionId)
    )
  })
}
