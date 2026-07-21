// features/playersDatabase/model/leaguePage.model.js

import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../catalog/clubs.catalog.js'
import { buildTeamDisplayName } from '../catalog/teamDisplay.js'
import { normalizeSeasonIdentity, normalizeSeasonLookupKey } from './season.model.js'
import { normalizeTeamIdentity, resolveTeamLookupKey } from './teamIdentity.model.js'
import { normalizeTeamStats } from './teamStats.model.js'
import { cleanValue, toNumberOrZero } from './value.model.js'
import { sortByTableRank } from '../ui/logic/tableRows.logic.js'
import { buildTeamScoutLeagueModel, TEAM_SCOUT_NORMALIZATION_MODE, TEAM_SCOUT_SORT_MODE } from '../../../shared/teams/scout/index.js'

const buildSeasonOption = ({ season, target }) => {
  const identity = normalizeSeasonIdentity({ season })

  return {
    target,
    season,
    seasonId: identity.seasonId,
    seasonKey: normalizeSeasonLookupKey(
      identity.seasonKey || identity.seasonId
    ),
  }
}

export const buildLeaguePageSeasonOptions = league => {
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
  PLAYERS_DATABASE_CLUBS_CATALOG.find(
    club => cleanValue(club.id) === cleanValue(clubId)
  ) || null

const resolveTeamName = row => {
  const identity = normalizeTeamIdentity({ team: row })
  const club = getClubById(identity.clubId)

  return buildTeamDisplayName({
    clubName: club?.name || row?.clubName || row?.displayName || row?.teamName,
    clubId: identity.clubId,
    teamId: identity.birthTeamId || identity.teamId,
    teamSlot: identity.birthTeamSlot || identity.teamSlot,
  }) || cleanValue(identity.teamId || identity.clubId || '-')
}

const buildTeamRow = ({ row, scoutResult } = {}) => {
  const teamIdentity = normalizeTeamIdentity({ team: row })
  const teamStats = normalizeTeamStats(row, {
    gamesCandidates: [row?.teamStats?.teamGamePlayed, row?.games],
    goalsForCandidates: [row?.teamStats?.goalsFor, row?.goalsFor],
    goalsAgainstCandidates: [row?.teamStats?.goalsAgainst, row?.goalsAgainst],
    pointsCandidates: [row?.teamStats?.points, row?.points],
  })
  const scoutSummary = row?.scoutProfilesSummary || {}
  const playersCount = toNumberOrZero(row?.playersCount || row?.teamPlayersCount)
  const profilesCount = toNumberOrZero(scoutSummary.total)
  const attackPerformance = row?.teamStats?.attackNormalPerformance ||
    row?.attackNormalPerformance
  const defensePerformance = row?.teamStats?.defenseNormalPerformance ||
    row?.defenseNormalPerformance

  return {
    id: resolveTeamLookupKey(row) || cleanValue(row?.rank),
    teamId: teamIdentity.teamId,
    birthTeamId: teamIdentity.birthTeamId,
    teamDocumentId: teamIdentity.teamDocumentId,
    clubId: teamIdentity.clubId,
    teamUrl: cleanValue(row?.teamUrl),
    tableRank: toNumberOrZero(row?.rank || row?.tableRank),
    name: resolveTeamName(row),
    teamSlot: teamIdentity.birthTeamSlot || teamIdentity.teamSlot || 1,
    points: teamStats.points,
    goalsFor: teamStats.goalsFor,
    goalsAgainst: teamStats.goalsAgainst,
    games: teamStats.gamesPlayed,
    teamStats,
    playersCount,
    profilesCount,
    attackPriority: scoutResult?.offense?.priorityLevel ||
      resolvePriorityLevel(attackPerformance),
    defensePriority: scoutResult?.defense?.priorityLevel ||
      resolvePriorityLevel(defensePerformance),
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

  return new Map((result.rows || []).map(row => [
    resolveTeamLookupKey(row) || cleanValue(row.clubId || row.rank),
    row,
  ]))
}

export const buildLeaguePageTeams = ({ season, leagueDoc }) => {
  const tableRank = Array.isArray(season?.tableRank) ? season.tableRank : []
  const scoutResultMap = buildScoutResultMap({
    tableRank,
    leagueDoc,
    season,
  })

  return sortByTableRank(tableRank.map(row => buildTeamRow({
    row,
    scoutResult: scoutResultMap.get(
      resolveTeamLookupKey(row) || cleanValue(row?.clubId || row?.rank)
    ),
  })).filter(row => row.id))
}

const getLeagueLevelLabel = level => {
  if (level === null || level === undefined || level === '') return '-'
  return `רמה ${level}`
}

export const buildLeaguePageView = ({ league, leagueId, selectedSeason }) => ({
  id: cleanValue(league?.id || league?.leagueId || leagueId),
  name: cleanValue(league?.leagueName || league?.name || leagueId || '-'),
  region: cleanValue(league?.regionLabel || league?.region),
  seasonKey: normalizeSeasonLookupKey(
    selectedSeason?.seasonKey || selectedSeason?.seasonId
  ) || '-',
  ageGroup: cleanValue(league?.ageGroupLabel || league?.ageGroupId || '-'),
  birthYear: selectedSeason?.birthYear || '-',
  levelLabel: getLeagueLevelLabel(league?.level),
  leagueTotalRound: selectedSeason?.leagueTotalRound || '-',
  gameTime: selectedSeason?.gameTime || league?.gameTime || '-',
})

export const buildLeaguePageSummary = ({ teams, league }) => ({
  teamsCount: teams.length,
  birthYear: league.birthYear,
  goalsCount: teams.reduce(
    (total, team) => total + toNumberOrZero(team.goalsFor),
    0
  ),
  profilesCount: teams.reduce(
    (total, team) => total + toNumberOrZero(team.profilesCount),
    0
  ),
  attackPositive: teams.filter(
    team => ['elite', 'high', 'positive'].includes(team.attackPriority)
  ).length,
  defensePositive: teams.filter(
    team => ['elite', 'high', 'positive'].includes(team.defensePriority)
  ).length,
  recommendedTeams: teams.filter(team => (
    ['elite', 'high'].includes(team.attackPriority) ||
    ['elite', 'high'].includes(team.defensePriority)
  )).length,
})

