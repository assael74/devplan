// src/features/playersDatabase/services/read/pages/playerPage.read.test.js

import {
  trackedGetDoc,
  trackedGetDocs,
} from '../../../../../services/firestore/usage/index.js'
import { doc } from 'firebase/firestore'
import {
  buildPlayerDocumentId,
  buildPlayerMatchValues,
  isCanonicalPlayerDocumentId,
  isValidExternalPlayerId,
} from '../../../model/player/playerIdentity.model.js'
import {
  adaptPlayerDocumentSeason,
  normalizePlayerEventsState,
} from '../../../domain/index.js'
import {
  buildPlayerDocumentCacheKey,
  clearPlayersDatabaseDocumentCache,
  getDocumentCacheResolvedKey,
} from '../../cache/index.js'
import { getTeamSeason } from '../entities/teamSeason.js'
import { readPlayerPageData } from './playerPage.read.js'

jest.mock('firebase/firestore', () => ({
  collection: jest.fn((db, collectionName) => ({ collectionName })),
  doc: jest.fn((db, collectionName, id) => ({ collectionName, id, path: `${collectionName}/${id}` })),
  query: jest.fn((...args) => ({ args })),
  where: jest.fn((...args) => ({ args })),
}))

jest.mock('../../../../../services/firebase/firebase.js', () => ({ db: {} }))
jest.mock('../../../../../services/firestore/usage/index.js', () => ({
  trackedGetDoc: jest.fn(),
  trackedGetDocs: jest.fn(),
}))
jest.mock('../entities/teamSeason.js', () => ({
  getTeamSeason: jest.fn(),
}))
jest.mock('../../../domain/index.js', () => ({
  adaptPlayerDocumentSeason: jest.fn(({ seasonDocument }) => seasonDocument),
  normalizePlayerEventsState: jest.fn(() => []),
}))
jest.mock('../../../model/player/playerIdentity.model.js', () => ({
  buildPlayerDocumentId: jest.fn(({ externalPlayerId }) => (
    externalPlayerId ? `external__${externalPlayerId}` : ''
  )),
  buildPlayerMatchValues: jest.fn(value => [
    value?.playerDocumentId,
    value?.playerId,
    value?.externalPlayerId,
    value?.id,
  ].filter(Boolean)),
  isCanonicalPlayerDocumentId: jest.fn(value => /^(external|name)__/.test(String(value || ''))),
  isValidExternalPlayerId: jest.fn(({ externalPlayerId }) => /^\d{5,}$/.test(String(externalPlayerId || ''))),
}))

beforeEach(() => {
  jest.clearAllMocks()
  doc.mockImplementation((db, collectionName, id) => ({
    collectionName,
    id,
    path: `${collectionName}/${id}`,
  }))
  buildPlayerDocumentId.mockImplementation(({ externalPlayerId }) => (
    externalPlayerId ? `external__${externalPlayerId}` : ''
  ))
  buildPlayerMatchValues.mockImplementation(value => [
    value?.playerDocumentId,
    value?.playerId,
    value?.externalPlayerId,
    value?.id,
  ].filter(Boolean))
  isCanonicalPlayerDocumentId.mockImplementation(value => /^(external|name)__/.test(String(value || '')))
  isValidExternalPlayerId.mockImplementation(({ externalPlayerId }) => /^\d{5,}$/.test(String(externalPlayerId || '')))
  adaptPlayerDocumentSeason.mockImplementation(({ seasonDocument }) => seasonDocument)
  normalizePlayerEventsState.mockImplementation(() => [])
  clearPlayersDatabaseDocumentCache()
})

test('legacy player id and canonical document id share one Store entry', async () => {
  trackedGetDoc.mockImplementation(async ref => ({
    exists: () => ref.id === 'external__12345',
    id: ref.id,
    data: () => ({
      playerDocumentId: 'external__12345',
      playerId: 'player__2010__12345',
      externalPlayerId: '12345',
      fullName: 'Player',
      current: [],
      history: [],
    }),
  }))

  const first = await readPlayerPageData({ playerId: 'player__2010__12345' })
  const second = await readPlayerPageData({ playerId: 'external__12345' })

  expect(first).toEqual(second)
  expect(trackedGetDoc).toHaveBeenCalledTimes(1)
  expect(getDocumentCacheResolvedKey(
    buildPlayerDocumentCacheKey('player__2010__12345')
  )).toBe(buildPlayerDocumentCacheKey('external__12345'))
})

test('missing Player Document uses SearchIndex scopes before legacy Team Seasons scan', async () => {
  trackedGetDoc.mockResolvedValue({
    exists: () => false,
  })
  trackedGetDocs.mockImplementation(async (queryRef, meta) => {
    if (meta?.action !== 'player-fallback-search-index-lookup') {
      throw new Error(`unexpected read: ${meta?.action}`)
    }

    return {
      docs: meta?.meta?.field === 'externalPlayerId' && meta?.meta?.value === '12345'
        ? [{
            id: 'index-1',
            data: () => ({
              entityType: 'playerSeason',
              playerDocumentId: 'external__12345',
              playerId: 'player__2010__12345',
              externalPlayerId: '12345',
              birthTeamDocumentId: 'team-root-1',
              seasonKey: '26/27',
            }),
          }]
        : [],
    }
  })
  getTeamSeason.mockResolvedValue({
    id: 'team-root-1__26_27',
    birthTeamDocumentId: 'team-root-1',
    seasonKey: '26/27',
    seasonStatus: 'active',
    teamPlayers: [{
      playerDocumentId: 'external__12345',
      playerId: 'player__2010__12345',
      externalPlayerId: '12345',
      fullName: 'Player',
      birthYear: 2010,
    }],
  })

  const result = await readPlayerPageData({ playerId: 'player__2010__12345' })

  expect(result?.identity?.playerDocumentId).toBe('external__12345')
  expect(trackedGetDocs.mock.calls[0]?.[1]?.meta).toEqual(expect.objectContaining({
    field: 'playerDocumentId',
    value: 'external__12345',
  }))
  expect(trackedGetDocs.mock.calls.map(([, meta]) => meta?.meta?.field)).toEqual([
    'playerDocumentId',
    'playerId',
    'externalPlayerId',
  ])
  expect(getTeamSeason).toHaveBeenCalledTimes(1)
  expect(getTeamSeason).toHaveBeenCalledWith({
    birthTeamDocumentId: 'team-root-1',
    seasonKey: '26/27',
  })
  expect(trackedGetDocs.mock.calls.some(([, meta]) => (
    meta?.action === 'player-legacy-fallback-team-seasons-scan'
  ))).toBe(false)
})


test('Player SearchIndex lookup stops after the deterministic playerDocumentId query succeeds', async () => {
  trackedGetDoc.mockResolvedValue({ exists: () => false })
  trackedGetDocs.mockImplementation(async (queryRef, meta) => ({
    docs: meta?.meta?.field === 'playerDocumentId' && meta?.meta?.value === 'external__12345'
      ? [{
          id: 'index-primary',
          data: () => ({
            playerDocumentId: 'external__12345',
            playerId: 'player__2010__12345',
            externalPlayerId: '12345',
            birthTeamDocumentId: 'team-root-1',
            seasonKey: '26/27',
          }),
        }]
      : [],
  }))
  getTeamSeason.mockResolvedValue({
    birthTeamDocumentId: 'team-root-1',
    seasonKey: '26/27',
    seasonStatus: 'active',
    teamPlayers: [{
      playerDocumentId: 'external__12345',
      playerId: 'player__2010__12345',
      externalPlayerId: '12345',
      fullName: 'Player',
      birthYear: 2010,
    }],
  })

  await readPlayerPageData({ playerId: 'player__2010__12345' })

  expect(trackedGetDocs).toHaveBeenCalledTimes(1)
  expect(trackedGetDocs.mock.calls[0]?.[1]?.meta).toEqual(expect.objectContaining({
    field: 'playerDocumentId',
    value: 'external__12345',
  }))
})
