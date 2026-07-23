// features/playersDatabase/ui/hooks/useLeagueCenter.js

import { useEffect, useMemo, useState } from 'react'

import { PLAYERS_DATABASE_LEAGUES_CATALOG } from '../../catalog/leagues.catalog.js'
import {
  LEAGUE_CENTER_DEFAULT_SEASON_KEY,
  buildLeagueCenterAgeGroupOptions,
  buildLeagueCenterBirthYearOptionsFromMasterDocument,
  buildLeagueCenterLeagueDocsFromMasterDocument,
  buildLeagueCenterLeagueOptions,
  buildLeagueCenterRowsFromMasterDocument,
  buildLeagueCenterSeasonOptions,
  buildLeagueCenterSummary,
  resolveLeagueCenterSeasonTarget,
} from '../../model/leagueCenter.model.js'
import { readLeagueCenterData } from '../../services/read/index.js'
import { filterByText, filterByValue } from '../logic/filters.logic.js'

export function useLeagueCenter() {
  const [query, setQuery] = useState('')
  const [leagueFilter, setLeagueFilter] = useState('all')
  const [ageGroup, setAgeGroup] = useState('all')
  const [birthYear, setBirthYear] = useState('all')
  const [seasonKey, setSeasonKey] = useState(LEAGUE_CENTER_DEFAULT_SEASON_KEY)
  const [leaguesMasterDoc, setLeaguesMasterDoc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')

    readLeagueCenterData()
      .then(({ leaguesMasterDoc: nextMasterDoc }) => {
        if (!active) return
        setLeaguesMasterDoc(nextMasterDoc || null)
      })
      .catch(err => {
        if (!active) return
        setLeaguesMasterDoc(null)
        setError(err?.message || 'טעינת מרכז הליגות נכשלה')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

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
  const birthYearOptions = useMemo(
    () => buildLeagueCenterBirthYearOptionsFromMasterDocument({ leaguesMasterDoc }),
    [leaguesMasterDoc]
  )
  const ageGroupOptions = useMemo(() => buildLeagueCenterAgeGroupOptions(leagueDocs), [leagueDocs])
  const leagueOptions = useMemo(() => buildLeagueCenterLeagueOptions(leagueDocs), [leagueDocs])

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
