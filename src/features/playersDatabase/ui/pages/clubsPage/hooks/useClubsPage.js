// src/features/playersDatabase/ui/pages/clubsPage/hooks/useClubsPage.js

import {
  useCallback,
  useEffect,
  useMemo,
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
  buildClubIntelligenceFromMaster,
} from '../../../../domain/clubIntelligence/index.js'
import {
  PLAYERS_DATABASE_CURRENT_SEASON_KEY,
  PLAYERS_DATABASE_SEASONS_CATALOG,
} from '../../../../catalog/seasons.catalog.js'
import {
  readClubsMasterDocument,
} from '../../../../services/read/index.js'

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
  const [clubsMasterDoc, setClubsMasterDoc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [clubLevels, setClubLevels] = useState([])
  const [leaguePathDirections, setLeaguePathDirections] = useState([])
  const [leagueLevelDirections, setLeagueLevelDirections] = useState([])
  const currentSeasonOption = CLUBS_PAGE_SEASON_OPTIONS[0]

  const reload = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const doc = await readClubsMasterDocument()
      setClubsMasterDoc(doc)
      return doc
    } catch (err) {
      setClubsMasterDoc(null)
      setError(err?.message || 'טעינת המועדונים נכשלה')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload().catch(() => {})
  }, [reload])

  const intelligencesByClubId = useMemo(() => new Map(
    (Array.isArray(clubsMasterDoc?.clubs)
      ? clubsMasterDoc.clubs
      : [])
      .map(club => [club?.clubId, buildClubIntelligenceFromMaster({ club })])
      .filter(([clubId]) => Boolean(clubId))
  ), [clubsMasterDoc])

  const allGroups = useMemo(() => buildClubsPageRows({
    clubsMasterDoc,
    seasonView: 'current',
    intelligencesByClubId,
  }), [clubsMasterDoc, intelligencesByClubId])
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
      (Array.isArray(clubsMasterDoc?.clubs) ? clubsMasterDoc.clubs : [])
        .map(club => Number(club?.clubStrengthLevel || club?.clubLevel))
        .filter(level => Number.isFinite(level) && level > 0)
    )

    return [...levels]
      .sort((left, right) => left - right)
      .map(level => ({ value: String(level), label: String(level) }))
  }, [clubsMasterDoc])

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
    clubsMasterDoc,
    loading,
    error,
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
