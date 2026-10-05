// src/features/playersDatabase/services/write/league/writeTeamSeasonCompetitionSnapshots.test.js

import { doc, updateDoc } from 'firebase/firestore'

import { writeTeamSeasonCompetitionSnapshots } from './writeTeamSeasonCompetitionSnapshots.js'

jest.mock('firebase/firestore', () => ({
  doc: jest.fn((db, collectionName, documentId) => ({
    collectionName,
    documentId,
  })),
  updateDoc: jest.fn(() => Promise.resolve()),
}))

jest.mock('../../../../../services/firebase/firebase.js', () => ({
  db: { name: 'db' },
}))

const buildSnapshot = () => ({
  teamUrl: 'https://example.test/team',
  clubLevel: 2,
  clubStrengthLevel: 3,
  officialTable: {
    rank: 1,
    points: 10,
    goalsFor: 12,
    goalsAgainst: 4,
    teamGamePlayed: 5,
  },
  updatedAt: '2026-10-02T09:00:00.000Z',
})

describe('writeTeamSeasonCompetitionSnapshots', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    doc.mockImplementation((db, collectionName, documentId) => ({
      collectionName,
      documentId,
    }))
    updateDoc.mockResolvedValue(undefined)
  })

  test('updates only competitionSnapshot on an existing Team Season target', async () => {
    const competitionSnapshot = buildSnapshot()

    const result = await writeTeamSeasonCompetitionSnapshots({
      approvedState: {
        seasonId: '2025_2026',
        teamSeasonCompetitionSnapshots: [
          {
            teamId: 'club-a_2010_1',
            teamSeasonDocumentId: 'club-a_2010_1__2025_2026',
            competitionSnapshot,
          },
        ],
      },
    })

    expect(doc).toHaveBeenCalledWith(
      { name: 'db' },
      'dbBirthTeamSeasons',
      'club-a_2010_1__2025_2026'
    )
    expect(updateDoc).toHaveBeenCalledWith(
      {
        collectionName: 'dbBirthTeamSeasons',
        documentId: 'club-a_2010_1__2025_2026',
      },
      { competitionSnapshot }
    )
    expect(result).toEqual({
      seasonId: '2025_2026',
      updatedTeamSeasons: 1,
    })
  })

  test('does not access Firestore when there are no existing Team Season targets', async () => {
    const result = await writeTeamSeasonCompetitionSnapshots({
      approvedState: {
        seasonId: '2025_2026',
        teamSeasonCompetitionSnapshots: [],
      },
    })

    expect(doc).not.toHaveBeenCalled()
    expect(updateDoc).not.toHaveBeenCalled()
    expect(result).toEqual({
      seasonId: '2025_2026',
      updatedTeamSeasons: 0,
    })
  })

  test('rejects a target whose Team Season document id is not canonical', async () => {
    await expect(writeTeamSeasonCompetitionSnapshots({
      approvedState: {
        seasonId: '2025_2026',
        teamSeasonCompetitionSnapshots: [
          {
            teamId: 'club-a_2010_1',
            teamSeasonDocumentId: 'wrong-id',
            competitionSnapshot: buildSnapshot(),
          },
        ],
      },
    })).rejects.toThrow('Team Season competitionSnapshot target identity mismatch')

    expect(doc).not.toHaveBeenCalled()
    expect(updateDoc).not.toHaveBeenCalled()
  })

  test('rejects a partial competitionSnapshot instead of leaving stale owned fields', async () => {
    await expect(writeTeamSeasonCompetitionSnapshots({
      approvedState: {
        seasonId: '2025_2026',
        teamSeasonCompetitionSnapshots: [
          {
            teamId: 'club-a_2010_1',
            teamSeasonDocumentId: 'club-a_2010_1__2025_2026',
            competitionSnapshot: {
              teamUrl: '',
              officialTable: {
                rank: null,
                points: null,
                goalsFor: null,
                goalsAgainst: null,
                teamGamePlayed: null,
              },
              updatedAt: null,
            },
          },
        ],
      },
    })).rejects.toThrow('Invalid Team Season competitionSnapshot projection')

    expect(updateDoc).not.toHaveBeenCalled()
  })
})
