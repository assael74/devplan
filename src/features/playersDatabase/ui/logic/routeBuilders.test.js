// src/features/playersDatabase/ui/logic/routeBuilders.test.js

// src/features/playersDatabase/ui/logic/routeBuilders.test.js

import {
  buildDataOpsNavigationState,
  PLAYERS_DATABASE_UI_ROUTES,
  resolveDataOpsAuditRoute,
  resolveDataOpsReturnPath,
} from './routeBuilders.js'

describe('PLAYERS_DATABASE_UI_ROUTES.team', () => {
  test('builds a direct Stats import repair route', () => {
    expect(PLAYERS_DATABASE_UI_ROUTES.team({
      leagueId: 'league-1',
      teamId: 'team-1',
      auditSeasonKey: '26/27',
      openStatsImport: true,
    })).toBe(
      '/players-database/leagues/league-1/teams/team-1?auditSeason=26%2F27&openStatsImport=1'
    )
  })
})

describe('DataOps return navigation', () => {
  test('preserves the full PlayersDatabase source route', () => {
    const state = buildDataOpsNavigationState({
      pathname: '/players-database/leagues/league-1',
      search: '?season=2026_2027',
      hash: '#teams',
    })

    expect(resolveDataOpsReturnPath(state)).toBe(
      '/players-database/leagues/league-1?season=2026_2027#teams'
    )
  })

  test('falls back to the entry page for a missing or invalid source', () => {
    expect(resolveDataOpsReturnPath()).toBe(PLAYERS_DATABASE_UI_ROUTES.entry)
    expect(resolveDataOpsReturnPath({ from: '/another-feature' }))
      .toBe(PLAYERS_DATABASE_UI_ROUTES.entry)
    expect(resolveDataOpsReturnPath({ from: PLAYERS_DATABASE_UI_ROUTES.dataOps }))
      .toBe(PLAYERS_DATABASE_UI_ROUTES.entry)
  })
})

describe('DataOps scoped navigation', () => {
  test('opens a team audit with context from the current route', () => {
    expect(resolveDataOpsAuditRoute({
      pathname: '/players-database/leagues/league-1/teams/team-1',
      search: '?auditSeason=2026_2027',
    })).toBe(
      '/players-database/data-ops/audit?type=team&league=league-1&team=team-1&season=2026_2027'
    )
  })

  test('opens a player audit with query context', () => {
    expect(resolveDataOpsAuditRoute({
      pathname: '/players-database/players/player-1',
      search: '?league=league-1&team=team-1&season=2026_2027',
    })).toBe(
      '/players-database/data-ops/audit?type=player&league=league-1&team=team-1&player=player-1&season=2026_2027'
    )
  })

  test('falls back to the DataOps home outside an entity route', () => {
    expect(resolveDataOpsAuditRoute({ pathname: '/players-database/search' }))
      .toBe(PLAYERS_DATABASE_UI_ROUTES.dataOps)
  })
})
