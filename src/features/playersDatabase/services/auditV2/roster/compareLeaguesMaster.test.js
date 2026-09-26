import { compareRosterLeaguesMasterV2 } from './compareLeaguesMaster.js'

const expected = {
  leagueId: 'league-1',
  seasonKey: '26_27',
  fields: {
    playersCount: 24,
  },
}

describe('compareRosterLeaguesMasterV2', () => {
  test('ignores unrelated League, Stats and Scouting data in the shared master', () => {
    const actual = {
      summary: {
        playersCount: 999,
        scoutProfilesCount: 999,
      },
      leagues: [
        {
          leagueId: 'league-other',
          seasons: [{
            seasonKey: '26_27',
            playersCount: 500,
          }],
        },
        {
          leagueId: 'league-1',
          leagueName: 'Display name can differ',
          seasons: [{
            seasonKey: '26_27',
            playersCount: 24,
            scoutProfilesCount: 88,
            playersWithScoutProfileCount: 77,
            teamsCount: 999,
          }],
        },
      ],
    }

    expect(compareRosterLeaguesMasterV2({
      expected,
      actual,
    })).toEqual([])
  })

  test('reports a real Roster-owned playersCount mismatch', () => {
    const findings = compareRosterLeaguesMasterV2({
      expected,
      actual: {
        leagues: [{
          leagueId: 'league-1',
          seasons: [{
            seasonKey: '26_27',
            playersCount: 23,
          }],
        }],
      },
    })

    expect(findings).toEqual([expect.objectContaining({
      type: 'projection_mismatch',
      target: 'leaguesMaster',
    })])
  })

  test('reports missing playersCount even when canonical playersCount is zero', () => {
    const findings = compareRosterLeaguesMasterV2({
      expected: {
        ...expected,
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
    })

    expect(findings).toEqual([expect.objectContaining({
      type: 'projection_mismatch',
      target: 'leaguesMaster',
      actual: {
        playersCount: undefined,
      },
    })])
  })

  test('reports a missing current League entry', () => {
    const findings = compareRosterLeaguesMasterV2({
      expected,
      actual: {
        leagues: [{
          leagueId: 'league-other',
          seasons: [{
            seasonKey: '26_27',
            playersCount: 24,
          }],
        }],
      },
    })

    expect(findings).toEqual([expect.objectContaining({
      type: 'missing_projection',
      target: 'leaguesMaster',
    })])
  })

  test('reports a missing current League season entry', () => {
    const findings = compareRosterLeaguesMasterV2({
      expected,
      actual: {
        leagues: [{
          leagueId: 'league-1',
          seasons: [{
            seasonKey: '25_26',
            playersCount: 24,
          }],
        }],
      },
    })

    expect(findings).toEqual([expect.objectContaining({
      type: 'missing_projection',
      target: 'leaguesMaster',
    })])
  })
})
