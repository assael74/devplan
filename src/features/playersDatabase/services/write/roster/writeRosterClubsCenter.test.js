// src/features/playersDatabase/services/write/roster/writeRosterClubsCenter.test.js

import { writeClubsCenter } from '../league/writeClubsCenter.js'
import { writeRosterClubsCenter } from './writeRosterClubsCenter.js'

jest.mock('../league/writeClubsCenter.js', () => ({
  writeClubsCenter: jest.fn(),
}))

describe('writeRosterClubsCenter', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    writeClubsCenter.mockResolvedValue({ written: true })
  })

  test('writes the local projection and every changed counterpart projection', async () => {
    const local = { seasonId: '2026_2027', leagueId: 'league-a' }
    const counterpartA = { seasonId: '2026_2027', leagueId: 'league-b' }
    const counterpartB = { seasonId: '2026_2027', leagueId: 'league-c' }

    const result = await writeRosterClubsCenter({
      approvedState: {
        clubsCenterProjection: local,
        counterpartClubsCenterProjections: [counterpartA, counterpartB],
      },
    })

    expect(writeClubsCenter.mock.calls).toEqual([
      [{ approvedState: { clubsCenterProjection: local }, refreshSignals: false }],
      [{ approvedState: { clubsCenterProjection: counterpartA }, refreshSignals: false }],
      [{ approvedState: { clubsCenterProjection: counterpartB }, refreshSignals: false }],
    ])
    expect(result).toMatchObject({ written: true, projectionsCount: 3 })
  })
})

jest.mock('../signals/refreshTeamSignalSummaries.js', () => ({
  refreshTeamSignalSummaries: jest.fn(async () => ({ teams: 1, documents: 3 })),
}))
