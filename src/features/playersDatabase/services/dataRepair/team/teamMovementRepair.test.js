jest.mock('../../read/entities/teamSeason.js', () => ({
  getTeamSeason: jest.fn(),
}))
jest.mock('../../write/teams/index.js', () => ({
  retryTeamSeasonMovementCounterparts: jest.fn(),
}))

import { AUDIT_REPAIR_TYPE } from '../../audit/audit.contract.js'
import { getTeamSeason } from '../../read/entities/teamSeason.js'
import { retryTeamSeasonMovementCounterparts } from '../../write/teams/index.js'
import { retryMovementCounterpartsFromAuditFindings } from './teamMovementRepair.js'

const finding = {
  repairType: AUDIT_REPAIR_TYPE.RETRY_MOVEMENT_COUNTERPART,
  teamDocumentId: 'team-target',
  seasonKey: '26-27',
  relationKey: 'movement-1',
}

beforeEach(() => {
  jest.clearAllMocks()
})

test('retries each audited Movement once and is safe to run repeatedly', async () => {
  getTeamSeason.mockResolvedValue({
    id: 'team-target__26-27',
    transfersIn: [
      { movementId: 'movement-1', playerId: 'p1' },
      { movementId: 'movement-2', playerId: 'p2' },
    ],
  })
  retryTeamSeasonMovementCounterparts.mockResolvedValue({
    status: 'complete',
    results: [{ movementId: 'movement-1', status: 'complete' }],
  })

  const first = await retryMovementCounterpartsFromAuditFindings({ findings: [finding, { ...finding }] })
  const second = await retryMovementCounterpartsFromAuditFindings({ findings: [finding] })

  expect(first).toMatchObject({ totalCount: 1, repairedCount: 1, failures: [] })
  expect(second).toMatchObject({ totalCount: 1, repairedCount: 1, failures: [] })
  expect(retryTeamSeasonMovementCounterparts).toHaveBeenCalledTimes(2)
  expect(retryTeamSeasonMovementCounterparts.mock.calls[0][0].teamSeason.transfersIn)
    .toEqual([{ movementId: 'movement-1', playerId: 'p1' }])
})

test('does not create or retry when the canonical local Team Season is gone', async () => {
  getTeamSeason.mockResolvedValue(null)

  const result = await retryMovementCounterpartsFromAuditFindings({ findings: [finding] })

  expect(result).toMatchObject({
    totalCount: 1,
    repairedCount: 0,
    skipped: [expect.objectContaining({ reason: 'LOCAL_TEAM_SEASON_MISSING' })],
  })
  expect(retryTeamSeasonMovementCounterparts).not.toHaveBeenCalled()
})
