// features/playersDatabase/ui/hooks/useLeaguePage.js

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'

import {
  buildLeaguePageSeasonOptions,
  buildLeaguePageTeams,
  buildLeaguePageView,
  buildLeaguePageSummary,
} from '../../model/leaguePage.model.js'
import { normalizeSeasonLookupKey } from '../../model/season.model.js'
import { readLeaguePageData } from '../../services/read/index.js'

const isSameSeasonKey = (left, right) => (
  Boolean(
    normalizeSeasonLookupKey(left) &&
    normalizeSeasonLookupKey(left) === normalizeSeasonLookupKey(right)
  )
)

export function useLeaguePage() {
  const { leagueId = '' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedSeasonKey = normalizeSeasonLookupKey(searchParams.get('season'))
  const [leagueDoc, setLeagueDoc] = useState(null)
  const [selectedSeasonKey, setSelectedSeasonKeyState] = useState(requestedSeasonKey)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadToken, setReloadToken] = useState(0)
  const reload = useCallback(() => setReloadToken(current => current + 1), [])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')

    readLeaguePageData({ leagueId })
      .then(({ leagueDoc: nextLeague }) => {
        if (!active) return
        setLeagueDoc(nextLeague)
        const options = buildLeaguePageSeasonOptions(nextLeague)
        setSelectedSeasonKeyState(current => {
          const requestedOption = options.find(option =>
            isSameSeasonKey(option.seasonKey, requestedSeasonKey)
          )
          const currentOption = options.find(option =>
            isSameSeasonKey(option.seasonKey, current)
          )

          if (requestedOption) {
            return requestedOption.seasonKey
          }

          if (requestedSeasonKey) {
            return ''
          }

          if (currentOption) {
            return currentOption.seasonKey
          }

          return options[0]?.seasonKey || ''
        })
      })
      .catch(err => {
        if (!active) return
        setLeagueDoc(null)
        setError(err?.message || 'טעינת הליגה נכשלה')
      })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [leagueId, reloadToken, requestedSeasonKey])

  const seasonOptions = useMemo(() => buildLeaguePageSeasonOptions(leagueDoc), [leagueDoc])
  const selectedSeasonOption = useMemo(() => (
    seasonOptions.find(option => isSameSeasonKey(option.seasonKey, selectedSeasonKey)) || null
  ), [seasonOptions, selectedSeasonKey])
  const selectionError = useMemo(() => {
    if (loading || error || !requestedSeasonKey || selectedSeasonOption) return ''
    return `לא נמצאה גרסת ליגה לעונת ${requestedSeasonKey}`
  }, [error, loading, requestedSeasonKey, selectedSeasonOption])
  const setSelectedSeasonKey = useCallback(value => {
    const nextSeasonKey = normalizeSeasonLookupKey(value)
    const nextSearchParams = new URLSearchParams(searchParams)

    if (nextSeasonKey) {
      nextSearchParams.set('season', nextSeasonKey)
    } else {
      nextSearchParams.delete('season')
    }

    setSelectedSeasonKeyState(nextSeasonKey)
    setSearchParams(nextSearchParams, { replace: true })
  }, [searchParams, setSearchParams])
  const teams = useMemo(() => buildLeaguePageTeams({
    season: selectedSeasonOption?.season,
    leagueDoc,
    target: selectedSeasonOption?.target || 'current',
  }), [leagueDoc, selectedSeasonOption])
  const league = useMemo(() => buildLeaguePageView({
    league: leagueDoc,
    leagueId,
    selectedSeason: selectedSeasonOption?.season,
  }), [leagueDoc, leagueId, selectedSeasonOption])
  const summary = useMemo(() => buildLeaguePageSummary({ teams, league }), [league, teams])

  return {
    league, leagueDoc, teams, summary, seasonOptions,
    selectedSeasonKey, selectedSeasonOption, setSelectedSeasonKey,
    reload, loading, error, selectionError,
  }
}
