import {
  buildLeagueClubCleanupRemovals,
  buildLeagueClubIdentity,
} from './leagueClubSync.projection.js'

describe('leagueClubSync projection', () => {
  test('builds Club identity from a League row', () => {
    expect(buildLeagueClubIdentity({
      clubId: 'club-a',
      clubName: 'Club A',
      clubLevel: 2,
    })).toEqual(expect.objectContaining({
      clubId: 'club-a',
      name: 'Club A',
      clubLevel: 2,
    }))
  })

  test('removes only stale projection inside the current League scope', () => {
    const removals = buildLeagueClubCleanupRemovals({
      clubId: 'club-a',
      league: { id: 'league-1', ageGroupId: 'u15' },
      season: { seasonKey: '2026-27' },
      rows: [{ clubId: 'club-a', teamId: 'team-new' }],
      club: {
        ageGroups: [{
          ageGroupId: 'u15',
          seasons: [
            {
              seasonKey: '2026-27',
              teamId: 'team-old',
              league: { leagueId: 'league-1' },
            },
            {
              seasonKey: '2025-26',
              teamId: 'team-history',
              league: { leagueId: 'league-1' },
            },
            {
              seasonKey: '2026-27',
              teamId: 'team-other-league',
              league: { leagueId: 'league-2' },
            },
          ],
        }],
      },
    })

    expect(removals).toEqual([{
      ageGroupId: 'u15',
      seasonKey: '2026-27',
      leagueId: 'league-1',
      teamId: 'team-old',
    }])
  })

  test('cleans a removed Club when its prior identity was returned by identity sync', () => {
    const removals = buildLeagueClubCleanupRemovals({
      clubId: 'club-old',
      league: { id: 'league-1', ageGroupId: 'u15' },
      season: { seasonKey: '2026-27' },
      rows: [],
      removedLeagueEntries: [{ clubId: 'club-old', teamId: 'team-old' }],
      club: {
        ageGroups: [{
          ageGroupId: 'u15',
          seasons: [{
            seasonKey: '2026-27',
            teamId: 'team-old',
            league: { leagueId: 'league-1' },
          }],
        }],
      },
    })

    expect(removals).toHaveLength(1)
    expect(removals[0].teamId).toBe('team-old')
  })
})
