// features/playersDatabase/ui/logic/routeBuilders.js

export const PLAYERS_DATABASE_UI_ROUTES = {
  entry: '/players-database',
  leagues: ({ seasonKey, birthYear } = {}) => {
    const basePath = '/players-database/leagues'
    const params = new URLSearchParams()

    if (seasonKey) params.set('season', seasonKey)
    if (birthYear && birthYear !== 'all') params.set('birthYear', birthYear)

    const query = params.toString()
    return query ? `${basePath}?${query}` : basePath
  },
  search: '/players-database/search',
  league: (leagueId, { seasonKey } = {}) => {
    const basePath = `/players-database/leagues/${leagueId || ''}`
    if (!seasonKey) return basePath

    return `${basePath}?season=${encodeURIComponent(seasonKey)}`
  },
  team: ({ leagueId, teamId, seasonKey } = {}) => {
    const basePath = `/players-database/leagues/${leagueId || ''}/teams/${teamId || ''}`
    if (!seasonKey) return basePath

    return `${basePath}?season=${encodeURIComponent(seasonKey)}`
  },
  player: playerId => `/players-database/players/${playerId || ''}`,
}

export function buildPlayersDatabaseBreadcrumbs(items = []) {
  return [
    { label: 'מאגר שחקנים חיצוני', to: PLAYERS_DATABASE_UI_ROUTES.entry },
    ...items.filter(Boolean),
  ]
}
