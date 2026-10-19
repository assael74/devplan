// src/features/playersDatabase/ui/pages/leagueCenterPage/hooks/useLeagueCenter.js

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  useLocation,
  useSearchParams,
} from 'react-router-dom'

import {
  LEAGUE_CENTER_ALL_SEASONS_KEY,
  LEAGUE_CENTER_DEFAULT_SEASON_KEY,
  buildLeagueCenterLeagueDocuments,
  buildLeagueCenterRows,
  resolveLeagueCenterSeasonTarget,
} from '../../../../model/league/center/leagueCenterRows.model.js'
import {
  buildLeagueCenterAgeGroupOptions,
  buildLeagueCenterBirthYearOptions,
  buildLeagueCenterFilterCounts,
  buildLeagueCenterLevelOptions,
  buildLeagueCenterOpenOptions,
  buildLeagueCenterSeasonOptions,
} from '../../../../model/league/center/leagueCenterOptions.model.js'
import { buildLeagueCenterSummary } from '../../../../model/league/center/leagueCenterSummary.model.js'
import { normalizeSeasonLookupKey } from '../../../../model/shared/season.model.js'
import {
  LEAGUES_CENTER_STORE_KEY,
  readLeagueCenterData,
} from '../../../../services/read/pages/leagueCenter.read.js'
import usePlayersDatabaseReadStoreEntry from '../../../hooks/usePlayersDatabaseReadStoreEntry.js'
import { CLUBS_DIRECTORY_STORE_KEY } from '../../../../services/read/pages/clubs.read.js'
import { filterByText } from '../../../logic/filters.logic.js'
import { PLAYERS_DATABASE_QUERY_KEYS as queryKeys } from '../../../logic/routeBuilders.js'

const LEGACY_QUERY_KEYS = {
  [queryKeys.season]: 'season',
  [queryKeys.birthYear]: 'birthYear',
  [queryKeys.ageGroup]: 'ageGroup',
  [queryKeys.level]: 'level',
  [queryKeys.status]: 'status',
  [queryKeys.view]: 'view',
}

const readQueryValue = (searchParams, key) => (
  searchParams.get(key) || searchParams.get(LEGACY_QUERY_KEYS[key])
)

const deleteQueryValue = (searchParams, key) => {
  searchParams.delete(key)
  if (LEGACY_QUERY_KEYS[key]) searchParams.delete(LEGACY_QUERY_KEYS[key])
}

function cleanSeasonKey(value) {
  return normalizeSeasonLookupKey(value)
}

function cleanFilterValue(value) {
  return String(value || '').trim() || 'all'
}

function cleanMultiFilterValues(value, normalizer = cleanFilterValue) {
  const values = String(value || '')
    .split(',')
    .map(item => normalizer(item))
    .filter(item => item && item !== 'all')

  return Array.from(new Set(values))
}

function filterByValues(rows, field, values) {
  if (!values.length) return rows

  return rows.filter(row => values.includes(String(row[field] || '')))
}

const DEFAULT_LEAGUE_STATUSES = ['active', 'no_teams']

export function useLeagueCenter() {
  const location = useLocation()
  const directoryEntry = usePlayersDatabaseReadStoreEntry(CLUBS_DIRECTORY_STORE_KEY)
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const nextSearchParams = new URLSearchParams(searchParams)
    let changed = false

    Object.entries(LEGACY_QUERY_KEYS).forEach(([key, legacyKey]) => {
      const legacyValue = nextSearchParams.get(legacyKey)
      if (!legacyValue) return

      if (!nextSearchParams.has(key)) nextSearchParams.set(key, legacyValue)
      nextSearchParams.delete(legacyKey)
      changed = true
    })

    if (!changed) return

    setSearchParams(nextSearchParams, {
      replace: true,
      state: location.state,
    })
  }, [location.state, searchParams, setSearchParams])

  const requestedSeasonKeys = cleanMultiFilterValues(
    readQueryValue(searchParams, queryKeys.season),
    cleanSeasonKey
  )
  const requestedBirthYears = cleanMultiFilterValues(readQueryValue(searchParams, queryKeys.birthYear))
  const ageGroupId = cleanFilterValue(readQueryValue(searchParams, queryKeys.ageGroup))
  const leagueLevel = cleanFilterValue(readQueryValue(searchParams, queryKeys.level))
  const requestedLeagueStatuses = cleanMultiFilterValues(readQueryValue(searchParams, queryKeys.status))
  const leagueStatuses = requestedLeagueStatuses.length
    ? requestedLeagueStatuses
    : DEFAULT_LEAGUE_STATUSES
  const leagueStatus = leagueStatuses.length === 1 ? leagueStatuses[0] : 'all'
  const quickView = cleanFilterValue(readQueryValue(searchParams, queryKeys.view))
  const [query, setQuery] = useState('')
  const centerEntry = usePlayersDatabaseReadStoreEntry(LEAGUES_CENTER_STORE_KEY)
  const leaguesCenterDoc = centerEntry.data
  const loading = centerEntry.status === 'idle' || centerEntry.status === 'loading'
  const refreshing = centerEntry.status === 'refreshing'
  const error = centerEntry.status === 'error'
    ? centerEntry.error?.message || 'טעינת מרכז הליגות נכשלה'
    : ''
  const refreshError = centerEntry.refreshError?.message || ''

  const reload = useCallback((options = {}) => (
    readLeagueCenterData({ fromServer: options?.fromServer === true })
  ), [])

  const leagueDocs = useMemo(
    () => buildLeagueCenterLeagueDocuments({ leaguesCenterDoc }),
    [leaguesCenterDoc]
  )
  const seasonOptions = useMemo(
    () => buildLeagueCenterSeasonOptions(leagueDocs),
    [leagueDocs]
  )
  const openLeagueOptions = useMemo(
    () => buildLeagueCenterOpenOptions(leagueDocs),
    [leagueDocs]
  )
  const allRows = useMemo(() => buildLeagueCenterRows({
    leagueDocs,
    selectedSeasonKey: LEAGUE_CENTER_ALL_SEASONS_KEY,
  }), [leagueDocs])
  const birthYearOptions = useMemo(
    () => buildLeagueCenterBirthYearOptions(allRows),
    [allRows]
  )
  const highestBirthYear = birthYearOptions.length
    ? String(birthYearOptions[0])
    : ''
  const birthYears = requestedBirthYears.length
    ? requestedBirthYears
    : (highestBirthYear ? [highestBirthYear] : [])
  const birthYear = birthYears.length === 1 ? birthYears[0] : 'all'
  const highestSeasonKey = [...seasonOptions]
    .filter(key => key !== LEAGUE_CENTER_ALL_SEASONS_KEY)
    .sort((left, right) => Number(right.slice(0, 2)) - Number(left.slice(0, 2)))[0] || ''
  const seasonKeys = requestedSeasonKeys.length
    ? requestedSeasonKeys
    : (highestSeasonKey ? [highestSeasonKey] : [])
  const seasonKey = seasonKeys.length === 1
    ? seasonKeys[0]
    : LEAGUE_CENTER_ALL_SEASONS_KEY
  const levelOptions = useMemo(
    () => buildLeagueCenterLevelOptions(allRows),
    [allRows]
  )
  const ageGroupOptions = useMemo(
    () => buildLeagueCenterAgeGroupOptions(allRows),
    [allRows]
  )
  const rowsForSelectedSeason = useMemo(() => filterByValues(
    allRows,
    'seasonKey',
    seasonKeys
  ), [allRows, seasonKeys])
  const contextRows = useMemo(() => {
    const byBirthYear = filterByValues(rowsForSelectedSeason, 'birthYear', birthYears)
    const byLevel = leagueLevel === 'all'
      ? byBirthYear
      : byBirthYear.filter(row => String(row.level || '') === leagueLevel)
    const byAgeGroup = ageGroupId === 'all'
      ? byLevel
      : byLevel.filter(row => String(row.ageGroupId || '') === ageGroupId)

    return filterByValues(byAgeGroup, 'seasonWorkStatus', leagueStatuses)
  }, [
    rowsForSelectedSeason,
    birthYears,
    ageGroupId,
    leagueStatuses,
    leagueLevel,
  ])
  const filterCounts = useMemo(() => buildLeagueCenterFilterCounts({
    allRows,
    rowsForSelectedSeason,
    birthYears,
    seasonKeys,
    ageGroupId,
    leagueLevel,
    leagueStatuses,
  }), [
    ageGroupId,
    allRows,
    birthYears,
    leagueLevel,
    leagueStatuses,
    rowsForSelectedSeason,
    seasonKeys,
  ])
  const quickViewRows = useMemo(() => {
    if (quickView === 'active') {
      return contextRows.filter(row => row.seasonWorkStatus === 'active')
    }
    if (quickView === 'not_started') {
      return contextRows.filter(row => row.seasonWorkStatus === 'not_started')
    }
    if (quickView === 'review') {
      return contextRows.filter(row => row.requiresReview)
    }
    if (quickView === 'priority') {
      return contextRows.filter(row => row.hasTeamSignals)
    }
    return contextRows
  }, [contextRows, quickView])
  const leagues = useMemo(() => filterByText(
    quickViewRows,
    query,
    ['leagueName', 'teamSearchText']
  ), [quickViewRows, query])
  const summary = useMemo(
    () => buildLeagueCenterSummary(contextRows),
    [contextRows]
  )

  const updateParam = useCallback((key, value, allValue = 'all') => {
    const nextSearchParams = new URLSearchParams(searchParams)

    if (!value || value === allValue) {
      deleteQueryValue(nextSearchParams, key)
    } else {
      nextSearchParams.set(key, value)
    }

    setSearchParams(nextSearchParams, {
      replace: true,
      state: location.state,
    })
  }, [location.state, searchParams, setSearchParams])

  const updateMultiParam = useCallback((key, values) => {
    const nextSearchParams = new URLSearchParams(searchParams)

    deleteQueryValue(nextSearchParams, key)
    if (values.length) nextSearchParams.set(key, values.join(','))

    setSearchParams(nextSearchParams, {
      replace: true,
      state: location.state,
    })
  }, [location.state, searchParams, setSearchParams])

  const setSeasonKey = useCallback(value => {
    if (value === null || value === undefined || value === '') return

    const nextValue = cleanSeasonKey(value) || LEAGUE_CENTER_DEFAULT_SEASON_KEY
    updateMultiParam(queryKeys.season, nextValue === LEAGUE_CENTER_ALL_SEASONS_KEY ? [] : [nextValue])
  }, [updateMultiParam])

  const toggleSeasonKey = useCallback(value => {
    const nextValue = cleanSeasonKey(value)
    if (!nextValue) return

    if (nextValue === LEAGUE_CENTER_ALL_SEASONS_KEY) return

    if (seasonKeys.length === 1 && seasonKeys[0] === nextValue) return

    const nextValues = seasonKeys.includes(nextValue)
      ? seasonKeys.filter(item => item !== nextValue)
      : [...seasonKeys, nextValue]

    updateMultiParam(queryKeys.season, nextValues)
  }, [seasonKeys, updateMultiParam])

  const setBirthYear = useCallback(value => {
    if (value === null || value === undefined || value === '') return
    const nextValue = cleanFilterValue(value)
    updateMultiParam(queryKeys.birthYear, nextValue === 'all' ? [] : [nextValue])
  }, [updateMultiParam])

  const toggleBirthYear = useCallback(value => {
    const nextValue = cleanFilterValue(value)

    if (nextValue === 'all') return

    if (birthYears.length === 1 && birthYears[0] === nextValue) return

    const nextValues = birthYears.includes(nextValue)
      ? birthYears.filter(item => item !== nextValue)
      : [...birthYears, nextValue]

    updateMultiParam(queryKeys.birthYear, nextValues)
  }, [birthYears, updateMultiParam])

  const setAgeGroupId = useCallback(value => {
    if (value === null || value === undefined || value === '') return
    updateParam(queryKeys.ageGroup, cleanFilterValue(value))
  }, [updateParam])

  const setLeagueLevel = useCallback(value => {
    if (value === null || value === undefined || value === '') return
    updateParam(queryKeys.level, cleanFilterValue(value))
  }, [updateParam])

  const setLeagueStatus = useCallback(value => {
    if (value === null || value === undefined || value === '') return
    updateMultiParam(queryKeys.status, [cleanFilterValue(value)])
  }, [updateMultiParam])

  const toggleLeagueStatus = useCallback(value => {
    const nextValue = cleanFilterValue(value)
    if (nextValue === 'all') return

    if (leagueStatuses.length === 1 && leagueStatuses[0] === nextValue) return

    const nextValues = leagueStatuses.includes(nextValue)
      ? leagueStatuses.filter(item => item !== nextValue)
      : [...leagueStatuses, nextValue]

    updateMultiParam(queryKeys.status, nextValues)
  }, [leagueStatuses, updateMultiParam])

  const setQuickView = useCallback(value => {
    updateParam(queryKeys.view, cleanFilterValue(value), 'all')
  }, [updateParam])

  const resetPrimaryFilters = useCallback(() => {
    const nextSearchParams = new URLSearchParams(searchParams)

    deleteQueryValue(nextSearchParams, queryKeys.season)
    deleteQueryValue(nextSearchParams, queryKeys.birthYear)
    deleteQueryValue(nextSearchParams, queryKeys.ageGroup)
    deleteQueryValue(nextSearchParams, queryKeys.level)
    deleteQueryValue(nextSearchParams, queryKeys.status)
    deleteQueryValue(nextSearchParams, queryKeys.view)

    setSearchParams(nextSearchParams, {
      replace: true,
      state: location.state,
    })
  }, [location.state, searchParams, setSearchParams])

  const resetContext = useCallback(() => {
    setQuery('')
    setSearchParams(new URLSearchParams(), {
      replace: true,
      state: location.state,
    })
  }, [location.state, setSearchParams])

  return {
    query,
    setQuery,
    birthYear,
    birthYears,
    setBirthYear,
    toggleBirthYear,
    birthYearOptions,
    ageGroupId,
    setAgeGroupId,
    ageGroupOptions,
    leagueLevel,
    setLeagueLevel,
    levelOptions,
    leagueStatus,
    leagueStatuses,
    setLeagueStatus,
    toggleLeagueStatus,
    filterCounts,
    quickView,
    setQuickView,
    seasonKey,
    seasonKeys,
    setSeasonKey,
    toggleSeasonKey,
    seasonTarget: resolveLeagueCenterSeasonTarget(seasonKey),
    seasonOptions,
    openLeagueOptions,
    allRows,
    contextRows,
    leagues,
    summary,
    loading,
    refreshing,
    error,
    refreshError,
    leaguesCenterDoc,
    clubsDirectoryDocument: directoryEntry.data,
    directoryLoading: directoryEntry.status === 'idle' || directoryEntry.status === 'loading',
    leagueDocs,
    reload,
    resetPrimaryFilters,
    resetContext,
  }
}
