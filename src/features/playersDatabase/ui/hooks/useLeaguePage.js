// features/playersDatabase/ui/hooks/useLeaguePage.js

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  buildTeamScoutLeagueModel,
  TEAM_SCOUT_NORMALIZATION_MODE,
  TEAM_SCOUT_SORT_MODE,
} from '../../../../shared/teams/scout/index.js'

import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../catalog/clubs.catalog.js'
import { buildTeamDisplayName } from '../../catalog/teamDisplay.js'
import { getLeagueById } from '../../services/read/index.js'
import { sortByTableRank } from '../logic/tableRows.logic.js'

const clean = value => String(value ?? '').trim()

const toNumber = value => {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : 0
}

const normalizeSeasonKey = value => {
  const key = clean(value)
  if (!key) return ''

  const fullMatch = key.match(/^20(\d{2})\s*\/\s*20(\d{2})$/)
  if (fullMatch) return `${fullMatch[1]}/${fullMatch[2]}`

  return key.replace(/_/g, '/')
}

const buildSeasonOption = ({ season, target }) => ({
  target,
  season,
  seasonId: clean(season?.seasonId),
  seasonKey: normalizeSeasonKey(season?.seasonKey || season?.seasonId),
})

const buildSeasonOptions = league => {
  const options = []

  if (league?.current?.seasonId || league?.current?.seasonKey) {
    options.push(buildSeasonOption({
      season: league.current,
      target: 'current',
    }))
  }

  const history = Array.isArray(league?.history) ? league.history : []
  history.forEach(season => {
    if (!season?.seasonId && !season?.seasonKey) return

    options.push(buildSeasonOption({
      season,
      target: 'history',
    }))
  })

  return options.filter(option => option.seasonKey || option.seasonId)
}

const resolvePriorityLevel = value => {
  const rate = Number(value)
  if (!Number.isFinite(rate)) return 'neutral'
  if (rate >= 140) return 'elite'
  if (rate >= 115) return 'high'
  if (rate >= 100) return 'positive'
  if (rate >= 85) return 'neutral'

  return 'low'
}

const getClubById = clubId =>
  PLAYERS_DATABASE_CLUBS_CATALOG.find(club => clean(club.id) === clean(clubId)) || null

const resolveTeamName = row => {
  const club = getClubById(row?.clubId)

  return buildTeamDisplayName({
    clubName: club?.name || row?.clubName || row?.displayName || row?.teamName,
    clubId: row?.clubId,
    teamId: row?.teamId,
    teamSlot: row?.teamSlot,
  }) || clean(row?.teamId || row?.clubId || '-')
}

const getTeamStat = ({ row = {}, stats = {}, key = '', fallbackKey = '' } = {}) =>
  toNumber(stats[key] ?? row[key] ?? (fallbackKey ? row[fallbackKey] : undefined))

const buildTeamRow = ({ row, scoutResult } = {}) => {
  const stats = row?.teamStats || {}
  const scoutSummary = row?.scoutProfilesSummary || {}

  const playersCount = toNumber(row?.playersCount || row?.teamPlayersCount)
  const profilesCount = toNumber(scoutSummary.total)

  return {
    id: clean(row?.teamId || row?.clubId || row?.rank),
    tableRank: toNumber(row?.rank || row?.tableRank),
    name: resolveTeamName(row),
    teamSlot: toNumber(row?.birthTeamSlot || row?.teamSlot) || 1,
    points: getTeamStat({ row, stats, key: 'points' }),
    goalsFor: getTeamStat({ row, stats, key: 'goalsFor' }),
    goalsAgainst: getTeamStat({ row, stats, key: 'goalsAgainst' }),
    games: getTeamStat({ row, stats, key: 'teamGamePlayed', fallbackKey: 'games' }),
    playersCount,
    profilesCount,
    attackPriority: scoutResult?.offense?.priorityLevel ||
      resolvePriorityLevel(stats.attackNormalPerformance ?? row?.attackNormalPerformance),
    defensePriority: scoutResult?.defense?.priorityLevel ||
      resolvePriorityLevel(stats.defenseNormalPerformance ?? row?.defenseNormalPerformance),
    scoutStatus: profilesCount > 0 ? 'full' : 'missing',
    source: row,
  }
}

const buildScoutResultMap = ({ tableRank = [], leagueDoc = {}, season = {} } = {}) => {
  const result = buildTeamScoutLeagueModel({
    leagueLevel: leagueDoc?.level,
    leagueNumGames: season?.leagueTotalRound || 30,
    rows: tableRank,
    normalizationMode: TEAM_SCOUT_NORMALIZATION_MODE.AUTO,
    sortMode: TEAM_SCOUT_SORT_MODE.TABLE,
  })

  return new Map((result.rows || []).map(row => [clean(row.teamId), row]))
}

const buildTeams = ({ season, leagueDoc }) => {
  const tableRank = Array.isArray(season?.tableRank) ? season.tableRank : []
  const scoutResultMap = buildScoutResultMap({
    tableRank,
    leagueDoc,
    season,
  })

  return sortByTableRank(tableRank.map(row => buildTeamRow({
    row,
    scoutResult: scoutResultMap.get(clean(row?.teamId || row?.clubId || row?.rank)),
  })).filter(row => row.id))
}

const getLeagueLevelLabel = level => {
  if (level === null || level === undefined || level === '') return '-'
  return `רמה ${level}`
}

const buildLeagueView = ({ league, leagueId, selectedSeason }) => ({
  id: clean(league?.id || league?.leagueId || leagueId),
  name: clean(league?.leagueName || league?.name || leagueId || '-'),
  region: clean(league?.regionLabel || league?.region),
  seasonKey: normalizeSeasonKey(selectedSeason?.seasonKey || selectedSeason?.seasonId) || '-',
  ageGroup: clean(league?.ageGroupLabel || league?.ageGroupId || '-'),
  birthYear: selectedSeason?.birthYear || '-',
  levelLabel: getLeagueLevelLabel(league?.level),
  leagueTotalRound: selectedSeason?.leagueTotalRound || '-',
  gameTime: selectedSeason?.gameTime || league?.gameTime || '-',
})

const buildSummary = ({ teams, league }) => ({
  teamsCount: teams.length,
  birthYear: league.birthYear,
  goalsCount: teams.reduce((total, team) => total + toNumber(team.goalsFor), 0),
  profilesCount: teams.reduce((total, team) => total + toNumber(team.profilesCount), 0),
  attackPositive: teams.filter(team => ['elite', 'high', 'positive'].includes(team.attackPriority)).length,
  defensePositive: teams.filter(team => ['elite', 'high', 'positive'].includes(team.defensePriority)).length,
  recommendedTeams: teams.filter(team => (
    ['elite', 'high'].includes(team.attackPriority) ||
    ['elite', 'high'].includes(team.defensePriority)
  )).length,
})

export function useLeaguePage() {
  const { leagueId = '' } = useParams()
  const [leagueDoc, setLeagueDoc] = useState(null)
  const [selectedSeasonKey, setSelectedSeasonKey] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadToken, setReloadToken] = useState(0)

  const reload = useCallback(() => {
    setReloadToken(current => current + 1)
  }, [])

  useEffect(() => {
    let active = true

    async function loadLeague() {
      setLoading(true)
      setError('')

      try {
        const nextLeague = await getLeagueById(leagueId)
        if (!active) return

        setLeagueDoc(nextLeague)

        const options = buildSeasonOptions(nextLeague)
        setSelectedSeasonKey(current => (
          current && options.some(option => option.seasonKey === current)
            ? current
            : options[0]?.seasonKey || ''
        ))
      } catch (err) {
        if (!active) return

        setLeagueDoc(null)
        setError(err?.message || 'טעינת הליגה נכשלה')
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadLeague()

    return () => {
      active = false
    }
  }, [leagueId, reloadToken])

  const seasonOptions = useMemo(() => buildSeasonOptions(leagueDoc), [leagueDoc])

  const selectedSeasonOption = useMemo(() => (
    seasonOptions.find(option => option.seasonKey === selectedSeasonKey) ||
    seasonOptions[0] ||
    null
  ), [seasonOptions, selectedSeasonKey])

  const birthYearOptions = useMemo(() => (
    [...new Set(seasonOptions
      .map(option => toNumber(option?.season?.birthYear))
      .filter(Boolean))]
  ), [seasonOptions])

  const setSelectedBirthYear = useCallback(value => {
    const birthYear = toNumber(value)
    const matchingSeason = seasonOptions.find(option => (
      toNumber(option?.season?.birthYear) === birthYear
    ))

    if (matchingSeason?.seasonKey) {
      setSelectedSeasonKey(matchingSeason.seasonKey)
    }
  }, [seasonOptions])

  const teams = useMemo(() => buildTeams({
    season: selectedSeasonOption?.season,
    leagueDoc,
  }), [leagueDoc, selectedSeasonOption])

  const league = useMemo(() => buildLeagueView({
    league: leagueDoc,
    leagueId,
    selectedSeason: selectedSeasonOption?.season,
  }), [leagueDoc, leagueId, selectedSeasonOption])

  const summary = useMemo(() => buildSummary({ teams, league }), [league, teams])

  return {
    league,
    leagueDoc,
    teams,
    summary,
    seasonOptions,
    birthYearOptions,
    selectedSeasonKey,
    selectedSeasonOption,
    setSelectedSeasonKey,
    setSelectedBirthYear,
    reload,
    loading,
    error,
  }
}




