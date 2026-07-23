export const PLAYERS_DATABASE_ROUTE = '/players-database'

export const PLAYERS_DATABASE_COLLECTIONS = {
  players: 'dbPlayers',
  leagues: 'dbLeagues',
  teams: 'dbBirthTeams',
  searchIndexes: 'dbSearchIndexes',
  leagueCenterIndex: 'dbLeagueCenterIndex',
  leaguesMaster: 'dbLeaguesMaster',
}

export const PLAYERS_DATABASE_IMPORT_FLOW = {
  PLAYERS: 'players',
  LEAGUE_TABLE: 'league_table',
}

export const PLAYERS_DATABASE_SNAPSHOT_TYPE = {
  LEAGUE_TABLE: 'league_table',
  TEAM_WEEKLY: 'team_weekly',
  FOCUSED_PLAYERS: 'focused_players',
  SEMIANNUAL_FULL: 'semiannual_full',
}

export const PLAYERS_DATABASE_TREND_STATUS = {
  POSITIVE: 'positive',
  STABLE: 'stable',
  DECLINE: 'decline',
}

export const PLAYERS_DATABASE_TRACKING_STATUS = {
  NONE: 'none',
  ACTIVE: 'active',
  ON_HOLD: 'on_hold',
  CLOSED: 'closed',
  ARCHIVED: 'archived',
}

export const PLAYERS_DATABASE_CHECKPOINT = {
  SEASON_START: 'season_start',
  MID_SEASON: 'mid_season',
  SEASON_END: 'season_end',
}

export const PLAYERS_DATABASE_PAGE_SIZE = 50

export const PLAYERS_DATABASE_TABLE_COLUMNS = [
  { id: 'name', label: 'שם', width: 190 },
  { id: 'birthYear', label: 'שנתון', width: 80 },
  { id: 'clubName', label: 'מועדון', width: 150 },
  { id: 'teamName', label: 'קבוצה', width: 150 },
  { id: 'leagueName', label: 'ליגה', width: 150 },
  { id: 'minutes', label: 'דקות', width: 80 },
  { id: 'goals', label: 'שערים', width: 70 },
  { id: 'playingUpMinutes', label: 'שנתון מעל', width: 110 },
  { id: 'trend', label: 'מגמה', width: 110 },
  { id: 'tracking', label: 'מעקב', width: 110 },
  { id: 'latestSnapshotAt', label: 'עדכון', width: 100 },
]

export const PLAYERS_DATABASE_FILTERS = [
  { id: 'search', label: 'חיפוש', placeholder: 'שם שחקן או external id' },
  { id: 'birthYear', label: 'שנתון', placeholder: 'כל השנתונים' },
  { id: 'clubId', label: 'מועדון', placeholder: 'כל המועדונים' },
  { id: 'leagueId', label: 'ליגה', placeholder: 'כל הליגות' },
  { id: 'trendStatus', label: 'מגמה', placeholder: 'כל המגמות' },
  { id: 'trackingStatus', label: 'מעקב', placeholder: 'הכל' },
]

