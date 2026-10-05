// src/features/playersDatabase/services/write/stats/statsClearOrchestrator.test.js

import { buildStatsClearApprovedState } from '../../../domain/stats/index.js'
import { auditStats } from '../../audit/stats/index.js'
import {
  completeWriteActionAudit,
  completeWriteActionStage,
  failWriteActionStage,
  openWriteActionReceipt,
} from '../receipt/index.js'
import { readStatsLoadSources } from './readStatsLoadSources.js'
import { writeStatsCanonical } from './writeStatsCanonical.js'
import { writeStatsClubsCenter } from './writeStatsClubsCenter.js'
import { writeStatsLeagueProjection } from './writeStatsLeagueProjection.js'
import { writeStatsLeaguesCenter } from './writeStatsLeaguesCenter.js'
import { writeStatsPlayerRoots } from './writeStatsPlayerRoots.js'
import { writeStatsPlayerSearchIndexes } from './writeStatsPlayerSearchIndexes.js'
import { writeStatsPlayerSeasons } from './writeStatsPlayerSeasons.js'
import { clearStats, prepareStatsClear } from './statsClearOrchestrator.js'

jest.mock('../../../domain/stats/index.js', () => ({ buildStatsClearApprovedState: jest.fn() }))
jest.mock('../../audit/stats/index.js', () => ({ auditStats: jest.fn() }))
jest.mock('../receipt/index.js', () => ({
  completeWriteActionAudit: jest.fn(),
  completeWriteActionStage: jest.fn(),
  failWriteActionStage: jest.fn(() => Promise.resolve()),
  openWriteActionReceipt: jest.fn(),
}))
jest.mock('./readStatsLoadSources.js', () => ({ readStatsLoadSources: jest.fn() }))
jest.mock('./writeStatsCanonical.js', () => ({ writeStatsCanonical: jest.fn() }))
jest.mock('./writeStatsClubsCenter.js', () => ({ writeStatsClubsCenter: jest.fn() }))
jest.mock('./writeStatsLeagueProjection.js', () => ({ writeStatsLeagueProjection: jest.fn() }))
jest.mock('./writeStatsLeaguesCenter.js', () => ({ writeStatsLeaguesCenter: jest.fn() }))
jest.mock('./writeStatsPlayerRoots.js', () => ({ writeStatsPlayerRoots: jest.fn() }))
jest.mock('./writeStatsPlayerSearchIndexes.js', () => ({ writeStatsPlayerSearchIndexes: jest.fn() }))
jest.mock('./writeStatsPlayerSeasons.js', () => ({ writeStatsPlayerSeasons: jest.fn() }))

const approvedState = {
  actionType: 'statsClear',
  leagueId: 'league-1',
  clubId: 'club-1',
  teamId: 'club-1_2011_1',
  seasonId: '2026_2027',
  teamSeasonDocumentId: 'club-1_2011_1__2026_2027',
  sourceSummary: { seasonKey: '26/27' },
  impact: { playersAffected: 1 },
}

const writers = [
  writeStatsCanonical,
  writeStatsPlayerRoots,
  writeStatsPlayerSeasons,
  writeStatsPlayerSearchIndexes,
  writeStatsLeagueProjection,
  writeStatsLeaguesCenter,
  writeStatsClubsCenter,
]

describe('statsClearOrchestrator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    readStatsLoadSources.mockResolvedValue({ sourceVersion: 1 })
    buildStatsClearApprovedState.mockReturnValue(approvedState)
    openWriteActionReceipt.mockResolvedValue('receipt-1')
    completeWriteActionStage.mockResolvedValue(undefined)
    failWriteActionStage.mockResolvedValue(undefined)
    auditStats.mockResolvedValue({ status: 'CLEAN', findings: [], coverage: { complete: true } })
    completeWriteActionAudit.mockResolvedValue({
      status: 'closed',
      executionStatus: 'succeeded',
      recoveryRequired: false,
    })
    writers.forEach(writer => writer.mockResolvedValue({ written: 1 }))
  })

  test('prepares once and executes the same Approved State', async () => {
    const input = {
      leagueId: 'league-1',
      teamId: 'club-1_2011_1',
      seasonId: '2026_2027',
    }

    const plan = await prepareStatsClear({ input })
    await clearStats({ approvedState: plan })

    expect(buildStatsClearApprovedState.mock.invocationCallOrder[0])
      .toBeLessThan(openWriteActionReceipt.mock.invocationCallOrder[0])
    expect(openWriteActionReceipt.mock.invocationCallOrder[0])
      .toBeLessThan(writeStatsCanonical.mock.invocationCallOrder[0])
  })

  test('rejects execution without an Approved State', async () => {
    await expect(clearStats()).rejects.toThrow('Stats Clear requires an approved state')
    expect(readStatsLoadSources).not.toHaveBeenCalled()
    writers.forEach(writer => expect(writer).not.toHaveBeenCalled())
  })

  test('returns completed stages when a projection write fails', async () => {
    const failure = new Error('player season write failed')
    writeStatsPlayerSeasons.mockRejectedValueOnce(failure)

    let receivedError
    try {
      await clearStats({ approvedState })
    } catch (error) {
      receivedError = error
    }

    expect(receivedError).toEqual(expect.objectContaining({
      failedStep: 'playerSeasons',
      receiptId: 'receipt-1',
      canonicalWrite: expect.objectContaining({ playersAffected: 1 }),
      projectionWrite: expect.objectContaining({
        writesCompleted: 1,
        failedTarget: expect.objectContaining({
          targetType: 'playerSeasons',
          status: 'failed',
        }),
      }),
    }))
    expect(receivedError.projectionWrite.targets).toEqual([
      expect.objectContaining({ targetType: 'playerRoots', status: 'written' }),
    ])
  })

  test('identifies a receipt creation failure', async () => {
    openWriteActionReceipt.mockRejectedValueOnce(new Error('receipt failed'))

    await expect(clearStats({ approvedState })).rejects.toEqual(expect.objectContaining({
      failedStep: 'receipt',
    }))
  })
})
