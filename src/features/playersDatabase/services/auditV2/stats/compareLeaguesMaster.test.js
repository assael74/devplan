import {
  compareStatsLeaguesMasterV2,
} from './compareLeaguesMaster.js'

describe('Stats Audit V2 Leagues Master', () => {
  test('compares only Stats-derived counters in the receipt league season', () => {
    expect(compareStatsLeaguesMasterV2({
      expected: {
        leagueId: 'league-1',
        seasonKey: '26_27',
        fields: {
          playersCount: 18,
          playersWithScoutProfileCount: 4,
          scoutProfilesCount: 6,
        },
      },
      actual: {
        leagues: [{
          leagueId: 'league-1',
          region: 'unrelated',
          seasons: [{
            seasonKey: '26_27',
            playersCount: 18,
            playersWithScoutProfileCount: 4,
            scoutProfilesCount: 6,
            teamsCount: 14,
          }],
        }, {
          leagueId: 'other-league',
          seasons: [{
            seasonKey: '26_27',
            playersCount: 999,
          }],
        }],
      },
    })).toEqual([])
  })

  test('reports a missing owned counter instead of treating it as zero', () => {
    expect(compareStatsLeaguesMasterV2({
      expected: {
        leagueId: 'league-1',
        seasonKey: '26_27',
        fields: {
          playersCount: 0,
        },
      },
      actual: {
        leagues: [{
          leagueId: 'league-1',
          seasons: [{
            seasonKey: '26_27',
          }],
        }],
      },
    })).toEqual([
      expect.objectContaining({
        type: 'projection_mismatch',
        target: 'leaguesMaster',
      }),
    ])
  })
})
