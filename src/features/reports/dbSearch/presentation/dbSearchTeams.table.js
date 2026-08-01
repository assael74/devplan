// src/features/reports/dbSearch/presentation/dbSearchTeams.table.js

export const DB_SEARCH_TEAM_TABLE_WIDTHS = {
  teamName: '18%',
  seasonKey: '6%',
  birthYear: '6%',
  leagueName: '14%',
  leagueLevel: '5%',
  tableRank: '5%',
  appearances: '5%',
  goalsFor: '6%',
  goalsAgainst: '6%',
  offensePriority: '10%',
  defensePriority: '10%',
  expectedLeagueLevelChange: '9%',
}

export function getDbSearchTeamColumnWidth(columnId) {
  return DB_SEARCH_TEAM_TABLE_WIDTHS[columnId] || 'auto'
}
