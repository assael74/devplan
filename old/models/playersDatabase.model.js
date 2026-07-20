export const PLAYERS_DATABASE_ENTITY_KIND = {
  PLAYER: 'player',
  CLUB: 'club',
  LEAGUE: 'league',
  TEAM: 'team',
  PLAYER_SNAPSHOT: 'playerSnapshot',
  LEAGUE_SNAPSHOT: 'leagueSnapshot',
  IMPORT: 'import',
  RECOMMENDATION: 'recommendation',
  TRACKING_EVENT: 'trackingEvent',
}

export const createEmptyPlayersDatabaseFilters = () => ({
  search: '',
  birthYear: '',
  clubId: '',
  leagueId: '',
  trendStatus: '',
  trackingStatus: '',
})

export const createEmptyPlayersDatabasePageState = () => ({
  rows: [],
  selectedPlayerId: '',
  filters: createEmptyPlayersDatabaseFilters(),
  cursor: null,
  hasMore: false,
  loading: false,
  error: '',
})
