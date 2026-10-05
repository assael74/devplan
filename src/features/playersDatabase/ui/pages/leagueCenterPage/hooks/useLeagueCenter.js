// src/features/playersDatabase/ui/pages/leagueCenterPage/hooks/useLeagueCenter.js

import {
  useCallback,
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
import {
  filterByText,
  filterByValue,
} from '../../../logic/filters.logic.js'

function cleanSeasonKey(value) {
  return normalizeSeasonLookupKey(value)
}

function cleanFilterValue(value) {
  return String(value || '').trim() || 'all'
}

export function useLeagueCenter() {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedSeasonKey = cleanSeasonKey(searchParams.get('season'))
  const birthYear = cleanFilterValue(searchParams.get('birthYear'))
  const ageGroupId = cleanFilterValue(searchParams.get('ageGroup'))
  const leagueLevel = cleanFilterValue(searchParams.get('level'))
  const leagueStatus = cleanFilterValue(searchParams.get('status'))
  const seasonKey = requestedSeasonKey || LEAGUE_CENTER_ALL_SEASONS_KEY
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
  const levelOptions = useMemo(
    () => buildLeagueCenterLevelOptions(allRows),
    [allRows]
  )
  const ageGroupOptions = useMemo(
    () => buildLeagueCenterAgeGroupOptions(allRows),
    [allRows]
  )
  const rowsForSelectedSeason = useMemo(() => (
    seasonKey === LEAGUE_CENTER_ALL_SEASONS_KEY
      ? allRows
      : buildLeagueCenterRows({
        leagueDocs,
        selectedSeasonKey: seasonKey,
      })
  ), [allRows, leagueDocs, seasonKey])
  const contextRows = useMemo(() => {
    const byBirthYear = filterByValue(
      rowsForSelectedSeason,
      'birthYear',
      birthYear
    )
    const byLevel = filterByValue(
      byBirthYear,
      'level',
      leagueLevel
    )
    const byAgeGroup = filterByValue(byLevel, 'ageGroupId', ageGroupId)

    return filterByValue(byAgeGroup, 'seasonStatus', leagueStatus)
  }, [
    rowsForSelectedSeason,
    birthYear,
    ageGroupId,
    leagueStatus,
    leagueLevel,
  ])
  const leagues = useMemo(() => filterByText(
    contextRows,
    query,
    ['leagueName', 'teamSearchText']
  ), [contextRows, query])
  const summary = useMemo(
    () => buildLeagueCenterSummary(contextRows),
    [contextRows]
  )

  const updateParam = useCallback((key, value, allValue = 'all') => {
    const nextSearchParams = new URLSearchParams(searchParams)

    if (!value || value === allValue) {
      nextSearchParams.delete(key)
    } else {
      nextSearchParams.set(key, value)
    }

    setSearchParams(nextSearchParams, {
      replace: true,
      state: location.state,
    })
  }, [location.state, searchParams, setSearchParams])

  const setSeasonKey = useCallback(value => {
    if (value === null || value === undefined || value === '') return

    const nextValue = cleanSeasonKey(value) || LEAGUE_CENTER_DEFAULT_SEASON_KEY
    updateParam('season', nextValue, LEAGUE_CENTER_ALL_SEASONS_KEY)
  }, [updateParam])

  const setBirthYear = useCallback(value => {
    if (value === null || value === undefined || value === '') return
    updateParam('birthYear', cleanFilterValue(value))
  }, [updateParam])

  const setAgeGroupId = useCallback(value => {
    if (value === null || value === undefined || value === '') return
    updateParam('ageGroup', cleanFilterValue(value))
  }, [updateParam])

  const setLeagueLevel = useCallback(value => {
    if (value === null || value === undefined || value === '') return
    updateParam('level', cleanFilterValue(value))
  }, [updateParam])

  const setLeagueStatus = useCallback(value => {
    if (value === null || value === undefined || value === '') return
    updateParam('status', cleanFilterValue(value))
  }, [updateParam])

  const resetPrimaryFilters = useCallback(() => {
    const nextSearchParams = new URLSearchParams(searchParams)

    nextSearchParams.delete('season')
    nextSearchParams.delete('birthYear')
    nextSearchParams.delete('ageGroup')
    nextSearchParams.delete('level')
    nextSearchParams.delete('status')

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
    setBirthYear,
    birthYearOptions,
    ageGroupId,
    setAgeGroupId,
    ageGroupOptions,
    leagueLevel,
    setLeagueLevel,
    levelOptions,
    leagueStatus,
    setLeagueStatus,
    seasonKey,
    setSeasonKey,
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
    leagueDocs,
    reload,
    resetPrimaryFilters,
    resetContext,
  }
}
