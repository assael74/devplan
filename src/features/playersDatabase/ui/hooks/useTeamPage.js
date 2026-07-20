// features/playersDatabase/ui/hooks/useTeamPage.js

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'

import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../catalog/clubs.catalog.js'
import { buildTeamDisplayName } from '../../catalog/teamDisplay.js'
import { getLeagueById, getTeamById } from '../../services/read/index.js'
import {
  buildTeamScoutLeagueModel,
  TEAM_SCOUT_NORMALIZATION_MODE,
  TEAM_SCOUT_SORT_MODE,
} from '../../../../shared/teams/scout/index.js'

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

const isSameSeason = (row = {}, season = {}) => {
  const rowSeasonKey = normalizeSeasonKey(row?.seasonKey)
  const rowSeasonId = clean(row?.seasonId)
  const seasonKey = normalizeSeasonKey(season?.seasonKey)
  const seasonId = clean(season?.seasonId)

  return Boolean(
    (seasonKey && rowSeasonKey === seasonKey) ||
    (seasonId && rowSeasonId === seasonId)
  )
}

const findTeamRow = ({ season, teamId }) => {
  const rows = Array.isArray(season?.tableRank) ? season.tableRank : []
  const key = clean(teamId)

  return rows.find(row => (
    clean(row?.teamId) === key ||
    clean(row?.birthTeamId) === key ||
    clean(row?.teamSlotId) === key
  )) || null
}

const buildScoutResultMap = ({ tableRank = [], leagueDoc = {}, season = {} } = {}) => {
  const result = buildTeamScoutLeagueModel({
    leagueLevel: leagueDoc?.level,
    leagueNumGames: season?.leagueTotalRound || 30,
    rows: tableRank,
    normalizationMode: TEAM_SCOUT_NORMALIZATION_MODE.AUTO,
    sortMode: TEAM_SCOUT_SORT_MODE.TABLE,
  })

  return new Map((result.rows || []).map(row => [
    clean(row.teamId || row.birthTeamId || row.clubId || row.rank),
    row,
  ]))
}

const findTeamSeasonDoc = ({ teamDoc, selectedSeasonOption }) => {
  if (!teamDoc || !selectedSeasonOption) return null

  const fieldKey = selectedSeasonOption.target === 'history' ? 'history' : 'current'
  const rows = Array.isArray(teamDoc[fieldKey]) ? teamDoc[fieldKey] : []

  return rows.find(row => isSameSeason(row, selectedSeasonOption)) || null
}

const getClubIdFromTeamId = teamId => clean(teamId).split('_').filter(Boolean)[0] || ''

const getClubById = clubId =>
  PLAYERS_DATABASE_CLUBS_CATALOG.find(club => clean(club.id) === clean(clubId)) || null

const resolveTeamName = ({ teamRow = {}, teamDoc = {}, teamId = '' } = {}) => {
  const safeTeamDoc = teamDoc || {}
  const clubId = clean(teamRow.clubId || safeTeamDoc.clubId || getClubIdFromTeamId(teamId))
  const club = getClubById(clubId)

  return buildTeamDisplayName({
    clubName: club?.name || teamRow.clubName || safeTeamDoc.displayName || teamRow.displayName || teamRow.teamName,
    clubId,
    teamId: teamRow.teamId || teamRow.birthTeamId || safeTeamDoc.birthTeamId || teamId,
    teamSlot: teamRow.birthTeamSlot || teamRow.teamSlot || safeTeamDoc.birthTeamSlot,
  }) || clean(teamId || '-')
}

const normalizePlayerRow = (player = {}, index = 0) => {
  const playerStats = player.playerStats || {}

  return {
    id: clean(player.playerDocumentId || player.playerId || player.externalPlayerId || player.normalizedName || player.fullName || index),
    playerId: clean(player.playerId),
    playerDocumentId: clean(player.playerDocumentId),
    externalPlayerId: clean(player.externalPlayerId),
    playerUrl: clean(player.playerUrl),
    number: clean(player.numShirt || player.number || index + 1),
    numShirt: clean(player.numShirt || player.number),
    fullName: clean(player.fullName),
    normalizedName: clean(player.normalizedName),
    positionLayer: clean(player.positionLayer),
    primaryPosition: clean(player.primaryPosition),
    playerStats,
    games: Number(playerStats.games ?? player.games ?? 0),
    goals: Number(playerStats.goals ?? player.goals ?? 0),
    starts: Number(playerStats.starts ?? player.starts ?? 0),
    yellowCards: Number(playerStats.yellowCards ?? player.yellowCards ?? 0),
    minutes: Number(playerStats.minutes ?? player.minutes ?? 0),
    profile: Array.isArray(player.scoutProfiles) && player.scoutProfiles[0]
      ? clean(player.scoutProfiles[0].label || player.scoutProfiles[0].profileId)
      : '-',
    reliability: Array.isArray(player.scoutProfiles) && player.scoutProfiles[0]
      ? clean(player.scoutProfiles[0].reliabilityLevel || player.scoutProfiles[0].profileReliability)
      : '-',
    scoutProfiles: Array.isArray(player.scoutProfiles) ? player.scoutProfiles : [],
  }
}

const buildTeamView = ({ teamId, leagueDoc, teamDoc, selectedSeasonOption, selectedTeamSeason }) => {
  const season = selectedSeasonOption?.season || {}
  const teamRow = findTeamRow({ season, teamId }) || {}
  const tableRank = Array.isArray(season?.tableRank) ? season.tableRank : []
  const scoutResult = buildScoutResultMap({
    tableRank,
    leagueDoc,
    season,
  }).get(clean(teamRow.teamId || teamRow.birthTeamId || teamId))
  const stats = teamRow.teamStats || selectedTeamSeason?.teamStats || {}
  const games = toNumber(stats.teamGamePlayed || teamRow.games)
  const points = toNumber(stats.points || teamRow.points)
  const goalsFor = toNumber(stats.goalsFor || teamRow.goalsFor)
  const goalsAgainst = toNumber(stats.goalsAgainst || teamRow.goalsAgainst)
  const successPercent = games
    ? Math.round((points / (games * 3)) * 100)
    : null
  const teamPlayers = Array.isArray(selectedTeamSeason?.teamPlayers)
    ? selectedTeamSeason.teamPlayers
    : []
  const playersCount = teamPlayers.length

  return {
    id: clean(teamId),
    birthTeamId: clean(teamDoc?.birthTeamId || teamRow.birthTeamId || teamId),
    teamDocumentId: clean(teamDoc?.id || teamDoc?.birthTeamId || teamId),
    clubId: clean(teamRow.clubId || teamDoc?.clubId || getClubIdFromTeamId(teamId)),
    name: resolveTeamName({ teamRow, teamDoc, teamId }),
    leagueId: clean(leagueDoc?.id || season.leagueId),
    leagueName: clean(leagueDoc?.leagueName || leagueDoc?.name || leagueDoc?.id || '-'),
    ageGroupId: clean(teamRow.ageGroupId || selectedTeamSeason?.ageGroupId || season.ageGroupId || leagueDoc?.ageGroupId),
    ageGroupLabel: clean(teamRow.ageGroupLabel || selectedTeamSeason?.ageGroupLabel || season.ageGroupLabel || leagueDoc?.ageGroupLabel),
    birthYear: season.birthYear || selectedTeamSeason?.birthYear || teamDoc?.birthYear || '-',
    seasonKey: selectedSeasonOption?.seasonKey || '-',
    tableRank: Number(teamRow.rank || teamRow.tableRank || 0) || '-',
    games,
    points,
    successPercent,
    goalsFor,
    goalsAgainst,
    teamUrl: clean(selectedTeamSeason?.teamUrl || teamRow.teamUrl),
    teamStats: stats,
    attackPerGame: games ? (goalsFor / games).toFixed(2) : '-',
    defensePerGame: games ? (goalsAgainst / games).toFixed(2) : '-',
    offense: scoutResult?.offense || null,
    defense: scoutResult?.defense || null,
    playersStatus: playersCount ? `${playersCount}` : 'אין סגל',
    statsStatus: playersCount
      ? `${teamPlayers.filter(player => Number(player.playerStats?.minutes || 0) > 0).length}`
      : '0',
  }
}

export function useTeamPage() {
  const { leagueId = '', teamId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const requestedSeasonKey = normalizeSeasonKey(searchParams.get('season'))
  const [leagueDoc, setLeagueDoc] = useState(null)
  const [teamDoc, setTeamDoc] = useState(null)
  const [selectedSeasonKey, setSelectedSeasonKey] = useState(requestedSeasonKey)
  const [refreshKey, setRefreshKey] = useState(0)

  const reload = useCallback(() => {
    setRefreshKey(value => value + 1)
  }, [])

  useEffect(() => {
    let active = true

    async function loadData() {
      const [nextLeague, nextTeam] = await Promise.all([
        getLeagueById(leagueId),
        getTeamById(teamId),
      ])
      if (!active) return

      setLeagueDoc(nextLeague)
      setTeamDoc(nextTeam)
    }

    loadData().catch(() => {
      if (!active) return

      setLeagueDoc(null)
      setTeamDoc(null)
    })

    return () => {
      active = false
    }
  }, [leagueId, teamId, refreshKey])

  const seasonOptions = useMemo(() => buildSeasonOptions(leagueDoc), [leagueDoc])

  useEffect(() => {
    if (!seasonOptions.length) return

    const requestedOption = seasonOptions.find(option => option.seasonKey === requestedSeasonKey)
    if (requestedOption) {
      setSelectedSeasonKey(requestedOption.seasonKey)
      return
    }

    if (!selectedSeasonKey) {
      setSelectedSeasonKey(seasonOptions[0].seasonKey)
    }
  }, [requestedSeasonKey, seasonOptions, selectedSeasonKey])

  const selectedSeasonOption = useMemo(() => (
    seasonOptions.find(option => option.seasonKey === selectedSeasonKey) ||
    seasonOptions[0] ||
    null
  ), [seasonOptions, selectedSeasonKey])

  const selectedTeamSeason = useMemo(() => findTeamSeasonDoc({
    teamDoc,
    selectedSeasonOption,
  }), [teamDoc, selectedSeasonOption])

  const players = useMemo(() => (
    Array.isArray(selectedTeamSeason?.teamPlayers)
      ? selectedTeamSeason.teamPlayers.map(normalizePlayerRow)
      : []
  ), [selectedTeamSeason])

  const team = useMemo(() => buildTeamView({
    teamId,
    leagueDoc,
    teamDoc,
    selectedSeasonOption,
    selectedTeamSeason,
  }), [teamId, leagueDoc, teamDoc, selectedSeasonOption, selectedTeamSeason])

  return {
    leagueId,
    leagueDoc,
    team,
    teamDoc,
    players,
    hasTeamPlayers: players.length > 0,
    seasonOptions,
    selectedSeasonKey,
    selectedSeasonOption,
    selectedTeamSeason,
    setSelectedSeasonKey,
    reload,
  }
}


