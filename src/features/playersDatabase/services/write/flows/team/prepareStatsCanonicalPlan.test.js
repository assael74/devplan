jest.mock('../../../read/entities/teamSeasonRosterHistory.js', () => ({ readTeamSeasonRosterHistory: jest.fn() }))
jest.mock('../../../../model/team/teamIdentity.model.js', () => ({ resolveTeamLookupKey: jest.fn(() => 'team-a') }))
jest.mock('../../../../domain/movement/index.js', () => ({
  ROSTER_IMPORT_MODE: { PATCH: 'patch' },
  reconcileRosterMovement: jest.fn(() => ({ movement: 'stable', movementIds: ['m1'] })),
}))
jest.mock('../../teams/teamSeasonStats.js', () => ({ buildTeamStatsCanonicalCommit: jest.fn() }))

import { readTeamSeasonRosterHistory } from '../../../read/entities/teamSeasonRosterHistory.js'
import { reconcileRosterMovement } from '../../../../domain/movement/index.js'
import { buildTeamStatsCanonicalCommit } from '../../teams/teamSeasonStats.js'
import { buildStatsSourceFingerprint } from '../../teams/statsPlanFingerprint.js'
import { prepareStatsCanonicalPlan } from './prepareStatsCanonicalPlan.js'

const teamRoot = { seasons: [{ seasonKey: '24-25' }, { seasonKey: '25-26' }] }
const currentSeason = { rosterImport: { sourceSnapshotKey: 'snapshot-1', contentHash: 'hash-1' }, teamPlayers: [{ playerId: 'p1' }] }
const previousSeason = { teamPlayers: [{ playerId: 'p0' }] }

const input = {
  league: { id: 'league-1' },
  season: { seasonId: 'season-1', seasonKey: '25-26', seasonStatus: 'active' },
  team: { birthTeamDocumentId: 'team-a', name: 'Team A' },
  players: [{ playerId: 'p1', goals: 4 }],
  teamPerformance: { teamGamePlayed: 10 },
  teamPoints: 21,
  statsProjectionRevision: 'revision-1',
}

const canonicalCommit = {
  birthTeamDocumentId: 'team-a', teamDocumentId: 'team-a', teamSeasonDocumentId: 'team-a__25-26',
  seasonKey: '25-26', seasonId: 'season-1', seasonData: { canonical: true }, rootData: { canonical: true },
  players: [{ playerId: 'p1', goals: 4 }], movementState: { movementIds: ['m1'] },
}

describe('prepareStatsCanonicalPlan', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    readTeamSeasonRosterHistory.mockResolvedValue({
      teamRoot, currentSeason, previousSeason, previousSeasonKey: '24-25',
    })
    buildTeamStatsCanonicalCommit.mockImplementation(args => {
      const movementState = args.reconcileMovement({ currentSeason, previousSeason })
      return { ...canonicalCommit, movementState }
    })
  })

  test('builds one approved plan from the same canonical builder and snapshots', async () => {
    const plan = await prepareStatsCanonicalPlan(input)

    expect(readTeamSeasonRosterHistory).toHaveBeenCalledWith({
      birthTeamDocumentId: 'team-a', seasonKey: '25-26', bypassCache: true,
    })
    expect(buildTeamStatsCanonicalCommit).toHaveBeenCalledWith(expect.objectContaining({
      players: input.players,
      teamPerformance: input.teamPerformance,
      teamPoints: 21,
      statsProjectionRevision: 'revision-1',
      existingRoot: teamRoot,
      existingSeason: currentSeason,
      previousSeason,
    }))
    expect(reconcileRosterMovement).toHaveBeenCalledWith(expect.objectContaining({
      seasonKey: '25-26', incomingPlayers: input.players, currentSeason, previousSeason,
      rosterImport: expect.objectContaining({ sourceSnapshotKey: 'snapshot-1', contentHash: 'hash-1' }),
    }))
    expect(plan).toMatchObject({
      planType: 'approvedStatsCanonicalPlan', planVersion: 1,
      birthTeamDocumentId: 'team-a', seasonKey: '25-26', statsProjectionRevision: 'revision-1',
      canonicalCommit: expect.objectContaining({ movementState: { movement: 'stable', movementIds: ['m1'] } }),
    })
    expect(plan.sourceFingerprints).toEqual({
      teamRoot: buildStatsSourceFingerprint(teamRoot),
      currentSeason: buildStatsSourceFingerprint(currentSeason),
      previousSeason: buildStatsSourceFingerprint(previousSeason),
      previousSeasonKey: '24-25',
    })
  })

  test('is deterministic for identical snapshots and preserves Movement ids', async () => {
    const first = await prepareStatsCanonicalPlan(input)
    const second = await prepareStatsCanonicalPlan(input)

    expect(second.canonicalCommit).toEqual(first.canonicalCommit)
    expect(second.canonicalCommit.movementState.movementIds).toEqual(['m1'])
    expect(second.sourceFingerprints).toEqual(first.sourceFingerprints)
  })
})
