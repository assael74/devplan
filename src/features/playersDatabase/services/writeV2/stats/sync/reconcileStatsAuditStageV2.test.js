jest.mock('../../../auditV2/stats/readCanonical.js', () => ({
  readStatsCanonicalV2: jest.fn(),
}))
jest.mock('../../../auditV2/stats/auditStatsV2.js', () => ({
  auditStatsV2: jest.fn(),
}))
jest.mock('../../../auditV2/stats/reconcileState.js', () => ({
  STATS_RECONCILE_STAGE: {
    PLAYER_DOCUMENTS: 'playerDocuments',
  },
  STATS_RECONCILE_TARGETS_BY_STAGE: {
    playerDocuments: ['playerDocument'],
  },
  buildStatsReconcileStageStateV2: jest.fn(),
  statsAuditHasTargetFindingV2: jest.fn(),
}))
jest.mock('../prepare/prepareStatsImportPlanV2.js', () => ({
  prepareStatsFinalSyncFromCanonicalV2: jest.fn(),
}))
jest.mock('../flows/statsFinalSync.flow.js', () => ({
  runStatsFinalSyncStageV2: jest.fn(),
}))
jest.mock('../../receipt/index.js', () => ({
  persistWriteActionAuditResultV2: jest.fn(),
}))

import { readStatsCanonicalV2 } from '../../../auditV2/stats/readCanonical.js'
import { auditStatsV2 } from '../../../auditV2/stats/auditStatsV2.js'
import {
  prepareStatsFinalSyncFromCanonicalV2,
} from '../prepare/prepareStatsImportPlanV2.js'
import {
  runStatsFinalSyncStageV2,
} from '../flows/statsFinalSync.flow.js'
import { persistWriteActionAuditResultV2 } from '../../receipt/index.js'
import {
  buildStatsReconcileStageStateV2,
  statsAuditHasTargetFindingV2,
} from '../../../auditV2/stats/reconcileState.js'
import { reconcileStatsAuditStageV2 } from './reconcileStatsAuditStageV2.js'

describe('reconcileStatsAuditStageV2 write boundary', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    readStatsCanonicalV2.mockResolvedValue({ birthTeamDocumentId: 'bt1', seasonKey: '26_27' })
    prepareStatsFinalSyncFromCanonicalV2.mockResolvedValue({ planType: 'approvedStatsState' })
    runStatsFinalSyncStageV2.mockResolvedValue({ updatedCount: 1 })
    persistWriteActionAuditResultV2.mockResolvedValue('open')
    buildStatsReconcileStageStateV2.mockImplementation(audit => [{
      stage: 'playerDocuments',
      status: audit?.findings?.length ? 'needs_sync' : 'clean',
      blockedBy: '',
    }])
    statsAuditHasTargetFindingV2.mockImplementation((audit, targets) => (
      (audit?.findings || []).some(row => targets.includes(row.target))
    ))
  })

  test('skips writer when Audit is already clean', async () => {
    auditStatsV2.mockResolvedValue({ findings: [] })

    const result = await reconcileStatsAuditStageV2({
      birthTeamDocumentId: 'bt1',
      seasonKey: '26_27',
      stage: 'playerDocuments',
      receiptId: 'r1',
    })

    expect(result.skipped).toBe(true)
    expect(runStatsFinalSyncStageV2).not.toHaveBeenCalled()
  })

  test('writes required stage and audits again', async () => {
    auditStatsV2
      .mockResolvedValueOnce({ findings: [{ target: 'playerDocument' }] })
      .mockResolvedValueOnce({ findings: [] })

    const result = await reconcileStatsAuditStageV2({
      birthTeamDocumentId: 'bt1',
      seasonKey: '26_27',
      stage: 'playerDocuments',
      receiptId: 'r1',
    })

    expect(result.skipped).toBe(false)
    expect(readStatsCanonicalV2).toHaveBeenCalledTimes(1)
    expect(runStatsFinalSyncStageV2).toHaveBeenCalledTimes(1)
    expect(auditStatsV2).toHaveBeenCalledTimes(2)
  })
})
