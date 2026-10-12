// src/features/playersDatabase/services/audit/stats/readActual.test.js

import { doc } from 'firebase/firestore'
import { trackedGetDocFromServer } from '../../../../../services/firestore/usage/index.js'
import { readStatsAuditActual } from './readActual.js'

jest.mock('firebase/firestore', () => ({
  doc: jest.fn((db, collectionName, documentId) => ({ collectionName, documentId })),
}))
jest.mock('../../../../../services/firebase/firebase.js', () => ({ db: { id: 'db' } }))
jest.mock('../../../../../services/firestore/usage/index.js', () => ({ trackedGetDocFromServer: jest.fn() }))

const seasonId = '2026_2027'
const teamId = 'club-1_2011_1'
const playerIds = ['player__2011__90000', 'player__2011__90001']
const seasonDocumentId = playerId => `playerSeason__${playerId}__${seasonId}`
const searchDocumentId = playerId => `playerSeason__${playerId}__${teamId}__${seasonId}`
const read = () => readStatsAuditActual({
  leagueId: 'league-1', teamId, seasonId, scopedPlayerIds: playerIds,
})

const mockDocuments = documents => {
  trackedGetDocFromServer.mockImplementation(async ({ collectionName, documentId }) => {
    const data = documents[`${collectionName}/${documentId}`]
    return data
      ? { exists: () => true, id: documentId, data: () => data }
      : { exists: () => false }
  })
}

beforeEach(() => {
  jest.clearAllMocks()
  doc.mockImplementation((db, collectionName, documentId) => ({ collectionName, documentId }))
})

test('indexes existing deterministic documents by requested player even when identity is corrupt and a preceding read is missing', async () => {
  const playerId = playerIds[1]
  const season = { identity: { playerId: 'corrupt-player' }, teamsById: { otherTeam: { manual: { playerUrl: 'keep' } } } }
  const search = { playerId: 'corrupt-player' }
  mockDocuments({
    [`dbPlayers/${playerId}`]: { id: 'corrupt-player' },
    [`dbPlayerSeasons/${seasonDocumentId(playerId)}`]: season,
    [`dbSearchIndexes/${searchDocumentId(playerId)}`]: search,
  })

  const actual = await read()

  expect(Object.keys(actual.playerRootsById)).toEqual([playerId])
  expect(Object.keys(actual.playerSeasonsById)).toEqual([playerId])
  expect(Object.keys(actual.playerSearchIndexesById)).toEqual([playerId])
  expect(actual.playerSeasonsById[playerId]).toMatchObject(season)
  expect(actual.playerSearchIndexesById[playerId]).toMatchObject(search)
})

test('reads Team Root as the canonical roster lifecycle evidence', async () => {
  mockDocuments({
    [`dbBirthTeams/${teamId}`]: {
      identity: { teamId },
      seasonRefsById: {
        [seasonId]: { teamSeasonDocumentId: `${teamId}__${seasonId}` },
      },
    },
  })

  const actual = await read()

  expect(actual.teamRoot).toEqual(expect.objectContaining({
    id: teamId,
    identity: { teamId },
  }))
})

test('retains separate documents when both stored identities point at the same player', async () => {
  const documents = {}
  playerIds.forEach(playerId => {
    documents[`dbPlayerSeasons/${seasonDocumentId(playerId)}`] = { identity: { playerId: playerIds[0] } }
    documents[`dbSearchIndexes/${searchDocumentId(playerId)}`] = { playerId: playerIds[0] }
  })
  mockDocuments(documents)

  const actual = await read()

  expect(Object.keys(actual.playerSeasonsById)).toEqual(playerIds)
  expect(Object.keys(actual.playerSearchIndexesById)).toEqual(playerIds)
  playerIds.forEach(playerId => {
    expect(actual.playerSeasonsById[playerId].id).toBe(seasonDocumentId(playerId))
    expect(actual.playerSearchIndexesById[playerId].id).toBe(searchDocumentId(playerId))
  })
})

test('keeps an existing document with no persisted player identity visible to repair', async () => {
  mockDocuments({
    [`dbPlayerSeasons/${seasonDocumentId(playerIds[0])}`]: { teamsById: { otherTeam: {} } },
    [`dbSearchIndexes/${searchDocumentId(playerIds[0])}`]: { stats: {} },
  })

  const actual = await read()

  expect(actual.playerSeasonsById[playerIds[0]].teamsById).toEqual({ otherTeam: {} })
  expect(actual.playerSearchIndexesById[playerIds[0]].stats).toEqual({})
  expect(actual.playerSeasonsById).not.toHaveProperty('')
})
