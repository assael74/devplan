// src/features/playersDatabase/services/cache/cacheKeys.js

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const joinKey = (...parts) => parts.map(clean).filter(Boolean).join(':')

export const PLAYERS_DATABASE_CACHE_PREFIXES = {
  leagues: 'leagues',
  league: 'league',
  teams: 'teams',
  team: 'team',
  teamSeason: 'teamSeason',
  teamSeasonsByRoot: 'teamSeasonsByRoot',
  teamPage: 'teamPage',
  player: 'player',
  favorite: 'favorite',
  club: 'club',
  leaguesMaster: 'leaguesMaster',
  clubsMaster: 'clubsMaster',
  clubSeasonIdentity: 'clubSeasonIdentity',
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

export const buildTeamSeasonsByRootCacheKey = birthTeamDocumentId => (
  joinKey(PLAYERS_DATABASE_CACHE_PREFIXES.teamSeasonsByRoot, birthTeamDocumentId)
)

export const buildTeamPageDataCacheKey = ({ leagueId, teamId } = {}) => {
  const safeLeagueId = clean(leagueId)
  const safeTeamId = clean(teamId)
  if (!safeLeagueId || !safeTeamId) return ''

  return joinKey(PLAYERS_DATABASE_CACHE_PREFIXES.teamPage, safeLeagueId, safeTeamId)
}

export const buildPlayerDocumentCacheKey = playerId => (
  joinKey(PLAYERS_DATABASE_CACHE_PREFIXES.player, playerId)
)

export const buildFavoriteDocumentCacheKey = documentId => (
  joinKey(PLAYERS_DATABASE_CACHE_PREFIXES.favorite, documentId)
)

export const buildClubDocumentCacheKey = clubId => (
  joinKey(PLAYERS_DATABASE_CACHE_PREFIXES.club, clubId)
)

export const buildLeaguesMasterCacheKey = () => (
  joinKey(PLAYERS_DATABASE_CACHE_PREFIXES.leaguesMaster, 'all')
)

export const buildClubsMasterCacheKey = () => (
  joinKey(PLAYERS_DATABASE_CACHE_PREFIXES.clubsMaster, 'all')
)

export const buildClubSeasonIdentityIndexCacheKey = ({ seasonKey, birthYear } = {}) => (
  joinKey(
    PLAYERS_DATABASE_CACHE_PREFIXES.clubSeasonIdentity,
    String(seasonKey || '').replaceAll('/', '-'),
    Number(birthYear) || 0
  )
)
