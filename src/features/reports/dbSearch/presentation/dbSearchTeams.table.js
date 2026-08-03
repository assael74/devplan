// src/features/reports/dbSearch/presentation/dbSearchTeams.table.js

export const DB_SEARCH_TEAM_TABLE_WIDTHS = {
  teamName: '17%',
  clubLevel: '6%',
  seasonKey: '6%',
  birthYear: '6%',
  leagueName: '17%',
  leagueLevel: '0%',
  tableRank: '5%',
  appearances: '5%',
  goalsFor: '6%',
  goalsAgainst: '6%',
  offensePriority: '9%',
  defensePriority: '9%',
  expectedLeagueLevelChange: '8%',
}

export function getDbSearchTeamColumnWidth(columnId) {
  return DB_SEARCH_TEAM_TABLE_WIDTHS[columnId] || 'auto'
}
