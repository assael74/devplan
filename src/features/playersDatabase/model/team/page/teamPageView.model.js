// src/features/playersDatabase/model/team/page/teamPageView.model.js

import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../../catalog/clubs.catalog.js'
import { resolveAgeGroupLabel } from '../../../catalog/ageGroups.catalog.js'
import { PLAYERS_DATABASE_LEAGUES_CATALOG } from '../../../catalog/leagues.catalog.js'
import { PLAYERS_DATABASE_CURRENT_SEASON_KEY } from '../../../catalog/seasons.catalog.js'
import { buildTeamDisplayName } from '../../../catalog/teamDisplay.js'
import {
  adaptBirthTeamDocumentSeason,
  adaptLeagueTableTeam,
  adaptTeamScoutEngineRow,
} from '../../../domain/index.js'
import { normalizeSeasonLookupKey } from '../../shared/season.model.js'
import {
  normalizeTeamIdentity,
  resolveTeamLookupKey,
} from '../teamIdentity.model.js'
import { cleanValue } from '../../shared/value.model.js'
import { buildTeamPerformanceViewModel } from '../teamPerformance.viewModel.js'
import { formatPerGameRate } from '../../shared/rate.model.js'
import { findTeamPageTableRow } from './teamPageSeason.model.js'
import { PLAYER_STATS_STATUS } from '../../player/playerStats.model.js'

import {
  buildTeamScoutLeagueModel,
  TEAM_SCOUT_NORMALIZATION_MODE,
  TEAM_SCOUT_SORT_MODE,
} from '../../../../../shared/scouting/teams/index.js'
import { enrichTeamScoutInputRows } from '../../../domain/adapters/teamScoutInput.adapter.js'
import {
  buildTeamPerformanceProjectionFromTableRows,
} from '../../../domain/projections/teamPerformance.projection.js'

const nullishFallback = (value, fallbackValue) => (
  value === null || value === undefined ? fallbackValue : value
)

const buildScoutResultMap = ({ tableRank = [], leagueDoc = {}, season = {} } = {}) => {
  const result = buildTeamScoutLeagueModel({
    leagueLevel: leagueDoc?.level,
    leagueNumGames: season?.leagueTotalRound || 30,
    rows: enrichTeamScoutInputRows(tableRank),
    normalizationMode: TEAM_SCOUT_NORMALIZATION_MODE.AUTO,
    sortMode: TEAM_SCOUT_SORT_MODE.TABLE,
  })

  return new Map((result.rows || []).map(row => [
    resolveTeamLookupKey(row) || cleanValue(row.clubId || row.rank),
    adaptTeamScoutEngineRow({
      row,
      source: {
        normalization: result.normalization,
        leagueLevel: leagueDoc?.level,
        leagueGames: season?.leagueTotalRound || 30,
      },
    }),
  ]))
}

const getClubIdFromTeamId = teamId => cleanValue(teamId).split('_').filter(Boolean)[0] || ''

const getClubById = clubId => PLAYERS_DATABASE_CLUBS_CATALOG.find(
  club => cleanValue(club.id) === cleanValue(clubId)
) || null

const resolveTeamName = ({ teamRow = {}, teamDoc = {}, teamId = '' } = {}) => {
  const identity = normalizeTeamIdentity({
    team: teamRow,
    fallback: {
      ...teamDoc,
      teamId,
      clubId: teamDoc?.clubId || getClubIdFromTeamId(teamId),
    },
  })
  const club = getClubById(identity.clubId)

  return buildTeamDisplayName({
    clubName: club?.name || teamRow.clubName || teamDoc?.displayName || teamRow.displayName || teamRow.teamName,
    clubId: identity.clubId,
    teamId: identity.birthTeamId || identity.teamId || teamId,
    teamSlot: identity.birthTeamSlot || identity.teamSlot,
  }) || cleanValue(teamId || '-')
}

export const buildTeamPageView = ({
  teamId,
  leagueDoc,
  teamDoc,
  teamSeasons,
  selectedSeasonOption,
  selectedLeagueSeason,
  selectedTeamSeason,
}) => {
  const leagueSeason = selectedLeagueSeason?.season || {}
  const leagueTarget = selectedLeagueSeason?.target || selectedSeasonOption?.target || 'current'
  const teamRow = findTeamPageTableRow({
    season: leagueSeason,
    teamId,
  }) || {}
  const tableRank = Array.isArray(leagueSeason?.tableRank)
    ? leagueSeason.tableRank
    : []
  const teamIdentity = normalizeTeamIdentity({
    team: teamRow,
    fallback: {
      ...teamDoc,
      teamId,
      teamDocumentId: teamDoc?.id,
      birthTeamId: teamDoc?.birthTeamId || teamId,
    },
  })

  const performance = buildScoutResultMap({
    tableRank,
    leagueDoc,
    season: leagueSeason,
  }).get(
    resolveTeamLookupKey(teamRow) || resolveTeamLookupKey(teamIdentity)
  ) || null

  const officialPerformance = buildTeamPerformanceProjectionFromTableRows({
    rows: tableRank,
    team: { ...teamRow, ...teamIdentity },
  })
  const leagueTeamSeason = adaptLeagueTableTeam({
    leagueDocument: leagueDoc || {},
    seasonDocument: leagueSeason,
    tableRow: teamRow,
    target: leagueTarget,
  })
  const birthTeamSeason = adaptBirthTeamDocumentSeason({
    teamDocument: teamDoc || {},
    seasonDocument: selectedTeamSeason || {},
    league: leagueDoc || {},
  })

  const sourceActual = leagueTeamSeason.completeness?.hasStats
    ? leagueTeamSeason.stats.actual
    : birthTeamSeason.stats.actual
  const actual = officialPerformance
    ? {
        ...sourceActual,
        gamesPlayed: officialPerformance.teamGamePlayed,
        goalsFor: officialPerformance.goalsFor,
        goalsAgainst: officialPerformance.goalsAgainst,
        goalsForPerGame: officialPerformance.goalsForPerGame,
        goalsAgainstPerGame: officialPerformance.goalsAgainstPerGame,
      }
    : sourceActual
  const canonicalTeamSeason = {
    ...birthTeamSeason,
    identity: {
      ...birthTeamSeason.identity,
      ...leagueTeamSeason.identity,
      displayName: resolveTeamName({
        teamRow,
        teamDoc,
        teamId,
      }),
    },
    season: {
      ...birthTeamSeason.season,
      ...leagueTeamSeason.season,
    },
    league: {
      ...birthTeamSeason.league,
      ...leagueTeamSeason.league,
    },
    stats: {
      actual,
      projected: birthTeamSeason.stats.projected,
    },
    metadata: {
      ...birthTeamSeason.metadata,
      teamUrl: cleanValue(
        birthTeamSeason.metadata?.teamUrl ||
        leagueTeamSeason.metadata?.teamUrl
      ),
      seasonUrl: cleanValue(
        birthTeamSeason.metadata?.seasonUrl ||
        leagueTeamSeason.metadata?.seasonUrl ||
        leagueDoc?.leagueUrl
      ),
    },
    ranking: officialPerformance
      ? { ...leagueTeamSeason.ranking, tableRank: officialPerformance.tableRank }
      : leagueTeamSeason.ranking,
    performance: performance || birthTeamSeason.performance,
    scoutProfilesSummary: leagueTeamSeason.scoutProfilesSummary,
    completeness: {
      ...birthTeamSeason.completeness,
      ...leagueTeamSeason.completeness,
      hasPerformance: Boolean(performance || officialPerformance),
    },
  }

  const games = actual.gamesPlayed || 0
  const points = actual.points || 0
  const goalsFor = actual.goalsFor || 0
  const goalsAgainst = actual.goalsAgainst || 0
  const successPercent = games ? Math.round((points / (games * 3)) * 100) : null
  const teamPlayers = Array.isArray(selectedTeamSeason?.teamPlayers)
    ? selectedTeamSeason.teamPlayers
    : []
  const playersCount = teamPlayers.length
  const performanceView = buildTeamPerformanceViewModel(canonicalTeamSeason.performance)
  const clubId = canonicalTeamSeason.identity.clubId || getClubIdFromTeamId(teamId)
  const club = getClubById(clubId)

  return {
    ...canonicalTeamSeason,
    domain: canonicalTeamSeason,
    id: cleanValue(teamId),
    birthTeamId: canonicalTeamSeason.identity.teamId || cleanValue(teamId),
    teamDocumentId: canonicalTeamSeason.identity.teamDocumentId || cleanValue(teamId),
    clubId,
    clubLevel: Number(club?.clubLevel || canonicalTeamSeason.clubLevel || 0),
    birthTeamSlot: canonicalTeamSeason.identity.teamSlot || 1,
    teamSlot: canonicalTeamSeason.identity.teamSlot || 1,
    name: canonicalTeamSeason.identity.displayName,
    leagueId: canonicalTeamSeason.league.leagueId,
    leagueName: cleanValue(leagueDoc?.leagueName || leagueDoc?.name || leagueDoc?.id || '-'),
    ageGroupId: canonicalTeamSeason.league.ageGroupId,
    ageGroupLabel: canonicalTeamSeason.league.ageGroupLabel,
    birthYear: canonicalTeamSeason.season.birthYear || '-',
    seasonKey: canonicalTeamSeason.season.seasonKey || '-',
    tableRank: canonicalTeamSeason.ranking.tableRank || '-',
    tableAttackRank: nullishFallback(officialPerformance?.tableAttackRank, Number(canonicalTeamSeason.performance?.offense?.rank) || null),
    tableDefenseRank: nullishFallback(officialPerformance?.tableDefenseRank, Number(canonicalTeamSeason.performance?.defense?.rank) || null),
    games,
    points,
    successPercent,
    goalsFor,
    goalsAgainst,
    goalsForPerGame: nullishFallback(actual.goalsForPerGame, null),
    goalsAgainstPerGame: nullishFallback(actual.goalsAgainstPerGame, null),
    teamUrl: canonicalTeamSeason.metadata.teamUrl,
    teamStats: {
      teamGamePlayed: games,
      gamesPlayed: games,
      points,
      goalsFor,
      goalsAgainst,
      goalsForPerGame: nullishFallback(actual.goalsForPerGame, null),
      goalsAgainstPerGame: nullishFallback(actual.goalsAgainstPerGame, null),
      attackPerformance: performanceView.offense.priority.score,
      defensePerformance: performanceView.defense.priority.score,
    },
    // Match the persisted Team Performance contract: a pace value carries at
    // most one decimal place and is never a second, two-decimal calculation.
    attackPerGame: games ? formatPerGameRate(goalsFor / games) : '-',
    defensePerGame: games ? formatPerGameRate(goalsAgainst / games) : '-',
    offense: canonicalTeamSeason.performance?.offense || {},
    defense: canonicalTeamSeason.performance?.defense || {},
    performanceView,
    playersStatus: playersCount ? `${playersCount}` : 'אין סגל',
    statsStatus: playersCount
      ? `${teamPlayers.filter(player => (
          player.statsStatus === PLAYER_STATS_STATUS.LOADED
        )).length}`
      : '0',
  }
}
