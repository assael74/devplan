// src/features/playersDatabase/domain/league/leagueLoad.builder.test.js

import { buildLeagueLoadDocument } from './leagueLoad.builder.js'
import { buildLeaguePerformanceProjection } from './leaguePerformance.builder.js'
import { resolveLeagueLoadContext } from './leagueLoadContext.resolver.js'

const baseLeague = {
  leagueId: 'league-1',
  names: {
    official: 'League 1',
    display: 'League 1',
    short: 'L1',
    source: 'ifa',
  },
  region: 'center',
  ageGroupId: 'u15',
  ageGroupLabel: 'U15',
  level: 2,
}

const baseSeason = {
  seasonId: '2026_2027',
  seasonKey: '26/27',
  seasonStatus: 'active',
  birthYear: 2012,
  seasonUrl: 'https://example.test/league',
  leagueTotalRound: 30,
  gameDurationMinutes: 80,
  competitionRules: {
    configured: true,
    promotion: {
      enabled: true,
      directPlaces: [1],
      playoffPlaces: [],
    },
    relegation: {
      enabled: true,
      directPlaces: [16],
      playoffPlaces: [],
    },
  },
}

const row = {
  clubId: 'club-a',
  teamSlot: 1,
  teamId: 'club-a_2012_1',
  teamUrl: 'https://example.test/team-a',
  officialTable: {
    rank: 1,
    points: 9,
    goalsFor: 8,
    goalsAgainst: 2,
    teamGamePlayed: 3,
  },
}

const performanceByTeamId = {
  'club-a_2012_1': {
    offense: {
      targetRate: 1,
    },
    defense: {
      targetRate: 2,
    },
  },
}

const performanceCalculation = {
  engineVersion: 'engine-1',
  normalizationMode: 'AUTO',
  appliedFactor: 1,
  calculatedAt: 'calculated',
}

const resolveContext = ({
  league = baseLeague,
  season = baseSeason,
  rows = [],
  existingLeague = {},
} = {}) => resolveLeagueLoadContext({
  league,
  season,
  rows,
  existingLeague,
})

describe('buildLeagueLoadDocument', () => {
  test('builds a canonical season keyed only by technical seasonId', () => {
    const context = resolveContext({ rows: [row] })
    const result = buildLeagueLoadDocument({
      context,
      season: baseSeason,
      clubProfilesById: {
        'club-a': {
          clubLevel: 2,
        },
      },
      performanceByTeamId,
      performanceCalculation,
      createdAt: 'created',
      updatedAt: 'updated',
      tableImportedAt: 'imported',
    })

    expect(result.document.seasonsById['2026_2027']).toBeTruthy()
    expect(result.document.seasonsById['26/27']).toBeUndefined()
    expect(result.season.table.tableState).toBe('LOADED')
    expect(result.season.table.teamsById['club-a_2012_1']).toEqual(
      expect.objectContaining({
        clubId: 'club-a',
        teamSlot: 1,
        clubLevel: 2,
      })
    )
  })

  test('adds a season to an existing League without replacing earlier seasons', () => {
    const previousSeason = {
      seasonKey: '25/26',
      seasonStatus: 'completed',
      birthYear: 2011,
      table: { tableState: 'LOADED', teamsById: {} },
    }
    const existingLeague = {
      ...baseLeague,
      seasonsById: {
        '2025_2026': previousSeason,
      },
    }
    const context = resolveContext({ existingLeague })
    const result = buildLeagueLoadDocument({
      context,
      season: baseSeason,
      updatedAt: 'updated',
      tableImportedAt: 'imported',
    })

    expect(result.document.seasonsById['2025_2026']).toBe(previousSeason)
    expect(result.document.seasonsById['2026_2027']).toBeTruthy()
  })

  test('marks a successful empty import as LOADED_EMPTY', () => {
    const context = resolveContext({ rows: [] })
    const result = buildLeagueLoadDocument({
      context,
      season: baseSeason,
      updatedAt: 'updated',
      tableImportedAt: 'imported',
    })

    expect(result.season.table.tableState).toBe('LOADED_EMPTY')
    expect(result.season.table.teamsById).toEqual({})
    expect(result.season.tableImportedAt).toBe('imported')
  })

  test('preserves projection-owned row fields for teams that remain in the official table', () => {
    const existingLeague = {
      leagueId: 'league-1',
      level: baseLeague.level,
      seasonsById: {
        '2026_2027': {
          gameDurationMinutes: 70,
          table: {
            teamsById: {
              'club-a_2012_1': {
                clubId: 'club-a',
                teamSlot: 1,
                roster: {
                  playersCount: 18,
                  hasPlayers: true,
                },
                stats: {
                  hasStats: true,
                  statsComplete: false,
                },
                scouting: {
                  playersWithScoutProfileCount: 4,
                  teamTaskSignals: {
                    offense: true,
                    defense: false,
                    updatedAt: 'signals-updated',
                  },
                },
              },
            },
          },
        },
      },
      timestamps: {
        createdAt: 'existing-created',
      },
    }
    const context = resolveContext({ rows: [row], existingLeague })
    const result = buildLeagueLoadDocument({
      context,
      season: baseSeason,
      performanceByTeamId,
      performanceCalculation,
      updatedAt: 'updated',
      tableImportedAt: 'imported',
    })

    const team = result.season.table.teamsById['club-a_2012_1']

    expect(team.roster).toEqual({
      playersCount: 18,
      hasPlayers: true,
    })
    expect(team.stats).toEqual({
      hasStats: true,
      statsComplete: false,
    })
    expect(team.scouting.playersWithScoutProfileCount).toBe(4)
    expect(result.season.gameDurationMinutes).toBe(70)
    expect(result.document.timestamps.createdAt).toBe('existing-created')
  })

  test('builds a first empty import without a resolved league schedule', () => {
    const season = {
      ...baseSeason,
      leagueTotalRound: null,
    }
    const context = resolveContext({ season, rows: [] })
    const performance = buildLeaguePerformanceProjection({
      context,
      calculatedAt: 'calculated',
    })
    const result = buildLeagueLoadDocument({
      context,
      season,
      performanceByTeamId: performance.performanceByTeamId,
      performanceCalculation: performance.performanceCalculation,
      tableImportedAt: 'imported',
    })

    expect(context.resolvedLeagueTotalRound).toBeNull()
    expect(performance.performanceByTeamId).toEqual({})
    expect(result.season.leagueTotalRound).toBeNull()
    expect(result.season.table.tableState).toBe('LOADED_EMPTY')
    expect(result.season.table.teamsById).toEqual({})
    expect(result.season.tableImportedAt).toBe('imported')
  })

  test('rejects team ids that do not match the canonical team identity', () => {
    expect(() => resolveContext({
      rows: [{
        ...row,
        teamId: 'wrong-team-id',
      }],
    })).toThrow('Team id does not match canonical identity')
  })

  test('rejects seasonKey in place of technical seasonId', () => {
    expect(() => resolveContext({
      season: {
        ...baseSeason,
        seasonId: '26/27',
      },
      rows: [],
    })).toThrow('Invalid seasonId')
  })

  test('builds performance and league document when a row omits teamId', () => {
    const rowWithoutTeamId = {
      ...row,
      teamId: undefined,
    }
    const context = resolveContext({ rows: [rowWithoutTeamId] })
    const performance = buildLeaguePerformanceProjection({
      context,
      clubProfilesById: {
        'club-a': {
          clubLevel: 2,
          clubStrengthLevel: 2,
        },
      },
      calculatedAt: 'calculated',
    })
    const result = buildLeagueLoadDocument({
      context,
      season: baseSeason,
      clubProfilesById: {
        'club-a': {
          clubLevel: 2,
        },
      },
      performanceByTeamId: performance.performanceByTeamId,
      performanceCalculation: performance.performanceCalculation,
      updatedAt: 'updated',
      tableImportedAt: 'imported',
    })

    expect(performance.performanceByTeamId['club-a_2012_1']).toBeTruthy()
    expect(result.season.table.teamsById['club-a_2012_1']).toBeTruthy()
  })

  test('returns canonical empty performance for a team with zero games', () => {
    const openingRow = {
      ...row,
      teamId: undefined,
      officialTable: {
        ...row.officialTable,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        teamGamePlayed: 0,
      },
    }
    const context = resolveContext({ rows: [openingRow] })
    const performance = buildLeaguePerformanceProjection({
      context,
      calculatedAt: 'calculated',
    })
    const teamPerformance = performance.performanceByTeamId['club-a_2012_1']

    expect(teamPerformance).toBeTruthy()
    expect(teamPerformance.offense.scoutPriorityScore).toBeNull()
    expect(teamPerformance.defense.scoutPriorityScore).toBeNull()

    expect(() => buildLeagueLoadDocument({
      context,
      season: baseSeason,
      performanceByTeamId: performance.performanceByTeamId,
      performanceCalculation: performance.performanceCalculation,
      tableImportedAt: 'imported',
    })).not.toThrow()
  })

  test('rejects league ids that are invalid Firestore document ids', () => {
    for (const leagueId of ['a/b', '.', '..']) {
      expect(() => resolveContext({
        league: {
          ...baseLeague,
          leagueId,
        },
        rows: [],
      })).toThrow('Invalid leagueId')
    }
  })

  test('uses the same calculated 18 rounds in performance and document for 10 teams', () => {
    const rows = Array.from({ length: 10 }, (_, index) => ({
      clubId: `club-${index + 1}`,
      teamSlot: 1,
      officialTable: {
        rank: index + 1,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        teamGamePlayed: 0,
      },
    }))
    const season = {
      ...baseSeason,
      leagueTotalRound: null,
    }
    const context = resolveContext({ season, rows })
    const performance = buildLeaguePerformanceProjection({
      context,
      calculatedAt: 'calculated',
    })
    const result = buildLeagueLoadDocument({
      context,
      season,
      performanceByTeamId: performance.performanceByTeamId,
      performanceCalculation: performance.performanceCalculation,
      tableImportedAt: 'imported',
    })

    expect(context.resolvedLeagueTotalRound).toBe(18)
    expect(result.season.leagueTotalRound).toBe(18)
  })

  test('uses existing leagueTotalRound in both performance context and document', () => {
    const season = {
      ...baseSeason,
      leagueTotalRound: null,
    }
    const existingLeague = {
      leagueId: baseLeague.leagueId,
      level: baseLeague.level,
      seasonsById: {
        [baseSeason.seasonId]: {
          leagueTotalRound: 22,
        },
      },
    }
    const context = resolveContext({ season, rows: [row], existingLeague })
    const performance = buildLeaguePerformanceProjection({
      context,
      calculatedAt: 'calculated',
    })
    const result = buildLeagueLoadDocument({
      context,
      season,
      existingLeague,
      performanceByTeamId: performance.performanceByTeamId,
      performanceCalculation: performance.performanceCalculation,
      tableImportedAt: 'imported',
    })

    expect(context.resolvedLeagueTotalRound).toBe(22)
    expect(result.season.leagueTotalRound).toBe(22)
  })

  test('uses existing league level in performance context when input omits it', () => {
    const league = {
      ...baseLeague,
      level: null,
    }
    const existingLeague = {
      leagueId: baseLeague.leagueId,
      level: 4,
    }
    const context = resolveContext({ league, rows: [row], existingLeague })
    const performance = buildLeaguePerformanceProjection({
      context,
      calculatedAt: 'calculated',
    })

    expect(context.resolvedLeagueLevel).toBe(4)
    expect(performance.performanceByTeamId['club-a_2012_1']).toBeTruthy()
  })
})
