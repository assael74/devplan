// src/features/playersDatabase/services/write/roster/writeRosterCanonical.notes.test.js

import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
import { writeRosterCanonical } from './writeRosterCanonical.js'

jest.mock('firebase/firestore', () => ({
  doc: (_db, collection, id) => ({ path: `${collection}/${id}` }),
  deleteField: () => ({ deleted: true }),
  deleteDoc: jest.fn(),
  setDoc: jest.fn(),
}))
jest.mock('../../../../../services/firebase/firebase.js', () => ({ db: {} }))
jest.mock('../../../../../services/firestore/usage/index.js', () => ({
  trackedRunTransaction: jest.fn(),
}))

const teamId = 'club_2012_1'
const seasonId = '2025_2026'
const teamSeasonDocumentId = `${teamId}__${seasonId}`
const teamRoot = {
  identity: { teamId },
  notes: { showInvestigationIndicator: false },
  seasonRefsById: { [seasonId]: { leagueId: 'league' } },
  timestamps: { updatedAt: 'new' },
}

test('roster reload updates its season ref without writing notes', async () => {
  const updates = []
  trackedRunTransaction.mockImplementation(async (_db, callback) => callback({
    get: async () => ({ exists: () => true, data: () => ({
      identity: { teamId },
      notes: { showInvestigationIndicator: true, performance: { reportsIds: ['report-1'] } },
      seasonRefsById: {},
    }) }),
    update: (_ref, patch) => updates.push(patch),
  }))

  await writeRosterCanonical({ approvedState: {
    teamId,
    seasonId,
    teamSeasonDocumentId,
    canonical: {
      teamRootOperation: 'SET',
      teamRoot,
      teamSeasonOperation: 'SET',
      teamSeason: { identity: { teamSeasonDocumentId, teamId, seasonId } },
    },
  } })

  expect(updates).toEqual([{
    [`seasonRefsById.${seasonId}`]: { leagueId: 'league' },
    'timestamps.updatedAt': 'new',
  }])
})

test('roster clear retains a root with an investigation indicator', async () => {
  const updates = []
  const deletes = []
  trackedRunTransaction.mockImplementation(async (_db, callback) => callback({
    get: async () => ({ exists: () => true, data: () => ({
      identity: { teamId },
      notes: { showInvestigationIndicator: true },
      seasonRefsById: { [seasonId]: { leagueId: 'league' } },
    }) }),
    update: (_ref, patch) => updates.push(patch),
    delete: ref => deletes.push(ref),
  }))

  await writeRosterCanonical({ approvedState: {
    teamId,
    seasonId,
    teamSeasonDocumentId,
    updatedAt: 'new',
    canonical: {
      teamRootOperation: 'DELETE',
      teamRoot: null,
      teamSeasonOperation: 'NONE',
    },
  } })

  expect(deletes).toEqual([])
  expect(updates[0][`seasonRefsById.${seasonId}`]).toEqual({ deleted: true })
})
