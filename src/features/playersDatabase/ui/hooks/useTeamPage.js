// features/playersDatabase/ui/hooks/useTeamPage.js

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import {
  buildTeamPageSeasonOptions,
  buildTeamPageView,
  findTeamPageSeasonDoc,
  findTeamPageLeagueSeasonDoc,
  adaptTeamPagePlayerRow,
} from '../../model/teamPage.model.js'
import { normalizeSeasonLookupKey } from '../../model/season.model.js'
import { readTeamPageData } from '../../services/read/index.js'
import { PLAYERS_DATABASE_UI_ROUTES } from '../logic/routeBuilders.js'

export function useTeamPage() {
  const navigate = useNavigate()
  const { leagueId = '', teamId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const requestedSeasonKey = normalizeSeasonLookupKey(searchParams.get('season'))
  const requestedOptionKey = String(searchParams.get('version') || '').trim()
  const [leagueDoc, setLeagueDoc] = useState(null)
  const [teamDoc, setTeamDoc] = useState(null)
  const [selectedOptionKey, setSelectedOptionKey] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(() => setRefreshKey(value => value + 1), [])

  useEffect(() => {
    let active = true

    setLoading(true)
    setError('')
    setLeagueDoc(null)
    setTeamDoc(null)

    readTeamPageData({ leagueId, teamId })
      .then(data => {
        if (!active) return
        setLeagueDoc(data.leagueDoc)
        setTeamDoc(data.teamDoc)
      })
      .catch(err => {
        if (!active) return
        setLeagueDoc(null)
        setTeamDoc(null)
        setError(err?.message || 'טעינת הקבוצה נכשלה')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [leagueId, teamId, refreshKey])

  const seasonOptions = useMemo(
    () => buildTeamPageSeasonOptions(leagueDoc, teamDoc, teamId),
    [leagueDoc, teamDoc, teamId]
  )

  useEffect(() => {
    if (!seasonOptions.length) return

    const requestedOption = requestedOptionKey
      ? seasonOptions.find(option => option.optionKey === requestedOptionKey)
      : seasonOptions.find(option => option.seasonKey === requestedSeasonKey)

    setSelectedOptionKey(currentOptionKey => {
      if (requestedOption) return requestedOption.optionKey

      if (requestedOptionKey || requestedSeasonKey) return ''

      const currentOption = seasonOptions.find(option => (
        option.optionKey === currentOptionKey
      ))

      if (currentOption) return currentOptionKey

      return seasonOptions[0].optionKey
    })
  }, [requestedOptionKey, requestedSeasonKey, seasonOptions])

  const selectedSeasonOption = useMemo(() => (
    seasonOptions.find(option => option.optionKey === selectedOptionKey) || null
  ), [seasonOptions, selectedOptionKey])

  const selectionError = useMemo(() => {
    if (loading || error || !seasonOptions.length) return ''
    if (selectedSeasonOption) return ''

    return requestedSeasonKey
      ? `לא נמצאה גרסת קבוצה לעונת ${requestedSeasonKey}`
      : 'לא נמצאה גרסת קבוצה מתאימה'
  }, [error, loading, requestedSeasonKey, seasonOptions.length, selectedSeasonOption])

  const selectedLeagueSeason = useMemo(() => findTeamPageLeagueSeasonDoc({
    leagueDoc,
    selectedSeasonOption,
  }), [leagueDoc, selectedSeasonOption])

  const selectedTeamSeason = useMemo(() => findTeamPageSeasonDoc({
    teamDoc,
    selectedSeasonOption,
  }), [teamDoc, selectedSeasonOption])

  const team = useMemo(() => buildTeamPageView({
    teamId,
    leagueDoc,
    teamDoc,
    selectedSeasonOption,
    selectedLeagueSeason,
    selectedTeamSeason,
  }), [
    teamId,
    leagueDoc,
    teamDoc,
    selectedSeasonOption,
    selectedLeagueSeason,
    selectedTeamSeason,
  ])

  const players = useMemo(() => (
    Array.isArray(selectedTeamSeason?.teamPlayers)
      ? selectedTeamSeason.teamPlayers.map((player, index) => adaptTeamPagePlayerRow({
        player,
        index,
        selectedSeasonOption,
        teamSeason: team?.domain || team,
      }))
      : []
  ), [selectedTeamSeason, selectedSeasonOption, team])

  const changeSeason = useCallback(value => {
    const nextOption = seasonOptions.find(option => (
      option.optionKey === value
    ))

    if (!nextOption) return

    const nextLeagueId = nextOption.leagueId || leagueId
    const nextPath = PLAYERS_DATABASE_UI_ROUTES.team({
      leagueId: nextLeagueId,
      teamId,
      seasonKey: nextOption.seasonKey,
      versionKey: nextOption.optionKey,
    })

    if (nextLeagueId !== leagueId) {
      navigate(nextPath)
      return
    }

    setSelectedOptionKey(nextOption.optionKey)
    navigate(nextPath, { replace: true })
  }, [leagueId, navigate, seasonOptions, teamId])

  return {
    leagueId, leagueDoc, team, teamDoc, players,
    hasTeamPlayers: players.length > 0,
    seasonOptions,
    selectedSeasonKey: selectedSeasonOption?.seasonKey || '',
    selectedSeasonOptionKey: selectedOptionKey,
    selectedSeasonOption, selectedLeagueSeason, selectedTeamSeason,
    setSelectedSeasonKey: changeSeason, reload, loading, error, selectionError,
  }
}
