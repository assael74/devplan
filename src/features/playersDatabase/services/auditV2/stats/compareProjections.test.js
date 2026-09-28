import {
  compareStatsProjectionsV2,
} from './compareProjections.js'

const expected = {
  playerSearchIndexes: [{
    docId: 'player-1',
    fields: {
      games: 5,
      goals: 2,
      statsStatus: 'loaded',
    },
  }],
  teamSearchIndex: {
    docId: 'team-index',
    fields: {
      playersCount: 18,
    },
  },
  leagueMetadata: {
    leagueId: 'league-1',
    seasonKey: '26_27',
    birthTeamDocumentId: 'team-1',
    sourceTarget: 'current',
    fields: {
      playersCount: 18,
      hasStats: true,
    },
  },
}

describe('Stats Audit V2 projections', () => {
  test('ignores fields outside Stats ownership', () => {
    expect(compareStatsProjectionsV2({
      expected,
      actual: {
        playerSearchIndexes: [{
          id: 'player-1',
          games: 5,
          goals: 2,
          statsStatus: 'loaded',
          rosterOnlyField: 'preserved',
        }],
        teamSearchIndex: {
          id: 'team-index',
          playersCount: 18,
          scoutingDisplayField: 'preserved',
        },
        league: {
          current: {
            seasonKey: '26_27',
            tableRank: [{
              birthTeamDocumentId: 'team-1',
              playersCount: 18,
              hasStats: true,
              goalsFor: 99,
            }],
          },
        },
      },
    })).toEqual([])
  })

  test('reports a missing Player SearchIndex', () => {
    const findings = compareStatsProjectionsV2({
      expected,
      actual: {
        playerSearchIndexes: [],
        teamSearchIndex: {
          playersCount: 18,
        },
        league: {
          current: {
            seasonKey: '26_27',
            tableRank: [{
              birthTeamDocumentId: 'team-1',
              playersCount: 18,
              hasStats: true,
            }],
          },
        },
      },
    })

    expect(findings).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: 'missing_projection',
        target: 'playerSearchIndex',
      }),
    ]))
  })

  test('does not report unrelated extra Player SearchIndexes as stale', () => {
    expect(compareStatsProjectionsV2({
      expected: {
        ...expected,
        playerSearchIndexes: [],
      },
      actual: {
        playerSearchIndexes: [{
          id: 'unrelated-existing-index',
        }],
        teamSearchIndex: {
          playersCount: 18,
        },
        league: {
          current: {
            seasonKey: '26_27',
            tableRank: [{
              birthTeamDocumentId: 'team-1',
              playersCount: 18,
              hasStats: true,
            }],
          },
        },
      },
    })).toEqual([])
  })
})

test('compares nested Stats snapshot fields without requiring writer-only metadata', () => {
  const nestedExpected = {
    ...expected,
    playerSearchIndexes: [{
      docId: 'player-1',
      fields: {
        statsSnapshots: {
          current: {
            snapshotKey: '10|5|2|400|4|1|1',
            games: 5,
            goals: 2,
          },
        },
      },
    }],
  }

  expect(compareStatsProjectionsV2({
    expected: nestedExpected,
    actual: {
      playerSearchIndexes: [{
        id: 'player-1',
        statsSnapshots: {
          previous: { snapshotKey: 'old' },
          current: {
            capturedAt: 'server-owned-value',
            snapshotKey: '10|5|2|400|4|1|1',
            games: 5,
            goals: 2,
            minutes: 400,
          },
        },
      }],
      teamSearchIndex: { playersCount: 18 },
      league: {
        current: {
          seasonKey: '26_27',
          tableRank: [{
            birthTeamDocumentId: 'team-1',
            playersCount: 18,
            hasStats: true,
          }],
        },
      },
    },
  })).toEqual([])
})
