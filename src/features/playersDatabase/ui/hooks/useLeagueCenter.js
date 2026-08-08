// features/playersDatabase/ui/hooks/useLeagueCenter.js

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

import { PLAYERS_DATABASE_LEAGUES_CATALOG } from '../../catalog/leagues.catalog.js'
import {
  LEAGUE_CENTER_ALL_SEASONS_KEY,
  LEAGUE_CENTER_DEFAULT_SEASON_KEY,
  buildLeagueCenterBirthYearOptions,
  buildLeagueCenterLeagueDocsFromMasterDocument,
  buildLeagueCenterLevelOptions,
  buildLeagueCenterRowsFromMasterDocument,
  buildLeagueCenterSeasonOptions,
  buildLeagueCenterSummary,
  resolveLeagueCenterSeasonTarget,
} from '../../model/leagueCenter.model.js'
import { normalizeSeasonLookupKey } from '../../model/season.model.js'
import { readLeagueCenterData } from '../../services/read/index.js'
import {
  filterByText,
  filterByValue,
} from '../logic/filters.logic.js'

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
  const leagueLevel = cleanFilterValue(searchParams.get('level'))
  const seasonKey = requestedSeasonKey || LEAGUE_CENTER_ALL_SEASONS_KEY
  const [query, setQuery] = useState('')
  const [dataStatus, setDataStatus] = useState('all')
  const [leaguesMasterDoc, setLeaguesMasterDoc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const {
        leaguesMasterDoc: nextMasterDoc,
      } = await readLeagueCenterData()

      setLeaguesMasterDoc(nextMasterDoc || null)
      return nextMasterDoc || null
    } catch (err) {
      setLeaguesMasterDoc(null)
      setError(err?.message || 'טעינת מרכז הליגות נכשלה')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload().catch(() => {})
  }, [reload])

  const leagueDocs = useMemo(
    () => buildLeagueCenterLeagueDocsFromMasterDocument({ leaguesMasterDoc }),
    [leaguesMasterDoc]
  )
  const seasonOptions = useMemo(
    () => buildLeagueCenterSeasonOptions(leagueDocs),
    [leagueDocs]
  )
  const allRows = useMemo(() => buildLeagueCenterRowsFromMasterDocument({
    leaguesMasterDoc,
    selectedSeasonKey: LEAGUE_CENTER_ALL_SEASONS_KEY,
  }), [leaguesMasterDoc])
  const birthYearOptions = useMemo(
    () => buildLeagueCenterBirthYearOptions(allRows),
    [allRows]
  )
  const levelOptions = useMemo(
    () => buildLeagueCenterLevelOptions(allRows),
    [allRows]
  )
  const contextRows = useMemo(() => {
    const bySeason = filterByValue(
      allRows,
      'seasonKey',
      seasonKey
    )
    const byBirthYear = filterByValue(
      bySeason,
      'birthYear',
      birthYear
    )

    return filterByValue(
      byBirthYear,
      'level',
      leagueLevel
    )
  }, [
    allRows,
    birthYear,
    leagueLevel,
    seasonKey,
  ])
  const leagues = useMemo(() => {
    const byText = filterByText(
      contextRows,
      query,
      ['name', 'leagueName']
    )

    return filterByValue(
      byText,
      'dataStatus',
      dataStatus
    )
  }, [
    contextRows,
    dataStatus,
    query,
  ])
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
  }, [
    location.state,
    searchParams,
    setSearchParams,
  ])

  const setSeasonKey = useCallback(value => {
    if (value === null || value === undefined || value === '') return

    const nextValue = cleanSeasonKey(value) || LEAGUE_CENTER_DEFAULT_SEASON_KEY
    updateParam(
      'season',
      nextValue,
      LEAGUE_CENTER_ALL_SEASONS_KEY
    )
  }, [updateParam])

  const setBirthYear = useCallback(value => {
    if (value === null || value === undefined || value === '') return

    updateParam(
      'birthYear',
      cleanFilterValue(value)
    )
  }, [updateParam])

  const setLeagueLevel = useCallback(value => {
    if (value === null || value === undefined || value === '') return

    updateParam(
      'level',
      cleanFilterValue(value)
    )
  }, [updateParam])

  const resetPrimaryFilters = useCallback(() => {
    const nextSearchParams = new URLSearchParams(searchParams)

    nextSearchParams.delete('season')
    nextSearchParams.delete('birthYear')
    nextSearchParams.delete('level')

    setSearchParams(nextSearchParams, {
      replace: true,
      state: location.state,
    })
  }, [
    location.state,
    searchParams,
    setSearchParams,
  ])

  const resetContext = useCallback(() => {
    setQuery('')
    setDataStatus('all')
    setSearchParams(new URLSearchParams(), {
      replace: true,
      state: location.state,
    })
  }, [
    location.state,
    setSearchParams,
  ])

  return {
    query,
    setQuery,
    dataStatus,
    setDataStatus,
    birthYear,
    setBirthYear,
    birthYearOptions,
    leagueLevel,
    setLeagueLevel,
    levelOptions,
    seasonKey,
    setSeasonKey,
    seasonTarget: resolveLeagueCenterSeasonTarget(seasonKey),
    seasonOptions,
    contextRows,
    leagues,
    summary,
    loading,
    error,
    leagueDocs,
    catalogLeagues: PLAYERS_DATABASE_LEAGUES_CATALOG,
    reload,
    resetPrimaryFilters,
    resetContext,
  }
}
