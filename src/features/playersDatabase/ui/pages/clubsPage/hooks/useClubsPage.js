// src/features/playersDatabase/ui/pages/clubsPage/hooks/useClubsPage.js

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  buildClubsPageRows,
  buildClubsPageSummary,
  filterClubsPageRows,
} from '../../../../model/pages/clubsPage.model.js'
import {
  buildClubSummaryModel,
} from '../../../../model/pages/clubPresentation.model.js'
import {
  buildAllClubIntelligencesFromCanonicalSources,
} from '../../../../domain/clubIntelligence/index.js'
import {
  PLAYERS_DATABASE_CURRENT_SEASON_KEY,
  PLAYERS_DATABASE_SEASONS_CATALOG,
} from '../../../../catalog/seasons.catalog.js'
import { readClubsPageData } from '../../../../services/read/index.js'
import { getCachedClubsPageData } from '../../../../services/read/pages/clubs.read.js'

const currentSeason = PLAYERS_DATABASE_SEASONS_CATALOG.find(season => (
  season.target === 'current'
)) || null
const previousSeason = PLAYERS_DATABASE_SEASONS_CATALOG.find(season => (
  season.target === 'history'
)) || null

const CLUBS_PAGE_SEASON_OPTIONS = Object.freeze([
  {
    value: 'current',
    seasonKey: currentSeason?.seasonKey || PLAYERS_DATABASE_CURRENT_SEASON_KEY,
    label: `עונה נוכחית · ${currentSeason?.label || PLAYERS_DATABASE_CURRENT_SEASON_KEY}`,
  },
  {
    value: 'previous',
    seasonKey: previousSeason?.seasonKey || '',
    label: `עונה קודמת · ${previousSeason?.label || ''}`.replace(/\s·\s$/, ''),
  },
])

export default function useClubsPage() {
  const [clubsPageData, setClubsPageData] = useState(getCachedClubsPageData)
  const [pending, setPending] = useState(true)
  const requestId = useRef(0)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [clubLevels, setClubLevels] = useState([])
  const [leaguePathDirections, setLeaguePathDirections] = useState([])
  const [leagueLevelDirections, setLeagueLevelDirections] = useState([])
  const currentSeasonOption = CLUBS_PAGE_SEASON_OPTIONS[0]

  const load = useCallback(async ({ refresh = false } = {}) => {
    const currentRequest = ++requestId.current
    setPending(true)
    setError('')

    try {
      const data = await readClubsPageData({ refresh })
      if (currentRequest === requestId.current) setClubsPageData(data)
      return data
    } catch (err) {
      if (currentRequest === requestId.current) setError(err?.message || 'טעינת המועדונים נכשלה')
      throw err
    } finally {
      if (currentRequest === requestId.current) setPending(false)
    }
  }, [])

  const reload = useCallback(() => load({ refresh: true }), [load])

  useEffect(() => {
    load().catch(() => {})
    return () => { requestId.current += 1 }
  }, [load])

  const intelligencesByClubId = useMemo(() => (
    buildAllClubIntelligencesFromCanonicalSources({
      directory: clubsPageData?.directory,
      centers: clubsPageData?.centers,
    })
  ), [clubsPageData])

  const allGroups = useMemo(() => buildClubsPageRows({
    seasonView: 'current',
    intelligencesByClubId,
  }), [intelligencesByClubId])
  const groups = useMemo(() => filterClubsPageRows({
    groups: allGroups,
    query,
    clubLevel: clubLevels,
    leaguePathDirections,
    leagueLevelDirections,
  }), [
    allGroups,
    clubLevels,
    leagueLevelDirections,
    leaguePathDirections,
    query,
  ])

  const presentationGroups = useMemo(() => groups.map(group => ({
    ...group,
    summaryModel: buildClubSummaryModel({
      intelligence: group.intelligence,
    }),
    seasonOptions: CLUBS_PAGE_SEASON_OPTIONS,
  })), [groups, currentSeasonOption?.seasonKey])

  const summary = useMemo(() => buildClubsPageSummary(groups), [groups])

  const clubLevelOptions = useMemo(() => {
    const levels = new Set(
      [...intelligencesByClubId.values()]
        .map(item => Number(item?.club?.clubStrengthLevel || item?.club?.clubLevel))
        .filter(level => Number.isFinite(level) && level > 0)
    )

    return [...levels]
      .sort((left, right) => left - right)
      .map(level => ({ value: String(level), label: String(level) }))
  }, [intelligencesByClubId])

  const toggleClubLevel = useCallback(value => {
    const normalizedValue = String(value)
    setClubLevels(previous => (
      previous.includes(normalizedValue)
        ? previous.filter(level => level !== normalizedValue)
        : [...previous, normalizedValue]
    ))
  }, [])

  const toggleLeaguePathDirection = useCallback(direction => {
    setLeaguePathDirections(previous => (
      previous.includes(direction)
        ? previous.filter(value => value !== direction)
        : [...previous, direction]
    ))
  }, [])

  const toggleLeagueLevelDirection = useCallback(direction => {
    setLeagueLevelDirections(previous => (
      previous.includes(direction)
        ? previous.filter(value => value !== direction)
        : [...previous, direction]
    ))
  }, [])

  const resetFilters = useCallback(() => {
    setQuery('')
    setClubLevels([])
    setLeaguePathDirections([])
    setLeagueLevelDirections([])
  }, [])

  return {
    reload,
    clubsPageData,
    loading: !clubsPageData && pending,
    refreshing: Boolean(clubsPageData && pending),
    error: clubsPageData ? '' : error,
    refreshError: clubsPageData ? error : '',
    query,
    setQuery,
    clubLevels,
    clubLevelOptions,
    toggleClubLevel,
    leaguePathDirections,
    toggleLeaguePathDirection,
    leagueLevelDirections,
    toggleLeagueLevelDirection,
    seasonLabel: currentSeasonOption?.label || '',
    groups: presentationGroups,
    summary,
    resetFilters,
  }
}
