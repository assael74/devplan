// features/playersDatabase/components/profilesPage/hooks/useProfilesPage.js

import { useCallback, useEffect, useMemo, useState } from 'react'

import { listLeagueSnapshotsByIds, listLeagues } from '../../../services/pdbLeague.firestore.js'
import { pdbSelectionMetrics } from '../../../sharedLogic/pdbCounts.logic.js'
import { findPlayersDatabaseYearGroupOpportunities } from '../../../sharedLogic/yearGroupOpportunities.js'
import { getLeagueBoardCache, setLeagueBoardCache } from '../../summary/hooks/leagueBoardCache.js'
import {
  DEFAULT_PROFILE_SEASON_ID,
  buildLeagueOptions,
  buildProfiles,
  buildRegionOptions,
  buildSeasonOptions,
  buildYearOptions,
  filterProfilesBySearch,
  getLeagueSeasonIds,
  getLeagueSnapshotId,
  leagueMatchesSeason,
  PROFILE_LIST_SORT_OPTIONS,
  PLAYER_LIST_SORT_OPTIONS,
  sortProfilesByState,
} from '../logic/index.js'
import { clean, unique } from '../logic/utils.js'
import { useProfileDocuments } from './useProfileDocuments.js'

const getLastOptionValue = options => {
  const lastOption = options[options.length - 1]
  return lastOption?.value || ''
}

export function useProfilesPage() {
  const [loading, setLoading] = useState(false)
  const [loadingIndicators, setLoadingIndicators] = useState(false)
  const [error, setError] = useState('')
  const [indicatorError, setIndicatorError] = useState('')
  const [leagues, setLeagues] = useState([])
  const [snapshots, setSnapshots] = useState([])
  const [opportunities, setOpportunities] = useState([])
  const [indicatorsLoaded, setIndicatorsLoaded] = useState(false)
  const [selectedId, setSelectedId] = useState('database:all')
  const [selectedSeasonId, setSelectedSeasonId] = useState(DEFAULT_PROFILE_SEASON_ID)
  const [searchMode, setSearchMode] = useState('all')
  const [primaryFilter, setPrimaryFilter] = useState('all')
  const [selectedRegionId, setSelectedRegionId] = useState('all')
  const [selectedLeagueIds, setSelectedLeagueIds] = useState([])
  const [selectedBirthYears, setSelectedBirthYears] = useState([])
  const [expandedIds, setExpandedIds] = useState({})
  const [sortBy, setSortBy] = useState('status')
  const [sortDirection, setSortDirection] = useState('desc')
  const [playerSortBy, setPlayerSortBy] = useState('playerName')
  const [playerSortDirection, setPlayerSortDirection] = useState('asc')
  const [previewContentCleared, setPreviewContentCleared] = useState(false)
  const [previewPlayerRow, setPreviewPlayerRow] = useState(null)

  const loadSummaries = useCallback(async ({ force = false } = {}) => {
    setLoading(true)
    setError('')

    try {
      const cached = force ? null : getLeagueBoardCache()

      if (cached?.leagues?.length) {
        setLeagues(cached.leagues)
        setSnapshots(cached.latestSnapshots || [])
        setOpportunities(cached.yearGroupOpportunities || [])
        setIndicatorsLoaded(Boolean(cached.latestSnapshots?.length))
        return
      }

      const rows = await listLeagues()
      setLeagues(Array.isArray(rows) ? rows : [])
      setSnapshots([])
      setOpportunities([])
      setIndicatorsLoaded(false)
    } catch (err) {
      setError(err?.message || 'טעינת תקצירי הפרופילים נכשלה')
      setLeagues([])
      setSnapshots([])
      setOpportunities([])
      setIndicatorsLoaded(false)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadIndicators = useCallback(async () => {
    if (!leagues.length || loadingIndicators) return

    const snapshotIds = unique(
      leagues.map(league => getLeagueSnapshotId(league, selectedSeasonId))
    )

    setLoadingIndicators(true)
    setIndicatorError('')

    try {
      const nextSnapshots = await listLeagueSnapshotsByIds(snapshotIds)
      const nextOpportunities = findPlayersDatabaseYearGroupOpportunities({
        leagues,
        snapshots: nextSnapshots,
      })

      setSnapshots(nextSnapshots)
      setOpportunities(nextOpportunities)
      setIndicatorsLoaded(true)
      setLeagueBoardCache({
        leagues,
        latestSnapshots: nextSnapshots,
        yearGroupOpportunities: nextOpportunities,
      })
    } catch (err) {
      setIndicatorError(err?.message || 'טעינת אינדיקציות נכשלה')
      setSnapshots([])
      setOpportunities([])
      setIndicatorsLoaded(false)
    } finally {
      setLoadingIndicators(false)
    }
  }, [leagues, loadingIndicators, selectedSeasonId])

  useEffect(() => {
    loadSummaries()
  }, [loadSummaries])

  const refreshProfilesAfterChange = useCallback(({
    team = null,
    removedProfileId = '',
    nextEligibleProfileIds = [],
    nextRawProfileIds = [],
  } = {}) => {
    const teamSeasonKey = clean(team?.teamSeasonKey)
    const leagueId = clean(team?.leagueId)
    const removedId = clean(removedProfileId)
    if (!teamSeasonKey || !leagueId) return

    const nextEligibleCount = Array.isArray(nextEligibleProfileIds)
      ? nextEligibleProfileIds.length
      : 0
    const nextRawCount = Array.isArray(nextRawProfileIds)
      ? nextRawProfileIds.length
      : 0

    const nextLeagues = leagues.map(league => {
      if (clean(league.id) !== leagueId) return league

      const currentTeam = league.teamsIndex?.[teamSeasonKey]
      if (!currentTeam) return league

      const nextProfileCounts = { ...(currentTeam.profileCounts || {}) }
      if (removedId && Number(nextProfileCounts[removedId]) > 0) {
        nextProfileCounts[removedId] = Math.max(Number(nextProfileCounts[removedId]) - 1, 0)
      }

      const nextRawProfileCounts = { ...(currentTeam.rawProfileCounts || {}) }
      if (removedId && Number(nextRawProfileCounts[removedId]) > 0) {
        nextRawProfileCounts[removedId] = Math.max(Number(nextRawProfileCounts[removedId]) - 1, 0)
      }

      const nextScoutProfilesCount =
        nextEligibleCount === 0
          ? Math.max((Number(currentTeam.scoutProfilesCount) || 0) - 1, 0)
          : Number(currentTeam.scoutProfilesCount) || 0

      return {
        ...league,
        teamsIndex: {
          ...(league.teamsIndex || {}),
          [teamSeasonKey]: {
            ...currentTeam,
            scoutProfilesCount: nextScoutProfilesCount,
            profileCounts: nextProfileCounts,
            rawProfileCounts: nextRawProfileCounts,
            updatedAt: new Date().toISOString(),
            lastRemovedProfileId: removedId,
            lastRemovedRawProfileCount: nextRawCount,
            lastRemovedEligibleProfileCount: nextEligibleCount,
          },
        },
      }
    })

    setLeagues(nextLeagues)
    setLeagueBoardCache({
      leagues: nextLeagues,
      latestSnapshots: snapshots,
      yearGroupOpportunities: opportunities,
    })
  }, [leagues, opportunities, snapshots])

  const documents = useProfileDocuments({
    onProfileChanged: refreshProfilesAfterChange,
  })

  const seasonOptions = useMemo(() => buildSeasonOptions(), [])
  const availableSeasonIds = useMemo(
    () => unique(leagues.flatMap(getLeagueSeasonIds)),
    [leagues]
  )

  const latestAvailableSeasonId = useMemo(() => {
    const availableIds = new Set(availableSeasonIds)
    const matchingOptions = seasonOptions.filter(option => availableIds.has(option.value))

    return (
      getLastOptionValue(matchingOptions) ||
      getLastOptionValue(seasonOptions) ||
      DEFAULT_PROFILE_SEASON_ID
    )
  }, [availableSeasonIds, seasonOptions])

  useEffect(() => {
    if (!seasonOptions.length) return

    const selectedIsKnown = seasonOptions.some(option => option.value === selectedSeasonId)
    const selectedIsAvailable =
      !availableSeasonIds.length || availableSeasonIds.includes(selectedSeasonId)

    if (!selectedIsKnown || !selectedIsAvailable) {
      setSelectedSeasonId(latestAvailableSeasonId)
    }
  }, [availableSeasonIds, latestAvailableSeasonId, seasonOptions, selectedSeasonId])

  const seasonLeagueRows = useMemo(
    () => leagues.filter(league => leagueMatchesSeason(league, selectedSeasonId)),
    [leagues, selectedSeasonId]
  )

  const profiles = useMemo(
    () =>
      buildProfiles({
        leagues: seasonLeagueRows,
        opportunities,
        seasonId: selectedSeasonId,
      }),
    [opportunities, seasonLeagueRows, selectedSeasonId]
  )

  const yearOptions = useMemo(
    () => buildYearOptions(seasonLeagueRows, selectedSeasonId),
    [seasonLeagueRows, selectedSeasonId]
  )

  const regionOptions = useMemo(
    () =>
      buildRegionOptions({
        leagues: seasonLeagueRows,
        leagueLevel: searchMode === 'league' ? primaryFilter : 'all',
      }),
    [primaryFilter, searchMode, seasonLeagueRows]
  )

  const leagueLevelOptions = useMemo(
    () => buildLeagueOptions(),
    []
  )

  const yearRows = useMemo(
    () => profiles.filter(row => row.scope === 'year'),
    [profiles]
  )

  const leagueRows = useMemo(
    () => profiles.filter(row => row.scope === 'league'),
    [profiles]
  )

  const previewState = useMemo(() => {
    const selectionMetrics = pdbSelectionMetrics({
      leagueRows,
      yearRows,
      searchMode,
      selectedLeagueIds,
      selectedBirthYears,
    })

    if (searchMode === 'all') {
      return {
        stage: 'initial',
        chipsReady: false,
        searchMode,
        primaryFilter,
        selectedLeagueIds,
        selectedBirthYears,
        leagueLevelsCount: leagueLevelOptions.length,
        yearsCount: Math.max(yearOptions.length - 1, 0),
        selectionMetrics,
      }
    }

    if (primaryFilter === 'all') {
      return {
        stage: 'primary',
        chipsReady: false,
        searchMode,
        primaryFilter,
        selectedLeagueIds,
        selectedBirthYears,
        leagueLevelsCount: leagueLevelOptions.length,
        yearsCount: Math.max(yearOptions.length - 1, 0),
        title:
          searchMode === 'league'
            ? `קיימות ${leagueLevelOptions.length} רמות ליגה`
            : `יש ${Math.max(yearOptions.length - 1, 0)} שנתונים במערכת`,
        subtitle:
          searchMode === 'league'
            ? 'בחר רמת ליגה'
            : 'בחר שנתון',
        selectionMetrics,
      }
    }

    return {
      stage: selectionMetrics.selectionCount > 0 ? 'selection' : 'primary',
      chipsReady:
        selectionMetrics.selectionCount > 0 &&
        (!regionOptions.length || selectedRegionId !== 'all'),
      searchMode,
      primaryFilter,
      selectedLeagueIds,
      selectedBirthYears,
      leagueLevelsCount: leagueLevelOptions.length,
      yearsCount: Math.max(yearOptions.length - 1, 0),
      title:
        searchMode === 'league'
          ? `קיימות ${leagueLevelOptions.length} רמות ליגה`
          : `יש ${Math.max(yearOptions.length - 1, 0)} שנתונים במערכת`,
      subtitle:
        searchMode === 'league'
          ? 'בחר רמת ליגה'
          : 'בחר שנתון',
      selectionMetrics,
    }
  }, [
    leagueLevelOptions.length,
    leagueRows,
    primaryFilter,
    searchMode,
    selectedBirthYears,
    selectedLeagueIds,
    selectedRegionId,
    yearOptions.length,
    yearRows,
    regionOptions.length,
  ])

  useEffect(() => {
    setPrimaryFilter('all')
    setSelectedRegionId('all')
    setSelectedLeagueIds([])
    setSelectedBirthYears([])
  }, [searchMode, selectedSeasonId])

  useEffect(() => {
    if (!regionOptions.length) {
      if (selectedRegionId !== 'all') setSelectedRegionId('all')
      return
    }

    if (!regionOptions.some(option => option.value === selectedRegionId)) {
      setSelectedRegionId('all')
    }
  }, [regionOptions, selectedRegionId])

  const toggleLeagueId = useCallback(leagueId => {
    const value = clean(leagueId)
    if (!value) return

    setSelectedLeagueIds(current =>
      current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value]
    )
  }, [])

  const toggleBirthYear = useCallback(birthYear => {
    const value = clean(birthYear)
    if (!value) return

    setSelectedBirthYears(current =>
      current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value]
    )
  }, [])

  const filteredProfiles = useMemo(
    () => sortProfilesByState(
      filterProfilesBySearch({
        profiles,
        yearRows,
        leagueRows,
        searchMode,
        primaryFilter,
        selectedRegionId,
        selectedLeagueIds,
        selectedBirthYears,
      }),
      sortBy,
      sortDirection
    ),
    [
      leagueRows,
      primaryFilter,
      profiles,
      searchMode,
      selectedRegionId,
      selectedBirthYears,
      selectedLeagueIds,
      yearRows,
      sortBy,
      sortDirection,
    ]
  )

  const selectedProfile = useMemo(
    () =>
      filteredProfiles.find(row => row.id === selectedId) ||
      profiles.find(row => row.id === selectedId) ||
      filteredProfiles[0] ||
      profiles[0] ||
      null,
    [filteredProfiles, profiles, selectedId]
  )

  useEffect(() => {
    if (!filteredProfiles.length) return

    setSelectedId(current =>
      filteredProfiles.some(row => row.id === current)
        ? current
        : filteredProfiles[0].id
    )
  }, [filteredProfiles])

  const kpis = useMemo(() => {
    const databaseProfile = profiles.find(row => row.scope === 'database') || {}

    return [
      { id: 'leagues', label: 'ליגות', value: leagues.length },
      { id: 'years', label: 'שנתונים', value: Math.max(yearOptions.length - 1, 0) },
      {
        id: 'loadedPlayers',
        label: 'שחקנים נטענו',
        value: databaseProfile.loadedPlayersCount || 0,
      },
      {
        id: 'profiles',
        label: 'פרופילי סקאוט',
        value: databaseProfile.scoutProfilesCount || 0,
      },
      {
        id: 'risk',
        label: 'בסיכון',
        value: databaseProfile.riskCount || 0,
      },
    ]
  }, [leagues.length, profiles, yearOptions.length])

  const openProfile = profile => {
    if (!profile) return

    setSelectedId(profile.id)
    setPreviewContentCleared(false)
    setPreviewPlayerRow(null)
    setExpandedIds(current => ({
      ...current,
      [profile.id]: !current[profile.id],
    }))
  }

  const openPreviewPlayerRow = useCallback(player => {
    setPreviewContentCleared(false)
    setPreviewPlayerRow(player || null)
  }, [])

  return {
    loading,
    loadingIndicators,
    error,
    indicatorError,
    leagues,
    snapshots,
    opportunities,
    indicatorsLoaded,
    profiles,
    filteredProfiles,
    selectedProfile,
    selectedId,
    seasonOptions,
    selectedSeasonId,
    searchMode,
    primaryFilter,
    regionOptions,
    selectedRegionId,
    yearOptions,
    leagueLevelOptions,
    yearRows,
    leagueRows,
    selectedLeagueIds,
    selectedBirthYears,
    expandedIds,
    kpis,
    previewState,
    loadSummaries,
    loadIndicators,
    setSelectedId,
    setSelectedSeasonId,
    setSearchMode,
    setPrimaryFilter,
    setSelectedRegionId,
    toggleLeagueId,
    toggleBirthYear,
    setSelectedLeagueIds,
    setSelectedBirthYears,
    sortBy,
    sortDirection,
    sortOptions: PROFILE_LIST_SORT_OPTIONS,
    setSortBy,
    setSortDirection,
    playerSortBy,
    playerSortDirection,
    playerSortOptions: PLAYER_LIST_SORT_OPTIONS,
    setPlayerSortBy,
    setPlayerSortDirection,
    previewContentCleared,
    previewPlayerRow,
    clearPreviewContent: () => setPreviewContentCleared(true),
    restorePreviewContent: () => setPreviewContentCleared(false),
    setPreviewPlayerRow: openPreviewPlayerRow,
    openProfile,
    ...documents,
  }
}
