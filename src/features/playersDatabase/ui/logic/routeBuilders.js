// features/playersDatabase/ui/logic/routeBuilders.js

export const PLAYERS_DATABASE_UI_ROUTES = {
  entry: '/players-database',
  leagues: ({ seasonKey, birthYear, level } = {}) => {
    const basePath = '/players-database/leagues'
    const params = new URLSearchParams()

    if (seasonKey) params.set('season', seasonKey)
    if (birthYear && birthYear !== 'all') params.set('birthYear', birthYear)
    if (level && level !== 'all') params.set('level', level)

    const query = params.toString()
    return query ? `${basePath}?${query}` : basePath
  },
  search: '/players-database/search',
  league: (leagueId, { seasonKey } = {}) => {
    const basePath = `/players-database/leagues/${leagueId || ''}`
    if (!seasonKey) return basePath

    return `${basePath}?season=${encodeURIComponent(seasonKey)}`
  },
  team: ({ leagueId, teamId, seasonKey, versionKey } = {}) => {
    const basePath = `/players-database/leagues/${leagueId || ''}/teams/${teamId || ''}`
    const params = new URLSearchParams()

    if (seasonKey) params.set('season', seasonKey)
    if (versionKey) params.set('version', versionKey)

    const query = params.toString()
    return query ? `${basePath}?${query}` : basePath
  },
  player: playerId => `/players-database/players/${playerId || ''}`,
}

export function buildPlayersDatabaseBreadcrumbs(items = []) {
  return [
    { label: 'מאגר שחקנים חיצוני', to: PLAYERS_DATABASE_UI_ROUTES.entry },
    ...items.filter(Boolean),
  ]
}
