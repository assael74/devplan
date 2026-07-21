// features/playersDatabase/ui/hooks/useTeamPage.js

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'

import {
  buildTeamPageSeasonOptions,
  buildTeamPageView,
  findTeamPageSeasonDoc,
  normalizeTeamPagePlayerRow,
} from '../../model/teamPage.model.js'
import { normalizeSeasonLookupKey } from '../../model/season.model.js'
import { readTeamPageData } from '../../services/read/index.js'

export function useTeamPage() {
  const { leagueId = '', teamId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const requestedSeasonKey = normalizeSeasonLookupKey(searchParams.get('season'))
  const [leagueDoc, setLeagueDoc] = useState(null)
  const [teamDoc, setTeamDoc] = useState(null)
  const [selectedSeasonKey, setSelectedSeasonKey] = useState(requestedSeasonKey)
  const [refreshKey, setRefreshKey] = useState(0)

  const reload = useCallback(() => setRefreshKey(value => value + 1), [])

  useEffect(() => {
    let active = true

    readTeamPageData({ leagueId, teamId })
      .then(data => {
        if (!active) return
        setLeagueDoc(data.leagueDoc)
        setTeamDoc(data.teamDoc)
      })
      .catch(() => {
        if (!active) return
        setLeagueDoc(null)
        setTeamDoc(null)
      })

    return () => { active = false }
  }, [leagueId, teamId, refreshKey])

  const seasonOptions = useMemo(
    () => buildTeamPageSeasonOptions(leagueDoc),
    [leagueDoc]
  )

  useEffect(() => {
    if (!seasonOptions.length) return
    const requestedOption = seasonOptions.find(option => option.seasonKey === requestedSeasonKey)
    if (requestedOption) {
      setSelectedSeasonKey(requestedOption.seasonKey)
      return
    }
    if (!selectedSeasonKey) setSelectedSeasonKey(seasonOptions[0].seasonKey)
  }, [requestedSeasonKey, seasonOptions, selectedSeasonKey])

  const selectedSeasonOption = useMemo(() => (
    seasonOptions.find(option => option.seasonKey === selectedSeasonKey) || seasonOptions[0] || null
  ), [seasonOptions, selectedSeasonKey])

  const selectedTeamSeason = useMemo(() => findTeamPageSeasonDoc({
    teamDoc,
    selectedSeasonOption,
  }), [teamDoc, selectedSeasonOption])

  const players = useMemo(() => (
    Array.isArray(selectedTeamSeason?.teamPlayers)
      ? selectedTeamSeason.teamPlayers.map(normalizeTeamPagePlayerRow)
      : []
  ), [selectedTeamSeason])

  const team = useMemo(() => buildTeamPageView({
    teamId,
    leagueDoc,
    teamDoc,
    selectedSeasonOption,
    selectedTeamSeason,
  }), [teamId, leagueDoc, teamDoc, selectedSeasonOption, selectedTeamSeason])

  return {
    leagueId, leagueDoc, team, teamDoc, players,
    hasTeamPlayers: players.length > 0,
    seasonOptions, selectedSeasonKey, selectedSeasonOption, selectedTeamSeason,
    setSelectedSeasonKey, reload,
  }
}
