// src/features/playersDatabase/services/auditV2/system/scouting/evaluate.test.js

jest.mock('../../../../domain/statsV2/teamSeasonStats.builder.js', () => ({
  buildStatsScoutedPlayer: jest.fn(),
}))

jest.mock('../../../../domain/projections/teamPerformance.projection.js', () => ({
  resolveLeagueSeasonStatus: jest.fn(),
  buildLeagueTeamPerformanceProjection: jest.fn(),
}))

jest.mock('../../../../domain/orchestration/buildLeagueTeamSeasons.js', () => ({
  buildLeagueTeamSeasons: jest.fn(),
}))

jest.mock('../../../../model/team/rosterStatus.model.js', () => ({
  isCurrentRosterPlayer: jest.fn(),
}))

import { buildStatsScoutedPlayer } from '../../../../domain/statsV2/teamSeasonStats.builder.js'
import {
  buildLeagueTeamPerformanceProjection,
  resolveLeagueSeasonStatus,
} from '../../../../domain/projections/teamPerformance.projection.js'
import { buildLeagueTeamSeasons } from '../../../../domain/orchestration/buildLeagueTeamSeasons.js'
import { isCurrentRosterPlayer } from '../../../../model/team/rosterStatus.model.js'
import { evaluateScoutingIntegrityV2 } from './evaluate.js'

const canonical = player => ({
  birthTeamDocumentId: 'team-1',
  leagueId: 'league-1',
  seasonKey: '26_27',
  teamRoot: { id: 'team-1', clubId: 'club-1', ageGroupId: 'u15' },
  teamSeason: {
    id: 'team-1__26_27',
    seasonKey: '26_27',
    seasonStatus: 'active',
    leagueId: 'league-1',
    teamGamePlayed: 999,
    teamPlayers: [player],
  },
  club: {
    id: 'club-1',
    clubId: 'club-1',
    name: 'Club 1',
    clubLevel: 2,
    clubStrengthLevel: 3,
  },
  league: {
    level: 4,
    ageGroupId: 'u15',
    current: {
      seasonKey: '26_27',
      seasonStatus: 'active',
      leagueLevel: 4,
      ageGroupId: 'u15',
      tableRank: [{ birthTeamDocumentId: 'team-1' }],
    },
    history: [],
  },
})

const matchingPlayer = overrides => ({
  playerId: 'p-1',
  statsStatus: 'loaded',
  rosterStatus: 'regular',
  primaryScoutProfileId: 'profile-1',
  primaryScoutProfileStrengthDepthPct: 80,
  professionalScoutProfileIds: ['profile-1'],
  preliminaryScoutProfileIds: ['pre-1'],
  scoutEffectiveImmediacyStatus: 'now',
  scoutPlayerInterestLevel: 'high',
  scoutEngineVersion: 'current-engine',
  expectedPrimaryScoutProfileId: 'profile-1',
  expectedPrimaryScoutProfileStrengthDepthPct: 80,
  expectedProfessionalScoutProfileIds: ['profile-1'],
  expectedPreliminaryScoutProfileIds: ['pre-1'],
  expectedScoutEffectiveImmediacyStatus: 'now',
  expectedScoutPlayerInterestLevel: 'high',
  expectedScoutEngineVersion: 'current-engine',
  ...overrides,
})

describe('evaluateScoutingIntegrityV2', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    buildStatsScoutedPlayer.mockImplementation(({ player }) => ({
      ...player,
      primaryScoutProfileId: player.expectedPrimaryScoutProfileId || '',
      primaryScoutProfileStrengthDepthPct:
        player.expectedPrimaryScoutProfileStrengthDepthPct ?? null,
      professionalScoutProfileIds: player.expectedProfessionalScoutProfileIds || [],
      preliminaryScoutProfileIds: player.expectedPreliminaryScoutProfileIds || [],
      scoutEffectiveImmediacyStatus: player.expectedScoutEffectiveImmediacyStatus || '',
      scoutPlayerInterestLevel: player.expectedScoutPlayerInterestLevel || '',
      scoutEngineVersion: player.expectedScoutEngineVersion || 'current-engine',
    }))
    resolveLeagueSeasonStatus.mockImplementation(({ league }) => (
      league?.current ? 'active' : league?.history?.length ? 'completed' : ''
    ))
    buildLeagueTeamPerformanceProjection.mockReturnValue({
      tableRank: 1,
      tableAttackRank: 1,
      tableDefenseRank: 1,
      teamGamePlayed: 10,
      goalsFor: 20,
      goalsAgainst: 5,
      goalsForPerGame: 2,
      goalsAgainstPerGame: 0.5,
    })
    buildLeagueTeamSeasons.mockReturnValue([{
      identity: { birthTeamDocumentId: 'team-1' },
      performance: { offense: { rank: 1 }, defense: { rank: 1 } },
    }])
    isCurrentRosterPlayer.mockImplementation(player => player?.rosterStatus !== 'left')
  })

  test('returns clean when all seven compact scout fields match', () => {
    const result = evaluateScoutingIntegrityV2({ canonical: canonical(matchingPlayer()) })

    expect(result.result).toBe('clean')
    expect(result.findings).toEqual([])
    expect(result.summary.checkedPlayers).toBe(1)
  })

  test('detects engine-version drift even when profile ids match', () => {
    const result = evaluateScoutingIntegrityV2({
      canonical: canonical(matchingPlayer({ scoutEngineVersion: 'old-engine' })),
    })

    expect(result.result).toBe('findings')
    expect(result.findings).toHaveLength(1)
    expect(result.findings[0].expected.scoutEngineVersion).toBe('current-engine')
    expect(result.findings[0].actual.scoutEngineVersion).toBe('old-engine')
  })

  test('feeds buildStatsScoutedPlayer from canonical League performance, not stored Team Season performance', () => {
    evaluateScoutingIntegrityV2({ canonical: canonical(matchingPlayer()) })

    expect(buildStatsScoutedPlayer).toHaveBeenCalledWith(expect.objectContaining({
      team: expect.objectContaining({
        teamGamePlayed: 10,
        goalsFor: 20,
        goalsAgainst: 5,
        leagueLevel: 4,
        clubLevel: 2,
        clubStrengthLevel: 3,
        ageGroupId: 'u15',
      }),
      season: expect.objectContaining({
        seasonStatus: 'active',
        leagueLevel: 4,
        ageGroupId: 'u15',
      }),
    }))
  })

  test('skips players without loaded stats and players outside the current roster', () => {
    const base = canonical(matchingPlayer({ statsStatus: 'missing' }))
    base.teamSeason.teamPlayers.push(matchingPlayer({
      playerId: 'p-2',
      rosterStatus: 'left',
    }))

    const result = evaluateScoutingIntegrityV2({ canonical: base })

    expect(result.result).toBe('clean')
    expect(result.summary).toMatchObject({
      rosterPlayers: 2,
      checkedPlayers: 0,
      skippedPlayers: 2,
      findingsCount: 0,
    })
  })

  test('fails explicitly when the canonical League season cannot be resolved', () => {
    expect(() => evaluateScoutingIntegrityV2({
      canonical: {
        ...canonical(matchingPlayer()),
        league: { current: null, history: [] },
      },
    })).toThrow('Scouting Integrity requires a canonical League season')
  })
})
