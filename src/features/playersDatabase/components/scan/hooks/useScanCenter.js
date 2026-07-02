// src/features/playersDatabase/components/scan/hooks/useScanCenter.js

import { useCallback, useEffect, useMemo, useState } from 'react'
import { listLeagueSnapshotsByIds, listLeagues } from '../../../services/pdbLeague.firestore.js'
import { findPlayersDatabaseYearGroupOpportunities } from '../../../sharedLogic/yearGroupOpportunities.js'
import { getLeagueBoardCache, setLeagueBoardCache } from '../../leagues/board/hook/leagueBoardCache.js'
import { DEFAULT_SCAN_SEASON_ID } from '../logic/constants.js'
import { buildScanLeagueOptions, buildScanYearOptions, filterProfilesBySearch } from '../logic/filters.logic.js'
import { buildScanProfiles } from '../logic/profiles.logic.js'
import { buildScanSeasonOptions, getLeagueSeasonIds, getLeagueSnapshotId, leagueMatchesSeason } from '../logic/season.logic.js'
import { clean, unique } from '../logic/utils.js'
import { useScanProfileDocuments } from './useScanProfileDocuments.js'

export function useScanCenter() {
  const [loading, setLoading] = useState(false)
  const [loadingIndicators, setLoadingIndicators] = useState(false)
  const [error, setError] = useState('')
  const [indicatorError, setIndicatorError] = useState('')
  const [leagues, setLeagues] = useState([])
  const [snapshots, setSnapshots] = useState([])
  const [opportunities, setOpportunities] = useState([])
  const [indicatorsLoaded, setIndicatorsLoaded] = useState(false)
  const [selectedId, setSelectedId] = useState('database:all')
  const [selectedSeasonId, setSelectedSeasonId] = useState(DEFAULT_SCAN_SEASON_ID)
  const [searchMode, setSearchMode] = useState('all')
  const [primaryFilter, setPrimaryFilter] = useState('all')
  const [selectedLeagueIds, setSelectedLeagueIds] = useState([])
  const [selectedBirthYears, setSelectedBirthYears] = useState([])
  const [expandedIds, setExpandedIds] = useState({})
  const documents = useScanProfileDocuments()

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
      setError(err?.message || 'טעינת תקצירי סריקה נכשלה')
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
    const snapshotIds = unique(leagues.map(league => getLeagueSnapshotId(league, selectedSeasonId)))
    setLoadingIndicators(true)
    setIndicatorError('')

    try {
      const nextSnapshots = await listLeagueSnapshotsByIds(snapshotIds)
      const nextOpportunities = findPlayersDatabaseYearGroupOpportunities({ leagues, snapshots: nextSnapshots })
      setSnapshots(nextSnapshots)
      setOpportunities(nextOpportunities)
      setIndicatorsLoaded(true)
      setLeagueBoardCache({ leagues, latestSnapshots: nextSnapshots, yearGroupOpportunities: nextOpportunities })
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

  const seasonOptions = useMemo(() => buildScanSeasonOptions(), [])
  const availableSeasonIds = useMemo(() => unique(leagues.flatMap(getLeagueSeasonIds)), [leagues])
  const latestAvailableSeasonId = useMemo(() => {
    const available = new Set(availableSeasonIds)
    return seasonOptions.map(option => option.value).filter(value => available.has(value)).at(-1) || seasonOptions.at(-1)?.value || DEFAULT_SCAN_SEASON_ID
  }, [availableSeasonIds, seasonOptions])

  useEffect(() => {
    if (!seasonOptions.length) return
    const selectedIsKnown = seasonOptions.some(option => option.value === selectedSeasonId)
    if (!selectedIsKnown || availableSeasonIds.length && !availableSeasonIds.includes(selectedSeasonId)) setSelectedSeasonId(latestAvailableSeasonId)
  }, [availableSeasonIds, latestAvailableSeasonId, seasonOptions, selectedSeasonId])

  const seasonLeagueRows = useMemo(() => leagues.filter(league => leagueMatchesSeason(league, selectedSeasonId)), [leagues, selectedSeasonId])
  const profiles = useMemo(() => buildScanProfiles({ leagues: seasonLeagueRows, opportunities, seasonId: selectedSeasonId }), [opportunities, seasonLeagueRows, selectedSeasonId])
  const yearOptions = useMemo(() => buildScanYearOptions(seasonLeagueRows, selectedSeasonId), [seasonLeagueRows, selectedSeasonId])
  const leagueOptions = useMemo(() => buildScanLeagueOptions(seasonLeagueRows), [seasonLeagueRows])
  const yearRows = useMemo(() => profiles.filter(row => row.scope === 'year'), [profiles])
  const leagueRows = useMemo(() => profiles.filter(row => row.scope === 'league'), [profiles])

  useEffect(() => {
    setPrimaryFilter('all')
    setSelectedLeagueIds([])
    setSelectedBirthYears([])
  }, [searchMode, selectedSeasonId])

  const toggleLeagueId = useCallback(leagueId => {
    const value = clean(leagueId)
    if (!value) return
    setSelectedLeagueIds(current => current.includes(value) ? current.filter(item => item !== value) : [...current, value])
  }, [])

  const toggleBirthYear = useCallback(birthYear => {
    const value = clean(birthYear)
    if (!value) return
    setSelectedBirthYears(current => current.includes(value) ? current.filter(item => item !== value) : [...current, value])
  }, [])

  const filteredProfiles = useMemo(() => filterProfilesBySearch({ profiles, yearRows, leagueRows, searchMode, primaryFilter, selectedLeagueIds, selectedBirthYears }), [leagueRows, primaryFilter, profiles, searchMode, selectedBirthYears, selectedLeagueIds, yearRows])
  const selectedProfile = useMemo(() => filteredProfiles.find(row => row.id === selectedId) || profiles.find(row => row.id === selectedId) || filteredProfiles[0] || profiles[0] || null, [filteredProfiles, profiles, selectedId])

  useEffect(() => {
    if (!filteredProfiles.length) return
    setSelectedId(current => filteredProfiles.some(row => row.id === current) ? current : filteredProfiles[0].id)
  }, [filteredProfiles])

  const kpis = useMemo(() => {
    const databaseProfile = profiles.find(row => row.scope === 'database') || {}
    return [
      { id: 'leagues', label: 'ליגות', value: leagues.length },
      { id: 'years', label: 'שנתונים', value: Math.max(yearOptions.length - 1, 0) },
      { id: 'loadedPlayers', label: 'שחקנים נטענו', value: databaseProfile.loadedPlayersCount || 0 },
      { id: 'profiles', label: 'פרופילי סקאוט', value: databaseProfile.scoutProfilesCount || 0 },
      { id: 'risk', label: 'בסיכון', value: databaseProfile.riskCount || 0 },
    ]
  }, [leagues.length, profiles, yearOptions.length])

  const openProfile = profile => {
    if (!profile) return
    setSelectedId(profile.id)
    setExpandedIds(current => ({ ...current, [profile.id]: !current[profile.id] }))
  }

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
    yearOptions,
    leagueOptions,
    yearRows,
    leagueRows,
    selectedLeagueIds,
    selectedBirthYears,
    expandedIds,
    kpis,
    loadSummaries,
    loadIndicators,
    setSelectedId,
    setSelectedSeasonId,
    setSearchMode,
    setPrimaryFilter,
    toggleLeagueId,
    toggleBirthYear,
    setSelectedLeagueIds,
    setSelectedBirthYears,
    openProfile,
    ...documents,
  }
}
