// features/playersDatabase/ui/hooks/useLeaguePage.js

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  useLocation,
  useParams,
  useSearchParams,
} from 'react-router-dom'

import {
  buildLeaguePageSeasonOptions,
  buildLeaguePageSummary,
  buildLeaguePageTeams,
  buildLeaguePageView,
} from '../../model/leaguePage.model.js'
import { normalizeSeasonLookupKey } from '../../model/season.model.js'
import { readLeaguePageData } from '../../services/read/index.js'

function isSameSeasonKey(left, right) {
  const leftKey = normalizeSeasonLookupKey(left)
  const rightKey = normalizeSeasonLookupKey(right)

  return Boolean(
    leftKey &&
    rightKey &&
    leftKey === rightKey
  )
}

export function useLeaguePage() {
  const location = useLocation()
  const { leagueId = '' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const querySeasonKey = normalizeSeasonLookupKey(
    searchParams.get('season')
  )
  const centerSeasonKey = normalizeSeasonLookupKey(
    searchParams.get('centerSeason')
  )
  const requestedBirthYear = Number(searchParams.get('birthYear')) || 0
  const requestedSeasonKey = querySeasonKey || (
    centerSeasonKey && centerSeasonKey !== 'all'
      ? centerSeasonKey
      : ''
  )
  const [leagueDoc, setLeagueDoc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadToken, setReloadToken] = useState(0)

  const reload = useCallback(() => {
    setReloadToken(current => current + 1)
  }, [])

  useEffect(() => {
    let active = true

    setLoading(true)
    setError('')

    readLeaguePageData({ leagueId })
      .then(({ leagueDoc: nextLeague }) => {
        if (!active) return
        setLeagueDoc(nextLeague)
      })
      .catch(err => {
        if (!active) return
        setLeagueDoc(null)
        setError(err?.message || 'טעינת הליגה נכשלה')
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [
    leagueId,
    reloadToken,
  ])

  const seasonOptions = useMemo(
    () => buildLeaguePageSeasonOptions(leagueDoc),
    [leagueDoc]
  )
  const selectedSeasonOption = useMemo(() => {
    if (!seasonOptions.length) return null

    if (requestedSeasonKey) {
      return seasonOptions.find(option => (
        isSameSeasonKey(
          option.seasonKey,
          requestedSeasonKey
        )
      )) || null
    }

    if (requestedBirthYear) {
      const birthYearOption = seasonOptions.find(option => (
        Number(option.birthYear) === requestedBirthYear
      ))

      if (birthYearOption) return birthYearOption
    }

    return seasonOptions[0]
  }, [
    requestedBirthYear,
    requestedSeasonKey,
    seasonOptions,
  ])
  const selectedSeasonKey = selectedSeasonOption?.seasonKey || requestedSeasonKey

  useEffect(() => {
    const resolvedSeasonKey = normalizeSeasonLookupKey(
      selectedSeasonOption?.seasonKey
    )

    if (
      !resolvedSeasonKey ||
      isSameSeasonKey(querySeasonKey, resolvedSeasonKey)
    ) {
      return
    }

    const nextSearchParams = new URLSearchParams(searchParams)
    nextSearchParams.set('season', resolvedSeasonKey)

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
    if (
      loading ||
      error ||
      !requestedSeasonKey ||
      selectedSeasonOption
    ) {
      return ''
    }

    return `לא נמצאה גרסת ליגה לעונת ${requestedSeasonKey}`
  }, [
    error,
    loading,
    requestedSeasonKey,
    selectedSeasonOption,
  ])

  const setSelectedSeasonKey = useCallback(value => {
    const nextSeasonKey = normalizeSeasonLookupKey(value)
    if (!nextSeasonKey) return

    const nextSearchParams = new URLSearchParams(searchParams)
    nextSearchParams.set('season', nextSeasonKey)

    setSearchParams(nextSearchParams, {
      replace: true,
      state: location.state,
    })
  }, [
    location.state,
    searchParams,
    setSearchParams,
  ])

  const teams = useMemo(() => buildLeaguePageTeams({
    season: selectedSeasonOption?.season,
    leagueDoc,
    target: selectedSeasonOption?.target || 'current',
  }), [
    leagueDoc,
    selectedSeasonOption,
  ])
  const league = useMemo(() => buildLeaguePageView({
    league: leagueDoc,
    leagueId,
    selectedSeason: selectedSeasonOption?.season,
  }), [
    leagueDoc,
    leagueId,
    selectedSeasonOption,
  ])
  const summary = useMemo(
    () => buildLeaguePageSummary({
      teams,
      league,
    }),
    [
      league,
      teams,
    ]
  )

  return {
    league,
    leagueDoc,
    teams,
    summary,
    seasonOptions,
    selectedSeasonKey,
    selectedSeasonOption,
    setSelectedSeasonKey,
    reload,
    loading,
    error,
    selectionError,
  }
}
