jest.mock('./readCanonical.js', () => ({
  readStatsCanonicalV2: jest.fn(),
}))
jest.mock('./index.js', () => ({
  auditStatsV2: jest.fn(),
}))
jest.mock('../../writeV2/stats/index.js', () => ({
  STATS_FINAL_SYNC_STAGE: {
    CANONICAL: 'canonical',
    COUNTERPARTS: 'counterparts',
    PLAYER_DOCUMENTS: 'playerDocuments',
    PLAYER_INDEXES: 'playerIndexes',
    TEAM_LEAGUE: 'teamLeague',
    CLUBS: 'clubs',
  },
  prepareStatsFinalSyncFromCanonicalV2: jest.fn(),
  runStatsFinalSyncStageV2: jest.fn(),
}))
jest.mock('../../writeV2/receipt/index.js', () => ({
  persistWriteActionAuditResultV2: jest.fn(),
}))

import { readStatsCanonicalV2 } from './readCanonical.js'
import { auditStatsV2 } from './index.js'
import {
  prepareStatsFinalSyncFromCanonicalV2,
  runStatsFinalSyncStageV2,
} from '../../writeV2/stats/index.js'
import {
  persistWriteActionAuditResultV2,
} from '../../writeV2/receipt/index.js'
import {
  buildStatsReconcileStageStateV2,
  reconcileStatsAuditStageV2,
  STATS_RECONCILE_STAGE,
} from './reconcileStage.js'

const cleanAudit = {
  coverage: {
    complete: true,
    coveredTargets: ['counterparts', 'playerDocuments'],
    uncoveredTargets: [],
  },
  findings: [],
}

const findingAudit = target => ({
  coverage: {
    complete: true,
    coveredTargets: [target],
    uncoveredTargets: [],
  },
  findings: [{ target, type: 'projection_mismatch' }],
})

const stateByStage = audit => Object.fromEntries(
  buildStatsReconcileStageStateV2(audit).map(row => [
    row.stage,
    row,
  ])
)

describe('Stats Audit V2 reconcile stage state', () => {
  test('groups Team + League findings into one Final Sync stage', () => {
    const state = stateByStage({
      findings: [
        { target: 'teamSearchIndex' },
        { target: 'leagueMetadata' },
        { target: 'leaguesMaster' },
      ],
    })

    expect(state[STATS_RECONCILE_STAGE.TEAM_LEAGUE].status)
      .toBe('needs_sync')
  })

  test('marks missing Team SearchIndex for Team + League sync', () => {
    const state = stateByStage({
      findings: [
        { target: 'teamSearchIndex', type: 'missing_projection' },
      ],
    })

    expect(state[STATS_RECONCILE_STAGE.TEAM_LEAGUE].status)
      .toBe('needs_sync')
  })

  test('blocks Clubs only while Counterparts needs sync', () => {
    const state = stateByStage({
      findings: [
        { target: 'counterpart' },
        { target: 'club' },
      ],
    })

    expect(state[STATS_RECONCILE_STAGE.COUNTERPARTS].status)
      .toBe('needs_sync')
    expect(state[STATS_RECONCILE_STAGE.CLUBS].status)
      .toBe('blocked')
    expect(state[STATS_RECONCILE_STAGE.CLUBS].blockedBy)
      .toBe(STATS_RECONCILE_STAGE.COUNTERPARTS)
  })

  test('does not block independent stages because Counterparts needs sync', () => {
    const state = stateByStage({
      findings: [
        { target: 'counterpart' },
        { target: 'playerSearchIndex' },
      ],
    })

    expect(state[STATS_RECONCILE_STAGE.PLAYER_INDEXES].status)
      .toBe('needs_sync')
    expect(state[STATS_RECONCILE_STAGE.PLAYER_DOCUMENTS].status)
      .toBe('clean')
    expect(state[STATS_RECONCILE_STAGE.TEAM_LEAGUE].status)
      .toBe('clean')
  })
})

describe('reconcileStatsAuditStageV2', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    persistWriteActionAuditResultV2.mockResolvedValue('open')
    readStatsCanonicalV2.mockResolvedValue({
      birthTeamDocumentId: 'bt1',
      seasonKey: '2026-27',
    })
    prepareStatsFinalSyncFromCanonicalV2.mockResolvedValue({
      planType: 'approvedStatsState',
      planVersion: 1,
    })
    runStatsFinalSyncStageV2.mockResolvedValue({ written: true })
  })

  test('clean preflight skips builder and writer and closes an open Receipt', async () => {
    auditStatsV2.mockResolvedValue(cleanAudit)

    const result = await reconcileStatsAuditStageV2({
      birthTeamDocumentId: 'bt1',
      seasonKey: '2026-27',
      stage: STATS_RECONCILE_STAGE.PLAYER_DOCUMENTS,
      receiptId: 'r1',
    })

    expect(result.skipped).toBe(true)
    expect(readStatsCanonicalV2).not.toHaveBeenCalled()
    expect(prepareStatsFinalSyncFromCanonicalV2).not.toHaveBeenCalled()
    expect(runStatsFinalSyncStageV2).not.toHaveBeenCalled()
    expect(persistWriteActionAuditResultV2).toHaveBeenCalledWith({
      receiptId: 'r1',
      audit: cleanAudit,
    })
  })

  test('writes one required stage, audits again, and closes Receipt when clean', async () => {
    auditStatsV2
      .mockResolvedValueOnce(findingAudit('playerDocument'))
      .mockResolvedValueOnce(cleanAudit)

    const result = await reconcileStatsAuditStageV2({
      birthTeamDocumentId: 'bt1',
      seasonKey: '2026-27',
      stage: STATS_RECONCILE_STAGE.PLAYER_DOCUMENTS,
      receiptId: 'r1',
    })

    expect(result.skipped).toBe(false)
    expect(readStatsCanonicalV2).toHaveBeenCalledTimes(1)
    expect(prepareStatsFinalSyncFromCanonicalV2).toHaveBeenCalledTimes(1)
    expect(prepareStatsFinalSyncFromCanonicalV2).toHaveBeenCalledWith({
      canonical: expect.objectContaining({ birthTeamDocumentId: 'bt1' }),
      stage: STATS_RECONCILE_STAGE.PLAYER_DOCUMENTS,
    })
    expect(runStatsFinalSyncStageV2).toHaveBeenCalledWith(expect.objectContaining({
      stage: STATS_RECONCILE_STAGE.PLAYER_DOCUMENTS,
    }))
    expect(auditStatsV2).toHaveBeenCalledTimes(2)
    expect(persistWriteActionAuditResultV2).toHaveBeenCalledTimes(1)
  })

  test('missing Team SearchIndex reaches canonical Prepare and teamLeague writer', async () => {
    auditStatsV2
      .mockResolvedValueOnce({
        coverage: { complete: true, coveredTargets: ['teamSearchIndex'], uncoveredTargets: [] },
        findings: [{ target: 'teamSearchIndex', type: 'missing_projection' }],
      })
      .mockResolvedValueOnce(cleanAudit)

    await reconcileStatsAuditStageV2({
      birthTeamDocumentId: 'bt1',
      seasonKey: '2026-27',
      stage: STATS_RECONCILE_STAGE.TEAM_LEAGUE,
      receiptId: 'r1',
    })

    expect(readStatsCanonicalV2).toHaveBeenCalledTimes(1)
    expect(prepareStatsFinalSyncFromCanonicalV2).toHaveBeenCalledWith({
      canonical: expect.objectContaining({ birthTeamDocumentId: 'bt1' }),
      stage: STATS_RECONCILE_STAGE.TEAM_LEAGUE,
    })
    expect(runStatsFinalSyncStageV2).toHaveBeenCalledWith(expect.objectContaining({
      stage: STATS_RECONCILE_STAGE.TEAM_LEAGUE,
    }))
  })

  test('keeps Receipt open and reports failure when post-write Audit still has a Finding', async () => {
    auditStatsV2
      .mockResolvedValueOnce(findingAudit('playerDocument'))
      .mockResolvedValueOnce(findingAudit('playerDocument'))

    await expect(reconcileStatsAuditStageV2({
      birthTeamDocumentId: 'bt1',
      seasonKey: '2026-27',
      stage: STATS_RECONCILE_STAGE.PLAYER_DOCUMENTS,
      receiptId: 'r1',
    })).rejects.toMatchObject({
      code: 'STATS_RECONCILE_FINDINGS_REMAIN',
      receiptStatus: 'open',
    })
    expect(persistWriteActionAuditResultV2).toHaveBeenCalledWith({
      receiptId: 'r1',
      audit: expect.objectContaining({ findings: expect.any(Array) }),
    })
  })

  test('delegates post-write Receipt lifecycle to the shared service', async () => {
    persistWriteActionAuditResultV2.mockResolvedValue('open')
    auditStatsV2
      .mockResolvedValueOnce(findingAudit('playerDocument'))
      .mockResolvedValueOnce(findingAudit('playerDocument'))

    await expect(reconcileStatsAuditStageV2({
      birthTeamDocumentId: 'bt1',
      seasonKey: '2026-27',
      stage: STATS_RECONCILE_STAGE.PLAYER_DOCUMENTS,
      receiptId: 'r1',
    })).rejects.toMatchObject({ receiptStatus: 'open' })
    expect(persistWriteActionAuditResultV2).toHaveBeenCalledTimes(1)
  })
})
