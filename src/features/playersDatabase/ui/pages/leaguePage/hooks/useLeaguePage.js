// src/features/playersDatabase/ui/pages/leaguePage/hooks/useLeaguePage.js

import {
  useCallback,
  useEffect,
  useMemo,
} from 'react'
import {
  useLocation,
  useParams,
  useSearchParams,
} from 'react-router-dom'

import {
  buildLeaguePageBootstrapLeague,
  buildLeaguePageSeasonOptions,
  buildLeaguePageSummary,
  buildLeaguePageTeams,
  buildLeaguePageView,
} from '../../../../model/league/page/leaguePage.model.js'
import { normalizeSeasonLookupKey } from '../../../../model/shared/season.model.js'
import { subscribeLeaguePageData, CLUBS_DIRECTORY_STORE_KEY } from '../../../../services/read/index.js'
import { buildLeagueDocumentCacheKey } from '../../../../services/cache/index.js'
import usePlayersDatabaseReadStoreEntry from '../../../hooks/usePlayersDatabaseReadStoreEntry.js'
import { PLAYERS_DATABASE_QUERY_KEYS as queryKeys } from '../../../logic/routeBuilders.js'

function isSameSeasonKey(left, right) {
  const leftKey = normalizeSeasonLookupKey(left)
  const rightKey = normalizeSeasonLookupKey(right)
  return Boolean(leftKey && rightKey && leftKey === rightKey)
}

export function useLeaguePage() {
  const location = useLocation()
  const { leagueId = '' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const querySeasonKey = normalizeSeasonLookupKey(searchParams.get(queryKeys.season) || searchParams.get('season'))
  const centerSeasonKey = normalizeSeasonLookupKey(searchParams.get(queryKeys.centerSeason) || searchParams.get('centerSeason'))
  const requestedBirthYear = Number(searchParams.get(queryKeys.birthYear) || searchParams.get('birthYear')) || 0
  const requestedSeasonKey = querySeasonKey || (
    centerSeasonKey && centerSeasonKey !== 'all' ? centerSeasonKey : ''
  )
  const leagueCacheKey = useMemo(
    () => buildLeagueDocumentCacheKey(leagueId),
    [leagueId]
  )
  const leagueStoreEntry = usePlayersDatabaseReadStoreEntry(leagueCacheKey)
  const directoryEntry = usePlayersDatabaseReadStoreEntry(CLUBS_DIRECTORY_STORE_KEY)
  const canonicalLeagueDoc = leagueStoreEntry.data
  const leagueDoc = useMemo(() => (
    canonicalLeagueDoc || buildLeaguePageBootstrapLeague(leagueId)
  ), [canonicalLeagueDoc, leagueId])
  const loading = leagueStoreEntry.status === 'idle' || leagueStoreEntry.status === 'loading'
  const refreshing = leagueStoreEntry.status === 'refreshing'
  const refreshError = leagueStoreEntry.refreshError?.message || ''
  const error = leagueStoreEntry.status === 'error'
    ? leagueStoreEntry.error?.message || 'טעינת הליגה נכשלה'
    : ''

  useEffect(() => {
    return subscribeLeaguePageData({ leagueId })
  }, [leagueId])

  const bootstrapSeason = useMemo(() => (
    requestedSeasonKey
      ? { seasonKey: requestedSeasonKey, birthYear: requestedBirthYear || null }
      : null
  ), [requestedBirthYear, requestedSeasonKey])
  const seasonOptions = useMemo(
    () => buildLeaguePageSeasonOptions(leagueDoc, { bootstrapSeason }),
    [bootstrapSeason, leagueDoc]
  )
  const selectedSeasonOption = useMemo(() => {
    if (!seasonOptions.length) return null

    if (requestedSeasonKey) {
      const requested = seasonOptions.find(option => (
        isSameSeasonKey(option.seasonKey, requestedSeasonKey)
      ))
      if (requested) return requested
    }

    if (requestedBirthYear) {
      const birthYearOption = seasonOptions.find(option => (
        Number(option.birthYear) === requestedBirthYear
      ))
      if (birthYearOption) return birthYearOption
    }

    return seasonOptions[0]
  }, [requestedBirthYear, requestedSeasonKey, seasonOptions])
  const selectedSeasonKey = selectedSeasonOption?.seasonKey || requestedSeasonKey

  useEffect(() => {
    const resolvedSeasonKey = normalizeSeasonLookupKey(selectedSeasonOption?.seasonKey)
    if (!resolvedSeasonKey || isSameSeasonKey(querySeasonKey, resolvedSeasonKey)) return

    const nextSearchParams = new URLSearchParams(searchParams)
    nextSearchParams.delete('season')
    nextSearchParams.set(queryKeys.season, resolvedSeasonKey)

    setSearchParams(nextSearchParams, {
      replace: true,
      state: location.state,
    })
  }, [
    location.state,
    querySeasonKey,
    searchParams,
    selectedSeasonOption,
    setSearchParams,
  ])

  const selectionError = useMemo(() => {
    if (loading || error || !requestedSeasonKey || selectedSeasonOption) return ''
    return `לא נמצאה גרסת ליגה לעונת ${requestedSeasonKey}`
  }, [error, loading, requestedSeasonKey, selectedSeasonOption])

  const setSelectedSeasonKey = useCallback(value => {
    const nextSeasonKey = normalizeSeasonLookupKey(value)
    if (!nextSeasonKey) return

    const nextSearchParams = new URLSearchParams(searchParams)
    nextSearchParams.delete('season')
    nextSearchParams.set(queryKeys.season, nextSeasonKey)

    setSearchParams(nextSearchParams, {
      replace: true,
      state: location.state,
    })
  }, [location.state, searchParams, setSearchParams])

  const teams = useMemo(() => buildLeaguePageTeams({
    clubsDirectory: directoryEntry.data,
    season: selectedSeasonOption?.season,
  }), [directoryEntry.data, selectedSeasonOption])
  const league = useMemo(() => buildLeaguePageView({
    league: leagueDoc,
    leagueId,
    selectedSeason: selectedSeasonOption?.season,
  }), [leagueDoc, leagueId, selectedSeasonOption])
  const summary = useMemo(
    () => buildLeaguePageSummary({ teams, league }),
    [league, teams]
  )

  return {
    league,
    leagueDoc: canonicalLeagueDoc,
    displayLeagueDoc: leagueDoc,
    teams,
    summary,
    seasonOptions,
    selectedSeasonKey,
    selectedSeasonOption,
    setSelectedSeasonKey,
    loading,
    refreshing,
    error,
    refreshError,
    selectionError,
    bootstrap: !canonicalLeagueDoc,
  }
}
