// src/features/playersDatabase/services/audit/league/readActual.test.js

import {
  collection,
  doc,
  query,
  where,
} from 'firebase/firestore'

import {
  trackedGetDocFromServer,
  trackedGetDocsFromServer,
} from '../../../../../services/firestore/usage/index.js'
import { readActualLeagueAudit, readClubProfiles } from './readActual.js'

jest.mock('firebase/firestore', () => ({
  collection: jest.fn((db, name) => ({ db, name })),
  doc: jest.fn((db, name, id) => ({ db, name, id })),
  query: jest.fn((...parts) => ({ parts })),
  where: jest.fn((field, op, value) => ({ field, op, value })),
}))

jest.mock('../../../../../services/firebase/firebase.js', () => ({ db: { id: 'db' } }))

jest.mock('../../../../../services/firestore/usage/index.js', () => ({
  trackedGetDocFromServer: jest.fn(),
  trackedGetDocsFromServer: jest.fn(),
}))

const missingSnapshot = () => ({ exists: () => false })

beforeEach(() => {
  jest.clearAllMocks()
  collection.mockImplementation((db, name) => ({ db, name }))
  doc.mockImplementation((db, name, id) => ({ db, name, id }))
  query.mockImplementation((...parts) => ({ parts }))
  where.mockImplementation((field, op, value) => ({ field, op, value }))
  trackedGetDocFromServer.mockResolvedValue(missingSnapshot())
  trackedGetDocsFromServer.mockResolvedValue({ docs: [] })
})

test('queries Team Seasons by leagueId and seasonId in Firestore', async () => {
  await readActualLeagueAudit({
    expected: { teamSeasonCompetitionSnapshots: [] },
    leagueId: 'league-1',
    seasonId: '2026_2027',
  })

  expect(where).toHaveBeenCalledWith('identity.leagueId', '==', 'league-1')
  expect(where).toHaveBeenCalledWith('identity.seasonId', '==', '2026_2027')
  expect(query).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({ field: 'identity.leagueId', value: 'league-1' }),
    expect.objectContaining({ field: 'identity.seasonId', value: '2026_2027' })
  )
  expect(collection).toHaveBeenCalled()
})

test('reads only requested ClubProfile documents directly from dbClubs', async () => {
  trackedGetDocFromServer
    .mockResolvedValueOnce({
      exists: () => true,
      id: 'club-a',
      data: () => ({ names: { display: 'A' } }),
    })
    .mockResolvedValueOnce({
      exists: () => true,
      id: 'club-b',
      data: () => ({ names: { display: 'B' } }),
    })

  const profiles = await readClubProfiles({ clubIds: ['club-a', 'club-b', 'club-a'] })

  expect(profiles).toMatchObject({
    'club-a': { names: { display: 'A' } },
    'club-b': { names: { display: 'B' } },
  })
  expect(doc).toHaveBeenCalledTimes(2)
})
