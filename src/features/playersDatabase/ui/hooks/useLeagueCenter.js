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
  buildLeagueCenterLeagueDocuments,
  buildLeagueCenterRows,
  resolveLeagueCenterSeasonTarget,
} from '../../model/league/center/leagueCenterRows.model.js'
import {
  buildLeagueCenterAgeGroupOptions,
  buildLeagueCenterBirthYearOptions,
  buildLeagueCenterLevelOptions,
  buildLeagueCenterSeasonOptions,
} from '../../model/league/center/leagueCenterOptions.model.js'
import { buildLeagueCenterSummary } from '../../model/league/center/leagueCenterSummary.model.js'
import { normalizeSeasonLookupKey } from '../../model/shared/season.model.js'
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
  const ageGroupId = cleanFilterValue(searchParams.get('ageGroup'))
  const leagueLevel = cleanFilterValue(searchParams.get('level'))
  const seasonKey = requestedSeasonKey || LEAGUE_CENTER_ALL_SEASONS_KEY
  const [query, setQuery] = useState('')
  const [leaguesMasterDoc, setLeaguesMasterDoc] = useState(null)
  const [leagueDocuments, setLeagueDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const {
        leaguesMasterDoc: nextMasterDoc,
        leagueDocuments: nextLeagueDocuments,
      } = await readLeagueCenterData()

      setLeaguesMasterDoc(nextMasterDoc || null)
      setLeagueDocuments(
        Array.isArray(nextLeagueDocuments) ? nextLeagueDocuments : []
      )

      return {
        leaguesMasterDoc: nextMasterDoc || null,
        leagueDocuments: Array.isArray(nextLeagueDocuments)
          ? nextLeagueDocuments
          : [],
      }
    } catch (err) {
      setLeaguesMasterDoc(null)
      setLeagueDocuments([])
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
    () => buildLeagueCenterLeagueDocuments({
      leaguesMasterDoc,
      leagueDocuments,
    }),
    [
      leagueDocuments,
      leaguesMasterDoc,
    ]
  )
  const seasonOptions = useMemo(
    () => buildLeagueCenterSeasonOptions(leagueDocs),
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

    const byLevel = filterByValue(
      byBirthYear,
      'level',
      leagueLevel
    )

    return filterByValue(byLevel, 'ageGroupId', ageGroupId)
  }, [
    allRows,
    birthYear,
    ageGroupId,
    leagueLevel,
    seasonKey,
  ])
  const leagues = useMemo(() => {
    const byText = filterByText(
      contextRows,
      query,
      ['teamSearchText']
    )

    return byText
  }, [
    contextRows,
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

  const setAgeGroupId = useCallback(value => {
    if (value === null || value === undefined || value === '') return

    updateParam('ageGroup', cleanFilterValue(value))
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
    nextSearchParams.delete('ageGroup')
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
    birthYear,
    setBirthYear,
    birthYearOptions,
    ageGroupId,
    setAgeGroupId,
    ageGroupOptions,
    leagueLevel,
    setLeagueLevel,
    levelOptions,
    seasonKey,
    setSeasonKey,
    seasonTarget: resolveLeagueCenterSeasonTarget(seasonKey),
    seasonOptions,
    allRows,
    contextRows,
    leagues,
    summary,
    loading,
    error,
    leagueDocs,
    leagueDocuments,
    catalogLeagues: PLAYERS_DATABASE_LEAGUES_CATALOG,
    reload,
    resetPrimaryFilters,
    resetContext,
  }
}
