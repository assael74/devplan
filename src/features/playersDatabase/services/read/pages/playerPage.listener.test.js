// src/features/playersDatabase/services/read/pages/playerPage.listener.test.js

import { doc, onSnapshot } from 'firebase/firestore'

import {
  buildPlayerDocumentCacheKey,
  clearPlayersDatabaseDocumentCache,
  getDocumentStoreSnapshot,
} from '../../cache/index.js'
import { subscribePlayerPageData } from './playerPage.read.js'

jest.mock('firebase/firestore', () => ({
  doc: jest.fn((_db, collectionName, documentId) => ({
    path: `${collectionName}/${documentId}`,
  })),
  onSnapshot: jest.fn(),
}))
jest.mock('../../../../../services/firebase/firebase.js', () => ({ db: {} }))
jest.mock('../../../../../services/firestore/usage/index.js', () => ({
  trackedGetDoc: jest.fn(),
  trackFirestoreListenerClose: jest.fn(),
  trackFirestoreListenerOpen: jest.fn(),
  trackFirestoreListenerUpdate: jest.fn(),
}))
jest.mock('../../../domain/index.js', () => ({
  adaptPlayerDocumentSeason: jest.fn(({ seasonDocument, target }) => ({
    lifecycle: { type: target },
    season: {
      seasonId: seasonDocument.seasonId,
      seasonKey: seasonDocument.seasonKey,
    },
    team: { teamId: seasonDocument.teamId },
  })),
  normalizePlayerEventsState: jest.fn(() => []),
}))

const snapshot = ({ id, data }) => ({
  id,
  exists: () => data !== null,
  data: () => data,
  metadata: { fromCache: false },
})

beforeEach(() => {
  jest.clearAllMocks()
  clearPlayersDatabaseDocumentCache()
  doc.mockImplementation((_db, collectionName, documentId) => ({
    path: `${collectionName}/${documentId}`,
  }))
})

test('listens only to Player Root and referenced Player Seasons and replaces stale listeners', () => {
  const callbacks = new Map()
  const unsubscribes = new Map()
  onSnapshot.mockImplementation((reference, onValue) => {
    const unsubscribe = jest.fn()
    callbacks.set(reference.path, onValue)
    unsubscribes.set(reference.path, unsubscribe)
    return unsubscribe
  })

  const playerId = 'player__2010__12345'
  const stop = subscribePlayerPageData({ playerId })
  callbacks.get(`dbPlayers/${playerId}`)(snapshot({
    id: playerId,
    data: {
      identity: { playerId, externalPlayerId: '12345', fullName: 'Player' },
      seasonRefsById: {
        '2026_2027': {
          playerSeasonDocumentId: `playerSeason__${playerId}__2026_2027`,
        },
        '2025_2026': {
          playerSeasonDocumentId: `playerSeason__${playerId}__2025_2026`,
        },
      },
    },
  }))

  expect([...callbacks.keys()].sort()).toEqual([
    `dbPlayerSeasons/playerSeason__${playerId}__2025_2026`,
    `dbPlayerSeasons/playerSeason__${playerId}__2026_2027`,
    `dbPlayers/${playerId}`,
  ])
  expect([...callbacks.keys()].some(path => path.startsWith('dbSearchIndexes/'))).toBe(false)

  callbacks.get(`dbPlayers/${playerId}`)(snapshot({
    id: playerId,
    data: {
      identity: { playerId, externalPlayerId: '12345', fullName: 'Player' },
      seasonRefsById: {
        '2026_2027': {
          playerSeasonDocumentId: `playerSeason__${playerId}__2026_2027`,
        },
      },
    },
  }))
  expect(unsubscribes.get(
    `dbPlayerSeasons/playerSeason__${playerId}__2025_2026`
  )).toHaveBeenCalledTimes(1)

  stop()
  expect(unsubscribes.get(`dbPlayers/${playerId}`)).toHaveBeenCalledTimes(1)
  expect(unsubscribes.get(
    `dbPlayerSeasons/playerSeason__${playerId}__2026_2027`
  )).toHaveBeenCalledTimes(1)
})

test('keeps a missing Player Root missing and opens no fallback listener', () => {
  const callbacks = new Map()
  onSnapshot.mockImplementation((reference, onValue) => {
    callbacks.set(reference.path, onValue)
    return jest.fn()
  })

  const playerId = 'player__2010__missing'
  const stop = subscribePlayerPageData({ playerId })
  callbacks.get(`dbPlayers/${playerId}`)(snapshot({ id: playerId, data: null }))

  expect([...callbacks.keys()]).toEqual([`dbPlayers/${playerId}`])
  expect(getDocumentStoreSnapshot(buildPlayerDocumentCacheKey(playerId))).toMatchObject({
    status: 'ready',
    data: null,
  })
  stop()
})
