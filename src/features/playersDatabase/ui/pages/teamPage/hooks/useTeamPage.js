// features/playersDatabase/ui/pages/teamPage/hooks/useTeamPage.js

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
  buildTeamPageView,
} from '../../../../model/team/page/teamPageView.model.js'
import { buildTeamPageSeasonOptions, findTeamPageLeagueSeasonDoc, findTeamPageSeasonDoc } from '../../../../model/team/page/teamPageSeason.model.js'
import { adaptTeamPagePlayerRow } from '../../../../model/team/page/teamPagePlayer.model.js'
import { PLAYERS_DATABASE_CURRENT_SEASON_KEY } from '../../../../catalog/seasons.catalog.js'
import { readTeamPageData } from '../../../../services/read/index.js'
import { PLAYERS_DATABASE_UI_ROUTES } from '../../../logic/routeBuilders.js'

function cleanValue(value) {
  return String(value || '').trim()
}

function findRequestedSeasonOption({
  seasonOptions,
  selectedOptionKey,
}) {
  if (!seasonOptions.length) return null

  if (selectedOptionKey) {
    return seasonOptions.find(option => (
      option.optionKey === selectedOptionKey
    )) || null
  }

  return seasonOptions.find(option => (
    option.seasonKey === PLAYERS_DATABASE_CURRENT_SEASON_KEY
  )) || seasonOptions.find(option => option.target === 'current') ||
    seasonOptions.find(option => option.target !== 'future') ||
    seasonOptions[0]
}

export function useTeamPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { leagueId = '', teamId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const fromLeague = cleanValue(
    searchParams.get('fromLeague')
  )
  const fromClubs = searchParams.get('fromClubs') === '1'
  const [leagueDoc, setLeagueDoc] = useState(null)
  const [leagueDocuments, setLeagueDocuments] = useState([])
  const [documentLoadState, setDocumentLoadState] = useState(null)
  const [teamDoc, setTeamDoc] = useState(null)
  const [teamSeasons, setTeamSeasons] = useState([])
  const [seasonSnapshots, setSeasonSnapshots] = useState([])
  const [teamPageData, setTeamPageData] = useState(null)
  const [selectedOptionKey, setSelectedOptionKey] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!searchParams.has('season') && !searchParams.has('version')) return

    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('season')
    nextParams.delete('version')
    const query = nextParams.toString()

    navigate(`${location.pathname}${query ? `?${query}` : ''}`, {
      replace: true,
      state: location.state,
    })
  }, [location.pathname, location.state, navigate, searchParams])

  const reload = useCallback(() => {
    setRefreshKey(value => value + 1)
  }, [])

  useEffect(() => {
    let active = true

    setLoading(true)
    setError('')
    setLeagueDoc(null)
    setLeagueDocuments([])
    setDocumentLoadState(null)
    setTeamDoc(null)
    setTeamSeasons([])
    setSeasonSnapshots([])
    setTeamPageData(null)
    setSelectedOptionKey('')

    readTeamPageData({
      leagueId,
      teamId,
    })
      .then(data => {
        if (!active) return
        setLeagueDoc(data.leagueDoc)
        setLeagueDocuments(data.leagueDocuments || [])
        setDocumentLoadState(data.documentLoadState || null)
        setTeamDoc(data.teamDoc)
        setTeamSeasons(data.teamSeasons || [])
        setSeasonSnapshots(
          data.teamPageData?.seasons.map(season => ({
            ...season.resolved,
            sources: season.sources,
            availability: season.availability,
          })) || data.seasonSnapshots || []
        )
        setTeamPageData(data.teamPageData || null)
      })
      .catch(err => {
        if (!active) return
        setLeagueDoc(null)
        setLeagueDocuments([])
        setDocumentLoadState(null)
        setTeamDoc(null)
        setTeamSeasons([])
        setSeasonSnapshots([])
        setTeamPageData(null)
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
      leagueDocuments,
      teamDoc,
      teamSeasons,
      teamId
    ),
    [
      leagueDocuments,
      teamDoc,
      teamSeasons,
      teamId,
    ]
  )
  const selectedSeasonOption = useMemo(() => findRequestedSeasonOption({
    seasonOptions,
    selectedOptionKey,
  }), [
    seasonOptions,
    selectedOptionKey,
  ])
  const selectedSeasonKey = selectedSeasonOption?.seasonKey || ''
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

    return 'לא נמצאה גרסת קבוצה מתאימה'
  }, [
    error,
    loading,
    seasonOptions.length,
    selectedSeasonOption,
  ])

  const selectedLeagueSeason = useMemo(() => findTeamPageLeagueSeasonDoc({
    leagueDoc,
    leagueDocuments,
    selectedSeasonOption,
  }), [
    leagueDoc,
    leagueDocuments,
    selectedSeasonOption,
  ])
  const selectedLeagueDocument = selectedLeagueSeason?.leagueDoc || leagueDoc
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
    leagueDoc: selectedLeagueDocument,
    teamDoc,
    teamSeasons,
    selectedSeasonOption,
    selectedLeagueSeason,
    selectedTeamSeason,
  }), [
    teamId,
    selectedLeagueDocument,
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

    setSelectedOptionKey(nextOption.optionKey)

    const nextPath = PLAYERS_DATABASE_UI_ROUTES.team({
      leagueId,
      teamId,
      fromLeague,
      fromClubs,
    })

    navigate(nextPath, {
      replace: true,
      state: location.state,
    })
  }, [
    fromLeague,
    fromClubs,
    leagueId,
    location.state,
    navigate,
    setSelectedOptionKey,
    seasonOptions,
    teamId,
  ])

  return {
    leagueId,
    leagueDoc,
    leagueDocuments,
    documentLoadState,
    team,
    teamDoc,
    teamSeasons,
    seasonSnapshots,
    teamPageData,
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
