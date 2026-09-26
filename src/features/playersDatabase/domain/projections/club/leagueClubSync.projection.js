import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../../catalog/clubs.catalog.js'
import { cleanValue, pickDefinedValue } from '../../../model/shared/value.model.js'
import { buildTeamLoadStatus } from '../../../model/team/teamLoadStatus.model.js'
import {
  buildTeamPerformanceProjectionFromTableRows,
  getLeagueTableRowStats,
} from '../teamPerformance.projection.js'
import {
  CLUB_TRANSFER_COVERAGE_STATUS,
} from '../../contracts/club.contract.js'
import {
  buildClubAgeGroupSeasonProjection,
} from './clubAgeGroupSeason.projection.js'
import {
  buildCompetitionProjection,
} from './clubCompetition.projection.js'
import {
  buildClubCompetitionPathSeason,
} from './clubCompetitionPath.projection.js'

const clean = cleanValue

const catalogClubOf = clubId => (
  PLAYERS_DATABASE_CLUBS_CATALOG.find(club => clean(club?.id) === clean(clubId)) || null
)

export const buildLeagueClubIdentity = (team = {}) => {
  const clubId = clean(team?.clubId)
  if (!clubId) return null

  const catalogClub = catalogClubOf(clubId)

  return {
    clubId,
    externalClubId: clean(team?.externalClubId || catalogClub?.externalClubId),
    name: clean(team?.clubName || catalogClub?.name || team?.name),
    shortName: clean(team?.shortName || catalogClub?.shortName),
    sourceName: clean(team?.sourceName || catalogClub?.sourceName),
    clubUrl: clean(team?.clubUrl || catalogClub?.clubUrl),
    clubLevel: Number(pickDefinedValue(team?.clubLevel, catalogClub?.clubLevel)) || 0,
    clubStrengthLevel: Number(pickDefinedValue(
      team?.clubStrengthLevel,
      catalogClub?.clubStrengthLevel,
      catalogClub?.clubLevel
    )) || 0,
    aliases: Array.isArray(catalogClub?.aliases) ? [...catalogClub.aliases] : [],
    searchAliases: Array.isArray(catalogClub?.searchAliases)
      ? [...catalogClub.searchAliases]
      : [],
  }
}

const resolveTransferCoverageStatus = teamSeason => {
  const loadStatus = buildTeamLoadStatus(teamSeason?.teamPlayers)

  if (loadStatus.statsComplete) return CLUB_TRANSFER_COVERAGE_STATUS.COMPLETE
  if (loadStatus.hasStats) return CLUB_TRANSFER_COVERAGE_STATUS.PARTIAL
  return CLUB_TRANSFER_COVERAGE_STATUS.NOT_LOADED
}

export const buildLeagueClubRowProjection = ({
  league = {},
  season = {},
  rows = [],
  row = {},
  teamSeason = {},
  leagueSeasonDocument = {},
} = {}) => {
  const clubIdentity = buildLeagueClubIdentity(row)
  const performance = buildTeamPerformanceProjectionFromTableRows({
    rows,
    team: row,
  })
  const points = getLeagueTableRowStats(row).points
  const effectiveSeason = {
    ...season,
    seasonStatus: leagueSeasonDocument?.seasonStatus || season?.seasonStatus,
    leagueTotalRound: leagueSeasonDocument?.leagueTotalRound || season?.leagueTotalRound,
  }
  const ageGroupSeasonProjection = buildClubAgeGroupSeasonProjection({
    season: effectiveSeason,
    league,
    team: row,
    performance,
    points,
    leagueTeam: row,
    leagueScoutProfilesSummary: row?.scoutProfilesSummary || {},
    teamSeason: {
      ...teamSeason,
      playersCount: row?.playersCount,
    },
    // League-table import does not own transfer facts. Existing transfer
    // projection is preserved by the Club document merge when coverage is null.
    transferCoverageStatus: null,
  })
  const automaticProjection = buildCompetitionProjection({
    rows,
    targetTeam: row,
    leagueLevel: league?.level,
    competitionRules: leagueSeasonDocument?.competitionRules || {},
  })
  const competitionSeason = buildClubCompetitionPathSeason({
    season: effectiveSeason,
    ageGroupId: league?.ageGroupId,
    league,
    team: row,
    automaticProjection,
    manualProjection: undefined,
  })

  return {
    clubIdentity,
    ageGroupSeasonProjection,
    competitionPathUpdate: {
      birthYear: Number(season?.birthYear || leagueSeasonDocument?.birthYear) || 0,
      season: competitionSeason,
    },
    transferCoverageStatus: resolveTransferCoverageStatus(teamSeason),
  }
}

export const buildLeagueClubCleanupRemovals = ({
  club = {},
  clubId = '',
  league = {},
  season = {},
  rows = [],
  removedLeagueEntries = [],
} = {}) => {
  const leagueId = clean(league?.id || league?.leagueId || season?.leagueId)
  const seasonKey = clean(season?.seasonKey || season?.seasonId)
  const ageGroupId = clean(league?.ageGroupId || season?.ageGroupId)
  const resolvedClubId = clean(clubId || club?.clubId || club?.id)
  const currentTeamIds = new Set(
    (Array.isArray(rows) ? rows : [])
      .filter(row => clean(row?.clubId) === resolvedClubId)
      .map(row => clean(row?.teamId || row?.birthTeamId))
      .filter(Boolean)
  )
  const removedClubWasInLeague = (Array.isArray(removedLeagueEntries) ? removedLeagueEntries : [])
    .some(entry => clean(entry?.clubId) === resolvedClubId)

  if (!leagueId || !seasonKey || !ageGroupId || (!currentTeamIds.size && !removedClubWasInLeague)) {
    return []
  }

  const ageGroup = (Array.isArray(club?.ageGroups) ? club.ageGroups : [])
    .find(group => clean(group?.ageGroupId) === ageGroupId)

  return (Array.isArray(ageGroup?.seasons) ? ageGroup.seasons : [])
    .filter(candidate => (
      clean(candidate?.seasonKey || candidate?.seasonId) === seasonKey &&
      clean(candidate?.league?.leagueId) === leagueId &&
      !currentTeamIds.has(clean(candidate?.teamId))
    ))
    .map(candidate => ({
      ageGroupId,
      seasonKey,
      leagueId,
      teamId: clean(candidate?.teamId),
    }))
}
