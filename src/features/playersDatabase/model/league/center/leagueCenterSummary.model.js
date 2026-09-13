import { PLAYERS_DATABASE_LEAGUES_CATALOG } from '../../../catalog/leagues.catalog.js'
import { toNumberOrZero } from '../../shared/value.model.js'

const toNumber = toNumberOrZero

export const buildLeagueCenterSummary = rows => ({
  totalLeagues: rows.length,
  openedLeagues: rows.filter(row => row.hasLeagueDoc).length,
  unopenedCatalogLeagues: rows.filter(row => (
    row.catalogLeagueId && !row.hasLeagueDoc
  )).length,
  fullData: rows.filter(row => row.dataStatus === 'full').length,
  partialData: rows.filter(row => row.dataStatus === 'partial').length,
  missingData: rows.filter(row => row.dataStatus === 'missing').length,
  fullTables: rows.filter(row => row.tableStatus === 'full').length,
  missingTables: rows.filter(row => row.tableStatus !== 'full').length,
  partialTeams: rows.filter(row => row.playersStatsStatus !== 'full').length,
  partialStats: rows.filter(row => row.playersStatsStatus !== 'full').length,
  profiledPlayers: rows.reduce(
    (sum, row) => sum + toNumber(row.playersWithProfiles),
    0
  ),
  playersCount: rows.reduce(
    (sum, row) => sum + toNumber(row.playersCount),
    0
  ),
  playersWithScoutProfileCount: rows.reduce(
    (sum, row) => sum + toNumber(row.playersWithScoutProfileCount),
    0
  ),
  scoutProfilesCount: rows.reduce(
    (sum, row) => sum + toNumber(row.scoutProfilesCount),
    0
  ),
  teamsWithStatsCount: rows.reduce(
    (sum, row) => sum + toNumber(row.playersStatsCompleteCount),
    0
  ),
  teamsCount: rows.reduce(
    (sum, row) => sum + toNumber(row.teamsCount),
    0
  ),
  offensePriorityCount: rows.reduce(
    (sum, row) => sum + toNumber(row.offensePriorityCount),
    0
  ),
  defensePriorityCount: rows.reduce(
    (sum, row) => sum + toNumber(row.defensePriorityCount),
    0
  ),
  catalogLeagues: PLAYERS_DATABASE_LEAGUES_CATALOG.length,
})
