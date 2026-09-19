import { TEAM_STATS_IMPORT_TABLE_WIDTHS } from '../sx/statsTableWidths.sx.js'

export const PLAYER_STATS_BASE_COLUMNS = [
  {
    key: 'index',
    label: 'אינדקס',
    readOnly: true,
    sx: TEAM_STATS_IMPORT_TABLE_WIDTHS.index,
  },
  {
    key: 'fullName',
    label: 'שם השחקן',
    required: true,
    sx: {
      ...TEAM_STATS_IMPORT_TABLE_WIDTHS.fullName,
      textAlign: 'left !important',
    },
  },
  {
    key: 'games',
    label: 'משחקים',
    sx: TEAM_STATS_IMPORT_TABLE_WIDTHS.games,
  },
  {
    key: 'goals',
    label: 'שערים',
    sx: TEAM_STATS_IMPORT_TABLE_WIDTHS.goals,
  },
  {
    key: 'starts',
    label: 'הרכב פותח',
    sx: TEAM_STATS_IMPORT_TABLE_WIDTHS.starts,
  },
  {
    key: 'minutes',
    label: 'דקות משחק',
    sx: TEAM_STATS_IMPORT_TABLE_WIDTHS.minutes,
  },
]
