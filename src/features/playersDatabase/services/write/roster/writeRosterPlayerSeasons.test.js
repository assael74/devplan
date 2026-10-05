// src/features/playersDatabase/services/write/roster/writeRosterPlayerSeasons.test.js

import {
  deleteDoc,
  deleteField,
  doc,
  setDoc,
  updateDoc,
} from 'firebase/firestore'

import { writeRosterPlayerSeasons } from './writeRosterPlayerSeasons.js'

jest.mock('firebase/firestore', () => ({
  FieldPath: class FieldPath {
    constructor(...segments) {
      this.segments = segments
    }
  },
  deleteDoc: jest.fn(() => Promise.resolve()),
  deleteField: jest.fn(() => ({ deleteField: true })),
  doc: jest.fn((db, collectionName, documentId) => ({ collectionName, documentId })),
  setDoc: jest.fn(() => Promise.resolve()),
  updateDoc: jest.fn(() => Promise.resolve()),
}))

jest.mock('../../../../../services/firebase/firebase.js', () => ({
  db: { name: 'db' },
}))

const documentId = 'playerSeason__player__2010__12345__2025_2026'
const teamId = 'club-a_2010_1'

const document = {
  identity: {
    playerSeasonDocumentId: documentId,
    playerId: 'player__2010__12345',
    seasonId: '2025_2026',
    seasonKey: '25/26',
    seasonStatus: 'active',
  },
  teamsById: {
    [teamId]: { roster: { rosterStatus: 'regular' } },
  },
  timestamps: {
    createdAt: 'created',
    updatedAt: 'updated',
  },
}

describe('writeRosterPlayerSeasons', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    doc.mockImplementation((db, collectionName, targetDocumentId) => ({
      collectionName,
      documentId: targetDocumentId,
    }))
    setDoc.mockResolvedValue(undefined)
    updateDoc.mockResolvedValue(undefined)
    deleteDoc.mockResolvedValue(undefined)
  })

  test('creates a missing Player Season with catalog identity', async () => {
    await writeRosterPlayerSeasons({
      approvedState: {
        playerSeasons: [{
          documentId,
          teamId,
          operation: 'UPSERT_TEAM',
          exists: false,
          document,
        }],
      },
    })

    expect(setDoc).toHaveBeenCalledWith(
      expect.objectContaining({ documentId }),
      document
    )
  })

  test('updates only the affected team context on an existing Player Season', async () => {
    await writeRosterPlayerSeasons({
      approvedState: {
        playerSeasons: [{
          documentId,
          teamId,
          operation: 'UPSERT_TEAM',
          exists: true,
          document,
        }],
      },
    })

    expect(setDoc).toHaveBeenCalledWith(
      expect.objectContaining({ documentId }),
      expect.objectContaining({
        identity: document.identity,
        teamsById: { [teamId]: document.teamsById[teamId] },
      }),
      expect.objectContaining({ mergeFields: expect.any(Array) })
    )
  })

  test('removes only the affected team context when other contexts remain', async () => {
    await writeRosterPlayerSeasons({
      approvedState: {
        playerSeasons: [{
          documentId,
          teamId,
          operation: 'REMOVE_TEAM',
          updatedAt: 'updated',
        }],
      },
    })

    expect(deleteField).toHaveBeenCalledTimes(1)
    expect(updateDoc).toHaveBeenCalledTimes(1)
    expect(deleteDoc).not.toHaveBeenCalled()
  })
})
