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

test('reads the canonical Player Root by its exact id without alias fallback', async () => {
  trackedGetDoc.mockResolvedValue({
    exists: () => true,
    id: 'player__2010__12345',
    data: () => ({
      identity: {
        playerId: 'player__2010__12345',
        externalPlayerId: '12345',
        fullName: 'Player',
      },
      seasonRefsById: {},
    }),
  })

  const result = await readPlayerPageData({ playerId: 'player__2010__12345' })

  expect(result.identity.playerId).toBe('player__2010__12345')
  expect(trackedGetDoc).toHaveBeenCalledTimes(1)
  expect(trackedGetDocs).not.toHaveBeenCalled()
})

test('keeps a missing Player Root missing without SearchIndex or Team Season fallback', async () => {
  trackedGetDoc.mockResolvedValue({
    exists: () => false,
  })

  const result = await readPlayerPageData({ playerId: 'player__2010__12345' })

  expect(result).toBe(null)
  expect(trackedGetDoc).toHaveBeenCalledTimes(1)
  expect(trackedGetDocs).not.toHaveBeenCalled()
  expect(getTeamSeason).not.toHaveBeenCalled()
})

test('reads only Player Seasons referenced by the canonical Player Root', async () => {
  trackedGetDoc.mockImplementation(async reference => {
    if (reference.collectionName === 'dbPlayers') {
      return {
        exists: () => true,
        id: 'player__2010__12345',
        data: () => ({
          identity: { playerId: 'player__2010__12345', fullName: 'Player' },
          seasonRefsById: {
            '2026_2027': {
              playerSeasonDocumentId: 'playerSeason__player__2010__12345__2026_2027',
            },
          },
        }),
      }
    }
    return {
      exists: () => true,
      id: reference.id,
      data: () => ({
        identity: {
          seasonId: '2026_2027',
          seasonKey: '26/27',
          seasonStatus: 'active',
        },
        teamId: 'team-1',
        team: { clubId: 'club-1', leagueId: 'league-1' },
      }),
    }
  })

  const result = await readPlayerPageData({ playerId: 'player__2010__12345' })

  expect(result.seasons).toHaveLength(1)
  expect(trackedGetDoc).toHaveBeenCalledTimes(2)
  expect(trackedGetDocs).not.toHaveBeenCalled()
})
