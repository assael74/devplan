// src/features/playersDatabase/services/auditV2/stats/clear/auditClearStatsReceiptV2.test.js

import { buildClearStatsApprovedStateV2 } from '../../../../domain/statsV2/index.js'
import { prepareClearStatsForUiV2 } from '../../../../services/writeV2/stats/clear/prepareClearStatsForUi.flow.js'
import { readStatsCanonicalV2 } from '../readCanonical.js'
import { auditClearStatsV2 } from './auditClearStatsV2.js'
import { auditClearStatsReceiptV2 } from './auditClearStatsReceiptV2.js'
import { readClearStatsActualV2 } from './readClearStatsActual.js'

jest.mock('../../../../domain/statsV2/index.js', () => ({
  buildClearStatsApprovedStateV2: jest.fn(),
}))
jest.mock('../../../../services/writeV2/stats/clear/prepareClearStatsForUi.flow.js', () => ({
  prepareClearStatsForUiV2: jest.fn(),
}))
jest.mock('../readCanonical.js', () => ({ readStatsCanonicalV2: jest.fn() }))
jest.mock('./auditClearStatsV2.js', () => ({ auditClearStatsV2: jest.fn() }))
jest.mock('./readClearStatsActual.js', () => ({ readClearStatsActualV2: jest.fn() }))

test('rebuilds a read-only CLEAR_STATS expectation and returns general Audit findings', async () => {
  readStatsCanonicalV2.mockResolvedValue({ leagueId: 'league-1' })
  prepareClearStatsForUiV2.mockResolvedValue({ planType: 'clearStatsProposedPlan' })
  buildClearStatsApprovedStateV2.mockReturnValue({ stateType: 'clearStatsApprovedState' })
  readClearStatsActualV2.mockResolvedValue({ teamSeason: {} })
  auditClearStatsV2.mockReturnValue({
    checksCount: 2,
    failuresCount: 1,
    checks: [
      { targetType: 'teamSeason', docId: 'team-1__2026', check: 'canonical_stats_absent', status: 'failed', reason: 'not absent' },
      { targetType: 'league', docId: 'league-1', check: 'setFields.current', status: 'passed', reason: null },
    ],
  })

  const result = await auditClearStatsReceiptV2({
    birthTeamDocumentId: 'team-1',
    seasonKey: '2026',
  })

  expect(prepareClearStatsForUiV2).toHaveBeenCalledWith({
    birthTeamDocumentId: 'team-1',
    seasonKey: '2026',
    leagueId: 'league-1',
  })
  expect(result.coverage.complete).toBe(true)
  expect(result.findings).toEqual([
    expect.objectContaining({
      target: 'teamSeason',
      check: 'canonical_stats_absent',
    }),
  ])
})
