// features/playersDatabase/ui/hooks/useLeagueCenter.js

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { PLAYERS_DATABASE_LEAGUES_CATALOG } from '../../catalog/leagues.catalog.js'
import {
  LEAGUE_CENTER_DEFAULT_SEASON_KEY,
  buildLeagueCenterAgeGroupOptions,
  buildLeagueCenterBirthYearOptions,
  buildLeagueCenterLeagueDocsFromMasterDocument,
  buildLeagueCenterLeagueOptions,
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
  return Boolean(selected && options.some(option =>
    normalizeSeasonLookupKey(option) === selected
  ))
}

export function useLeagueCenter() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedSeasonKey = cleanSeasonKey(searchParams.get('season'))
  const requestedBirthYear = cleanFilterValue(searchParams.get('birthYear'))
  const [query, setQuery] = useState('')
  const [leagueFilter, setLeagueFilter] = useState('all')
  const [ageGroup, setAgeGroup] = useState('all')
  const [birthYear, setBirthYearState] = useState(requestedBirthYear)
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

  const leagueRows = useMemo(() => buildLeagueCenterRowsFromMasterDocument({
    leaguesMasterDoc,
    selectedSeasonKey: seasonKey,
  }), [leaguesMasterDoc, seasonKey])

  const leagues = useMemo(() => {
    const byText = filterByText(leagueRows, query, ['name', 'birthYear', 'seasonKey'])
    const byLeague = filterByValue(byText, 'leagueName', leagueFilter)
    const byAgeGroup = filterByValue(byLeague, 'ageGroupId', ageGroup)
    return filterByValue(byAgeGroup, 'birthYear', birthYear)
  }, [ageGroup, birthYear, leagueFilter, leagueRows, query])

  const summary = useMemo(() => buildLeagueCenterSummary(leagueRows), [leagueRows])

  const leagueDocs = useMemo(
    () => buildLeagueCenterLeagueDocsFromMasterDocument({ leaguesMasterDoc }),
    [leaguesMasterDoc]
  )

  const seasonOptions = useMemo(() => buildLeagueCenterSeasonOptions(leagueDocs), [leagueDocs])
  const setSeasonKey = useCallback(value => {
    const nextSeasonKey = cleanSeasonKey(value) || LEAGUE_CENTER_DEFAULT_SEASON_KEY
    const nextSearchParams = new URLSearchParams(searchParams)

    nextSearchParams.set('season', nextSeasonKey)
    setSeasonKeyState(nextSeasonKey)
    setSearchParams(nextSearchParams, { replace: true })
  }, [searchParams, setSearchParams])
  const setBirthYear = useCallback(value => {
    const nextBirthYear = cleanFilterValue(value)
    const nextSearchParams = new URLSearchParams(searchParams)

    if (nextBirthYear === 'all') {
      nextSearchParams.delete('birthYear')
    } else {
      nextSearchParams.set('birthYear', nextBirthYear)
    }

    setBirthYearState(nextBirthYear)
    setSearchParams(nextSearchParams, { replace: true })
  }, [searchParams, setSearchParams])

  useEffect(() => {
    if (requestedSeasonKey && requestedSeasonKey !== seasonKey) {
      setSeasonKeyState(requestedSeasonKey)
    }
  }, [requestedSeasonKey, seasonKey])

  useEffect(() => {
    if (requestedBirthYear !== birthYear) {
      setBirthYearState(requestedBirthYear)
    }
  }, [birthYear, requestedBirthYear])

  useEffect(() => {
    if (!seasonOptions.length) return
    if (hasSeasonOption(seasonOptions, seasonKey)) return

    setSeasonKey(seasonOptions[0] || LEAGUE_CENTER_DEFAULT_SEASON_KEY)
  }, [seasonKey, seasonOptions, setSeasonKey])

  const birthYearOptions = useMemo(
    () => buildLeagueCenterBirthYearOptions(leagueRows),
    [leagueRows]
  )

  useEffect(() => {
    if (birthYear === 'all') return
    if (!leaguesMasterDoc || !birthYearOptions.length) return

    const hasSelectedBirthYear = birthYearOptions.some(
      option => String(option) === String(birthYear)
    )

    if (!hasSelectedBirthYear) {
      setBirthYear('all')
    }
  }, [birthYear, birthYearOptions, leaguesMasterDoc, setBirthYear])
  const ageGroupOptions = useMemo(() => buildLeagueCenterAgeGroupOptions(leagueRows), [leagueRows])
  const leagueOptions = useMemo(() => buildLeagueCenterLeagueOptions(leagueRows), [leagueRows])

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
    reload,
  }
}
