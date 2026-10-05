// src/features/playersDatabase/services/read/entities/teamSeasonRosterHistory.test.js

import { getTeamById } from './team.js'
import { getTeamSeasonByDocumentId } from './teamSeason.js'
import { readTeamSeasonRosterHistory } from './teamSeasonRosterHistory.js'

jest.mock('./team.js', () => ({ getTeamById: jest.fn() }))
jest.mock('./teamSeason.js', () => ({ getTeamSeasonByDocumentId: jest.fn() }))

describe('readTeamSeasonRosterHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getTeamById.mockResolvedValue({
      seasonRefsById: {
        '2025_2026': {
          seasonKey: '25/26',
          teamSeasonDocumentId: 'team-1__2025_2026',
        },
        '2024_2025': {
          seasonKey: '24/25',
          teamSeasonDocumentId: 'team-1__2024_2025',
        },
      },
    })
    getTeamSeasonByDocumentId.mockImplementation(async documentId => ({
      identity: {
        teamSeasonDocumentId: documentId,
        seasonId: documentId.endsWith('2025_2026') ? '2025_2026' : '2024_2025',
      },
      roster: { playersById: {} },
      movement: {
        pendingById: { 'player__2011__10000': { playerId: 'player__2011__10000' } },
      },
    }))
  })

  test('uses the latest earlier season when the target season has no Team Season yet', async () => {
    const result = await readTeamSeasonRosterHistory({
      birthTeamDocumentId: 'team-1',
      seasonId: '2026_2027',
      seasonKey: '26/27',
    })

    expect(result.currentSeason).toBeNull()
    expect(result.previousSeason.seasonId).toBe('2025_2026')
    expect(result.previousSeason.pendingPlayers).toEqual([
      { playerId: 'player__2011__10000' },
    ])
  })
})
