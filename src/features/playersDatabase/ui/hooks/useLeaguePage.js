// features/playersDatabase/ui/hooks/useLeaguePage.js

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  buildLeaguePageSeasonOptions,
  buildLeaguePageTeams,
  buildLeaguePageView,
  buildLeaguePageSummary,
} from '../../model/leaguePage.model.js'
import { toNumberOrZero } from '../../model/value.model.js'
import { readLeaguePageData } from '../../services/read/index.js'

export function useLeaguePage() {
  const { leagueId = '' } = useParams()
  const [leagueDoc, setLeagueDoc] = useState(null)
  const [selectedSeasonKey, setSelectedSeasonKey] = useState('')
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
        setSelectedSeasonKey(current => (
          current && options.some(option => option.seasonKey === current)
            ? current
            : options[0]?.seasonKey || ''
        ))
      })
      .catch(err => {
        if (!active) return
        setLeagueDoc(null)
        setError(err?.message || 'טעינת הליגה נכשלה')
      })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [leagueId, reloadToken])

  const seasonOptions = useMemo(() => buildLeaguePageSeasonOptions(leagueDoc), [leagueDoc])
  const selectedSeasonOption = useMemo(() => (
    seasonOptions.find(option => option.seasonKey === selectedSeasonKey) || seasonOptions[0] || null
  ), [seasonOptions, selectedSeasonKey])
  const birthYearOptions = useMemo(() => ([...new Set(seasonOptions
    .map(option => toNumberOrZero(option?.season?.birthYear)).filter(Boolean))]), [seasonOptions])
  const setSelectedBirthYear = useCallback(value => {
    const birthYear = toNumberOrZero(value)
    const matchingSeason = seasonOptions.find(option => toNumberOrZero(option?.season?.birthYear) === birthYear)
    if (matchingSeason?.seasonKey) setSelectedSeasonKey(matchingSeason.seasonKey)
  }, [seasonOptions])
  const teams = useMemo(() => buildLeaguePageTeams({
    season: selectedSeasonOption?.season,
    leagueDoc,
  }), [leagueDoc, selectedSeasonOption])
  const league = useMemo(() => buildLeaguePageView({
    league: leagueDoc,
    leagueId,
    selectedSeason: selectedSeasonOption?.season,
  }), [leagueDoc, leagueId, selectedSeasonOption])
  const summary = useMemo(() => buildLeaguePageSummary({ teams, league }), [league, teams])

  return {
    league, leagueDoc, teams, summary, seasonOptions, birthYearOptions,
    selectedSeasonKey, selectedSeasonOption, setSelectedSeasonKey,
    setSelectedBirthYear, reload, loading, error,
  }
}
