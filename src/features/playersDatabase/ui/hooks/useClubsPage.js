// src/features/playersDatabase/ui/hooks/useClubsPage.js

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
} from '../../model/pages/clubsPage.model.js'
import {
  buildClubExpandedModel,
  buildClubSummaryModel,
} from '../../model/pages/clubPresentation.model.js'
import {
  PLAYERS_DATABASE_CURRENT_SEASON_KEY,
  PLAYERS_DATABASE_SEASONS_CATALOG,
} from '../../catalog/seasons.catalog.js'
import { readClubsMasterDocument } from '../../services/read/index.js'

const currentSeason = PLAYERS_DATABASE_SEASONS_CATALOG.find(season => (
  season.target === 'current'
)) || null
const previousSeason = PLAYERS_DATABASE_SEASONS_CATALOG.find(season => (
  season.target === 'history'
)) || null

export const CLUBS_PAGE_SEASON_OPTIONS = Object.freeze([
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
  const previousSeasonOption = CLUBS_PAGE_SEASON_OPTIONS[1]

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

  const allGroups = useMemo(() => buildClubsPageRows({
    clubsMasterDoc,
    seasonView: 'current',
  }), [clubsMasterDoc])
  const previousTeamsByClubId = useMemo(() => new Map(
    buildClubsPageRows({ clubsMasterDoc, seasonView: 'previous' })
      .map(group => [group.club?.clubId, group.teams])
  ), [clubsMasterDoc])

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
      club: group.club,
      teams: group.teams,
      previousTeams: group.previousTeams,
      seasonKey: currentSeasonOption?.seasonKey,
      seasonView: 'current',
    }),
    expandedModels: {
      current: buildClubExpandedModel({
        club: group.club,
        teams: group.teams,
        seasonKey: currentSeasonOption?.seasonKey,
      }),
      previous: buildClubExpandedModel({
        club: group.club,
        teams: previousTeamsByClubId.get(group.club?.clubId) || [],
        seasonKey: previousSeasonOption?.seasonKey,
      }),
    },
    seasonOptions: CLUBS_PAGE_SEASON_OPTIONS,
  })), [groups, currentSeasonOption?.seasonKey, previousSeasonOption?.seasonKey, previousTeamsByClubId])

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
    reload,
    resetFilters,
  }
}
