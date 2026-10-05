// src/features/playersDatabase/services/write/club/clubBootstrapOrchestrator.test.js

import { buildClubBootstrapApprovedState } from '../../../domain/club/bootstrapClubCatalog.builder.js'
import { auditClubBootstrap } from '../../audit/club/index.js'
import {
  completeWriteActionAudit,
  completeWriteActionStage,
  openWriteActionReceipt,
} from '../receipt/index.js'
import { readClubBootstrapSources } from './readClubBootstrapSources.js'
import { writeClubBootstrap } from './writeClubBootstrap.js'
import { bootstrapClubs } from './clubBootstrapOrchestrator.js'

jest.mock('../../../domain/club/bootstrapClubCatalog.builder.js', () => ({
  buildClubBootstrapApprovedState: jest.fn(),
}))
jest.mock('../../audit/club/index.js', () => ({ auditClubBootstrap: jest.fn() }))
jest.mock('../receipt/index.js', () => ({
  completeWriteActionAudit: jest.fn(),
  completeWriteActionStage: jest.fn(),
  failWriteActionStage: jest.fn(),
  openWriteActionReceipt: jest.fn(),
}))
jest.mock('./readClubBootstrapSources.js', () => ({ readClubBootstrapSources: jest.fn() }))
jest.mock('./writeClubBootstrap.js', () => ({ writeClubBootstrap: jest.fn() }))

describe('bootstrapClubs', () => {
  test('builds Approved State before Receipt and writes the atomic club state', async () => {
    const approvedState = {
      kind: 'clubBootstrapApprovedState',
      mode: 'create',
      profiles: [{ clubId: 'club-a' }],
      directory: { clubsById: { 'club-a': {} } },
      summary: { clubsCount: 1 },
    }
    readClubBootstrapSources.mockResolvedValue({ profiles: [], directory: null })
    buildClubBootstrapApprovedState.mockReturnValue(approvedState)
    openWriteActionReceipt.mockResolvedValue('receipt-1')
    writeClubBootstrap.mockResolvedValue({ written: true, clubsCount: 1 })
    completeWriteActionStage.mockResolvedValue(undefined)
    auditClubBootstrap.mockResolvedValue({
      findings: [],
      coverage: { complete: true, coveredTargets: ['clubProfiles', 'clubsDirectory'] },
    })
    completeWriteActionAudit.mockResolvedValue({
      status: 'closed',
      executionStatus: 'succeeded',
      recoveryRequired: false,
    })

    const result = await bootstrapClubs()

    expect(buildClubBootstrapApprovedState.mock.invocationCallOrder[0]).toBeLessThan(
      openWriteActionReceipt.mock.invocationCallOrder[0],
    )
    expect(writeClubBootstrap).toHaveBeenCalledWith({ approvedState })
    expect(openWriteActionReceipt).toHaveBeenCalledWith(expect.objectContaining({
      actionType: 'clubsBootstrap',
      target: { domain: 'clubs' },
    }))
    expect(result.status).toBe('closed')
  })
})
