import { PLAYERS_DATABASE_UI_ROUTES } from './routeBuilders.js'

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
