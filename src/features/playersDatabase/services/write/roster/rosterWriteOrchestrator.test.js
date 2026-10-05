// src/features/playersDatabase/services/write/roster/rosterWriteOrchestrator.test.js

import {
  completeWriteActionAudit,
  completeWriteActionStage,
  openWriteActionReceipt,
} from '../receipt/index.js'
import { auditRoster } from '../../audit/roster/index.js'
import {
  buildRosterLoadWritePlan,
} from '../../../domain/roster/index.js'
import { readRosterClearSources, readRosterLoadSources } from './readRosterWriteSources.js'
import { writeRosterCanonical } from './writeRosterCanonical.js'
import { writeRosterClubsCenter } from './writeRosterClubsCenter.js'
import { writeRosterCounterparts } from './writeRosterCounterparts.js'
import { writeRosterLeagueProjection } from './writeRosterLeagueProjection.js'
import { writeRosterLeaguesCenter } from './writeRosterLeaguesCenter.js'
import { writeRosterPlayerSearchIndexes } from './writeRosterPlayerSearchIndexes.js'
import { writeRosterPlayerSeasons } from './writeRosterPlayerSeasons.js'
import {
  clearRoster,
  loadRoster,
  prepareRosterLoad,
} from './rosterWriteOrchestrator.js'

jest.mock('../../../domain/roster/index.js', () => ({
  buildRosterClearWritePlan: jest.fn(),
  buildRosterLoadWritePlan: jest.fn(),
}))

jest.mock('./readRosterWriteSources.js', () => ({
  readRosterClearSources: jest.fn(),
  readRosterLoadSources: jest.fn(),
}))

jest.mock('../receipt/index.js', () => ({
  completeWriteActionAudit: jest.fn(),
  completeWriteActionStage: jest.fn(),
  failWriteActionStage: jest.fn(),
  getWriteActionReceipt: jest.fn(),
  openWriteActionReceipt: jest.fn(),
}))

jest.mock('../../audit/roster/index.js', () => ({ auditRoster: jest.fn() }))

jest.mock('./writeRosterCanonical.js', () => ({ writeRosterCanonical: jest.fn() }))
jest.mock('./writeRosterClubsCenter.js', () => ({ writeRosterClubsCenter: jest.fn() }))
jest.mock('./writeRosterCounterparts.js', () => ({ writeRosterCounterparts: jest.fn() }))
jest.mock('./writeRosterLeagueProjection.js', () => ({ writeRosterLeagueProjection: jest.fn() }))
jest.mock('./writeRosterLeaguesCenter.js', () => ({ writeRosterLeaguesCenter: jest.fn() }))
jest.mock('./writeRosterPlayerSearchIndexes.js', () => ({ writeRosterPlayerSearchIndexes: jest.fn() }))
jest.mock('./writeRosterPlayerSeasons.js', () => ({ writeRosterPlayerSeasons: jest.fn() }))

const approvedState = {
  actionType: 'rosterLoad',
  teamId: 'club-a_2010_1',
  teamSeasonDocumentId: 'club-a_2010_1__2025_2026',
  leagueId: 'league-1',
  clubId: 'club-a',
  seasonId: '2025_2026',
  canonical: {
    teamRoot: { identity: { clubId: 'club-a' } },
  },
}

const clearApprovedState = {
  ...approvedState,
  actionType: 'rosterClear',
}

const writers = [
  writeRosterCanonical,
  writeRosterCounterparts,
  writeRosterPlayerSeasons,
  writeRosterPlayerSearchIndexes,
  writeRosterLeagueProjection,
  writeRosterLeaguesCenter,
  writeRosterClubsCenter,
]

describe('rosterWriteOrchestrator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    readRosterLoadSources.mockResolvedValue({ sourceVersion: 1 })
    buildRosterLoadWritePlan.mockReturnValue(approvedState)
    openWriteActionReceipt.mockResolvedValue('receipt-1')
    completeWriteActionStage.mockResolvedValue(undefined)
    auditRoster.mockResolvedValue({
      findings: [],
      coverage: { complete: true, coveredTargets: ['teamSeason'] },
    })
    completeWriteActionAudit.mockResolvedValue({
      status: 'closed',
      executionStatus: 'succeeded',
      recoveryRequired: false,
    })
    writers.forEach(writer => writer.mockResolvedValue({ written: true }))
  })

  test('prepares Roster Load once from fresh sources', async () => {
    const input = { requestKey: 'request-1' }

    await expect(prepareRosterLoad({ input })).resolves.toBe(approvedState)
    expect(readRosterLoadSources).toHaveBeenCalledWith({ input })
    expect(buildRosterLoadWritePlan).toHaveBeenCalledWith({
      ...input,
      sourceVersion: 1,
    })
  })

  test('runs the target Roster stages from the supplied Approved State without preparing again', async () => {
    const onProgress = jest.fn()
    const result = await loadRoster({ approvedState, onProgress })

    expect(readRosterLoadSources).not.toHaveBeenCalled()
    expect(buildRosterLoadWritePlan).not.toHaveBeenCalled()
    expect(openWriteActionReceipt).toHaveBeenCalledWith(expect.objectContaining({
      actionType: 'rosterLoad',
      target: expect.objectContaining({
        domain: 'roster',
        teamId: approvedState.teamId,
        seasonId: approvedState.seasonId,
      }),
    }))
    writers.forEach(writer => expect(writer).toHaveBeenCalledWith({ approvedState }))
    expect(completeWriteActionStage.mock.calls.map(([call]) => call.stageId)).toEqual([
      'canonical',
      'counterparts',
      'playerSeasons',
      'playerSearchIndexes',
      'leagueProjection',
      'leaguesCenter',
      'clubsCenter',
    ])
    expect(result.receiptId).toBe('receipt-1')
    expect(auditRoster).toHaveBeenCalledWith({ approvedState })
    expect(completeWriteActionAudit).toHaveBeenCalledWith(expect.objectContaining({
      receiptId: 'receipt-1',
    }))
    expect(result.status).toBe('closed')
    expect(onProgress.mock.calls.map(([event]) => [event.type, event.stageId || ''])).toEqual([
      ['receiptOpened', ''],
      ['stageCompleted', 'canonical'],
      ['stageCompleted', 'counterparts'],
      ['stageCompleted', 'playerSeasons'],
      ['stageCompleted', 'playerSearchIndexes'],
      ['stageCompleted', 'leagueProjection'],
      ['stageCompleted', 'leaguesCenter'],
      ['stageCompleted', 'clubsCenter'],
      ['stageCompleted', 'audit'],
    ])
  })

  test('Roster Load rejects execution without an Approved State', async () => {
    await expect(loadRoster()).rejects.toThrow('Roster Load requires an approved state')
    expect(openWriteActionReceipt).not.toHaveBeenCalled()
  })

  test('Roster Clear executes the Approved State without reading or rebuilding it', async () => {
    const result = await clearRoster({ approvedState: clearApprovedState })

    expect(readRosterClearSources).not.toHaveBeenCalled()
    expect(openWriteActionReceipt).toHaveBeenCalledWith(expect.objectContaining({
      actionType: 'rosterClear',
    }))
    expect(writeRosterCanonical).toHaveBeenCalledWith({ approvedState: clearApprovedState })
    expect(writeRosterCounterparts).not.toHaveBeenCalled()
    expect(result.approvedState).toBe(clearApprovedState)
  })

  test('Roster Clear rejects execution without an Approved State', async () => {
    await expect(clearRoster()).rejects.toThrow('Roster Clear requires an approved state')
    expect(openWriteActionReceipt).not.toHaveBeenCalled()
  })
})
