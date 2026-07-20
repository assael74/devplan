// src/features/playersDatabase/sharedLogic/pdbCounts.logic.js

import {
  getScoutProfileRows,
  pdbScoutProfileCounts,
} from './pdbScoutProfiles.logic.js'

const clean = value => String(value ?? '').trim()

const toNumber = value => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

const normalizeIds = values =>
  Array.from(new Set((Array.isArray(values) ? values : [])
    .map(clean)
    .filter(Boolean)))

const getTeamRows = league => (
  Object.entries(league?.teamsIndex || {}).map(([teamSeasonKey, team]) => ({
    key: clean(teamSeasonKey),
    ...(team || {}),
  }))
)

const getPrimarySeason = league => (
  Object.values(league?.seasons || {})[0] || null
)

const sumRows = (rows, field) => (
  (Array.isArray(rows) ? rows : []).reduce(
    (total, row) => total + toNumber(row?.[field]),
    0
  )
)

export const pdbProfileBreakdownRows = (profileCounts = {}) =>
  Object.entries(profileCounts || {})
    .map(([profileId, count]) => ({
      profileId: clean(profileId),
      label: clean(profileId),
      count: toNumber(count),
    }))
    .filter(row => row.count > 0 && row.profileId)

export const pdbScoutProfileChipRows = (profileCounts = {}) =>
  getScoutProfileRows(
    Array.isArray(profileCounts)
      ? pdbScoutProfileCounts(profileCounts)
      : profileCounts
  )

export const pdbLeagueTeamsCount = league => {
  const primarySeason = getPrimarySeason(league)
  const clubsCount = toNumber(primarySeason?.clubsCount)
  const loadedClubsCount = toNumber(primarySeason?.loadedClubsCount)
  const indexedTeamsCount = getTeamRows(league).length

  if (clubsCount > 0) return clubsCount
  if (loadedClubsCount > 0) return loadedClubsCount

  return indexedTeamsCount
}

export const pdbLeagueLoadedTeamsCount = league =>
  getTeamRows(league).filter(team => toNumber(team.playersCount) > 0).length

export const pdbLeaguePlayersCount = league =>
  sumRows(getTeamRows(league), 'playersCount')

export const pdbLeagueStatsCount = league =>
  sumRows(getTeamRows(league), 'statsCount')

export const pdbLeagueSearchCount = league =>
  sumRows(getTeamRows(league), 'searchCount')

export const pdbLeagueScoutProfilesCount = league =>
  sumRows(getTeamRows(league), 'scoutProfilesCount')

export const pdbSelectionMetrics = ({
  leagueRows = [],
  yearRows = [],
  searchMode = 'all',
  selectedLeagueIds = [],
  selectedBirthYears = [],
} = {}) => {
  const selectedIds = normalizeIds(
    searchMode === 'year' ? selectedLeagueIds : selectedBirthYears
  )

  if (searchMode === 'all' || !selectedIds.length) {
    return {
      selectionCount: selectedIds.length,
      selectedRows: [],
      leaguesCount: 0,
      teamsCount: 0,
      playersCount: 0,
      statsCount: 0,
      profilesCount: 0,
    }
  }

  const selectedRows = (searchMode === 'year' ? leagueRows : yearRows).filter(row => {
    const rowId = searchMode === 'year'
      ? clean(row?.leagueId)
      : clean(row?.birthYear)

    return selectedIds.includes(rowId)
  })

  return {
    selectionCount: selectedIds.length,
    selectedRows,
    leaguesCount: selectedRows.length,
    teamsCount: sumRows(selectedRows, 'loadedTeamsCount'),
    playersCount: sumRows(selectedRows, 'loadedPlayersCount'),
    statsCount: sumRows(selectedRows, 'statsCount'),
    profilesCount: sumRows(selectedRows, 'scoutProfilesCount'),
  }
}
