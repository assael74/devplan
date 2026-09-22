jest.mock('./teamSeasonMovement.js', () => ({
  reconcileTeamSeasonMovementCounterparts: jest.fn(),
}))
jest.mock('../../read/entities/league.js', () => ({
  getLeagueById: jest.fn(),
}))
jest.mock('../../../domain/projections/teamPerformance.projection.js', () => ({
  buildLeagueTeamPerformanceProjection: jest.fn(() => ({})),
  resolveLeagueTeamPoints: jest.fn(() => 0),
}))
jest.mock('../clubs/index.js', () => ({
  syncClubProjectionFromTeamSeason: jest.fn(),
}))

import { reconcileTeamSeasonMovementCounterparts } from './teamSeasonMovement.js'
import { getLeagueById } from '../../read/entities/league.js'
import { syncClubProjectionFromTeamSeason } from '../clubs/index.js'
import { reconcileTeamSeasonMovementCounterpartsWithClubRefresh } from './teamSeasonMovementProjection.js'

describe('counterpart Club refresh', () => {
  test('does not refresh Club projections when the counterpart did not change', async () => {
    reconcileTeamSeasonMovementCounterparts.mockResolvedValue({
      status: 'no_op', results: [{ changed: false }],
    })

    await reconcileTeamSeasonMovementCounterpartsWithClubRefresh({ requests: [{}] })

    expect(getLeagueById).not.toHaveBeenCalled()
    expect(syncClubProjectionFromTeamSeason).not.toHaveBeenCalled()
  })

  test('refreshes Club and Clubs Master only after a changed counterpart', async () => {
    reconcileTeamSeasonMovementCounterparts.mockResolvedValue({
      status: 'complete',
      results: [{
        changed: true,
        teamSeasonDocumentId: 'team-a__25_26',
        teamSeason: {
          leagueId: 'league-a', seasonId: '25/26', seasonKey: '25/26',
          seasonStatus: 'completed', ageGroupId: 'u14', birthYear: 2012,
          birthTeamDocumentId: 'team-a', birthTeamId: 'team-a', clubId: 'club-a',
        },
      }],
    })
    getLeagueById.mockResolvedValue({ id: 'league-a', history: [] })
    syncClubProjectionFromTeamSeason.mockResolvedValue({ completed: true })

    const result = await reconcileTeamSeasonMovementCounterpartsWithClubRefresh({ requests: [{}] })

    expect(syncClubProjectionFromTeamSeason).toHaveBeenCalledTimes(1)
    expect(result.projectionResults[0]).toEqual(expect.objectContaining({
      teamSeasonDocumentId: 'team-a__25_26',
    }))
  })
})