// src/features/playersDatabase/model/league/page/leaguePage.model.js

import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../../catalog/clubs.catalog.js'
import { PLAYERS_DATABASE_LEAGUES_CATALOG } from '../../../catalog/leagues.catalog.js'
import { buildTeamDisplayName } from '../../../catalog/teamDisplay.js'
import {
  getSeasonCatalogEntry,
  PLAYERS_DATABASE_CURRENT_SEASON_KEY,
} from '../../../catalog/seasons.catalog.js'
import {
  normalizeSeasonLookupKey,
  resolveSeasonBirthYear,
} from '../../shared/season.model.js'
import {
  cleanValue,
  toNumberOrZero,
} from '../../shared/value.model.js'
import { buildTeamPerformanceViewModel } from '../../team/teamPerformance.viewModel.js'
import { sortByTableRank } from '../../shared/tableRows.model.js'

const object = value => (
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}
)

const getSeasonSortValue = value => {
  const match = String(value || '').match(/(\d{2,4})/)
  if (!match) return 0

  const year = Number(match[1])
  return year < 100 ? 2000 + year : year
}

const buildSeasonOption = ({ season, seasonId, league }) => {
  const seasonKey = normalizeSeasonLookupKey(season?.seasonKey || seasonId)
  const birthYear = toNumberOrZero(season?.birthYear)
  const target = cleanValue(season?.seasonStatus).toLowerCase() || 'season'

  return {
    target,
    season: {
      ...object(season),
      seasonId: cleanValue(seasonId),
    },
    seasonId: cleanValue(seasonId),
    seasonKey,
    birthYear,
    label: [seasonKey, birthYear ? `שנתון ${birthYear}` : ''].filter(Boolean).join(' · '),
    primaryLabel: [
      cleanValue(league?.names?.display || league?.names?.official || league?.leagueId || 'ליגה'),
      seasonKey,
    ].filter(Boolean).join(' · '),
    secondaryLabel: [
      birthYear ? `שנתון ${birthYear}` : '',
      cleanValue(league?.ageGroupLabel || league?.ageGroupId),
    ].filter(Boolean).join(' · '),
    sortValue: getSeasonSortValue(seasonId || seasonKey),
  }
}

export const buildLeaguePageSeasonOptions = (league, { bootstrapSeason = null } = {}) => {
  const options = Object.entries(object(league?.seasonsById)).map(([seasonId, season]) => (
    buildSeasonOption({ season, seasonId, league })
  ))

  const bootstrapSeasonKey = normalizeSeasonLookupKey(
    bootstrapSeason?.seasonKey || PLAYERS_DATABASE_CURRENT_SEASON_KEY
  )

  if (!options.length && bootstrapSeasonKey) {
    const catalogSeason = getSeasonCatalogEntry(bootstrapSeasonKey)
    const bootstrapSeasonId = cleanValue(catalogSeason?.seasonId)
    const bootstrapBirthYear = Number(bootstrapSeason?.birthYear) || resolveSeasonBirthYear({
      seasonKey: bootstrapSeasonKey,
      ageGroupId: league?.ageGroupId,
    })

    if (!bootstrapSeasonId) return options

    options.push({
      target: 'bootstrap',
      season: {
        seasonId: bootstrapSeasonId,
        seasonKey: bootstrapSeasonKey,
        seasonStatus: '',
        birthYear: bootstrapBirthYear || null,
        seasonUrl: '',
        leagueTotalRound: null,
        gameDurationMinutes: null,
        tableImportedAt: null,
        competitionRules: { configured: false },
        table: {
          tableState: 'NOT_LOADED',
          teamsById: {},
        },
        bootstrap: true,
      },
      seasonId: bootstrapSeasonId,
      seasonKey: bootstrapSeasonKey,
      birthYear: bootstrapBirthYear || null,
      label: bootstrapSeasonKey,
      primaryLabel: [
        cleanValue(league?.names?.display || league?.names?.official || league?.leagueId || 'ליגה'),
        bootstrapSeasonKey,
      ].filter(Boolean).join(' · '),
      secondaryLabel: bootstrapBirthYear
        ? `שנתון ${bootstrapBirthYear}`
        : '',
      sortValue: getSeasonSortValue(bootstrapSeasonKey),
    })
  }

  return options.sort((left, right) => (
    right.sortValue - left.sortValue ||
    String(right.seasonKey).localeCompare(String(left.seasonKey), 'he')
  ))
}

export const buildLeaguePageBootstrapLeague = leagueId => {
  const safeLeagueId = cleanValue(leagueId)
  const catalog = PLAYERS_DATABASE_LEAGUES_CATALOG.find(item => (
    cleanValue(item?.id) === safeLeagueId
  )) || null

  return {
    leagueId: safeLeagueId,
    names: {
      official: cleanValue(catalog?.name),
      display: cleanValue(catalog?.name),
      short: cleanValue(catalog?.name),
      source: cleanValue(catalog?.name),
    },
    region: cleanValue(catalog?.region),
    ageGroupId: cleanValue(catalog?.ageGroupId),
    ageGroupLabel: cleanValue(catalog?.ageGroupLabel),
    level: catalog?.level || null,
    seasonsById: {},
    bootstrap: true,
  }
}

const getClubById = clubId => (
  PLAYERS_DATABASE_CLUBS_CATALOG.find(
    club => cleanValue(club.id) === cleanValue(clubId)
  ) || null
)

const resolveTeamName = ({ teamId, team, clubsDirectory }) => {
  const clubId = cleanValue(team?.clubId)
  const club = getClubById(clubId)

  return buildTeamDisplayName({
    clubNames: clubsDirectory?.clubsById?.[clubId]?.names,
    clubName: club?.name,
    clubId,
    teamId,
    teamSlot: team?.teamSlot,
  }) || cleanValue(teamId || clubId || '-')
}

const buildTeamRow = ([teamId, team], clubsDirectory) => {
  const officialTable = object(team?.officialTable)
  const performance = object(team?.performance)
  const performanceView = buildTeamPerformanceViewModel(performance)
  const roster = object(team?.roster)
  const stats = object(team?.stats)
  const scouting = object(team?.scouting)
  const clubId = cleanValue(team?.clubId)

  return {
    id: cleanValue(teamId),
    teamId: cleanValue(teamId),
    birthTeamId: cleanValue(teamId),
    teamDocumentId: cleanValue(teamId),
    clubId,
    clubLevel: toNumberOrZero(team?.clubLevel),
    teamUrl: cleanValue(team?.teamUrl),
    tableRank: toNumberOrZero(officialTable.rank),
    name: resolveTeamName({ teamId, team, clubsDirectory }),
    teamSlot: team?.teamSlot,
    points: toNumberOrZero(officialTable.points),
    goalsFor: toNumberOrZero(officialTable.goalsFor),
    goalsAgainst: toNumberOrZero(officialTable.goalsAgainst),
    games: toNumberOrZero(officialTable.teamGamePlayed),
    teamStats: {
      points: officialTable.points,
      goalsFor: officialTable.goalsFor,
      goalsAgainst: officialTable.goalsAgainst,
      teamGamePlayed: officialTable.teamGamePlayed,
    },
    playersCount: toNumberOrZero(roster.playersCount),
    hasPlayers: Boolean(roster.hasPlayers),
    statsComplete: Boolean(stats.statsComplete),
    rosterLoadedAt: roster.loadedAt || null,
    statsLoadedAt: stats.loadedAt || null,
    profilesCount: toNumberOrZero(scouting.playersWithScoutProfileCount),
    profileAssignmentsCount: toNumberOrZero(scouting.playersWithScoutProfileCount),
    attackPriority: performanceView.offense.priority.level,
    defensePriority: performanceView.defense.priority.level,
    performanceView,
    teamTaskSignals: scouting.teamTaskSignals || {
      offense: false,
      defense: false,
      updatedAt: null,
    },
  }
}

export const buildLeaguePageTeams = ({ season, clubsDirectory }) => (
  sortByTableRank(
    Object.entries(object(season?.table?.teamsById))
      .map(entry => buildTeamRow(entry, clubsDirectory))
      .filter(row => row.id)
  )
)

const getLeagueLevelLabel = level => {
  if (level === null || level === undefined || level === '') return '-'
  return `רמה ${level}`
}

export const buildLeaguePageView = ({ league, leagueId, selectedSeason }) => ({
  id: cleanValue(league?.leagueId || leagueId),
  name: cleanValue(
    league?.names?.display ||
    league?.names?.official ||
    league?.names?.short ||
    leagueId ||
    '-'
  ),
  region: cleanValue(league?.region),
  seasonKey: normalizeSeasonLookupKey(
    selectedSeason?.seasonKey || selectedSeason?.seasonId
  ) || '-',
  ageGroup: cleanValue(league?.ageGroupLabel || league?.ageGroupId || '-'),
  birthYear: selectedSeason?.birthYear || '-',
  level: toNumberOrZero(league?.level) || '',
  levelLabel: getLeagueLevelLabel(league?.level),
  leagueTotalRound: selectedSeason?.leagueTotalRound || '-',
  gameTime: selectedSeason?.gameDurationMinutes || '-',
})

const POSITIVE_PRIORITY_LEVELS = ['elite', 'high', 'positive']

const isTeamStatsComplete = team => (
  Boolean(team?.hasPlayers) && Boolean(team?.statsComplete)
)

export const buildLeaguePageSummary = ({ teams }) => {
  const attackTargets = teams.filter(
    team => POSITIVE_PRIORITY_LEVELS.includes(team.attackPriority)
  )
  const defenseTargets = teams.filter(
    team => POSITIVE_PRIORITY_LEVELS.includes(team.defensePriority)
  )
  const attackComplete = attackTargets.filter(isTeamStatsComplete).length
  const defenseComplete = defenseTargets.filter(isTeamStatsComplete).length

  return {
    teamsCount: teams.length,
    goalsCount: teams.reduce((total, team) => total + toNumberOrZero(team.goalsFor), 0),
    profilesCount: teams.reduce((total, team) => total + toNumberOrZero(team.profilesCount), 0),
    attackPositive: attackTargets.length,
    attackMissing: Math.max(0, attackTargets.length - attackComplete),
    defensePositive: defenseTargets.length,
    defenseMissing: Math.max(0, defenseTargets.length - defenseComplete),
  }
}
