// features/playersDatabase/ui/logic/routeBuilders.js

export const PLAYERS_DATABASE_UI_ROUTES = {
  entry: '/players-database',
  leagues: '/players-database/leagues',
  search: '/players-database/search',
  league: leagueId => `/players-database/leagues/${leagueId || ''}`,
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
