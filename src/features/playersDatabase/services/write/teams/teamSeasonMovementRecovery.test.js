jest.mock('./teamSeasonMovementProjection.js', () => ({
  reconcileTeamSeasonMovementCounterpartsWithClubRefresh: jest.fn(),
}))

import { reconcileTeamSeasonMovementCounterpartsWithClubRefresh } from './teamSeasonMovementProjection.js'
import { retryTeamSeasonMovementCounterparts } from './teamSeasonMovementRecovery.js'

test('movement recovery uses the shared Club-refresh reconciliation path', async () => {
  reconcileTeamSeasonMovementCounterpartsWithClubRefresh.mockResolvedValue({ status: 'complete' })

  await expect(retryTeamSeasonMovementCounterparts({
    teamSeason: {
      seasonKey: '26/27', birthTeamDocumentId: 'team-b',
      transfersIn: [{
        movementId: 'movement-1', playerId: 'p1', fromBirthTeamDocumentId: 'team-a',
        counterpartSeasonKey: '25/26',
      }],
    },
  })).resolves.toEqual({ status: 'complete' })

  expect(reconcileTeamSeasonMovementCounterpartsWithClubRefresh).toHaveBeenCalledWith({
    requests: [expect.objectContaining({ counterpartSeasonKey: '25/26' })],
  })
})