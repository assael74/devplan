import {
  buildClubSeasonIdentityIndexDocumentId,
} from '../../../catalog/firestoreDocuments/clubSeasonIdentityIndex.catalog.js'
import {
  buildLeagueClubSeasonIdentityEntries,
} from '../../../domain/projections/clubSeasonIdentityIndex.projection.js'
import {
  buildLeagueClubRowProjection,
} from '../../../domain/projections/club/leagueClubSync.projection.js'
import {
  selectClubsMasterAgeGroupSeasons,
} from '../../../domain/projections/club/clubsMaster.projection.js'
import {
  buildLeaguesMasterLeagueEntry,
} from '../../../domain/projections/leaguesMaster.projection.js'
import {
  buildLeagueTeamSearchIndexProjections,
} from '../../../domain/projections/teamSeasonSearchIndex.projection.js'
import { cleanValue } from '../../../model/shared/value.model.js'
import { buildTeamSeasonDocumentId } from '../../../model/team/teamIdentity.model.js'
import {
  LEAGUE_SEARCH_INDEX_IGNORED_FIELDS,
  LEAGUE_SEARCH_INDEX_TEAM_OWNED_FIELDS,
} from './contract.js'

const clean = cleanValue
const excludedSearchIndexFields = new Set([
  ...LEAGUE_SEARCH_INDEX_TEAM_OWNED_FIELDS,
  ...LEAGUE_SEARCH_INDEX_IGNORED_FIELDS,
])

const pickSearchIndexLeagueFields = document => Object.fromEntries(
  Object.entries(document || {}).filter(([field]) => !excludedSearchIndexFields.has(field))
)

const pickTeamSeasonLeagueFields = projection => ({
  leagueId: clean(projection?.document?.leagueId),
  leagueLevel: Number(projection?.document?.leagueLevel) || 0,
  leagueTotalRound: Number(projection?.document?.leagueTotalRound) || 0,
  ...(clean(projection?.document?.seasonStatus)
    ? { seasonStatus: clean(projection.document.seasonStatus) }
    : {}),
  tableRank: projection?.performance?.tableRank,
  tableAttackRank: projection?.performance?.tableAttackRank,
  tableDefenseRank: projection?.performance?.tableDefenseRank,
  goalsForPerGame: projection?.performance?.goalsForPerGame,
  goalsAgainstPerGame: projection?.performance?.goalsAgainstPerGame,
  teamAttackPerformance: clean(projection?.document?.attackPriorityLevel)
    && clean(projection?.document?.attackPriorityLevel) !== 'unavailable'
    ? { priorityLevel: clean(projection.document.attackPriorityLevel) }
    : null,
  teamDefensePerformance: clean(projection?.document?.defensePriorityLevel)
    && clean(projection?.document?.defensePriorityLevel) !== 'unavailable'
    ? { priorityLevel: clean(projection.document.defensePriorityLevel) }
    : null,
  teamStats: {
    points: Number(projection?.document?.points) || 0,
    teamGamePlayed: projection?.performance?.teamGamePlayed,
    goalsFor: projection?.performance?.goalsFor,
    goalsAgainst: projection?.performance?.goalsAgainst,
  },
})

const pickClubLeagueSeason = season => ({
  teamId: clean(season?.teamId),
  teamSlot: Number(season?.teamSlot) || null,
  seasonId: clean(season?.seasonId),
  seasonKey: clean(season?.seasonKey),
  seasonStatus: clean(season?.seasonStatus),
  birthYear: Number(season?.birthYear) || 0,
  league: {
    leagueId: clean(season?.league?.leagueId),
    leagueName: clean(season?.league?.leagueName),
    region: clean(season?.league?.region),
    leagueLevel: Number(season?.league?.leagueLevel) || null,
  },
  performance: {
    tableRank: season?.performance?.tableRank === undefined
      ? null
      : season.performance.tableRank,
    points: Number(season?.performance?.points) || 0,
    teamGamePlayed: Number(season?.performance?.teamGamePlayed) || 0,
    goalsFor: Number(season?.performance?.goalsFor) || 0,
    goalsAgainst: Number(season?.performance?.goalsAgainst) || 0,
    goalsForPerGame: season?.performance?.goalsForPerGame === undefined
      ? null
      : season.performance.goalsForPerGame,
    goalsAgainstPerGame: season?.performance?.goalsAgainstPerGame === undefined
      ? null
      : season.performance.goalsAgainstPerGame,
  },
})

const pickClubsMasterLeagueSeason = season => ({
  teamId: clean(season?.teamId),
  teamSlot: Number(season?.teamSlot) || null,
  seasonId: clean(season?.seasonId),
  seasonKey: clean(season?.seasonKey),
  seasonStatus: clean(season?.seasonStatus),
  birthYear: Number(season?.birthYear) || 0,
  league: {
    leagueId: clean(season?.league?.leagueId),
    leagueName: clean(season?.league?.leagueName),
    leagueLevel: Number(season?.league?.leagueLevel) || null,
  },
  performance: {
    tableRank: season?.performance?.tableRank === undefined
      ? null
      : season.performance.tableRank,
    points: Number(season?.performance?.points) || 0,
    teamGamePlayed: Number(season?.performance?.teamGamePlayed) || 0,
    goalsFor: Number(season?.performance?.goalsFor) || 0,
    goalsAgainst: Number(season?.performance?.goalsAgainst) || 0,
    goalsForPerGame: season?.performance?.goalsForPerGame === undefined
      ? null
      : season.performance.goalsForPerGame,
    goalsAgainstPerGame: season?.performance?.goalsAgainstPerGame === undefined
      ? null
      : season.performance.goalsAgainstPerGame,
  },
})

const pickCompetitionSeason = season => ({
  teamId: clean(season?.teamId),
  teamSlot: Number(season?.teamSlot) || null,
  seasonId: clean(season?.seasonId),
  seasonKey: clean(season?.seasonKey),
  seasonStatus: clean(season?.seasonStatus),
  ageGroupId: clean(season?.ageGroupId),
  leagueId: clean(season?.leagueId),
  leagueName: clean(season?.leagueName),
  leagueLevel: Number(season?.leagueLevel) || null,
  competitionProjection: {
    automatic: season?.competitionProjection?.automatic || {},
  },
})

export function buildExpectedLeagueAuditV2({
  canonical = {},
} = {}) {
  const { league = {}, season = {}, target = 'current' } = canonical
  const leagueId = clean(league.id || league.leagueId)
  const seasonKey = clean(season.seasonKey || season.seasonId)
  const rows = Array.isArray(season.tableRank) ? season.tableRank : []
  const projections = buildLeagueTeamSearchIndexProjections({
    league,
    season,
    target,
    rows,
  })

  const teams = projections.map(projection => ({
    teamId: clean(projection.teamId),
    teamDocumentId: clean(projection.teamId),
    teamSeasonDocumentId: buildTeamSeasonDocumentId(projection.teamId, seasonKey),
    teamSeasonLeagueFields: pickTeamSeasonLeagueFields(projection),
  }))

  const teamSearchIndexes = projections.map(projection => ({
    id: projection.id,
    teamId: clean(projection.teamId),
    teamSeasonDocumentId: projection.teamSeasonDocumentId,
    ownedFields: pickSearchIndexLeagueFields(projection.document),
  }))

  const identityDocumentId = buildClubSeasonIdentityIndexDocumentId({
    seasonKey,
    birthYear: Number(season.birthYear) || 0,
  })
  const identityEntries = buildLeagueClubSeasonIdentityEntries({
    league,
    season,
    rows,
  })


  const clubs = rows.map(row => {
    const projection = buildLeagueClubRowProjection({
      league,
      season,
      rows,
      row,
      teamSeason: {},
      leagueSeasonDocument: season,
    })

    return {
      clubId: clean(row.clubId),
      ageGroupId: clean(projection.ageGroupSeasonProjection?.ageGroupId),
      birthYear: Number(projection.competitionPathUpdate?.birthYear) || 0,
      teamId: clean(row.teamId || row.birthTeamId),
      seasonKey,
      leagueId,
      clubIdentity: projection.clubIdentity,
      ageGroupSeason: pickClubLeagueSeason(projection.ageGroupSeasonProjection?.season),
      competitionSeason: pickCompetitionSeason(projection.competitionPathUpdate?.season),
    }
  })

  const fullLeaguesMasterEntry = buildLeaguesMasterLeagueEntry(league)
  const leaguesMasterEntry = {
    ...fullLeaguesMasterEntry,
    seasons: (fullLeaguesMasterEntry.seasons || []).filter(item => (
      clean(item?.seasonKey || item?.seasonId) === seasonKey
    )),
  }


  const clubsMasterTeams = clubs
    .filter(item => {
      const selected = selectClubsMasterAgeGroupSeasons([item.ageGroupSeason])
      return Boolean(selected.current || selected.previous)
    })
    .map(item => ({
      clubId: item.clubId,
      ageGroupId: item.ageGroupId,
      teamId: item.teamId,
      seasonKey: item.seasonKey,
      leagueId: item.leagueId,
      season: pickClubsMasterLeagueSeason(item.ageGroupSeason),
    }))


  return {
    teams,
    teamSearchIndexes,
    identity: {
      documentId: identityDocumentId,
      seasonKey,
      birthYear: Number(season.birthYear) || 0,
      entries: identityEntries,
    },
    clubs,
    leaguesMasterEntry,
    clubsMasterTeams,
  }
}
