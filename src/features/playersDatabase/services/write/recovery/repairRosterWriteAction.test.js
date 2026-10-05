// src/features/playersDatabase/services/write/recovery/repairRosterWriteAction.test.js

import { buildRosterProjectionRepairPlan } from '../../../domain/roster/index.js'
import { auditRoster } from '../../audit/roster/index.js'
import { readRosterClearSources } from '../roster/readRosterWriteSources.js'
import { writeRosterClubsCenter } from '../roster/writeRosterClubsCenter.js'
import { writeRosterCounterparts } from '../roster/writeRosterCounterparts.js'
import { writeRosterLeagueProjection } from '../roster/writeRosterLeagueProjection.js'
import { writeRosterLeaguesCenter } from '../roster/writeRosterLeaguesCenter.js'
import { writeRosterPlayerSearchIndexes } from '../roster/writeRosterPlayerSearchIndexes.js'
import { writeRosterPlayerSeasons } from '../roster/writeRosterPlayerSeasons.js'
import {
  beginWriteActionRepair,
  completeWriteActionAudit,
  completeWriteActionStage,
  getWriteActionReceipt,
} from '../receipt/index.js'
import { repairWriteActionReceipt } from './repairWriteAction.js'

jest.mock('firebase/firestore', () => ({ serverTimestamp: jest.fn(() => 'server-time') }))
jest.mock('../../../domain/league/index.js', () => ({
  buildLeagueLoadProjectionRepairPlan: jest.fn(),
  buildLeagueSeasonDeleteWritePlan: jest.fn(),
  buildLeagueTeamsClearWritePlan: jest.fn(),
}))
jest.mock('../../../domain/roster/index.js', () => ({
  buildRosterClearWritePlan: jest.fn(),
  buildRosterProjectionRepairPlan: jest.fn(),
}))
jest.mock('../../../domain/stats/index.js', () => ({
  buildStatsClearApprovedState: jest.fn(),
  buildStatsProjectionRepairApprovedState: jest.fn(),
}))
jest.mock('../../audit/league/index.js', () => ({ auditLeague: jest.fn() }))
jest.mock('../../audit/roster/index.js', () => ({ auditRoster: jest.fn() }))
jest.mock('../../audit/stats/index.js', () => ({ auditStats: jest.fn() }))
jest.mock('../receipt/index.js', () => ({
  beginWriteActionRepair: jest.fn(),
  completeWriteActionAudit: jest.fn(),
  completeWriteActionStage: jest.fn(),
  failWriteActionStage: jest.fn(),
  getWriteActionReceipt: jest.fn(),
}))
jest.mock('../league/readLeagueWriteSources.js', () => ({
  readLeagueLoadSources: jest.fn(),
  readLeagueMutationSources: jest.fn(),
}))
jest.mock('../roster/readRosterWriteSources.js', () => ({
  readRosterClearSources: jest.fn(),
}))
jest.mock('../stats/readStatsLoadSources.js', () => ({ readStatsLoadSources: jest.fn() }))
jest.mock('../league/writeClubsCenter.js', () => ({ writeClubsCenter: jest.fn() }))
jest.mock('../league/writeLeaguesCenter.js', () => ({ writeLeaguesCenter: jest.fn() }))
jest.mock('../league/writeTeamSeasonCompetitionSnapshots.js', () => ({
  writeTeamSeasonCompetitionSnapshots: jest.fn(),
}))
jest.mock('../roster/writeRosterClubsCenter.js', () => ({ writeRosterClubsCenter: jest.fn() }))
jest.mock('../roster/writeRosterCounterparts.js', () => ({ writeRosterCounterparts: jest.fn() }))
jest.mock('../roster/writeRosterLeagueProjection.js', () => ({ writeRosterLeagueProjection: jest.fn() }))
jest.mock('../roster/writeRosterLeaguesCenter.js', () => ({ writeRosterLeaguesCenter: jest.fn() }))
jest.mock('../roster/writeRosterPlayerSearchIndexes.js', () => ({
  writeRosterPlayerSearchIndexes: jest.fn(),
}))
jest.mock('../roster/writeRosterPlayerSeasons.js', () => ({ writeRosterPlayerSeasons: jest.fn() }))
jest.mock('../stats/writeStatsClubsCenter.js', () => ({ writeStatsClubsCenter: jest.fn() }))
jest.mock('../stats/writeStatsLeagueProjection.js', () => ({ writeStatsLeagueProjection: jest.fn() }))
jest.mock('../stats/writeStatsLeaguesCenter.js', () => ({ writeStatsLeaguesCenter: jest.fn() }))
jest.mock('../stats/writeStatsPlayerRoots.js', () => ({ writeStatsPlayerRoots: jest.fn() }))
jest.mock('../stats/writeStatsPlayerSearchIndexes.js', () => ({ writeStatsPlayerSearchIndexes: jest.fn() }))
jest.mock('../stats/writeStatsPlayerSeasons.js', () => ({ writeStatsPlayerSeasons: jest.fn() }))

test('repairs Roster counterparts and projections without reopening the canonical write', async () => {
  const approvedState = {
    actionType: 'rosterLoad',
    teamId: 'team-1',
    seasonId: '2026_2027',
    counterparts: [{ documentId: 'team-2__2026_2027', movement: {} }],
  }
  getWriteActionReceipt.mockResolvedValue({
    id: 'receipt-1',
    actionType: 'rosterLoad',
    status: 'open',
    executionStatus: 'failed',
    recoveryRequired: true,
    canonicalOutcome: 'confirmed',
    target: {
      leagueId: 'league-1',
      teamId: 'team-1',
      seasonId: '2026_2027',
    },
    progress: { completedByStage: { canonical: true } },
  })
  readRosterClearSources.mockResolvedValue({ existingTeamSeason: { timestamps: {} } })
  buildRosterProjectionRepairPlan.mockReturnValue(approvedState)
  const writers = [
    writeRosterCounterparts,
    writeRosterPlayerSeasons,
    writeRosterPlayerSearchIndexes,
    writeRosterLeagueProjection,
    writeRosterLeaguesCenter,
    writeRosterClubsCenter,
  ]
  writers.forEach(writer => writer.mockResolvedValue({ completed: true }))
  auditRoster.mockResolvedValue({ findings: [], coverage: { complete: true } })
  completeWriteActionAudit.mockResolvedValue({
    status: 'closed',
    executionStatus: 'succeeded',
    recoveryRequired: false,
  })

  const result = await repairWriteActionReceipt({ receiptId: 'receipt-1' })

  expect(readRosterClearSources).toHaveBeenCalledWith({
    input: {
      leagueId: 'league-1',
      teamId: 'team-1',
      seasonId: '2026_2027',
    },
    includeCounterparts: true,
  })
  expect(beginWriteActionRepair).toHaveBeenCalledWith({ receiptId: 'receipt-1' })
  expect(writeRosterCounterparts).toHaveBeenCalledWith({ approvedState })
  expect(completeWriteActionStage.mock.calls.map(([call]) => call.stageId)).toEqual([
    'counterparts',
    'playerSeasons',
    'playerSearchIndexes',
    'leagueProjection',
    'leaguesCenter',
    'clubsCenter',
  ])
  expect(result).toMatchObject({
    receiptId: 'receipt-1',
    status: 'closed',
    executionStatus: 'succeeded',
  })
})
