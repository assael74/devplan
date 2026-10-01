// src/features/playersDatabase/services/read/entities/teamSeason.test.js

import { trackedGetDoc, trackedGetDocs } from '../../../../../services/firestore/usage/index.js'
import {
  clearPlayersDatabaseDocumentCache,
  getDocumentCacheEntry,
  buildTeamSeasonDocumentCacheKey,
  buildTeamSeasonsByRootCacheKey,
} from '../../cache/index.js'
import { listTeamSeasons } from './teamSeason.js'

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => ({ kind: 'collection' })),
  doc: jest.fn((db, collectionName, id) => ({ id, path: `${collectionName}/${id}` })),
  query: jest.fn((...args) => ({ args })),
  where: jest.fn((...args) => ({ args })),
}))

jest.mock('../../../../../services/firebase/firebase.js', () => ({ db: {} }))
jest.mock('../../../../../services/firestore/usage/index.js', () => ({
  trackedGetDoc: jest.fn(),
  trackedGetDocs: jest.fn(),
}))

beforeEach(() => {
  jest.clearAllMocks()
  clearPlayersDatabaseDocumentCache()
})

test('query scope primes returned Team Season documents and avoids per-document reads', async () => {
  trackedGetDocs.mockResolvedValue({
    docs: [
      { id: 'team-1__26_27', data: () => ({ birthTeamDocumentId: 'team-1', seasonKey: '26/27' }) },
      { id: 'team-1__25_26', data: () => ({ birthTeamDocumentId: 'team-1', seasonKey: '25/26' }) },
    ],
  })

  const first = await listTeamSeasons('team-1')
  const second = await listTeamSeasons('team-1')

  expect(first.map(item => item.id)).toEqual(['team-1__26_27', 'team-1__25_26'])
  expect(second).toEqual(first)
  expect(trackedGetDocs).toHaveBeenCalledTimes(1)
  expect(trackedGetDoc).not.toHaveBeenCalled()
  expect(getDocumentCacheEntry(buildTeamSeasonsByRootCacheKey('team-1')).value).toEqual([
    'team-1__26_27',
    'team-1__25_26',
  ])
  expect(getDocumentCacheEntry(buildTeamSeasonDocumentCacheKey('team-1__26_27')).hit).toBe(true)
  expect(getDocumentCacheEntry(buildTeamSeasonDocumentCacheKey('team-1__25_26')).hit).toBe(true)
})
