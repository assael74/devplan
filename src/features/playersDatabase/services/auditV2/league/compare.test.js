import { compareLeagueAuditV2 } from './compare.js'

const expected = {
  teams: [{
    teamId: 'team-1',
    teamDocumentId: 'team-1',
    teamSeasonDocumentId: 'team-1__26_27',
    teamSeasonLeagueFields: { leagueId: 'league-1', leagueLevel: 2 },
  }],
  teamSearchIndexes: [{
    id: 'index-1',
    teamId: 'team-1',
    teamSeasonDocumentId: 'team-1__26_27',
    ownedFields: { leagueId: 'league-1', seasonKey: '26_27', points: 10 },
  }],
  identity: { documentId: 'identity__26_27__2012', entries: [] },
  clubs: [],
  leaguesMasterEntry: {
    leagueId: 'league-1',
    leagueDocumentId: 'league-1',
    leagueName: 'League 1',
    seasons: [{ seasonKey: '26_27', seasonId: '28' }],
  },
  clubsMasterTeams: [],
}

const actualBase = {
  teamRoots: [{ teamId: 'team-1', document: null }],
  teamSeasons: [{ teamId: 'team-1', document: null }],
  teamSearchIndexes: [{
    teamId: 'team-1',
    document: { leagueId: 'league-1', seasonKey: '26_27', points: 10 },
  }],
  scopedTeamSeasons: [],
  scopedIndexes: [],
  clubs: [],
  identity: { entries: [] },
  leaguesMaster: {
    id: 'all',
    leagues: [{
      leagueId: 'league-1',
      leagueDocumentId: 'league-1',
      leagueName: 'League 1',
      seasons: [{ seasonKey: '26_27', seasonId: '28' }],
    }],
  },
  clubsMaster: { clubs: [] },
}

describe('compareLeagueAuditV2', () => {
  test('accepts League-only state without Team Root or Team Season', () => {
    expect(compareLeagueAuditV2({
      expected,
      actual: actualBase,
      leagueId: 'league-1',
      seasonKey: '26_27',
    })).toEqual([])
  })

  test('ignores Team SearchIndex fields not owned by League', () => {
    const actual = {
      ...actualBase,
      teamSearchIndexes: [{
        teamId: 'team-1',
        document: {
          leagueId: 'league-1', seasonKey: '26_27', points: 10,
          playersCount: 999, scoutProfilesSummary: { total: 99 },
        },
      }],
    }
    expect(compareLeagueAuditV2({ expected, actual, leagueId: 'league-1', seasonKey: '26_27' }))
      .toEqual([])
  })

  test('detects stale Team SearchIndex League projection', () => {
    const actual = {
      ...actualBase,
      scopedIndexes: [{ id: 'old-index', teamId: 'team-old', leagueId: 'league-1', seasonKey: '26_27' }],
    }
    expect(compareLeagueAuditV2({ expected, actual, leagueId: 'league-1', seasonKey: '26_27' }))
      .toEqual(expect.arrayContaining([
        expect.objectContaining({ type: 'stale_projection', target: 'teamSearchIndex' }),
      ]))
  })

  test('requires Team Root when a Team Season exists', () => {
    const actual = {
      ...actualBase,
      teamSeasons: [{ teamId: 'team-1', document: { leagueId: 'league-1', leagueLevel: 2 } }],
    }
    expect(compareLeagueAuditV2({ expected, actual, leagueId: 'league-1', seasonKey: '26_27' }))
      .toEqual(expect.arrayContaining([
        expect.objectContaining({ type: 'missing_canonical_relation', target: 'teams' }),
      ]))
  })

  test('does not report stale Club projections outside expected receipt clubs', () => {
    const actual = {
      ...actualBase,
      clubs: [{
        id: 'club-other-league',
        clubId: 'club-other-league',
        ageGroups: [{
          ageGroupId: 'youth-c',
          seasons: [{
            teamId: 'team-other',
            seasonKey: '26_27',
            league: { leagueId: 'league-1' },
          }],
        }],
        competitionPaths: [{
          birthYear: 2012,
          seasons: [{
            teamId: 'team-other',
            seasonKey: '26_27',
            leagueId: 'league-1',
          }],
        }],
      }],
    }

    expect(compareLeagueAuditV2({
      expected,
      actual,
      leagueId: 'league-1',
      seasonKey: '26_27',
    })).toEqual([])
  })

  test('detects Identity mismatch', () => {
    const actual = {
      ...actualBase,
      identity: { entries: [{ clubId: 'unexpected-club', leagueId: 'league-1' }] },
    }

    expect(compareLeagueAuditV2({
      expected,
      actual,
      leagueId: 'league-1',
      seasonKey: '26_27',
    })).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: 'projection_mismatch',
        target: 'identity',
      }),
    ]))
  })

  test('detects missing Club projection', () => {
    const clubExpected = {
      clubId: 'club-1',
      ageGroupId: 'youth-c',
      birthYear: 2012,
      teamId: 'team-1',
      seasonKey: '26_27',
      leagueId: 'league-1',
      ageGroupSeason: {},
      competitionSeason: {},
    }

    expect(compareLeagueAuditV2({
      expected: { ...expected, clubs: [clubExpected] },
      actual: actualBase,
      leagueId: 'league-1',
      seasonKey: '26_27',
    })).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: 'missing_projection',
        target: 'club',
        documentId: 'club-1',
      }),
    ]))
  })

  test('detects Leagues Master mismatch', () => {
    const actual = {
      ...actualBase,
      leaguesMaster: {
        id: 'all',
        leagues: [{
          leagueId: 'league-1',
          leagueDocumentId: 'league-1',
          leagueName: 'Wrong League',
          seasons: [{ seasonKey: '26_27', seasonId: '28' }],
        }],
      },
    }

    expect(compareLeagueAuditV2({
      expected,
      actual,
      leagueId: 'league-1',
      seasonKey: '26_27',
    })).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: 'projection_mismatch',
        target: 'leaguesMaster',
      }),
    ]))
  })

  test('detects missing Clubs Master League projection', () => {
    const expectedWithMaster = {
      ...expected,
      clubsMasterTeams: [{
        clubId: 'club-1',
        ageGroupId: 'youth-c',
        teamId: 'team-1',
        seasonKey: '26_27',
        leagueId: 'league-1',
        season: { teamId: 'team-1', seasonKey: '26_27' },
      }],
    }

    expect(compareLeagueAuditV2({
      expected: expectedWithMaster,
      actual: actualBase,
      leagueId: 'league-1',
      seasonKey: '26_27',
    })).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: 'missing_projection',
        target: 'clubsMaster',
        teamId: 'team-1',
      }),
    ]))
  })


  test('ignores offense and defense differences in Clubs Master', () => {
    const expectedWithMaster = {
      ...expected,
      clubsMasterTeams: [{
        clubId: 'club-1',
        ageGroupId: 'youth-c',
        teamId: 'team-1',
        seasonKey: '26_27',
        leagueId: 'league-1',
        season: {
          teamId: 'team-1',
          teamSlot: 1,
          seasonId: '28',
          seasonKey: '26_27',
          seasonStatus: 'active',
          birthYear: 2012,
          league: {
            leagueId: 'league-1',
            leagueName: 'League 1',
            leagueLevel: 2,
          },
          performance: {
            tableRank: 1,
            points: 10,
            teamGamePlayed: 4,
            goalsFor: 8,
            goalsAgainst: 2,
            goalsForPerGame: 2,
            goalsAgainstPerGame: 0.5,
          },
        },
      }],
    }
    const actual = {
      ...actualBase,
      clubsMaster: {
        clubs: [{
          clubId: 'club-1',
          ageGroups: [{
            ageGroupId: 'youth-c',
            current: [{
              ...expectedWithMaster.clubsMasterTeams[0].season,
              performance: {
                ...expectedWithMaster.clubsMasterTeams[0].season.performance,
                offense: { priorityLevel: 'high' },
                defense: { priorityLevel: 'low' },
              },
            }],
            previous: [],
          }],
        }],
      },
    }

    expect(compareLeagueAuditV2({
      expected: expectedWithMaster,
      actual,
      leagueId: 'league-1',
      seasonKey: '26_27',
    }).filter(item => item.target === 'clubsMaster')).toEqual([])
  })

  test('ignores fields not written by League Clubs Master projection', () => {
    const expectedWithMaster = {
      ...expected,
      clubsMasterTeams: [{
        clubId: 'club-1', ageGroupId: 'youth-c', teamId: 'team-1',
        seasonKey: '26_27', leagueId: 'league-1',
        season: {
          teamId: 'team-1', teamSlot: 1, seasonId: '28', seasonKey: '26_27',
          seasonStatus: 'active', birthYear: 2012,
          league: { leagueId: 'league-1', leagueName: 'League 1', leagueLevel: 2 },
          performance: {
            tableRank: 1, points: 10, teamGamePlayed: 4, goalsFor: 8,
            goalsAgainst: 2, goalsForPerGame: 2, goalsAgainstPerGame: 0.5,
          },
        },
      }],
    }
    const season = {
      ...expectedWithMaster.clubsMasterTeams[0].season,
      league: {
        ...expectedWithMaster.clubsMasterTeams[0].season.league,
        region: 'not-owned-here',
      },
      playersCount: 25,
      scoutProfilesSummary: { total: 9 },
      teamTaskSignals: { offense: true },
    }
    const actual = {
      ...actualBase,
      clubsMaster: {
        clubs: [{
          clubId: 'club-1',
          ageGroups: [{ ageGroupId: 'youth-c', current: [season], previous: [] }],
        }],
      },
    }

    expect(compareLeagueAuditV2({
      expected: expectedWithMaster,
      actual,
      leagueId: 'league-1',
      seasonKey: '26_27',
    }).filter(item => item.target === 'clubsMaster')).toEqual([])
  })

  test('ignores another League entries in the same Identity document', () => {
    const actual = {
      ...actualBase,
      identity: {
        entries: [{ clubId: 'other-club', teamId: 'other-team', leagueId: 'league-2' }],
      },
    }

    expect(compareLeagueAuditV2({
      expected,
      actual,
      leagueId: 'league-1',
      seasonKey: '26_27',
    }).filter(item => item.target === 'identity')).toEqual([])
  })

  test('ignores another League data in Clubs Master', () => {
    const actual = {
      ...actualBase,
      clubsMaster: {
        clubs: [{
          clubId: 'other-club',
          ageGroups: [{
            ageGroupId: 'youth-c',
            current: [{
              teamId: 'other-team',
              seasonKey: '26_27',
              league: { leagueId: 'league-2' },
            }],
            previous: [],
          }],
        }],
      },
    }

    expect(compareLeagueAuditV2({
      expected,
      actual,
      leagueId: 'league-1',
      seasonKey: '26_27',
    }).filter(item => item.target === 'clubsMaster')).toEqual([])
  })


  test('ignores legacy clubName in current League Identity entries', () => {
    const identityExpected = [{
      clubId: 'club-1',
      ageGroupId: 'youth-c',
      teamId: 'team-1',
      teamSlot: 1,
      leagueId: 'league-1',
      leagueName: 'League 1',
      leagueLevel: 2,
    }]
    const actual = {
      ...actualBase,
      identity: { entries: [{ ...identityExpected[0], clubName: 'Legacy Club Name' }] },
    }

    expect(compareLeagueAuditV2({
      expected: { ...expected, identity: { ...expected.identity, entries: identityExpected } },
      actual,
      leagueId: 'league-1',
      seasonKey: '26_27',
    }).filter(item => item.target === 'identity')).toEqual([])
  })

  test.each([
    ['clubId', 'club-other'],
    ['teamId', 'team-other'],
    ['teamSlot', 2],
    ['leagueId', 'league-other'],
  ])('detects real Identity mismatch in %s', (field, value) => {
    const identityExpected = [{
      clubId: 'club-1',
      ageGroupId: 'youth-c',
      teamId: 'team-1',
      teamSlot: 1,
      leagueId: 'league-1',
      leagueName: 'League 1',
      leagueLevel: 2,
    }]
    const actualEntry = { ...identityExpected[0], [field]: value }
    const actual = { ...actualBase, identity: { entries: [actualEntry] } }

    expect(compareLeagueAuditV2({
      expected: { ...expected, identity: { ...expected.identity, entries: identityExpected } },
      actual,
      leagueId: 'league-1',
      seasonKey: '26_27',
    }).filter(item => item.target === 'identity')).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: 'projection_mismatch', target: 'identity' }),
    ]))
  })

})
