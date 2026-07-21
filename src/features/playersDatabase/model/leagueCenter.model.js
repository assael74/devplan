// features/playersDatabase/model/leagueCenter.model.js

import { PLAYERS_DATABASE_LEAGUES_CATALOG } from '../catalog/leagues.catalog.js'
import { isSameSeason, normalizeSeasonIdentity, normalizeSeasonLookupKey, resolveSeasonLookupKey } from './season.model.js'
import { normalizeTeamStats } from './teamStats.model.js'
import { cleanValue, toNumberOrZero } from './value.model.js'

export const LEAGUE_CENTER_DEFAULT_SEASON_KEY = '26/27'
const DEFAULT_SEASON_OPTIONS = ['26/27', '25/26', '24/25', '23/24', '22/23']

const clean = cleanValue
const toNumber = toNumberOrZero

const toAgeGroupLabel = value => {
  const ageGroupId = clean(value)
  if (!ageGroupId) return ''

  return ageGroupId.toUpperCase()
}

const normalizeSeasonKey = normalizeSeasonLookupKey

const isSameSeasonKey = (left, right) => isSameSeason(
  { seasonId: left, seasonKey: left },
  { seasonId: right, seasonKey: right }
)

export const resolveLeagueCenterSeasonTarget = seasonKey =>
  normalizeSeasonKey(seasonKey) === '26/27' ? 'current' : 'history'

const getLeagueIds = league => [
  league?.catalogLeagueId,
  league?.leagueId,
  league?.id,
].map(clean).filter(Boolean)

const getCatalogLeague = league => {
  const ids = getLeagueIds(league)

  return PLAYERS_DATABASE_LEAGUES_CATALOG.find(item => ids.includes(item.id)) || null
}

const buildLeagueDocsMap = leagueDocs => {
  const map = new Map()

  leagueDocs.forEach(league => {
    getLeagueIds(league).forEach(id => {
      if (!map.has(id)) {
        map.set(id, league)
      }
    })
  })

  return map
}

const getLeagueSeasons = league => {
  const rows = []

  if (league?.current?.seasonId || league?.current?.seasonKey) {
    rows.push({
      target: 'current',
      season: league.current,
    })
  }

  const history = Array.isArray(league?.history) ? league.history : []
  history.forEach(season => {
    if (season?.seasonId || season?.seasonKey) {
      rows.push({
        target: 'history',
        season,
      })
    }
  })

  return rows
}

const getSelectedSeason = (league, selectedSeasonKey) => {
  const seasons = getLeagueSeasons(league)
  if (!seasons.length) {
    return {
      target: 'missing',
      season: null,
    }
  }

  const selected = seasons.find(row => (
    isSameSeasonKey(row.season?.seasonKey, selectedSeasonKey) ||
    isSameSeasonKey(row.season?.seasonId, selectedSeasonKey)
  ))

  if (selected) return selected

  return {
    target: 'missing',
    season: null,
  }
}

const getTableRows = season =>
  Array.isArray(season?.tableRank)
    ? season.tableRank.filter(row => row && (row.teamId || row.clubId || row.rank))
    : []

const getStatsStatus = rows => {
  if (!rows.length) return 'missing'

  const rowsWithStats = rows.filter(row => {
    const stats = normalizeTeamStats(row)
    return (
      stats.gamesPlayed > 0 ||
      stats.goalsFor > 0 ||
      stats.goalsAgainst > 0 ||
      stats.points > 0
    )
  }).length

  if (rowsWithStats === rows.length) return 'full'
  if (rowsWithStats > 0) return 'partial'

  return 'missing'
}

const getTeamsStatus = rows => {
  if (!rows.length) return 'missing'

  const rowsWithPlayers = rows.filter(row =>
    toNumber(row?.scoutProfilesSummary?.total) > 0
  ).length

  if (rowsWithPlayers === rows.length) return 'full'
  if (rowsWithPlayers > 0) return 'partial'

  return 'missing'
}

const getTableStatus = (rows, expectedTeamsCount) => {
  if (!rows.length) return 'missing'
  if (!expectedTeamsCount) return 'full'

  return rows.length >= expectedTeamsCount ? 'full' : 'partial'
}

const getProfiledPlayersCount = rows =>
  rows.reduce((total, row) => (
    total + toNumber(row?.scoutProfilesSummary?.total)
  ), 0)

const buildLeagueName = ({ league, catalog }) => {
  const ageLabel = clean(league?.ageGroupLabel || catalog?.ageGroupLabel)
  const name = clean(league?.name || league?.leagueName || catalog?.name)

  return [ageLabel, name].filter(Boolean).join(' ')
}

const buildCleanLeagueName = ({ league, catalog }) =>
  clean(league?.name || league?.leagueName || catalog?.name)

const buildLeagueCenterRow = ({
  league,
  catalog,
  hasLeagueDoc,
  selectedSeasonKey,
}) => {
  const { target, season } = getSelectedSeason(league, selectedSeasonKey)
  const tableRows = getTableRows(season)
  const expectedTeamsCount = toNumber(
    league?.clubsCount ||
    league?.teamsCount ||
    season?.clubsCount ||
    season?.teamsCount
  )
  const teamsCount = expectedTeamsCount || tableRows.length
  const ageGroupId = clean(league?.ageGroupId || catalog?.ageGroupId)
  const birthYear = toNumber(season?.birthYear)
  const seasonIdentity = normalizeSeasonIdentity({ season: season || {} })

  return {
    id: clean(league?.id || league?.leagueId || catalog?.id),
    leagueId: clean(league?.leagueId || league?.id || catalog?.id),
    catalogLeagueId: clean(catalog?.id || league?.catalogLeagueId),
    name: buildLeagueName({ league, catalog }),
    leagueName: buildCleanLeagueName({ league, catalog }),
    ageGroup: toAgeGroupLabel(ageGroupId),
    ageGroupId,
    ageGroupLabel: clean(league?.ageGroupLabel || catalog?.ageGroupLabel),
    birthYear: birthYear || '',
    seasonKey: resolveSeasonLookupKey(seasonIdentity) || selectedSeasonKey,
    seasonId: seasonIdentity.seasonId,
    selectedTarget: target,
    teamsCount,
    tableStatus: getTableStatus(tableRows, teamsCount),
    teamsStatus: getTeamsStatus(tableRows),
    statsStatus: getStatsStatus(tableRows),
    playersWithProfiles: getProfiledPlayersCount(tableRows),
    hasLeagueDoc,
    hasSelectedSeason: Boolean(season),
    catalog,
    sourceLeague: league,
  }
}

export const buildLeagueCenterRows = ({
  leagueDocs,
  selectedSeasonKey,
}) => {
  const leagueDocsMap = buildLeagueDocsMap(leagueDocs)
  const catalogIds = new Set(PLAYERS_DATABASE_LEAGUES_CATALOG.map(item => item.id))

  const catalogRows = PLAYERS_DATABASE_LEAGUES_CATALOG.map(catalog => {
    const league = leagueDocsMap.get(catalog.id) || catalog

    return buildLeagueCenterRow({
      league,
      catalog,
      hasLeagueDoc: league !== catalog,
      selectedSeasonKey,
    })
  })

  const extraRows = leagueDocs
    .filter(league => !getLeagueIds(league).some(id => catalogIds.has(id)))
    .map(league => (
      buildLeagueCenterRow({
        league,
        catalog: getCatalogLeague(league),
        hasLeagueDoc: true,
        selectedSeasonKey,
      })
    ))

  return [...catalogRows, ...extraRows].filter(row => row.id)
}

export const buildLeagueCenterSeasonOptions = leagueDocs => {
  const keys = new Set(DEFAULT_SEASON_OPTIONS)

  leagueDocs.forEach(league => {
    getLeagueSeasons(league).forEach(({ season }) => {
      const key = resolveSeasonLookupKey(season)
      if (key) keys.add(key)
    })
  })

  return Array.from(keys)
}

export const buildLeagueCenterBirthYearOptions = rows => {
  const years = rows
    .map(row => toNumber(row.birthYear))
    .filter(Boolean)
    .sort((a, b) => b - a)

  return Array.from(new Set(years))
}

export const buildLeagueCenterAgeGroupOptions = rows => {
  const map = new Map()

  rows.forEach(row => {
    const label = clean(row.ageGroupLabel)
    const value = clean(row.ageGroupId || label)
    const key = label || value

    if (!key || map.has(key)) return

    map.set(key, {
      value,
      label,
    })
  })

  return Array.from(map.values())
}

export const buildLeagueCenterLeagueOptions = rows => {
  const map = new Map()

  rows.forEach(row => {
    const label = clean(row.leagueName)
    if (!label || map.has(label)) return

    map.set(label, {
      value: label,
      label,
    })
  })

  return Array.from(map.values())
}

export const buildLeagueCenterSummary = rows => ({
  totalLeagues: rows.length,
  openedLeagues: rows.filter(row => row.hasLeagueDoc).length,
  unopenedCatalogLeagues: rows.filter(row => (
    row.catalogLeagueId && !row.hasLeagueDoc
  )).length,
  fullTables: rows.filter(row => row.tableStatus === 'full').length,
  partialTeams: rows.filter(row => row.teamsStatus !== 'full').length,
  profiledPlayers: rows.reduce(
    (sum, row) => sum + toNumber(row.playersWithProfiles),
    0
  ),
  catalogLeagues: PLAYERS_DATABASE_LEAGUES_CATALOG.length,
})

