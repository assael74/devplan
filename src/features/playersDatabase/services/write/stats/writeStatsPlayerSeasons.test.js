// src/features/playersDatabase/services/write/stats/writeStatsPlayerSeasons.test.js

import { doc, setDoc } from 'firebase/firestore'

import { writeStatsPlayerSeasons } from './writeStatsPlayerSeasons.js'

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

const teamId = 'club-a_2011_1'
const documentId = 'playerSeason__player__2011__12345__2026_2027'
const projection = {
  identity: {
    playerSeasonDocumentId: documentId,
    playerId: 'player__2011__12345',
    seasonId: '2026_2027',
    seasonStatus: 'active',
  },
  teamId,
  team: {
    teamSeasonDocumentId: `${teamId}__2026_2027`,
    clubId: 'club-a',
    leagueId: 'league-a',
    stats: { statsStatus: 'loaded' },
    scouting: {},
    manual: { playerUrl: 'https://www.football.org.il/players/player/?player_id=12345', goalDistribution: {} },
    updatedAt: 'updated',
  },
}

describe('writeStatsPlayerSeasons', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    doc.mockImplementation((db, collectionName, targetDocumentId) => ({
      collectionName,
      documentId: targetDocumentId,
    }))
    setDoc.mockResolvedValue(undefined)
  })

  test('writes the full team context when the document exists but the team context is missing', async () => {
    await writeStatsPlayerSeasons({
      approvedState: {
        updatedAt: 'updated',
        playerSeasonPlans: [{
          documentId,
          exists: true,
          teamExists: false,
          projection,
        }],
      },
    })

    expect(setDoc).toHaveBeenCalledWith(
      expect.objectContaining({ documentId }),
      expect.objectContaining({ teamsById: { [teamId]: projection.team } }),
      expect.objectContaining({ mergeFields: expect.any(Array) })
    )
  })

  test('updates only Stats-owned fields when the team context already exists', async () => {
    await writeStatsPlayerSeasons({
      approvedState: {
        updatedAt: 'updated',
        playerSeasonPlans: [{
          documentId,
          exists: true,
          teamExists: true,
          projection,
        }],
      },
    })

    expect(setDoc).toHaveBeenCalledWith(
      expect.objectContaining({ documentId }),
      expect.objectContaining({
        teamsById: {
          [teamId]: {
            stats: projection.team.stats,
            scouting: projection.team.scouting,
            manual: { playerUrl: projection.team.manual.playerUrl },
            updatedAt: projection.team.updatedAt,
          },
        },
      }),
      expect.objectContaining({ mergeFields: expect.any(Array) })
    )
    const mergePaths = setDoc.mock.calls[0][2].mergeFields.map(path => path.segments)
    expect(mergePaths).toContainEqual(['teamsById', teamId, 'manual', 'playerUrl'])
    expect(mergePaths).not.toContainEqual(['teamsById', teamId, 'manual'])
  })
})
