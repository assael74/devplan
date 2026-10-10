// src/features/playersDatabase/services/write/stats/statsWriteOrchestrator.test.js

import { buildStatsLoadApprovedState } from '../../../domain/stats/index.js'
import { auditStats } from '../../audit/stats/index.js'
import {
  completeWriteActionAudit,
  completeWriteActionStage,
  openWriteActionReceipt,
} from '../receipt/index.js'
import { readStatsLoadSources } from './readStatsLoadSources.js'
import { writeStatsCanonical } from './writeStatsCanonical.js'
import { writeStatsClubsCenter } from './writeStatsClubsCenter.js'
import { writeStatsCounterparts } from './writeStatsCounterparts.js'
import { writeStatsLeagueProjection } from './writeStatsLeagueProjection.js'
import { writeStatsLeaguesCenter } from './writeStatsLeaguesCenter.js'
import { writeStatsPlayerRoots } from './writeStatsPlayerRoots.js'
import { writeStatsPlayerSearchIndexes } from './writeStatsPlayerSearchIndexes.js'
import { writeStatsPlayerSeasons } from './writeStatsPlayerSeasons.js'
import { loadStats, prepareStatsLoad } from './statsWriteOrchestrator.js'

jest.mock('../../../domain/stats/index.js', () => ({ buildStatsLoadApprovedState: jest.fn() }))
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
jest.mock('./writeStatsCounterparts.js', () => ({ writeStatsCounterparts: jest.fn() }))
jest.mock('./writeStatsLeagueProjection.js', () => ({ writeStatsLeagueProjection: jest.fn() }))
jest.mock('./writeStatsLeaguesCenter.js', () => ({ writeStatsLeaguesCenter: jest.fn() }))
jest.mock('./writeStatsPlayerRoots.js', () => ({ writeStatsPlayerRoots: jest.fn() }))
jest.mock('./writeStatsPlayerSearchIndexes.js', () => ({ writeStatsPlayerSearchIndexes: jest.fn() }))
jest.mock('./writeStatsPlayerSeasons.js', () => ({ writeStatsPlayerSeasons: jest.fn() }))

const approvedState = {
  actionType: 'statsLoad',
  leagueId: 'league-1',
  clubId: 'club-1',
  teamId: 'club-1_2011_1',
  seasonId: '2026_2027',
  teamSeasonDocumentId: 'club-1_2011_1__2026_2027',
  sourceSummary: {
    seasonKey: '26/27',
    incomingPlayersCount: 1,
  },
}

const writers = [
  writeStatsCanonical,
  writeStatsCounterparts,
  writeStatsPlayerRoots,
  writeStatsPlayerSeasons,
  writeStatsPlayerSearchIndexes,
  writeStatsLeagueProjection,
  writeStatsLeaguesCenter,
  writeStatsClubsCenter,
]

describe('statsWriteOrchestrator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    readStatsLoadSources.mockResolvedValue({ sourceVersion: 1 })
    buildStatsLoadApprovedState.mockReturnValue(approvedState)
    openWriteActionReceipt.mockResolvedValue('receipt-1')
    completeWriteActionStage.mockResolvedValue(undefined)
    auditStats.mockResolvedValue({ findings: [], coverage: { complete: true } })
    completeWriteActionAudit.mockResolvedValue({
      status: 'closed',
      executionStatus: 'succeeded',
      recoveryRequired: false,
    })
    writers.forEach(writer => writer.mockResolvedValue({ written: true }))
  })

  test('prepares once and executes the same Approved State without rereading sources', async () => {
    const input = {
      leagueId: 'league-1',
      teamId: 'club-1_2011_1',
      seasonId: '2026_2027',
      incomingPlayers: [{ externalPlayerId: '10000' }],
    }

    const plan = await prepareStatsLoad({ input })
    const onProgress = jest.fn()
    await loadStats({ approvedState: plan, receiptId: 'receipt-1', onProgress })

    expect(readStatsLoadSources).toHaveBeenCalledTimes(1)
    expect(buildStatsLoadApprovedState).toHaveBeenCalledTimes(1)
    writers.forEach(writer => expect(writer).toHaveBeenCalledTimes(1))
    expect(auditStats).toHaveBeenCalledTimes(1)
    expect(onProgress.mock.calls.map(([event]) => [event.type, event.stageId || ''])).toEqual([
      ['receiptOpened', ''],
      ['stageCompleted', 'canonical'],
      ['stageCompleted', 'counterparts'],
      ['stageCompleted', 'playerRoots'],
      ['stageCompleted', 'playerSeasons'],
      ['stageCompleted', 'playerSearchIndexes'],
      ['stageCompleted', 'leagueProjection'],
      ['stageCompleted', 'leaguesCenter'],
      ['stageCompleted', 'clubsCenter'],
      ['stageCompleted', 'audit'],
    ])
  })

  test('rejects execution without an Approved State', async () => {
    await expect(loadStats()).rejects.toThrow('Stats Load requires an approved state')
    expect(readStatsLoadSources).not.toHaveBeenCalled()
    writers.forEach(writer => expect(writer).not.toHaveBeenCalled())
  })
})
