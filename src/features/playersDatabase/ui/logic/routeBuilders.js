// src/features/playersDatabase/ui/logic/routeBuilders.js

export const PLAYERS_DATABASE_QUERY_KEYS = {
  season: 's',
  birthYear: 'y',
  ageGroup: 'a',
  level: 'l',
  status: 't',
  view: 'v',
  workMode: 'wm',
  workFilter: 'wf',
  centerSeason: 'cs',
  centerBirthYear: 'cy',
  centerAgeGroup: 'ca',
  centerLevel: 'cl',
  centerStatus: 'ct',
  fromLeague: 'fl',
  fromClubs: 'fc',
}

export const PLAYERS_DATABASE_UI_ROUTES = {
  entry: '/players-database',
  leagues: ({
    seasonKey,
    birthYear,
    ageGroup,
    level,
    status,
  } = {}) => {
    const basePath = '/players-database/leagues'
    const params = new URLSearchParams()

    if (seasonKey && seasonKey !== 'all') params.set(PLAYERS_DATABASE_QUERY_KEYS.season, seasonKey)
    if (birthYear && birthYear !== 'all') params.set(PLAYERS_DATABASE_QUERY_KEYS.birthYear, birthYear)
    if (ageGroup && ageGroup !== 'all') params.set(PLAYERS_DATABASE_QUERY_KEYS.ageGroup, ageGroup)
    if (level && level !== 'all') params.set(PLAYERS_DATABASE_QUERY_KEYS.level, level)
    if (status && status !== 'all') params.set(PLAYERS_DATABASE_QUERY_KEYS.status, status)

    const query = params.toString()
    return query ? `${basePath}?${query}` : basePath
  },
  search: '/players-database/search',
  dataOps: '/players-database/data-ops',
  dataOpsAudit: ({ type = '', leagueId = '', teamId = '', playerId = '', seasonId = '' } = {}) => {
    const params = new URLSearchParams()
    if (type) params.set('type', type)
    if (leagueId) params.set('league', leagueId)
    if (teamId) params.set('team', teamId)
    if (playerId) params.set('player', playerId)
    if (seasonId) params.set('season', seasonId)
    const query = params.toString()
    return query
      ? `/players-database/data-ops/audit?${query}`
      : '/players-database/data-ops/audit'
  },
  dataOpsReceipts: '/players-database/data-ops/receipts',
  dataOpsSystemAudit: '/players-database/data-ops/system-audit',
  clubs: '/players-database/clubs',
  club: clubId => `/players-database/clubs/${clubId || ''}`,
  league: (leagueId, {
    seasonKey,
    birthYear,
    level,
    centerSeasonKey,
    centerBirthYear,
    centerAgeGroup,
    centerLevel,
    centerStatus,
    auditFindingId,
    workMode,
    workFilter,
  } = {}) => {
    const basePath = `/players-database/leagues/${leagueId || ''}`
    const params = new URLSearchParams()

    if (workMode === 'research') params.set(PLAYERS_DATABASE_QUERY_KEYS.workMode, workMode)
    if (workFilter && workFilter !== 'all') params.set(PLAYERS_DATABASE_QUERY_KEYS.workFilter, workFilter)

    if (seasonKey && seasonKey !== 'all') params.set(PLAYERS_DATABASE_QUERY_KEYS.season, seasonKey)
    if (birthYear && birthYear !== 'all') params.set(PLAYERS_DATABASE_QUERY_KEYS.birthYear, birthYear)
    if (level && level !== 'all') params.set(PLAYERS_DATABASE_QUERY_KEYS.level, level)

    if (centerSeasonKey) params.set(PLAYERS_DATABASE_QUERY_KEYS.centerSeason, centerSeasonKey)
    if (centerBirthYear) params.set(PLAYERS_DATABASE_QUERY_KEYS.centerBirthYear, centerBirthYear)
    if (centerAgeGroup && centerAgeGroup !== 'all') params.set(PLAYERS_DATABASE_QUERY_KEYS.centerAgeGroup, centerAgeGroup)
    if (centerLevel) params.set(PLAYERS_DATABASE_QUERY_KEYS.centerLevel, centerLevel)
    if (centerStatus) params.set(PLAYERS_DATABASE_QUERY_KEYS.centerStatus, centerStatus)
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
    openStatsImport = false,
    insightId = '',
    seasonKey = '',
  } = {}) => {
    const basePath = `/players-database/leagues/${leagueId || ''}/teams/${teamId || ''}`
    const params = new URLSearchParams()

    if (fromLeague) params.set(PLAYERS_DATABASE_QUERY_KEYS.fromLeague, fromLeague)
    if (fromClubs) params.set(PLAYERS_DATABASE_QUERY_KEYS.fromClubs, '1')
    if (auditFindingId) params.set('auditFinding', auditFindingId)
    if (auditSeasonKey) params.set('auditSeason', auditSeasonKey)
    if (openStatsImport) params.set('openStatsImport', '1')
    if (insightId) params.set('insight', insightId)
    if (seasonKey) params.set('signalSeason', seasonKey)

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

const decodePathPart = value => {
  try {
    return decodeURIComponent(value || '')
  } catch {
    return value || ''
  }
}

export function resolveDataOpsAuditRoute({ pathname = '', search = '' } = {}) {
  const params = new URLSearchParams(search)
  const teamMatch = pathname.match(/^\/players-database\/leagues\/([^/]+)\/teams\/([^/]+)/)
  if (teamMatch) {
    return PLAYERS_DATABASE_UI_ROUTES.dataOpsAudit({
      type: 'team',
      leagueId: decodePathPart(teamMatch[1]),
      teamId: decodePathPart(teamMatch[2]),
      seasonId: params.get('auditSeason') || params.get('season') || '',
    })
  }

  const leagueMatch = pathname.match(/^\/players-database\/leagues\/([^/]+)$/)
  if (leagueMatch) {
    return PLAYERS_DATABASE_UI_ROUTES.dataOpsAudit({
      type: 'league',
      leagueId: decodePathPart(leagueMatch[1]),
      seasonId: params.get(PLAYERS_DATABASE_QUERY_KEYS.season) || '',
    })
  }

  const playerMatch = pathname.match(/^\/players-database\/players\/([^/]+)/)
  if (playerMatch) {
    return PLAYERS_DATABASE_UI_ROUTES.dataOpsAudit({
      type: 'player',
      playerId: decodePathPart(playerMatch[1]),
      leagueId: params.get('league') || '',
      teamId: params.get('team') || '',
      seasonId: params.get('season') || '',
    })
  }

  return PLAYERS_DATABASE_UI_ROUTES.dataOps
}

export function buildDataOpsNavigationState({
  pathname = '',
  search = '',
  hash = '',
} = {}) {
  const from = `${pathname}${search}${hash}`
  return from && from !== PLAYERS_DATABASE_UI_ROUTES.dataOps ? { from } : {}
}

export function resolveDataOpsReturnPath(state = {}) {
  const from = String(state && state.from ? state.from : '').trim()
  const entryPath = PLAYERS_DATABASE_UI_ROUTES.entry
  const belongsToPlayersDatabase = (
    from === entryPath
    || from.startsWith(`${entryPath}/`)
    || from.startsWith(`${entryPath}?`)
  )
  const isDataOpsPath = (
    from === PLAYERS_DATABASE_UI_ROUTES.dataOps
    || from.startsWith(`${PLAYERS_DATABASE_UI_ROUTES.dataOps}/`)
    || from.startsWith(`${PLAYERS_DATABASE_UI_ROUTES.dataOps}?`)
  )

  return belongsToPlayersDatabase && !isDataOpsPath ? from : entryPath
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
