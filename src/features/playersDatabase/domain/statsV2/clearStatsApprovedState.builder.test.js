// src/features/playersDatabase/domain/statsV2/clearStatsApprovedState.builder.test.js

import { prepareClearStatsPlanV2 } from '../../services/writeV2/stats/prepare/prepareClearStatsPlanV2.js'
import { buildStatsAbsentTeamSeasonState } from './statsAbsence.builder.js'
import { buildClearStatsApprovedStateV2 } from './clearStatsApprovedState.builder.js'

const APPROVED_AT = '2026-09-27T12:00:00.000Z'

const buildPresentTeamSeason = () => ({
  birthTeamDocumentId: 'team-1',
  seasonKey: '2026',
  leagueId: 'league-1',
  rosterStatus: 'loaded',
  transfersIn: [{ movementId: 'in-1' }],
  transfersOut: [{ movementId: 'out-1' }],
  pendingPlayers: [{ playerId: 'pending-1' }],
  tableRank: 2,
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
      scoutSignals: [{ id: 'signal-1' }],
      progression: { id: 'legacy-progression' },
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

const buildPrepareInput = () => ({
  teamRoot: {
    id: 'team-1',
  },
  teamSeason: buildPresentTeamSeason(),
  league: {
    id: 'league-1',
  },
  birthTeamDocumentId: 'team-1',
  seasonKey: '2026',
  leagueId: 'league-1',
})

const buildPresentPlan = () => prepareClearStatsPlanV2(buildPrepareInput())

const buildAbsentPlan = () => {
  const input = buildPrepareInput()
  input.teamSeason = buildStatsAbsentTeamSeasonState(input.teamSeason)

  return prepareClearStatsPlanV2(input)
}

const approve = proposedPlan => buildClearStatsApprovedStateV2({
  proposedPlan,
  approvedAt: APPROVED_AT,
})

const expectCode = (callback, code) => {
  try {
    callback()
    throw new Error('Expected CLEAR_STATS approval to fail')
  } catch (error) {
    expect(error.code).toBe(code)
  }
}

describe('buildClearStatsApprovedStateV2', () => {
  test('freezes a valid present Proposed Plan', () => {
    const plan = buildPresentPlan()
    const approved = approve(plan)

    expect(approved).toEqual(expect.objectContaining({
      stateType: 'clearStatsApprovedState',
      stateVersion: 1,
      approvedAt: APPROVED_AT,
      flowType: 'stats',
      operationType: 'clear',
      label: 'CLEAR_STATS',
      currentStatsState: 'present',
      isIdempotent: false,
    }))
    expect(approved.canonicalMutation).toEqual(plan.canonicalMutation)
  })

  test('freezes a valid idempotent Proposed Plan without mutation', () => {
    const approved = approve(buildAbsentPlan())

    expect(approved.currentStatsState).toBe('absent')
    expect(approved.isIdempotent).toBe(true)
    expect(approved.canonicalMutation).toBeNull()
  })

  test('is detached from later Proposed Plan changes', () => {
    const plan = buildPresentPlan()
    const approved = approve(plan)

    plan.identity.leagueId = 'changed'
    plan.canonicalMutation.playerOwnedPatches[0].setFields.statsStatus = 'loaded'
    plan.impact.playersAffected = 999

    expect(approved.identity.leagueId).toBe('league-1')
    expect(approved.canonicalMutation.playerOwnedPatches[0].setFields.statsStatus)
      .toBe('missing')
    expect(approved.impact.playersAffected).not.toBe(999)
  })

  test('fails when approvedAt is missing', () => {
    expectCode(() => buildClearStatsApprovedStateV2({
      proposedPlan: buildPresentPlan(),
      approvedAt: '',
    }), 'CLEAR_STATS_APPROVED_AT_REQUIRED')
  })

  test.each([
    ['planType', 'other'],
    ['planVersion', 2],
    ['flowType', 'roster'],
    ['operationType', 'import'],
    ['label', 'OTHER'],
  ])('fails when %s is invalid', (field, value) => {
    const plan = buildPresentPlan()
    plan[field] = value

    expectCode(
      () => approve(plan),
      'CLEAR_STATS_APPROVED_PLAN_INVALID'
    )
  })

  test('fails when identity is incomplete', () => {
    const plan = buildPresentPlan()
    plan.identity.seasonKey = ''

    expectCode(
      () => approve(plan),
      'CLEAR_STATS_APPROVED_IDENTITY_REQUIRED'
    )
  })

  test.each([
    ['absent', false, null],
    ['absent', true, {}],
    ['present', true, {}],
    ['present', false, null],
  ])('fails for invalid state combination %s/%s', (
    currentStatsState,
    isIdempotent,
    canonicalMutation
  ) => {
    const plan = buildPresentPlan()
    plan.currentStatsState = currentStatsState
    plan.isIdempotent = isIdempotent
    plan.canonicalMutation = canonicalMutation

    expectCode(
      () => approve(plan),
      'CLEAR_STATS_APPROVED_STATE_CONTRACT_INVALID'
    )
  })

  test('fails when final preview is not absent', () => {
    const plan = buildPresentPlan()
    plan.finalTeamSeasonPreview = buildPresentTeamSeason()

    expectCode(
      () => approve(plan),
      'CLEAR_STATS_APPROVED_PREVIEW_INVALID'
    )
  })

  test('fails when playerKey is missing', () => {
    const plan = buildPresentPlan()
    plan.canonicalMutation.playerOwnedPatches[0].playerKey = ''

    expectCode(
      () => approve(plan),
      'CLEAR_STATS_APPROVED_PLAYER_KEY_INVALID'
    )
  })

  test('fails when playerKey is duplicated', () => {
    const plan = buildPresentPlan()
    plan.canonicalMutation.playerOwnedPatches[1].playerKey = (
      plan.canonicalMutation.playerOwnedPatches[0].playerKey
    )

    expectCode(
      () => approve(plan),
      'CLEAR_STATS_APPROVED_PLAYER_KEY_INVALID'
    )
  })

  test('fails when setFields contains a non Stats-owned field', () => {
    const plan = buildPresentPlan()
    plan.canonicalMutation.playerOwnedPatches[0].setFields.rosterStatus = 'inactive'

    expectCode(
      () => approve(plan),
      'CLEAR_STATS_APPROVED_SET_FIELD_FORBIDDEN'
    )
  })

  test('fails when unsetFields contains a non Stats-owned field', () => {
    const plan = buildPresentPlan()
    plan.canonicalMutation.playerOwnedPatches[0].unsetFields.push('position')

    expectCode(
      () => approve(plan),
      'CLEAR_STATS_APPROVED_UNSET_FIELD_FORBIDDEN'
    )
  })

  test('fails when teamOwnedSetFields contains an additional field', () => {
    const plan = buildPresentPlan()
    plan.canonicalMutation.teamOwnedSetFields.performance = { tableRank: 1 }

    expectCode(
      () => approve(plan),
      'CLEAR_STATS_APPROVED_TEAM_SET_FIELD_FORBIDDEN'
    )
  })

  test('fails when a preview player has no approved patch', () => {
    const plan = buildPresentPlan()
    plan.canonicalMutation.playerOwnedPatches.pop()
    plan.impact.playersAffected -= 1

    expectCode(
      () => approve(plan),
      'CLEAR_STATS_APPROVED_PLAYER_PATCH_COVERAGE_INVALID'
    )
  })

  test('fails when a patch targets a player outside the preview', () => {
    const plan = buildPresentPlan()
    plan.canonicalMutation.playerOwnedPatches[0].playerKey = 'foreign-player'

    expectCode(
      () => approve(plan),
      'CLEAR_STATS_APPROVED_PLAYER_PATCH_TARGET_INVALID'
    )
  })

  test('fails when a required player set field is missing', () => {
    const plan = buildPresentPlan()
    delete plan.canonicalMutation.playerOwnedPatches[0].setFields.statsStatus

    expectCode(
      () => approve(plan),
      'CLEAR_STATS_APPROVED_SET_FIELDS_INCOMPLETE'
    )
  })

  test('fails when an allowed player set field differs from the preview', () => {
    const plan = buildPresentPlan()
    plan.canonicalMutation.playerOwnedPatches[0].setFields.statsStatus = 'loaded'

    expectCode(
      () => approve(plan),
      'CLEAR_STATS_APPROVED_SET_FIELD_MISMATCH'
    )
  })

  test('fails when a required Team set field is missing', () => {
    const plan = buildPresentPlan()
    delete plan.canonicalMutation.teamOwnedSetFields.statsLoadState

    expectCode(
      () => approve(plan),
      'CLEAR_STATS_APPROVED_TEAM_SET_FIELDS_INCOMPLETE'
    )
  })

  test('fails when an allowed Team set field differs from the preview', () => {
    const plan = buildPresentPlan()
    plan.canonicalMutation.teamOwnedSetFields.statsLoadState = { status: 'loaded' }

    expectCode(
      () => approve(plan),
      'CLEAR_STATS_APPROVED_TEAM_SET_FIELD_MISMATCH'
    )
  })

  test('fails when mutation impact does not match the approved patches', () => {
    const plan = buildPresentPlan()
    plan.impact.playersAffected += 1

    expectCode(
      () => approve(plan),
      'CLEAR_STATS_APPROVED_IMPACT_MISMATCH'
    )
  })

  test('fails when idempotent impact is not zero', () => {
    const plan = buildAbsentPlan()
    plan.impact.scoutingFieldsRemoved = 1

    expectCode(
      () => approve(plan),
      'CLEAR_STATS_APPROVED_IMPACT_MISMATCH'
    )
  })

  test('preserves full patches and impact without rebuilding them', () => {
    const plan = buildPresentPlan()
    const approved = approve(plan)

    expect(approved.canonicalMutation.playerOwnedPatches)
      .toEqual(plan.canonicalMutation.playerOwnedPatches)
    expect(approved.canonicalMutation.teamOwnedSetFields)
      .toEqual(plan.canonicalMutation.teamOwnedSetFields)
    expect(approved.impact).toEqual(plan.impact)
  })
})
