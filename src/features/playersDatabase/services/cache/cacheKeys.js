// src/features/playersDatabase/services/cache/cacheKeys.js

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const joinKey = (...parts) => parts.map(clean).filter(Boolean).join(':')

export const PLAYERS_DATABASE_CACHE_PREFIXES = {
  leagues: 'leagues',
  league: 'league',
  team: 'team',
  teamSeason: 'teamSeason',
  teamSeasonsByRoot: 'teamSeasonsByRoot',
  teamPage: 'teamPage',
  player: 'player',
  favorite: 'favorite',
  club: 'club',
  clubsDirectory: 'clubsDirectory',
  clubsCenter: 'clubsCenter',
}

export const buildLeaguesCollectionCacheKey = () => (
  PLAYERS_DATABASE_CACHE_PREFIXES.leagues
)

export const buildLeagueDocumentCacheKey = leagueId => (
  joinKey(PLAYERS_DATABASE_CACHE_PREFIXES.league, leagueId)
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

export const buildClubsDirectoryCacheKey = () => (
  joinKey(PLAYERS_DATABASE_CACHE_PREFIXES.clubsDirectory, 'all')
)

export const buildClubsCenterCacheKey = seasonId => (
  joinKey(PLAYERS_DATABASE_CACHE_PREFIXES.clubsCenter, seasonId)
)

