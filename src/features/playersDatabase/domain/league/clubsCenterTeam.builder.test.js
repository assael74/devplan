// src/features/playersDatabase/domain/league/clubsCenterTeam.builder.test.js

import {
  buildCompetitionProjection,
  buildEffectiveCompetitionProjection,
} from '../projections/club/clubCompetition.projection.js'
import { buildClubsCenterTeamProjection } from './clubsCenterTeam.builder.js'

jest.mock('../projections/club/clubCompetition.projection.js', () => ({
  buildCompetitionProjection: jest.fn(),
  buildEffectiveCompetitionProjection: jest.fn(),
}))

const seasonId = '2025_2026'
const updatedAt = '2026-10-02T10:00:00.000Z'

const league = {
  leagueId: 'league-1',
  ageGroupId: 'u16',
  level: 2,
}

const season = {
  seasonId,
  seasonStatus: 'active',
  birthYear: 2010,
  leagueTotalRound: 18,
  competitionRules: { configured: false },
  table: {
    teamsById: {
      'club-a_2010_1': {
        clubId: 'club-a',
        teamSlot: 1,
        officialTable: {
          rank: 1,
          points: 10,
          teamGamePlayed: 5,
        },
      },
    },
  },
}

const teamRow = season.table.teamsById['club-a_2010_1']

const buildTeamSeason = ({
  playersById = {},
  sourceSnapshotKey = '',
  rosterUpdatedAt = null,
  statsStatus = 'missing',
  statsUpdatedAt = null,
  pendingById = {},
  transfersInById = {},
  transfersOutById = {},
} = {}) => ({
  roster: {
    playersById,
    pendingById,
    rosterImport: { sourceSnapshotKey },
    updatedAt: rosterUpdatedAt,
  },
  stats: {
    statsLoadState: {
      status: statsStatus,
      updatedAt: statsUpdatedAt,
    },
  },
  movement: {
    transfersInById,
    transfersOutById,
    updatedAt: updatedAt,
  },
  teamTaskSignals: {
    offense: true,
    defense: false,
    updatedAt,
  },
})

const build = ({ teamSeason = null, previousTeamProjection = null, targetSeason = season } = {}) => (
  buildClubsCenterTeamProjection({
    league,
    season: targetSeason,
    seasonId,
    teamId: 'club-a_2010_1',
    teamRow,
    teamSeason,
    previousTeamProjection,
    updatedAt,
  })
)

describe('buildClubsCenterTeamProjection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    buildCompetitionProjection.mockReturnValue({
      projectedNextLeagueLevel: 3,
      status: 'PROMOTION',
      source: 'AUTOMATIC',
    })
    buildEffectiveCompetitionProjection.mockImplementation(({ automaticProjection }) => (
      automaticProjection
    ))
  })

  test('uses defaults when Team Season is missing', () => {
    const result = build()

    expect(result.documentationState).toBe('NO_ROSTER')
    expect(result.documentationStateUpdatedAt).toBeNull()
    expect(result.transfers.coverageStatus).toBe('NOT_LOADED')
    expect(result.transfers.pending.total).toBe(0)
    expect(result.teamTaskSignals).toEqual({ offense: false, defense: false, updatedAt: null })
  })

  test('marks transfers NOT_LOADED when roster has not been officially imported', () => {
    const result = build({
      teamSeason: buildTeamSeason({
        playersById: { p1: { playerId: 'p1' } },
        sourceSnapshotKey: '',
        rosterUpdatedAt: 'roster-time',
      }),
    })

    expect(result.documentationState).toBe('ROSTER_ONLY')
    expect(result.transfers.coverageStatus).toBe('NOT_LOADED')
  })

  test('marks an officially loaded empty roster COMPLETE without inventing roster documentation', () => {
    const result = build({
      teamSeason: buildTeamSeason({
        playersById: {},
        sourceSnapshotKey: 'roster-snapshot-1',
        rosterUpdatedAt: 'roster-time',
      }),
    })

    expect(result.documentationState).toBe('NO_ROSTER')
    expect(result.transfers.coverageStatus).toBe('COMPLETE')
  })

  test('marks an officially loaded roster with players COMPLETE', () => {
    const result = build({
      teamSeason: buildTeamSeason({
        playersById: { p1: { playerId: 'p1' } },
        sourceSnapshotKey: 'roster-snapshot-1',
        rosterUpdatedAt: 'roster-time',
      }),
    })

    expect(result.documentationState).toBe('ROSTER_ONLY')
    expect(result.transfers.coverageStatus).toBe('COMPLETE')
  })

  test('aggregates external and internal movement and pending state', () => {
    const result = build({
      teamSeason: buildTeamSeason({
        sourceSnapshotKey: 'roster-snapshot-1',
        pendingById: {
          p1: { playerId: 'p1' },
          p2: { playerId: 'p2' },
        },
        transfersInById: {
          extIn: {
            scope: 'external',
            levelDirection: 'up',
            fromClubId: 'club-x',
          },
          intIn: {
            scope: 'internal',
            levelDirection: 'lateral',
            fromTeamId: 'club-a_2009_1',
          },
        },
        transfersOutById: {
          extOut: {
            scope: 'external',
            levelDirection: 'down',
            toClubId: 'club-y',
          },
          intOut: {
            scope: 'internal',
            levelDirection: 'unknown',
            toTeamId: 'club-a_2011_1',
          },
        },
      }),
    })

    expect(result.transfers.external.in.up.clubsById).toEqual({ 'club-x': 1 })
    expect(result.transfers.external.out.down.clubsById).toEqual({ 'club-y': 1 })
    expect(result.transfers.internal.in.lateral.teamsById).toEqual({ 'club-a_2009_1': 1 })
    expect(result.transfers.internal.out.unknown.teamsById).toEqual({ 'club-a_2011_1': 1 })
    expect(result.transfers.pending.total).toBe(2)
  })

  test('builds the competition projection from League canonical data', () => {
    const result = build()

    expect(buildCompetitionProjection).toHaveBeenCalledWith(expect.objectContaining({
      leagueLevel: 2,
      expectedGamesPerTeam: 18,
      competitionRules: season.competitionRules,
      targetTeam: expect.objectContaining({ teamId: 'club-a_2010_1' }),
    }))
    expect(result.competitionProjection).toEqual({
      effective: {
        projectedNextLeagueLevel: 3,
        status: 'PROMOTION',
        source: 'AUTOMATIC',
      },
    })
  })

  test('preserves a previous NO_ROSTER timestamp when an official empty roster is loaded again', () => {
    const result = build({
      teamSeason: buildTeamSeason({
        playersById: {},
        sourceSnapshotKey: 'roster-snapshot-2',
        rosterUpdatedAt: 'new-empty-roster-time',
      }),
      previousTeamProjection: {
        documentationState: 'NO_ROSTER',
        documentationStateUpdatedAt: 'original-no-roster-time',
      },
    })

    expect(result.documentationState).toBe('NO_ROSTER')
    expect(result.documentationStateUpdatedAt).toBe('original-no-roster-time')
    expect(result.transfers.coverageStatus).toBe('COMPLETE')
  })

  test('preserves documentationStateUpdatedAt when documentationState does not change', () => {
    const result = build({
      teamSeason: buildTeamSeason({
        playersById: { p1: { playerId: 'p1' } },
        sourceSnapshotKey: 'roster-snapshot-2',
        rosterUpdatedAt: 'new-roster-time',
      }),
      previousTeamProjection: {
        documentationState: 'ROSTER_ONLY',
        documentationStateUpdatedAt: 'original-state-time',
      },
    })

    expect(result.documentationState).toBe('ROSTER_ONLY')
    expect(result.documentationStateUpdatedAt).toBe('original-state-time')
  })

  test('uses the event timestamp when documentationState changes', () => {
    const result = build({
      teamSeason: buildTeamSeason({
        playersById: { p1: { playerId: 'p1' } },
        sourceSnapshotKey: 'roster-snapshot-2',
        rosterUpdatedAt: 'roster-time',
        statsStatus: 'loaded',
        statsUpdatedAt: 'stats-time',
      }),
      previousTeamProjection: {
        documentationState: 'ROSTER_ONLY',
        documentationStateUpdatedAt: 'old-state-time',
      },
    })

    expect(result.documentationState).toBe('STATS_LOADED')
    expect(result.documentationStateUpdatedAt).toBe('stats-time')
  })
})
