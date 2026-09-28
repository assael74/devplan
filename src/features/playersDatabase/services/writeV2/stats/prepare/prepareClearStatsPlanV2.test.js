// src/features/playersDatabase/services/writeV2/stats/prepare/prepareClearStatsPlanV2.test.js

import {
  STATS_OWNED_RICH_SCOUT_FIELDS,
  buildStatsAbsentTeamSeasonState,
  getTeamSeasonStatsState,
} from '../../../../domain/statsV2/index.js'
import { prepareClearStatsPlanV2 } from './prepareClearStatsPlanV2.js'

const buildPresentTeamSeason = () => ({
  birthTeamDocumentId: 'team-1',
  seasonKey: '2026',
  leagueId: 'league-1',
  rosterStatus: 'loaded',
  transfersIn: [{ movementId: 'in-1' }],
  transfersOut: [{ movementId: 'out-1' }],
  pendingPlayers: [{ playerId: 'pending-1' }],
  tableRank: 2,
  tableAttackRank: 1,
  tableDefenseRank: 3,
  goalsForPerGame: 2.1,
  goalsAgainstPerGame: 0.9,
  teamStats: {
    teamGamePlayed: 10,
    goalsFor: 21,
    goalsAgainst: 9,
  },
  teamPlayers: [
    {
      playerId: 'p-1',
      fullName: 'Player One',
      rosterStatus: 'active',
      statsStatus: 'loaded',
      playerStats: {
        games: 10,
        goals: 3,
      },
      lineClassification: {
        line: 'ATTACK',
      },
      scoutSignals: [{ id: 'signal-1' }],
      scoutCombinations: [{ id: 'combination-1' }],
      primaryScoutProfileId: 'profile-1',
    },
    {
      playerId: 'p-2',
      fullName: 'Player Two',
      rosterStatus: 'active',
      statsStatus: 'loaded',
      playerStats: {
        games: 8,
        goals: 1,
      },
      scoutEvidence: [{ id: 'evidence-1' }],
    },
  ],
  scoutProfilesSummary: {
    total: 2,
    profileCounts: {
      profile: 2,
    },
  },
  statsLoadState: {
    status: 'loaded',
  },
})

const buildInput = () => ({
  teamRoot: {
    id: 'team-1',
    clubId: 'club-1',
  },
  teamSeason: buildPresentTeamSeason(),
  league: {
    id: 'league-1',
  },
  birthTeamDocumentId: 'team-1',
  seasonKey: '2026',
  leagueId: 'league-1',
})

describe('prepareClearStatsPlanV2', () => {
  test('fails when Team Root is missing', () => {
    expect(() => prepareClearStatsPlanV2({
      ...buildInput(),
      teamRoot: null,
    })).toThrow('Canonical Team Root is required for CLEAR_STATS')
  })

  test('fails when Team Season is missing', () => {
    expect(() => prepareClearStatsPlanV2({
      ...buildInput(),
      teamSeason: null,
    })).toThrow('Canonical Team Season is required for CLEAR_STATS')
  })

  test('builds an absent final preview from present Stats', () => {
    const plan = prepareClearStatsPlanV2(buildInput())

    expect(plan.currentStatsState).toBe('present')
    expect(plan.isIdempotent).toBe(false)
    expect(getTeamSeasonStatsState(plan.finalTeamSeasonPreview)).toBe('absent')
  })

  test('uses explicit setFields and unsetFields player patches', () => {
    const plan = prepareClearStatsPlanV2(buildInput())
    const patch = plan.canonicalMutation.playerOwnedPatches[0]

    expect(patch).toEqual(expect.objectContaining({
      playerKey: 'p-1',
      setFields: expect.objectContaining({
        statsStatus: 'missing',
        playerStats: expect.any(Object),
      }),
      unsetFields: expect.any(Array),
    }))
  })

  test('counts players whose displayed Scout profile will be cleared', () => {
    const plan = prepareClearStatsPlanV2(buildInput())

    expect(plan.impact.scoutProfilePlayersAffected).toBe(1)
    expect(plan.canonicalMutation.playerOwnedPatches[0].setFields).toEqual(
      expect.objectContaining({
        primaryScoutProfileId: '',
        professionalScoutProfileIds: [],
        preliminaryScoutProfileIds: [],
      })
    )
  })

  test('preserves roster membership and player order', () => {
    const input = buildInput()
    const plan = prepareClearStatsPlanV2(input)

    expect(plan.finalTeamSeasonPreview.teamPlayers.map(player => player.playerId))
      .toEqual(input.teamSeason.teamPlayers.map(player => player.playerId))
    expect(plan.finalTeamSeasonPreview.teamPlayers.map(player => player.rosterStatus))
      .toEqual(input.teamSeason.teamPlayers.map(player => player.rosterStatus))
  })

  test('preserves Movement collections', () => {
    const input = buildInput()
    const plan = prepareClearStatsPlanV2(input)

    expect(plan.finalTeamSeasonPreview.transfersIn).toEqual(input.teamSeason.transfersIn)
    expect(plan.finalTeamSeasonPreview.transfersOut).toEqual(input.teamSeason.transfersOut)
    expect(plan.finalTeamSeasonPreview.pendingPlayers).toEqual(input.teamSeason.pendingPlayers)
  })

  test('preserves Official Team Performance', () => {
    const input = buildInput()
    const plan = prepareClearStatsPlanV2(input)

    expect(plan.finalTeamSeasonPreview.tableRank).toBe(input.teamSeason.tableRank)
    expect(plan.finalTeamSeasonPreview.tableAttackRank).toBe(input.teamSeason.tableAttackRank)
    expect(plan.finalTeamSeasonPreview.tableDefenseRank).toBe(input.teamSeason.tableDefenseRank)
    expect(plan.finalTeamSeasonPreview.goalsForPerGame).toBe(input.teamSeason.goalsForPerGame)
    expect(plan.finalTeamSeasonPreview.goalsAgainstPerGame).toBe(input.teamSeason.goalsAgainstPerGame)
    expect(plan.finalTeamSeasonPreview.teamStats).toEqual(input.teamSeason.teamStats)
  })

  test('includes old and new rich scouting fields in unsetFields when present', () => {
    const input = buildInput()
    input.teamSeason.teamPlayers[0] = {
      ...input.teamSeason.teamPlayers[0],
      scoutProfileProgression: { id: 'new-field' },
      progression: { id: 'legacy-field' },
    }
    const plan = prepareClearStatsPlanV2(input)
    const unsetFields = plan.canonicalMutation.playerOwnedPatches[0].unsetFields

    expect(unsetFields).toEqual(expect.arrayContaining([
      'scoutSignals',
      'scoutCombinations',
      'scoutProfileProgression',
      'progression',
    ]))
    expect(unsetFields.every(field => STATS_OWNED_RICH_SCOUT_FIELDS.includes(field)))
      .toBe(true)
  })

  test('returns idempotent no-op when Stats are already absent', () => {
    const input = buildInput()
    input.teamSeason = buildStatsAbsentTeamSeasonState(input.teamSeason)
    const plan = prepareClearStatsPlanV2(input)

    expect(plan.currentStatsState).toBe('absent')
    expect(plan.isIdempotent).toBe(true)
    expect(plan.canonicalMutation).toBeNull()
    expect(plan.impact).toEqual({
      playersAffected: 0,
      scoutProfilePlayersAffected: 0,
      scoutingFieldsRemoved: 0,
    })
  })

  test('produces the same business plan for the same input', () => {
    const input = buildInput()

    expect(prepareClearStatsPlanV2(input)).toEqual(prepareClearStatsPlanV2(input))
  })
})

describe('prepareClearStatsPlanV2 identity validation', () => {
  const expectIdentityError = (input, code) => {
    try {
      prepareClearStatsPlanV2(input)
      throw new Error('Expected prepareClearStatsPlanV2 to fail')
    } catch (error) {
      expect(error.code).toBe(code)
    }
  }

  test('fails when birthTeamDocumentId is missing', () => {
    const input = buildInput()
    input.birthTeamDocumentId = ''
    input.teamRoot = {
      clubId: 'club-1',
    }
    input.teamSeason.birthTeamDocumentId = ''

    expectIdentityError(input, 'CLEAR_STATS_IDENTITY_REQUIRED')
  })

  test('fails when seasonKey is missing', () => {
    const input = buildInput()
    input.seasonKey = ''
    input.teamSeason.seasonKey = ''

    expectIdentityError(input, 'CLEAR_STATS_IDENTITY_REQUIRED')
  })

  test('fails when leagueId is missing', () => {
    const input = buildInput()
    input.leagueId = ''
    input.teamSeason.leagueId = ''
    input.league = {}

    expectIdentityError(input, 'CLEAR_STATS_IDENTITY_REQUIRED')
  })

  test('fails when birthTeamDocumentId conflicts with Canonical', () => {
    expectIdentityError({
      ...buildInput(),
      birthTeamDocumentId: 'team-other',
    }, 'CLEAR_STATS_IDENTITY_MISMATCH')
  })

  test('fails when seasonKey conflicts with Canonical', () => {
    expectIdentityError({
      ...buildInput(),
      seasonKey: '2025',
    }, 'CLEAR_STATS_IDENTITY_MISMATCH')
  })

  test('fails when leagueId conflicts with Canonical', () => {
    expectIdentityError({
      ...buildInput(),
      leagueId: 'league-other',
    }, 'CLEAR_STATS_IDENTITY_MISMATCH')
  })

  test('fails when clubId conflicts between Canonical Team Root and Team Season', () => {
    const input = buildInput()
    input.teamSeason.clubId = 'club-other'

    expectIdentityError(input, 'CLEAR_STATS_IDENTITY_MISMATCH')
  })

  test('fails on identity mismatch even when Stats are already absent', () => {
    const input = buildInput()
    input.teamSeason = buildStatsAbsentTeamSeasonState(input.teamSeason)
    input.leagueId = 'league-other'

    expectIdentityError(input, 'CLEAR_STATS_IDENTITY_MISMATCH')
  })
})
