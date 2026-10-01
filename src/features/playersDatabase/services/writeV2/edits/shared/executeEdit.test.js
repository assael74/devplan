// src/features/playersDatabase/services/writeV2/edits/shared/executeEdit.test.js

import { trackedRunTransaction } from '../../../../../../services/firestore/usage/index.js'
import {
  clearPlayersDatabaseDocumentCache,
  getDocumentCacheEntry,
  getDocumentStoreSnapshot,
  setDocumentCacheValue,
} from '../../../cache/index.js'
import { executeEdit } from './executeEdit.js'

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
}))
jest.mock('../../../../../../services/firebase/firebase.js', () => ({ db: {} }))
jest.mock('../../../../../../services/firestore/usage/index.js', () => ({
  trackedGetDocFromServer: jest.fn(),
  trackedGetDocsFromServer: jest.fn(),
  trackedRunTransaction: jest.fn(),
}))

beforeEach(() => {
  jest.clearAllMocks()
  clearPlayersDatabaseDocumentCache()
})

test.each([
  'dbLeagues/league-1',
  'dbBirthTeams/team-1',
  'dbBirthTeamSeasons/team-season-1',
])('writing %s invalidates derived Team Page data while keeping its snapshot visible', async path => {
  const ref = { path }
  const transaction = {
    get: jest.fn(async () => ({
      exists: () => true,
      data: () => ({ value: 'before' }),
    })),
    update: jest.fn(),
  }
  trackedRunTransaction.mockImplementation(async (db, callback) => callback(transaction))
  setDocumentCacheValue({
    key: 'teamPage:league-1:team-1',
    value: { id: 'cached-team-page' },
  })

  await executeEdit({
    refs: [ref],
    build: () => [{ ref, patch: { value: 'after' } }],
  })

  expect(getDocumentStoreSnapshot('teamPage:league-1:team-1').data).toEqual({
    id: 'cached-team-page',
  })
  expect(getDocumentCacheEntry('teamPage:league-1:team-1')).toEqual({
    hit: false,
    value: null,
  })
})

test('successful League edit writes through the raw League cache instead of deleting it', async () => {
  const ref = { path: 'dbLeagues/league-1', id: 'league-1' }
  const transaction = {
    get: jest.fn(async () => ({
      exists: () => true,
      data: () => ({ id: 'league-1', value: 'before', keep: true }),
    })),
    update: jest.fn(),
  }
  trackedRunTransaction.mockImplementation(async (db, callback) => callback(transaction))
  setDocumentCacheValue({
    key: 'league:league-1',
    value: { id: 'league-1', value: 'before', keep: true },
  })

  await executeEdit({
    refs: [ref],
    build: () => [{ ref, patch: { value: 'after' } }],
  })

  const cached = getDocumentCacheEntry('league:league-1')
  expect(cached.hit).toBe(true)
  expect(cached.value).toMatchObject({
    id: 'league-1',
    value: 'after',
    keep: true,
  })
  expect(cached.value.updatedAt).toEqual(expect.any(String))
})

test('successful Player edit preserves the adapted Player snapshot but marks it invalid', async () => {
  const ref = { path: 'dbPlayers/external__12345', id: 'external__12345' }
  const transaction = {
    get: jest.fn(async () => ({
      exists: () => true,
      data: () => ({ agent: { status: 'unknown' } }),
    })),
    update: jest.fn(),
  }
  trackedRunTransaction.mockImplementation(async (db, callback) => callback(transaction))
  setDocumentCacheValue({
    key: 'player:external__12345',
    value: { identity: { playerDocumentId: 'external__12345' }, current: [] },
  })

  await executeEdit({
    refs: [ref],
    build: () => [{ ref, patch: { agent: { status: 'yes' } } }],
  })

  expect(getDocumentStoreSnapshot('player:external__12345').data).toEqual({
    identity: { playerDocumentId: 'external__12345' },
    current: [],
  })
  expect(getDocumentCacheEntry('player:external__12345')).toEqual({
    hit: false,
    value: null,
  })
})
