// src/features/playersDatabase/domain/league/leagueWritePlan.builder.test.js

import { buildLeaguePerformanceProjection } from './leaguePerformance.builder.js'
import {
  buildLeagueOpenWritePlan,
  buildLeagueLoadWritePlan,
  buildLeagueLoadProjectionRepairPlan,
  buildLeagueSeasonDeleteWritePlan,
  buildLeagueTeamsClearWritePlan,
} from './leagueWritePlan.builder.js'

jest.mock('./leaguePerformance.builder.js', () => ({
  buildLeaguePerformanceProjection: jest.fn(),
}))

const updatedAt = '2026-10-02T10:00:00.000Z'
const seasonId = '2025_2026'
const leagueId = 'league-1'

const emptySide = () => ({
  targetRate: null,
  targetNormalized: null,
  targetLevel: '',
  rankingRate: null,
  rankingNormalized: null,
  rankingLevel: '',
  anomalyRate: null,
  anomalyLevel: '',
  qualityRate: null,
  scoutPriorityScore: null,
  priorityLevel: '',
  opportunityType: '',
  rank: null,
  benchmark: {
    expectedValue: null,
    actualValue: null,
    projectedValue: null,
    gap: null,
  },
})

const performanceFor = teamIds => ({
  performanceByTeamId: Object.fromEntries(teamIds.map(teamId => [teamId, {
    offense: emptySide(),
    defense: emptySide(),
  }])),
  performanceCalculation: {
    engineVersion: 'test-engine',
    normalizationMode: 'AUTO',
    appliedFactor: null,
    calculatedAt: updatedAt,
  },
})

const buildClubProfile = ({ clubId, displayName }) => ({
  clubId,
  externalClubId: '',
  clubUrl: '',
  names: {
    official: displayName,
    display: displayName,
    short: displayName,
    source: displayName,
  },
  aliases: [],
  searchAliases: [],
  clubLevel: 2,
  clubStrengthLevel: 3,
  timestamps: { createdAt: null, updatedAt },
})

const clubProfilesById = {
  'club-a': buildClubProfile({ clubId: 'club-a', displayName: 'Club A' }),
  'club-b': buildClubProfile({ clubId: 'club-b', displayName: 'Club B' }),
  'club-old': buildClubProfile({ clubId: 'club-old', displayName: 'Club Old' }),
}

const row = ({ clubId, teamSlot = 1, rank = 1 }) => ({
  clubId,
  teamSlot,
  teamUrl: `https://example.test/${clubId}`,
  officialTable: {
    rank,
    points: 10,
    goalsFor: 12,
    goalsAgainst: 4,
    teamGamePlayed: 5,
  },
})

const buildTeamSeason = ({
  teamId,
  clubId,
  targetLeagueId = leagueId,
  targetSeasonId = seasonId,
  withRoster = true,
  sourceSnapshotKey = 'roster-snapshot',
} = {}) => ({
  id: `${teamId}__${targetSeasonId}`,
  identity: {
    teamSeasonDocumentId: `${teamId}__${targetSeasonId}`,
    teamId,
    seasonId: targetSeasonId,
    seasonKey: '25/26',
    seasonStatus: 'active',
    clubId,
    birthYear: 2010,
    teamSlot: 1,
    externalTeamId: '',
    leagueId: targetLeagueId,
    ageGroupId: 'u16',
  },
  roster: {
    playersById: withRoster ? { 'player-1': { playerId: 'player-1' } } : {},
    pendingById: {},
    rosterImport: { sourceSnapshotKey },
    updatedAt,
  },
  stats: {
    statsLoadState: { status: 'missing', updatedAt: null },
  },
  movement: {
    transfersInById: {},
    transfersOutById: {},
    updatedAt: null,
  },
  teamTaskSignals: {
    offense: false,
    defense: true,
    updatedAt,
  },
})

const buildExistingLeague = ({ teamsById, tableState = 'LOADED' } = {}) => ({
  leagueId,
  names: {
    official: 'League One',
    display: 'League One',
    short: 'L1',
    source: 'League One',
  },
  region: 'north',
  ageGroupId: 'u16',
  ageGroupLabel: 'U16',
  level: 2,
  seasonsById: {
    [seasonId]: {
      seasonKey: '25/26',
      seasonStatus: 'active',
      birthYear: 2010,
      seasonUrl: 'https://example.test/league',
      leagueTotalRound: 18,
      gameDurationMinutes: 80,
      competitionRules: { configured: false },
      tableImportedAt: updatedAt,
      table: {
        tableState,
        teamsById: teamsById || {},
      },
      performanceCalculation: {
        engineVersion: 'test-engine',
        normalizationMode: 'AUTO',
        appliedFactor: null,
        calculatedAt: updatedAt,
      },
      updatedAt,
    },
  },
  timestamps: { createdAt: 'created', updatedAt },
})

const loadInput = () => ({
  league: {
    leagueId,
    names: {
      official: 'League One',
      display: 'League One',
      short: 'L1',
      source: 'League One',
    },
    region: 'north',
    ageGroupId: 'u16',
    ageGroupLabel: 'U16',
    level: 2,
  },
  season: {
    seasonId,
    seasonKey: '25/26',
    seasonStatus: 'active',
    birthYear: 2010,
    seasonUrl: 'https://example.test/league',
    leagueTotalRound: 18,
    competitionRules: { configured: false },
  },
  rows: [
    row({ clubId: 'club-a', teamSlot: 1, rank: 1 }),
    row({ clubId: 'club-b', teamSlot: 1, rank: 2 }),
  ],
  existingLeague: buildExistingLeague({
    teamsById: {
      'club-old_2010_1': {
        clubId: 'club-old',
        teamSlot: 1,
        teamUrl: '',
        officialTable: {},
      },
    },
  }),
  clubProfilesById: { ...clubProfilesById },
  existingTeamSeasons: [
    buildTeamSeason({ teamId: 'club-a_2010_1', clubId: 'club-a' }),
    buildTeamSeason({ teamId: 'club-old_2010_1', clubId: 'club-old' }),
  ],
  previousLeaguesCenterTeamsById: {
    'club-a_2010_1': {
      documentationState: 'ROSTER_ONLY',
      documentationStateUpdatedAt: 'original-leagues-center-time',
    },
  },
  previousClubsCenterTeamLocations: [{
    clubId: 'club-a',
    teamId: 'club-a_2010_1',
    team: {
      leagueId,
      documentationState: 'ROSTER_ONLY',
      documentationStateUpdatedAt: 'original-documentation-time',
    },
  }],
  createdAt: 'created',
  updatedAt,
  tableImportedAt: updatedAt,
  calculatedAt: updatedAt,
})

describe('leagueWritePlan.builder', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    buildLeaguePerformanceProjection.mockImplementation(({ context }) => (
      performanceFor(context.canonicalRows.map(item => item.teamId))
    ))
  })

  test('Open creates a NOT_LOADED season without Team writes', () => {
    const input = loadInput()
    const plan = buildLeagueOpenWritePlan({
      league: input.league,
      season: {
        ...input.season,
        seasonStatus: 'not_started',
        leagueTotalRound: null,
        gameDurationMinutes: 80,
      },
      existingLeague: {},
      existingTeamSeasons: [],
      previousLeaguesCenterTeamsById: {},
      previousClubsCenterTeamLocations: [],
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    })
    const openedSeason = plan.document.seasonsById[seasonId]

    expect(openedSeason.table).toEqual({
      tableState: 'NOT_LOADED',
      teamsById: {},
    })
    expect(openedSeason.tableImportedAt).toBeNull()
    expect(plan.teamSeasonCompetitionSnapshots).toEqual([])
    expect(plan.leaguesCenterProjection.season.tableState).toBe('NOT_LOADED')
    expect(plan.leaguesCenterProjection.season.teamsById).toEqual({})
    expect(plan.clubsCenterProjection.clubWrites).toEqual([])
  })

  test('Open does not replace a season whose table was already loaded', () => {
    const input = loadInput()

    expect(() => buildLeagueOpenWritePlan({
      league: input.league,
      season: input.season,
      existingLeague: input.existingLeague,
      existingTeamSeasons: input.existingTeamSeasons,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    })).toThrow('League season already exists')
  })

  test('Load builds all approved write payloads and uses defaults for a missing Team Season', () => {
    const plan = buildLeagueLoadWritePlan(loadInput())

    expect(plan.document.seasonsById[seasonId].table.teamsById).toHaveProperty('club-a_2010_1')
    expect(plan.document.seasonsById[seasonId].table.teamsById).toHaveProperty('club-b_2010_1')

    expect(plan.teamSeasonCompetitionSnapshots).toHaveLength(1)
    expect(plan.teamSeasonCompetitionSnapshots[0].teamId).toBe('club-a_2010_1')

    expect(plan.leaguesCenterProjection.season.teamsById['club-a_2010_1']).toMatchObject({
      documentationState: 'ROSTER_ONLY',
      documentationStateUpdatedAt: 'original-leagues-center-time',
      teamTaskSignals: { offense: false, defense: true, updatedAt },
    })
    expect(plan.leaguesCenterProjection.season.teamsById['club-b_2010_1']).toMatchObject({
      documentationState: 'NO_ROSTER',
      documentationStateUpdatedAt: null,
      teamTaskSignals: { offense: false, defense: false, updatedAt: null },
    })

    const clubA = plan.clubsCenterProjection.clubWrites.find(item => item.clubId === 'club-a')
    expect(clubA.upsertTeamsById['club-a_2010_1'].documentationStateUpdatedAt)
      .toBe('original-documentation-time')

    const clubB = plan.clubsCenterProjection.clubWrites.find(item => item.clubId === 'club-b')
    expect(clubB.upsertTeamsById['club-b_2010_1']).toMatchObject({
      documentationState: 'NO_ROSTER',
      transfers: {
        coverageStatus: 'NOT_LOADED',
        pending: { total: 0 },
      },
    })

    const oldClub = plan.clubsCenterProjection.clubWrites.find(item => item.clubId === 'club-old')
    expect(oldClub.deleteTeamIds).toEqual(['club-old_2010_1'])
  })

  test('Load blocks Approved State when a required ClubProfile is missing', () => {
    const input = loadInput()
    delete input.clubProfilesById['club-b']

    expect(() => buildLeagueLoadWritePlan(input)).toThrow(
      'Missing ClubProfile for League club club-b'
    )
  })

  test('Load repair rebuilds projections from the current canonical League only', () => {
    const input = loadInput()
    const loadPlan = buildLeagueLoadWritePlan(input)
    const repairPlan = buildLeagueLoadProjectionRepairPlan({
      leagueId,
      seasonId,
      existingLeague: loadPlan.document,
      clubProfilesById: input.clubProfilesById,
      existingTeamSeasons: input.existingTeamSeasons,
      previousLeaguesCenterTeamsById: input.previousLeaguesCenterTeamsById,
      previousClubsCenterTeamLocations: input.previousClubsCenterTeamLocations,
      updatedAt,
    })

    expect(repairPlan.canonicalWriteRequired).toBe(false)
    expect(repairPlan).not.toHaveProperty('document')
    expect(repairPlan.teamSeasonCompetitionSnapshots).toHaveLength(1)
    expect(repairPlan.leaguesCenterProjection.season.teamsById)
      .toHaveProperty('club-b_2010_1')
    expect(repairPlan.clubsCenterProjection.clubWrites)
      .toEqual(expect.arrayContaining([expect.objectContaining({ clubId: 'club-b' })]))
  })

  test('Clear resets snapshots and removes team projections while preserving the season in Centers', () => {
    const existingLeague = buildExistingLeague({
      teamsById: {
        'club-a_2010_1': {
          clubId: 'club-a',
          teamSlot: 1,
          teamUrl: 'https://example.test/a',
          officialTable: { rank: 1, points: 10, goalsFor: 12, goalsAgainst: 4, teamGamePlayed: 5 },
        },
      },
    })
    const existingTeamSeasons = [
      buildTeamSeason({ teamId: 'club-a_2010_1', clubId: 'club-a' }),
    ]

    const plan = buildLeagueTeamsClearWritePlan({
      leagueId,
      seasonId,
      existingLeague,
      existingTeamSeasons,
      updatedAt,
    })

    expect(plan.document.seasonsById[seasonId].table).toEqual({
      tableState: 'NOT_LOADED',
      teamsById: {},
    })
    expect(plan.teamSeasonCompetitionSnapshots[0].competitionSnapshot.officialTable)
      .toEqual({ rank: null, points: null, goalsFor: null, goalsAgainst: null, teamGamePlayed: null })
    expect(plan.leaguesCenterProjection.operation).toBe('UPSERT_SEASON')
    expect(plan.leaguesCenterProjection.season.teamsById).toEqual({})
    expect(plan.clubsCenterProjection.leagueOperation).toBe('UPSERT')
    expect(plan.clubsCenterProjection.clubWrites[0].deleteTeamIds).toEqual(['club-a_2010_1'])
  })

  test('Clear retry rebuilds affected targets from existing Team Seasons after canonical table is empty', () => {
    const existingLeague = buildExistingLeague({ teamsById: {}, tableState: 'NOT_LOADED' })
    const existingTeamSeasons = [
      buildTeamSeason({ teamId: 'club-a_2010_1', clubId: 'club-a' }),
    ]

    const plan = buildLeagueTeamsClearWritePlan({
      leagueId,
      seasonId,
      existingLeague,
      existingTeamSeasons,
      updatedAt,
    })

    expect(plan.affectedTeamIds).toEqual(['club-a_2010_1'])
    expect(plan.teamSeasonCompetitionSnapshots).toHaveLength(1)
    expect(plan.clubsCenterProjection.clubWrites[0].deleteTeamIds).toEqual(['club-a_2010_1'])
  })

  test('Delete removes Center projections and resets existing Team Season snapshots', () => {
    const existingLeague = buildExistingLeague({
      teamsById: {
        'club-a_2010_1': { clubId: 'club-a', teamSlot: 1 },
      },
    })
    const existingTeamSeasons = [
      buildTeamSeason({ teamId: 'club-a_2010_1', clubId: 'club-a' }),
    ]

    const plan = buildLeagueSeasonDeleteWritePlan({
      leagueId,
      seasonId,
      existingLeague,
      existingTeamSeasons,
      updatedAt,
    })

    expect(plan.canonicalWriteRequired).toBe(true)
    expect(plan.leaguesCenterProjection.operation).toBe('DELETE_SEASON')
    expect(plan.clubsCenterProjection.leagueOperation).toBe('DELETE')
    expect(plan.teamSeasonCompetitionSnapshots).toHaveLength(1)
    expect(plan.clubsCenterProjection.clubWrites[0].deleteTeamIds).toEqual(['club-a_2010_1'])
  })

  test('Delete retry after canonical removal remains a complete projection cleanup plan', () => {
    const existingTeamSeasons = [
      buildTeamSeason({ teamId: 'club-a_2010_1', clubId: 'club-a' }),
    ]

    const plan = buildLeagueSeasonDeleteWritePlan({
      leagueId,
      seasonId,
      existingLeague: null,
      existingTeamSeasons,
      updatedAt,
    })

    expect(plan.canonicalWriteRequired).toBe(false)
    expect(plan.document).toBeNull()
    expect(plan.teamSeasonCompetitionSnapshots).toHaveLength(1)
    expect(plan.leaguesCenterProjection).toMatchObject({
      operation: 'DELETE_LEAGUE',
      leagueId,
      seasonId,
    })
    expect(plan.clubsCenterProjection).toMatchObject({
      leagueOperation: 'DELETE',
      leagueId,
      seasonId,
    })
    expect(plan.clubsCenterProjection).not.toHaveProperty('seasonKey')
    expect(plan.clubsCenterProjection).not.toHaveProperty('seasonStatus')
  })
})
