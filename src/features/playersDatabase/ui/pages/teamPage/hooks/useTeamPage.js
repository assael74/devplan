// src/features/playersDatabase/ui/pages/teamPage/hooks/useTeamPage.js

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
import {
  buildTeamPagePlayerRows,
  buildTeamPageSeasonView,
} from '../../../../model/team/page/teamPagePlayer.model.js'
import { PLAYERS_DATABASE_CURRENT_SEASON_KEY } from '../../../../catalog/seasons.catalog.js'
import {
  CLUBS_DIRECTORY_STORE_KEY,
  readTeamPageData,
  subscribeTeamPageData,
} from '../../../../services/read/index.js'
import { buildTeamPageDataCacheKey } from '../../../../services/cache/index.js'
import usePlayersDatabaseReadStoreEntry from '../../../hooks/usePlayersDatabaseReadStoreEntry.js'

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
  const auditSeasonKey = cleanValue(searchParams.get('auditSeason'))
  const pageStoreKey = buildTeamPageDataCacheKey({ leagueId, teamId })
  const pageEntry = usePlayersDatabaseReadStoreEntry(pageStoreKey)
  const clubsDirectoryEntry = usePlayersDatabaseReadStoreEntry(
    CLUBS_DIRECTORY_STORE_KEY
  )
  const pageResult = pageEntry.data
  const leagueDoc = pageResult?.leagueDoc || null
  const leagueDocuments = useMemo(
    () => pageResult?.leagueDocuments || [],
    [pageResult?.leagueDocuments]
  )
  const documentLoadState = pageResult?.documentLoadState || null
  const teamDoc = pageResult?.teamDoc || null
  const teamSeasons = useMemo(
    () => pageResult?.teamSeasons || [],
    [pageResult?.teamSeasons]
  )
  const seasonSnapshots = pageResult?.teamPageData?.seasons.map(season => ({
    ...season.resolved,
    sources: season.sources,
    availability: season.availability,
  })) || pageResult?.seasonSnapshots || []
  const teamPageData = pageResult?.teamPageData || null
  const [liveError, setLiveError] = useState('')
  const [selectedOptionKey, setSelectedOptionKey] = useState('')
  const loading = !pageResult && (
    pageEntry.status === 'idle' ||
    pageEntry.status === 'loading' ||
    pageEntry.status === 'refreshing'
  )
  const refreshing = Boolean(pageResult && pageEntry.status === 'refreshing')
  const error = pageResult ? liveError : (
    liveError || pageEntry.error?.message || ''
  )
  const refreshError = pageEntry.refreshError?.message || ''

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

  const reload = useCallback(() => (
    readTeamPageData({
      leagueId,
      teamId,
      rebuildFromCache: true,
    })
  ), [leagueId, teamId])

  useEffect(() => {
    setLiveError('')
    return subscribeTeamPageData({
      leagueId,
      teamId,
      onError: nextError => setLiveError(
        nextError?.message || 'האזנה למסמכי הקבוצה נכשלה'
      ),
    })
  }, [leagueId, teamId])

  useEffect(() => {
    setSelectedOptionKey('')
  }, [leagueId, teamId])

  const clubDoc = useMemo(() => {
    const clubId = cleanValue(teamDoc?.identity?.clubId)
    const club = clubsDirectoryEntry.data?.clubsById?.[clubId]
    return club ? { id: clubId, ...club } : null
  }, [clubsDirectoryEntry.data, teamDoc?.identity?.clubId])
  const clubsDirectory = clubsDirectoryEntry.data || null

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
  useEffect(() => {
    if (selectedOptionKey || !auditSeasonKey || !seasonOptions.length) return

    const auditOption = seasonOptions.find(option => (
      option.seasonKey === auditSeasonKey && option.leagueId === leagueId
    )) || seasonOptions.find(option => option.seasonKey === auditSeasonKey)

    if (auditOption) setSelectedOptionKey(auditOption.optionKey)
  }, [auditSeasonKey, leagueId, seasonOptions, selectedOptionKey])
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
  const selectedTeamSeasonDocument = useMemo(() => findTeamPageSeasonDoc({
    teamDoc,
    teamSeasons,
    selectedSeasonOption,
  }), [
    teamDoc,
    teamSeasons,
    selectedSeasonOption,
  ])
  const selectedTeamSeason = useMemo(() => buildTeamPageSeasonView({
    teamSeason: selectedTeamSeasonDocument,
    selectedSeasonOption,
  }), [
    selectedSeasonOption,
    selectedTeamSeasonDocument,
  ])
  const team = useMemo(() => buildTeamPageView({
    clubsDirectory,
    teamId,
    leagueDoc: selectedLeagueDocument,
    teamDoc,
    teamSeasons,
    selectedSeasonOption,
    selectedLeagueSeason,
    selectedTeamSeason,
  }), [
    clubsDirectory,
    teamId,
    selectedLeagueDocument,
    teamDoc,
    teamSeasons,
    selectedSeasonOption,
    selectedLeagueSeason,
    selectedTeamSeason,
  ])
  const players = useMemo(() => buildTeamPagePlayerRows({
    teamSeason: selectedTeamSeason,
    selectedSeasonOption,
  }), [
    selectedTeamSeason,
    selectedSeasonOption,
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
    clubDoc,
    clubsDirectory,
    players,
    hasTeamPlayers: players.length > 0,
    seasonOptions,
    selectedSeasonKey,
    selectedSeasonOptionKey,
    selectedSeasonOption,
    selectedLeagueSeason,
    selectedTeamSeason,
    reload,
    loading,
    refreshing,
    error,
    refreshError,
    selectionError,
  }
}
