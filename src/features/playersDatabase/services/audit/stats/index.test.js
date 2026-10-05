// src/features/playersDatabase/services/audit/stats/index.test.js

import { buildStatsAuditExpected } from './buildExpected.js'
import { compareStatsAudit } from './compare.js'
import { auditStats } from './index.js'
import { readStatsAuditActual } from './readActual.js'

jest.mock('./buildExpected.js', () => ({ buildStatsAuditExpected: jest.fn() }))
jest.mock('./compare.js', () => ({ compareStatsAudit: jest.fn() }))
jest.mock('./readActual.js', () => ({ readStatsAuditActual: jest.fn() }))

test('audits approved non-roster player projections as well as roster players', async () => {
  readStatsAuditActual.mockResolvedValue({})
  buildStatsAuditExpected.mockReturnValue({ complete: true, reason: '', expected: {} })
  compareStatsAudit.mockReturnValue([])

  await auditStats({
    leagueId: 'league-1',
    teamId: 'team-1',
    seasonId: '2026_2027',
    approvedState: {
      playerRootPlans: [],
      playerSeasonPlans: [{ playerId: 'player-1' }],
      playerSearchIndexPlans: [{ playerId: 'player-1' }, { playerId: 'player-2' }],
    },
  })

  expect(readStatsAuditActual).toHaveBeenCalledWith(expect.objectContaining({
    playerIds: ['player-1', 'player-2'],
  }))
})
