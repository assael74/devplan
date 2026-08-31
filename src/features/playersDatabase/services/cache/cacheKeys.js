// features/playersDatabase/services/cache/cacheKeys.js

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const joinKey = (...parts) => parts.map(clean).filter(Boolean).join(':')

export const PLAYERS_DATABASE_CACHE_PREFIXES = {
  leagues: 'leagues',
  league: 'league',
  teams: 'teams',
  team: 'team',
  teamSeason: 'teamSeason',
  player: 'player',
  leaguesMaster: 'leaguesMaster',
}

export const buildLeaguesCollectionCacheKey = () => (
  PLAYERS_DATABASE_CACHE_PREFIXES.leagues
)

export const buildLeagueDocumentCacheKey = leagueId => (
  joinKey(PLAYERS_DATABASE_CACHE_PREFIXES.league, leagueId)
)

export const buildTeamsCollectionCacheKey = () => (
  PLAYERS_DATABASE_CACHE_PREFIXES.teams
)

export const buildTeamDocumentCacheKey = teamId => (
  joinKey(PLAYERS_DATABASE_CACHE_PREFIXES.team, teamId)
)

export const buildTeamSeasonDocumentCacheKey = teamSeasonDocumentId => (
  joinKey(PLAYERS_DATABASE_CACHE_PREFIXES.teamSeason, teamSeasonDocumentId)
)

export const buildPlayerDocumentCacheKey = playerId => (
  joinKey(PLAYERS_DATABASE_CACHE_PREFIXES.player, playerId)
)

export const buildLeaguesMasterCacheKey = () => (
  joinKey(PLAYERS_DATABASE_CACHE_PREFIXES.leaguesMaster, 'all')
)
