import { buildLeagueCanonicalState } from './leagueCanonical.builder.js'

describe('League V2 canonical builder', () => {
  const league = {
    id: 'league-1',
    name: 'League 1',
    level: 2,
  }
  const season = {
    seasonId: '26/27',
    seasonKey: '26_27',
    birthYear: 2012,
    seasonStatus: 'active',
  }

  test('replaces the league table scope while preserving cross-flow row metadata', () => {
    const currentData = {
      current: {
        seasonId: '26/27',
        seasonKey: '26_27',
        tableRank: [
          {
            rank: 1,
            clubId: 'club-a',
            birthTeamId: 'team-a',
            teamId: 'team-a',
            playersCount: 18,
            hasPlayers: true,
            hasStats: true,
            statsComplete: true,
            scoutProfilesSummary: {
              total: 3,
              profileCounts: {
                priority: 1,
              },
            },
            teamTaskSignals: {
              count: 2,
            },
            teamStats: {
              points: 10,
              goalsFor: 8,
              goalsAgainst: 3,
              teamGamePlayed: 4,
              customField: 'preserve-me',
            },
          },
          {
            rank: 2,
            clubId: 'club-removed',
            birthTeamId: 'team-removed',
            teamId: 'team-removed',
          },
        ],
      },
      history: [],
    }

    const result = buildLeagueCanonicalState({
      league,
      season,
      rows: [
        {
          position: 2,
          clubId: 'club-a',
          birthTeamId: 'team-a',
          games: 5,
          goalsFor: 11,
          goalsAgainst: 4,
          points: 12,
        },
        {
          position: 1,
          clubId: 'club-new',
          birthTeamId: 'team-new',
          games: 5,
          goalsFor: 14,
          goalsAgainst: 2,
          points: 15,
        },
      ],
      currentData,
      teamPerformanceContext: {
        version: 'test',
      },
      createdAt: 'created',
      updatedAt: 'updated',
    })

    expect(result.tableRank).toHaveLength(2)
    expect(result.tableRank.map(row => row.birthTeamId)).toEqual([
      'team-a',
      'team-new',
    ])
    expect(result.tableRank[0]).toEqual(expect.objectContaining({
      rank: 2,
      playersCount: 18,
      hasPlayers: true,
      hasStats: true,
      statsComplete: true,
    }))
    expect(result.tableRank[0].teamStats).toEqual(expect.objectContaining({
      points: 12,
      goalsFor: 11,
      goalsAgainst: 4,
      teamGamePlayed: 5,
      customField: 'preserve-me',
    }))
    expect(result.tableRank[0].scoutProfilesSummary.total).toBe(3)
  })

  test('moves the matching current season to history when completed', () => {
    const result = buildLeagueCanonicalState({
      league,
      season: {
        ...season,
        seasonStatus: 'completed',
      },
      target: 'history',
      rows: [],
      currentData: {
        current: {
          seasonId: '26/27',
          seasonKey: '26_27',
          seasonStatus: 'active',
          tableRank: [],
        },
        history: [
          {
            seasonId: '25/26',
            seasonKey: '25_26',
            seasonStatus: 'completed',
            tableRank: [],
          },
        ],
      },
      teamPerformanceContext: {
        version: 'test',
      },
      createdAt: 'created',
      updatedAt: 'updated',
    })

    expect(result.nextData.current).toBeNull()
    expect(result.nextData.history).toHaveLength(2)
    expect(result.nextData.history.find(item => item.seasonKey === '25_26')).toBeTruthy()
    expect(result.nextData.history.find(item => item.seasonKey === '26_27')).toEqual(
      expect.objectContaining({
        seasonStatus: 'completed',
      })
    )
  })

  test('creates a new current league season without legacy operational fields', () => {
    const result = buildLeagueCanonicalState({
      league,
      season,
      rows: [{
        position: 1,
        clubId: 'club-a',
        birthTeamId: 'team-a',
        games: 2,
        goalsFor: 5,
        goalsAgainst: 1,
        points: 6,
      }],
      currentData: {},
      teamPerformanceContext: { version: 'test' },
      createdAt: 'created',
      updatedAt: 'updated',
    })

    expect(result.nextData.current.seasonKey).toBe('26_27')
    expect(result.nextData.current.tableRank).toHaveLength(1)
    expect(result.nextData.current.generation).toBeUndefined()
    expect(result.nextData.generation).toBeUndefined()
  })

  test('updates one history season without changing other history seasons', () => {
    const untouchedHistorySeason = {
      seasonId: '24/25',
      seasonKey: '24_25',
      seasonStatus: 'completed',
      tableRank: [{ rank: 1, clubId: 'old-club', teamId: 'old-team' }],
    }
    const result = buildLeagueCanonicalState({
      league,
      season: {
        ...season,
        seasonStatus: 'completed',
      },
      target: 'history',
      rows: [{
        position: 1,
        clubId: 'club-a',
        birthTeamId: 'team-a',
        games: 3,
        goalsFor: 7,
        goalsAgainst: 2,
        points: 9,
      }],
      currentData: {
        current: null,
        history: [
          untouchedHistorySeason,
          {
            seasonId: '26/27',
            seasonKey: '26_27',
            seasonStatus: 'completed',
            tableRank: [],
          },
        ],
      },
      teamPerformanceContext: { version: 'test' },
      createdAt: 'created',
      updatedAt: 'updated',
    })

    expect(result.nextData.history).toHaveLength(2)
    expect(result.nextData.history.find(item => item.seasonKey === '24_25')).toEqual(
      expect.objectContaining(untouchedHistorySeason)
    )
    expect(result.nextData.history.find(item => item.seasonKey === '26_27').tableRank).toHaveLength(1)
  })

  test('preserves existing competition rules when the import does not replace them', () => {
    const competitionRules = {
      promotion: { enabled: true, places: 2 },
    }
    const result = buildLeagueCanonicalState({
      league,
      season,
      rows: [],
      currentData: {
        current: {
          ...season,
          competitionRules,
          tableRank: [],
        },
        history: [],
      },
      teamPerformanceContext: { version: 'test' },
      createdAt: 'created',
      updatedAt: 'updated',
    })

    expect(result.competitionRules).toEqual(expect.objectContaining({
      promotion: expect.objectContaining({ enabled: true }),
    }))
  })

  test('preserves an existing league total round before deriving a new schedule value', () => {
    const result = buildLeagueCanonicalState({
      league,
      season: {
        ...season,
        leagueTotalRound: 30,
      },
      rows: [],
      currentData: {
        current: {
          ...season,
          leagueTotalRound: 22,
          tableRank: [],
        },
        history: [],
      },
      teamPerformanceContext: { version: 'test' },
      createdAt: 'created',
      updatedAt: 'updated',
    })

    expect(result.canonicalSeason.leagueTotalRound).toBe(22)
  })

  test('stores the supplied team performance context on the canonical season', () => {
    const teamPerformanceContext = {
      version: 'context-v1',
      normalizationMode: 'AUTO',
      appliedFactor: 1.2,
    }
    const result = buildLeagueCanonicalState({
      league,
      season,
      rows: [],
      currentData: {},
      teamPerformanceContext,
      createdAt: 'created',
      updatedAt: 'updated',
    })

    expect(result.canonicalSeason.teamPerformanceContext).toEqual(teamPerformanceContext)
  })

})
