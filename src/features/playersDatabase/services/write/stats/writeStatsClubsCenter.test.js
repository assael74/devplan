// src/features/playersDatabase/services/write/stats/writeStatsClubsCenter.test.js

import { setDoc } from 'firebase/firestore'

import { writeStatsClubsCenter } from './writeStatsClubsCenter.js'

jest.mock('firebase/firestore', () => ({
  FieldPath: class FieldPath {
    constructor(...segments) {
      this.segments = segments
    }
  },
  doc: jest.fn((db, collectionName, documentId) => ({ collectionName, documentId })),
  setDoc: jest.fn(() => Promise.resolve()),
}))

jest.mock('../../../../../services/firebase/firebase.js', () => ({
  db: { name: 'db' },
}))

describe('writeStatsClubsCenter', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setDoc.mockResolvedValue(undefined)
  })

  test('writes transfers for the local team and every counterpart team', async () => {
    const localTransfers = { external: { in: {} } }
    const counterpartTransfers = { external: { out: {} } }

    const result = await writeStatsClubsCenter({
      approvedState: {
        clubsCenterProjection: {
          seasonId: '2026_2027',
          clubId: 'club-a',
          teamId: 'club-a_2011_1',
          team: {
            documentationState: 'STATS_LOADED',
            documentationStateUpdatedAt: 'updated',
            teamTaskSignals: {},
            transfers: localTransfers,
            updatedAt: 'updated',
          },
          updatedAt: 'updated',
        },
        counterpartClubsCenterProjections: [{
          seasonId: '2026_2027',
          clubId: 'club-b',
          teamId: 'club-b_2011_1',
          team: {
            transfers: counterpartTransfers,
            updatedAt: 'updated',
          },
          updatedAt: 'updated',
        }],
      },
    })

    expect(setDoc).toHaveBeenCalledTimes(2)
    expect(setDoc.mock.calls[0][1].clubsById['club-a'].teamsById['club-a_2011_1'].transfers)
      .toEqual(localTransfers)
    expect(setDoc.mock.calls[1][1].clubsById['club-b'].teamsById['club-b_2011_1'].transfers)
      .toEqual(counterpartTransfers)
    expect(setDoc.mock.calls[1][2].mergeFields.map(field => field.segments || field))
      .not.toContainEqual(['clubsById', 'club-b', 'teamsById', 'club-b_2011_1', 'documentationState'])
    expect(result).toEqual({ written: true, counterpartCount: 1 })
  })
})

jest.mock('../signals/refreshTeamSignalSummaries.js', () => ({
  refreshTeamSignalSummaries: jest.fn(async () => ({ teams: 1, documents: 3 })),
}))
