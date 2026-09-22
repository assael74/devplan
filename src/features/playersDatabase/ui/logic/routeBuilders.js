// features/playersDatabase/ui/logic/routeBuilders.js

export const PLAYERS_DATABASE_UI_ROUTES = {
  entry: '/players-database',
  leagues: ({ seasonKey, birthYear, level } = {}) => {
    const basePath = '/players-database/leagues'
    const params = new URLSearchParams()

    if (seasonKey && seasonKey !== 'all') params.set('season', seasonKey)
    if (birthYear && birthYear !== 'all') params.set('birthYear', birthYear)
    if (level && level !== 'all') params.set('level', level)

    const query = params.toString()
    return query ? `${basePath}?${query}` : basePath
  },
  search: '/players-database/search',
  clubs: '/players-database/clubs',
  club: clubId => `/players-database/clubs/${clubId || ''}`,
  league: (leagueId, {
    seasonKey,
    birthYear,
    level,
    centerSeasonKey,
    centerBirthYear,
    centerLevel,
    auditFindingId,
  } = {}) => {
    const basePath = `/players-database/leagues/${leagueId || ''}`
    const params = new URLSearchParams()

    if (seasonKey && seasonKey !== 'all') params.set('season', seasonKey)
    if (birthYear && birthYear !== 'all') params.set('birthYear', birthYear)
    if (level && level !== 'all') params.set('level', level)

    if (centerSeasonKey) params.set('centerSeason', centerSeasonKey)
    if (centerBirthYear) params.set('centerBirthYear', centerBirthYear)
    if (centerLevel) params.set('centerLevel', centerLevel)
    if (auditFindingId) params.set('auditFinding', auditFindingId)

    const query = params.toString()
    return query ? `${basePath}?${query}` : basePath
  },
  team: ({
    leagueId,
    teamId,
    fromLeague,
    fromClubs = false,
    auditFindingId,
    auditSeasonKey,
  } = {}) => {
    const basePath = `/players-database/leagues/${leagueId || ''}/teams/${teamId || ''}`
    const params = new URLSearchParams()

    if (fromLeague) params.set('fromLeague', fromLeague)
    if (fromClubs) params.set('fromClubs', '1')
    if (auditFindingId) params.set('auditFinding', auditFindingId)
    if (auditSeasonKey) params.set('auditSeason', auditSeasonKey)

    const query = params.toString()
    return query ? `${basePath}?${query}` : basePath
  },
  player: ({
    playerId,
    seasonKey,
    teamId,
    leagueId,
    fromTeam,
    auditFindingId,
  } = {}) => {
    const basePath = `/players-database/players/${playerId || ''}`
    const params = new URLSearchParams()

    if (seasonKey) params.set('season', seasonKey)
    if (teamId) params.set('team', teamId)
    if (leagueId) params.set('league', leagueId)
    if (fromTeam) params.set('fromTeam', fromTeam)
    if (auditFindingId) params.set('auditFinding', auditFindingId)

    const query = params.toString()
    return query ? `${basePath}?${query}` : basePath
  },
}

export function buildPlayersDatabaseBreadcrumbs(items = []) {
  return [
    {
      label: 'מאגר שחקנים חיצוני',
      to: PLAYERS_DATABASE_UI_ROUTES.entry,
    },
    ...items.filter(Boolean),
  ]
}
