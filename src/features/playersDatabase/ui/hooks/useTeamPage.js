// features/playersDatabase/ui/hooks/useTeamPage.js

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'

import {
  adaptTeamPagePlayerRow,
  buildTeamPageSeasonOptions,
  buildTeamPageView,
  findTeamPageLeagueSeasonDoc,
  findTeamPageSeasonDoc,
} from '../../model/teamPage.model.js'
import { normalizeSeasonLookupKey } from '../../model/season.model.js'
import { readTeamPageData } from '../../services/read/index.js'
import { PLAYERS_DATABASE_UI_ROUTES } from '../logic/routeBuilders.js'

function cleanValue(value) {
  return String(value || '').trim()
}

function findRequestedSeasonOption({
  seasonOptions,
  requestedOptionKey,
  requestedSeasonKey,
  leagueId,
}) {
  if (!seasonOptions.length) return null

  if (requestedOptionKey) {
    return seasonOptions.find(option => (
      option.optionKey === requestedOptionKey
    )) || null
  }

  if (requestedSeasonKey) {
    const seasonMatches = seasonOptions.filter(option => (
      option.seasonKey === requestedSeasonKey
    ))
    const leagueMatch = seasonMatches.find(option => (
      cleanValue(option.leagueId) === cleanValue(leagueId)
    ))

    return leagueMatch || seasonMatches[0] || null
  }

  return seasonOptions[0]
}

export function useTeamPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { leagueId = '', teamId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const requestedSeasonKey = normalizeSeasonLookupKey(
    searchParams.get('season')
  )
  const requestedOptionKey = cleanValue(
    searchParams.get('version')
  )
  const fromLeague = cleanValue(
    searchParams.get('fromLeague')
  )
  const [leagueDoc, setLeagueDoc] = useState(null)
  const [teamDoc, setTeamDoc] = useState(null)
  const [teamSeasons, setTeamSeasons] = useState([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(() => {
    setRefreshKey(value => value + 1)
  }, [])

  useEffect(() => {
    let active = true

    setLoading(true)
    setError('')
    setLeagueDoc(null)
    setTeamDoc(null)
    setTeamSeasons([])

    readTeamPageData({
      leagueId,
      teamId,
    })
      .then(data => {
        if (!active) return
        setLeagueDoc(data.leagueDoc)
        setTeamDoc(data.teamDoc)
        setTeamSeasons(data.teamSeasons || [])
      })
      .catch(err => {
        if (!active) return
        setLeagueDoc(null)
        setTeamDoc(null)
        setTeamSeasons([])
        setError(err?.message || 'טעינת הקבוצה נכשלה')
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
    teamId,
    refreshKey,
  ])

  const seasonOptions = useMemo(
    () => buildTeamPageSeasonOptions(
      leagueDoc,
      teamDoc,
      teamSeasons,
      teamId
    ),
    [
      leagueDoc,
      teamDoc,
      teamSeasons,
      teamId,
    ]
  )
  const selectedSeasonOption = useMemo(() => findRequestedSeasonOption({
    seasonOptions,
    requestedOptionKey,
    requestedSeasonKey,
    leagueId,
  }), [
    leagueId,
    requestedOptionKey,
    requestedSeasonKey,
    seasonOptions,
  ])
  const selectedSeasonKey = selectedSeasonOption?.seasonKey || requestedSeasonKey
  const selectedSeasonOptionKey = selectedSeasonOption?.optionKey || ''
  const selectionError = useMemo(() => {
    if (
      loading ||
      error ||
      !seasonOptions.length ||
      selectedSeasonOption
    ) {
      return ''
    }

    if (requestedSeasonKey) {
      return `לא נמצאה גרסת קבוצה לעונת ${requestedSeasonKey}`
    }

    return 'לא נמצאה גרסת קבוצה מתאימה'
  }, [
    error,
    loading,
    requestedSeasonKey,
    seasonOptions.length,
    selectedSeasonOption,
  ])

  const selectedLeagueSeason = useMemo(() => findTeamPageLeagueSeasonDoc({
    leagueDoc,
    selectedSeasonOption,
  }), [
    leagueDoc,
    selectedSeasonOption,
  ])
  const selectedTeamSeason = useMemo(() => findTeamPageSeasonDoc({
    teamDoc,
    teamSeasons,
    selectedSeasonOption,
  }), [
    teamDoc,
    teamSeasons,
    selectedSeasonOption,
  ])
  const team = useMemo(() => buildTeamPageView({
    teamId,
    leagueDoc,
    teamDoc,
    teamSeasons,
    selectedSeasonOption,
    selectedLeagueSeason,
    selectedTeamSeason,
  }), [
    teamId,
    leagueDoc,
    teamDoc,
    teamSeasons,
    selectedSeasonOption,
    selectedLeagueSeason,
    selectedTeamSeason,
  ])
  const players = useMemo(() => {
    if (!Array.isArray(selectedTeamSeason?.teamPlayers)) {
      return []
    }

    return selectedTeamSeason.teamPlayers.map((player, index) => (
      adaptTeamPagePlayerRow({
        player,
        index,
        selectedSeasonOption,
        teamSeason: team?.domain || team,
      })
    ))
  }, [
    selectedTeamSeason,
    selectedSeasonOption,
    team,
  ])

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
      fromLeague,
    })

    navigate(nextPath, {
      replace: true,
      state: location.state,
    })
  }, [
    fromLeague,
    leagueId,
    location.state,
    navigate,
    seasonOptions,
    teamId,
  ])

  return {
    leagueId,
    leagueDoc,
    team,
    teamDoc,
    teamSeasons,
    players,
    hasTeamPlayers: players.length > 0,
    seasonOptions,
    selectedSeasonKey,
    selectedSeasonOptionKey,
    selectedSeasonOption,
    selectedLeagueSeason,
    selectedTeamSeason,
    setSelectedSeasonKey: changeSeason,
    reload,
    loading,
    error,
    selectionError,
  }
}
