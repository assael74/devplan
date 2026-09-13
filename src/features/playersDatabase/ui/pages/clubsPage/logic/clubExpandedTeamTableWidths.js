import { buildTableColumnWidth } from '../../../components/tables/tableWidths.js'

export const CLUB_EXPANDED_TEAM_TABLE_WIDTHS = {
  team: '20%',
  league: '20%',
  tableRank: '8%',
  gamesPlayed: '8%',
  playersCount: '13%',
  defensePriority: '13%',
  offensePriority: '13%',
  actions: '5%',
}

export const clubExpandedTeamColumnWidth = key => buildTableColumnWidth(
  CLUB_EXPANDED_TEAM_TABLE_WIDTHS[key]
)
