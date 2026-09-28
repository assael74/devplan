import {
  collection,
  doc,
  query,
  where,
} from 'firebase/firestore'

import {
  trackedGetDocFromServer,
  trackedGetDocsFromServer,
} from '../../../../../../services/firestore/usage/index.js'
import { prepareClearStatsPlanV2 } from '../prepare/prepareClearStatsPlanV2.js'
import { prepareClearStatsForUiV2 } from './prepareClearStatsForUi.flow.js'

jest.mock('firebase/firestore', () => ({
  collection: jest.fn((db, collectionName) => ({ collectionName })),
  doc: jest.fn((db, collectionName, id) => ({ collectionName, id })),
  query: jest.fn((reference, ...constraints) => ({ reference, constraints })),
  where: jest.fn((field, operator, value) => ({ field, operator, value })),
}))

jest.mock('../../../../../../services/firebase/firebase.js', () => ({ db: {} }))

jest.mock('../../../../../../services/firestore/usage/index.js', () => ({
  trackedGetDocFromServer: jest.fn(),
  trackedGetDocsFromServer: jest.fn(),
}))

jest.mock('../prepare/prepareClearStatsPlanV2.js', () => ({
  prepareClearStatsPlanV2: jest.fn(input => input),
}))

const found = (id, data) => ({
  id,
  exists: () => true,
  data: () => data,
})

const missing = id => ({
  id,
  exists: () => false,
  data: () => ({}),
})

const baseDocuments = {
  'team-1': { id: 'stored-team-id', clubId: 'club-1' },
  'team-1__2026': {
    id: 'stored-season-id',
    birthTeamDocumentId: 'team-1',
    seasonKey: '2026',
    leagueId: 'league-1',
    teamPlayers: [{ playerDocumentId: 'player-1' }],
  },
  'league-1': { id: 'stored-league-id', leagueId: 'league-1' },
  'player-1': { id: 'stored-player-id', current: [] },
  'birthTeamSeason__league-1__2026__team-1': {
    id: 'stored-team-index-id',
    entityType: 'birthTeamSeason',
    birthTeamDocumentId: 'team-1',
    seasonKey: '2026',
    leagueId: 'league-1',
  },
  'club-1': { id: 'stored-club-id', clubId: 'club-1', ageGroups: [] },
  all: { id: 'stored-master-id', clubs: [] },
}

beforeEach(() => {
  jest.clearAllMocks()
  prepareClearStatsPlanV2.mockImplementation(input => input)
  collection.mockImplementation((db, collectionName) => ({ collectionName }))
  doc.mockImplementation((db, collectionName, id) => ({ collectionName, id }))
  query.mockImplementation((reference, ...constraints) => ({ reference, constraints }))
  where.mockImplementation((field, operator, value) => ({ field, operator, value }))
  trackedGetDocFromServer.mockImplementation(async reference => {
    const data = baseDocuments[reference.id]
    return data ? found(reference.id, data) : missing(reference.id)
  })
  trackedGetDocsFromServer.mockResolvedValue({
    docs: [found('player-index-1', {
      id: 'stored-player-index-id',
      entityType: 'playerSeason',
      birthTeamDocumentId: 'team-1',
      seasonKey: '2026',
      leagueId: 'league-1',
    })],
  })
})

describe('prepareClearStatsForUiV2', () => {
  test('uses server reads, the approved targeted query and snapshot ids', async () => {
    const result = await prepareClearStatsForUiV2({
      birthTeamDocumentId: 'team-1',
      seasonKey: '2026',
      leagueId: 'league-1',
    })

    expect(where.mock.calls).toEqual([
      ['entityType', '==', 'playerSeason'],
      ['birthTeamDocumentId', '==', 'team-1'],
      ['seasonKey', '==', '2026'],
    ])
    expect(trackedGetDocsFromServer).toHaveBeenCalledWith(
      expect.objectContaining({ constraints: expect.any(Array) }),
      expect.objectContaining({
        operationSubtype: 'clear-stats-prepare-getDocsFromServer',
      })
    )
    expect(result.teamRoot.id).toBe('team-1')
    expect(result.teamSeason.id).toBe('team-1__2026')
    expect(result.projectionSources.playerDocumentsById).toHaveProperty('player-1')
    expect(result.projectionSources.playerDocumentsById['player-1'].id).toBe('player-1')
    expect(result.projectionSources.playerSearchIndexesById).toHaveProperty('player-index-1')
    expect(result.projectionSources.playerSearchIndexesById['player-index-1'].id).toBe('player-index-1')
    expect(result.projectionSources.teamSearchIndex.id)
      .toBe('birthTeamSeason__league-1__2026__team-1')
    expect(result.projectionSources.clubsById).toHaveProperty('club-1')
    expect(result.projectionSources.clubsMaster.id).toBe('all')
    expect(prepareClearStatsPlanV2).toHaveBeenCalledTimes(1)
    trackedGetDocFromServer.mock.calls.forEach(([, metadata]) => {
      expect(metadata.operationSubtype).toBe('clear-stats-prepare-getDocFromServer')
    })
  })

  test('rejects a queried Player SearchIndex whose remaining identity mismatches', async () => {
    trackedGetDocsFromServer.mockResolvedValue({
      docs: [found('player-index-1', {
        entityType: 'playerSeason',
        birthTeamDocumentId: 'team-1',
        seasonKey: '2026',
        leagueId: 'other-league',
      })],
    })

    await expect(prepareClearStatsForUiV2({
      birthTeamDocumentId: 'team-1',
      seasonKey: '2026',
      leagueId: 'league-1',
    })).rejects.toMatchObject({
      code: 'CLEAR_STATS_PLAYER_INDEX_IDENTITY_MISMATCH',
    })
    expect(prepareClearStatsPlanV2).not.toHaveBeenCalled()
  })

  test('reads a Player Document referenced only by a removed-player SearchIndex', async () => {
    trackedGetDocsFromServer.mockResolvedValue({
      docs: [found('orphan-player-index', {
        entityType: 'playerSeason',
        playerDocumentId: 'orphan-player-document',
        birthTeamDocumentId: 'team-1',
        seasonKey: '2026',
        leagueId: 'league-1',
      })],
    })
    trackedGetDocFromServer.mockImplementation(async reference => {
      if (reference.id === 'orphan-player-document') {
        return found(reference.id, { current: [], history: [] })
      }
      const data = baseDocuments[reference.id]
      return data ? found(reference.id, data) : missing(reference.id)
    })

    const result = await prepareClearStatsForUiV2({
      birthTeamDocumentId: 'team-1',
      seasonKey: '2026',
      leagueId: 'league-1',
    })

    expect(result.projectionSources.playerDocumentsById)
      .toHaveProperty('orphan-player-document')
  })
})
