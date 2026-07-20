// features/playersDatabase/ui/hooks/useLeagueCenter.js

import { useEffect, useMemo, useState } from 'react'

import { PLAYERS_DATABASE_LEAGUES_CATALOG } from '../../catalog/leagues.catalog.js'
import { listLeagues } from '../../services/read/index.js'
import { filterByText, filterByValue } from '../logic/filters.logic.js'

const DEFAULT_SEASON_KEY = '26/27'
const DEFAULT_SEASON_OPTIONS = ['26/27', '25/26', '24/25', '23/24', '22/23']

const clean = value => String(value ?? '').trim()

const toNumber = value => {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

const toAgeGroupLabel = value => {
  const ageGroupId = clean(value)
  if (!ageGroupId) return ''

  return ageGroupId.toUpperCase()
}

const normalizeSeasonKey = value => {
  const key = clean(value)
  if (!key) return ''

  const fullMatch = key.match(/^20(\d{2})\s*\/\s*20(\d{2})$/)
  if (fullMatch) return `${fullMatch[1]}/${fullMatch[2]}`

  return key.replace(/_/g, '/')
}

const isSameSeasonKey = (left, right) => {
  const leftKey = normalizeSeasonKey(left)
  const rightKey = normalizeSeasonKey(right)

  return Boolean(leftKey && rightKey && leftKey === rightKey)
}

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
    const stats = row?.teamStats || {}
    return (
      toNumber(stats.teamGamePlayed) > 0 ||
      toNumber(stats.goalsFor) > 0 ||
      toNumber(stats.goalsAgainst) > 0 ||
      toNumber(stats.points) > 0
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
    seasonKey: normalizeSeasonKey(season?.seasonKey || season?.seasonId) || selectedSeasonKey,
    seasonId: clean(season?.seasonId),
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

const buildLeagueCenterRows = ({
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

const buildSeasonOptions = leagueDocs => {
  const keys = new Set(DEFAULT_SEASON_OPTIONS)

  leagueDocs.forEach(league => {
    getLeagueSeasons(league).forEach(({ season }) => {
      const key = normalizeSeasonKey(season?.seasonKey || season?.seasonId)
      if (key) keys.add(key)
    })
  })

  return Array.from(keys)
}

const buildBirthYearOptions = rows => {
  const years = rows
    .map(row => toNumber(row.birthYear))
    .filter(Boolean)
    .sort((a, b) => b - a)

  return Array.from(new Set(years))
}

const buildAgeGroupOptions = rows => {
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

const buildLeagueOptions = rows => {
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

const buildSummary = rows => ({
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

export function useLeagueCenter() {
  const [query, setQuery] = useState('')
  const [leagueFilter, setLeagueFilter] = useState('all')
  const [ageGroup, setAgeGroup] = useState('all')
  const [birthYear, setBirthYear] = useState('all')
  const [seasonKey, setSeasonKey] = useState(DEFAULT_SEASON_KEY)
  const [leagueDocs, setLeagueDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadLeagueDocs() {
      setLoading(true)
      setError('')

      try {
        const rows = await listLeagues()

        if (!active) return

        setLeagueDocs(Array.isArray(rows) ? rows : [])
      } catch (err) {
        if (!active) return

        setLeagueDocs([])
        setError(err?.message || 'טעינת הליגות נכשלה')
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadLeagueDocs()

    return () => {
      active = false
    }
  }, [])

  const leagueRows = useMemo(() => (
    buildLeagueCenterRows({
      leagueDocs,
      selectedSeasonKey: seasonKey,
    })
  ), [leagueDocs, seasonKey])

  const leagues = useMemo(() => {
    const byText = filterByText(
      leagueRows,
      query,
      ['name', 'birthYear', 'seasonKey']
    )
    const byLeague = filterByValue(byText, 'leagueName', leagueFilter)
    const byAgeGroup = filterByValue(byLeague, 'ageGroupId', ageGroup)

    return filterByValue(byAgeGroup, 'birthYear', birthYear)
  }, [ageGroup, birthYear, leagueFilter, leagueRows, query])

  const summary = useMemo(() => buildSummary(leagueRows), [leagueRows])
  const seasonOptions = useMemo(() => buildSeasonOptions(leagueDocs), [leagueDocs])
  const birthYearOptions = useMemo(() => buildBirthYearOptions(leagueRows), [leagueRows])
  const ageGroupOptions = useMemo(() => buildAgeGroupOptions(leagueRows), [leagueRows])
  const leagueOptions = useMemo(() => buildLeagueOptions(leagueRows), [leagueRows])

  return {
    query,
    setQuery,
    leagueFilter,
    setLeagueFilter,
    leagueOptions,
    ageGroup,
    setAgeGroup,
    ageGroupOptions,
    birthYear,
    setBirthYear,
    seasonKey,
    setSeasonKey,
    seasonTarget: resolveLeagueCenterSeasonTarget(seasonKey),
    seasonOptions,
    birthYearOptions,
    leagues,
    summary,
    loading,
    error,
    leagueDocs,
    catalogLeagues: PLAYERS_DATABASE_LEAGUES_CATALOG,
  }
}
