// features/playersDatabase/model/leaguePage.model.js

import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../catalog/clubs.catalog.js'
import { buildTeamDisplayName } from '../catalog/teamDisplay.js'
import { buildLeagueTeamSeasons } from '../domain/index.js'
import {
  normalizeSeasonIdentity,
  normalizeSeasonLookupKey,
} from './season.model.js'
import {
  cleanValue,
  toNumberOrZero,
} from './value.model.js'
import { buildTeamPerformanceViewModel } from './teamPerformance.viewModel.js'
import { sortByTableRank } from '../ui/logic/tableRows.logic.js'

const getSeasonSortValue = value => {
  const match = String(value || '').match(/(\d{2,4})/)
  if (!match) return 0

  const year = Number(match[1])
  return year < 100 ? 2000 + year : year
}

const buildSeasonOption = ({ season, target, league }) => {
  const identity = normalizeSeasonIdentity({ season })

  const seasonKey = normalizeSeasonLookupKey(
    identity.seasonKey || identity.seasonId
  )
  const birthYear = toNumberOrZero(season?.birthYear)

  return {
    target,
    season,
    seasonId: identity.seasonId,
    seasonKey,
    birthYear,
    label: [
      seasonKey,
      birthYear ? `שנתון ${birthYear}` : '',
    ].filter(Boolean).join(' · '),
    primaryLabel: [
      cleanValue(league?.leagueName || league?.name || 'ליגה'),
      seasonKey,
    ].filter(Boolean).join(' · '),
    secondaryLabel: [
      birthYear ? `שנתון ${birthYear}` : '',
      cleanValue(league?.ageGroupLabel || league?.ageGroupId),
    ].filter(Boolean).join(' · '),
    sortValue: getSeasonSortValue(seasonKey || identity.seasonId),
  }
}

export const buildLeaguePageSeasonOptions = league => {
  const options = []

  if (league?.current?.seasonId || league?.current?.seasonKey) {
    options.push(buildSeasonOption({
      season: league.current,
      target: 'current',
      league,
    }))
  }

  const history = Array.isArray(league?.history) ? league.history : []
  history.forEach(season => {
    if (!season?.seasonId && !season?.seasonKey) return

    options.push(buildSeasonOption({
      season,
      target: 'history',
      league,
    }))
  })

  return options
    .filter(option => option.seasonKey || option.seasonId)
    .sort((left, right) => (
      right.sortValue - left.sortValue ||
      String(right.seasonKey).localeCompare(String(left.seasonKey), 'he')
    ))
}

const getClubById = clubId =>
  PLAYERS_DATABASE_CLUBS_CATALOG.find(
    club => cleanValue(club.id) === cleanValue(clubId)
  ) || null

const resolveTeamName = teamSeason => {
  const clubId = cleanValue(teamSeason?.identity?.clubId)
  const teamId = cleanValue(teamSeason?.identity?.teamId)
  const club = getClubById(clubId)

  return buildTeamDisplayName({
    clubName: club?.name || teamSeason?.identity?.displayName,
    clubId,
    teamId,
    teamSlot: teamSeason?.identity?.teamSlot || 1,
  }) || cleanValue(teamId || clubId || '-')
}

const buildTeamRow = teamSeason => {
  const stats = teamSeason?.stats?.actual || {}
  const ranking = teamSeason?.ranking || {}
  const performance = teamSeason?.performance || {}
  const performanceView = buildTeamPerformanceViewModel(performance)
  const scoutSummary = teamSeason?.scoutProfilesSummary || {}
  const profilesCount = toNumberOrZero(scoutSummary.total)
  const profileAssignmentsCount = Object.values(
    scoutSummary.profileCounts || {}
  ).reduce((total, value) => (
    total + toNumberOrZero(value)
  ), 0)
  const clubId = cleanValue(teamSeason?.identity?.clubId)
  const club = getClubById(clubId)

  return {
    id: cleanValue(
      teamSeason?.identity?.teamId ||
      teamSeason?.identity?.teamDocumentId ||
      ranking.tableRank
    ),
    teamId: cleanValue(teamSeason?.identity?.teamId),
    birthTeamId: cleanValue(teamSeason?.identity?.teamId),
    teamDocumentId: cleanValue(teamSeason?.identity?.teamDocumentId),
    clubId,
    clubLevel: toNumberOrZero(teamSeason?.clubLevel || club?.clubLevel),
    teamUrl: cleanValue(teamSeason?.metadata?.teamUrl),
    tableRank: toNumberOrZero(ranking.tableRank),
    name: resolveTeamName(teamSeason),
    teamSlot: teamSeason?.identity?.teamSlot || 1,
    points: toNumberOrZero(stats.points),
    goalsFor: toNumberOrZero(stats.goalsFor),
    goalsAgainst: toNumberOrZero(stats.goalsAgainst),
    games: toNumberOrZero(stats.gamesPlayed),
    teamStats: stats,
    playersCount: toNumberOrZero(teamSeason?.playersCount),
    profilesCount,
    profileAssignmentsCount,
    attackPriority: performanceView.offense.priority.level,
    defensePriority: performanceView.defense.priority.level,
    performance,
    performanceView,
    scoutSummary,
    scoutStatus: profilesCount > 0 ? 'full' : 'missing',
    source: teamSeason,
  }
}

export const buildLeaguePageTeams = ({ season, leagueDoc, target = 'current' }) => {
  const teamSeasons = buildLeagueTeamSeasons({
    leagueDocument: leagueDoc,
    seasonDocument: season,
    target,
  })

  return sortByTableRank(
    teamSeasons
      .map(buildTeamRow)
      .filter(row => row.id)
  )
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
  level: toNumberOrZero(league?.level) || '',
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
