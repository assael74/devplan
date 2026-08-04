// features/playersDatabase/ui/hooks/useLeagueCenter.js

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

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
import { filterByText, filterByValue } from '../logic/filters.logic.js'

const cleanSeasonKey = value => String(value || '').trim()
const cleanFilterValue = value => String(value || '').trim() || 'all'
const hasSeasonOption = (options = [], seasonKey = '') => {
  const selected = normalizeSeasonLookupKey(seasonKey)
  if (selected === LEAGUE_CENTER_ALL_SEASONS_KEY) return true
  return Boolean(selected && options.some(option => (
    normalizeSeasonLookupKey(option) === selected
  )))
}

export function useLeagueCenter() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedSeasonKey = cleanSeasonKey(searchParams.get('season'))
  const requestedBirthYear = cleanFilterValue(searchParams.get('birthYear'))
  const requestedLevel = cleanFilterValue(searchParams.get('level'))
  const [query, setQuery] = useState('')
  const [dataStatus, setDataStatus] = useState('all')
  const [birthYear, setBirthYearState] = useState(requestedBirthYear)
  const [leagueLevel, setLeagueLevelState] = useState(requestedLevel)
  const [seasonKey, setSeasonKeyState] = useState(
    requestedSeasonKey || LEAGUE_CENTER_DEFAULT_SEASON_KEY
  )
  const [leaguesMasterDoc, setLeaguesMasterDoc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const { leaguesMasterDoc: nextMasterDoc } = await readLeagueCenterData()
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
    selectedSeasonKey: seasonKey,
  }), [leaguesMasterDoc, seasonKey])

  const birthYearOptions = useMemo(
    () => buildLeagueCenterBirthYearOptions(allRows),
    [allRows]
  )
  const birthYearRows = useMemo(
    () => filterByValue(allRows, 'birthYear', birthYear),
    [allRows, birthYear]
  )
  const levelOptions = useMemo(
    () => buildLeagueCenterLevelOptions(birthYearRows),
    [birthYearRows]
  )
  const contextRows = useMemo(() => (
    filterByValue(birthYearRows, 'level', leagueLevel)
  ), [birthYearRows, leagueLevel])
  const leagues = useMemo(() => {
    const byText = filterByText(contextRows, query, ['name', 'leagueName'])
    return filterByValue(byText, 'dataStatus', dataStatus)
  }, [contextRows, dataStatus, query])
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

    setSearchParams(nextSearchParams, { replace: true })
  }, [searchParams, setSearchParams])

  const setSeasonKey = useCallback(value => {
    const nextValue = cleanSeasonKey(value) || LEAGUE_CENTER_DEFAULT_SEASON_KEY
    setSeasonKeyState(nextValue)
    updateParam('season', nextValue, LEAGUE_CENTER_ALL_SEASONS_KEY)
  }, [updateParam])
  const setBirthYear = useCallback(value => {
    const nextValue = cleanFilterValue(value)
    setBirthYearState(nextValue)
    updateParam('birthYear', nextValue)
  }, [updateParam])
  const setLeagueLevel = useCallback(value => {
    const nextValue = cleanFilterValue(value)
    setLeagueLevelState(nextValue)
    updateParam('level', nextValue)
  }, [updateParam])

  useEffect(() => {
    if (!seasonOptions.length) return

    const availableSeasons = seasonOptions.filter(option => (
      option !== LEAGUE_CENTER_ALL_SEASONS_KEY
    ))
    const fallbackSeason = availableSeasons[0] || LEAGUE_CENTER_DEFAULT_SEASON_KEY

    if (
      seasonKey !== LEAGUE_CENTER_ALL_SEASONS_KEY &&
      hasSeasonOption(seasonOptions, seasonKey)
    ) return

    setSeasonKey(fallbackSeason)
  }, [seasonKey, seasonOptions, setSeasonKey])

  useEffect(() => {
    if (!leaguesMasterDoc || !birthYearOptions.length) return
    if (birthYear !== 'all' && birthYearOptions.some(year => String(year) === birthYear)) return
    setBirthYear(String(birthYearOptions[0]))
  }, [birthYear, birthYearOptions, leaguesMasterDoc, setBirthYear])

  useEffect(() => {
    if (!leaguesMasterDoc || !levelOptions.length) return
    if (leagueLevel !== 'all' && levelOptions.some(option => option.value === leagueLevel)) return
    setLeagueLevel(levelOptions[0].value)
  }, [leagueLevel, leaguesMasterDoc, levelOptions, setLeagueLevel])

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
  }
}
