// src/features/playersDatabase/services/write/roster/edits/updatePlayerShirtNumber.test.js

import { updatePlayerSeasonDetails, updatePlayerShirtNumber } from './updatePlayerShirtNumber.js'
import { executeManualEdit } from '../../shared/manualEdit.write.js'

jest.mock('../../shared/manualEdit.write.js', () => ({
  executeManualEdit: jest.fn(),
  manualEditRef: (collection, id) => ({ path: `${collection}/${id}` }),
  requireManualEditDocument: snapshot => {
    if (!snapshot.exists()) throw new Error('missing')
    return snapshot.data()
  },
}))
jest.mock('../../../../domain/identity/index.js', () => ({
  buildPlayerSeasonDocumentId: () => 'season-1',
  buildPlayerSearchIndexDocumentId: () => 'index-1',
}))

const identity = {
  playerId: 'player-1',
  teamId: 'team-1',
  seasonId: '2026_2027',
  teamSeasonDocumentId: 'team-season-1',
}
const snapshot = data => ({ exists: () => Boolean(data), data: () => data })
const run = ({ season, index, loaded = true, numShirt = null } = {}) => {
  const team = {
    identity: { ...identity },
    stats: { statsLoadState: { status: loaded ? 'loaded' : 'pending' } },
    roster: { playersById: { 'player-1': { playerId: 'player-1', numShirt } } },
  }
  executeManualEdit.mockImplementation(async ({ refs, build }) => build({
    updatedAt: '2026-10-17T00:00:00.000Z',
    get: ref => snapshot({
      'teamSeasons/team-season-1': team,
      'playerSeasons/season-1': season,
      'playerSearchIndexes/index-1': index,
    }[ref.path]),
  }))
  return updatePlayerShirtNumber({ ...identity, numShirt: '9' })
}

test('updates canonical shirt and only existing player projections', async () => {
  const changes = await run({
    season: { identity, teamsById: { 'team-1': { roster: { numShirt: null }, stats: { games: 3 } } } },
    index: { playerId: 'player-1', seasonId: '2026_2027', references: { teamSeasonDocumentId: 'team-season-1' }, player: { numShirt: '', name: 'א' } },
  })
  expect(changes.map(change => change.ref.path)).toEqual([
    'teamSeasons/team-season-1', 'playerSeasons/season-1', 'playerSearchIndexes/index-1',
  ])
  expect(changes[0].patch.roster.playersById['player-1'].numShirt).toBe(9)
  expect(changes[1].patch.teamsById['team-1'].stats.games).toBe(3)
  expect(changes[2].patch.player).toEqual({ numShirt: '9', name: 'א' })
})

test('does not create missing player documents', async () => {
  const changes = await run()
  expect(changes).toHaveLength(1)
  expect(changes[0].ref.path).toBe('teamSeasons/team-season-1')
})

test('blocks editing before stats load', async () => {
  await expect(run({ loaded: false })).rejects.toThrow('רק לאחר טעינת סטטיסטיקה')
})

test('rejects an invalid shirt number before reading documents', () => {
  expect(() => updatePlayerShirtNumber({ ...identity, numShirt: '9.5' })).toThrow('מספר חולצה')
})

test('saves shirt and season URL together while preserving other manual fields', async () => {
  const team = {
    identity,
    stats: { statsLoadState: { status: 'loaded' } },
    roster: { playersById: { 'player-1': { playerId: 'player-1', numShirt: null } } },
    manual: { playersById: { 'player-1': { note: 'keep note' } } },
  }
  const season = {
    identity,
    teamsById: { 'team-1': { roster: { numShirt: null }, manual: { note: 'keep team note' } } },
  }
  const index = {
    playerId: 'player-1',
    seasonId: '2026_2027',
    references: { teamSeasonDocumentId: 'team-season-1' },
    player: { numShirt: '', playerUrl: '' },
  }
  executeManualEdit.mockImplementation(async ({ build }) => build({
    updatedAt: 'updated-time',
    get: ref => snapshot({
      'teamSeasons/team-season-1': team,
      'playerSeasons/season-1': season,
      'playerSearchIndexes/index-1': index,
    }[ref.path]),
  }))

  const changes = await updatePlayerSeasonDetails({
    ...identity,
    numShirt: '12',
    playerUrl: 'https://example.com/player',
  })

  expect(changes.map(change => change.ref.path)).toEqual([
    'teamSeasons/team-season-1', 'playerSeasons/season-1', 'playerSearchIndexes/index-1',
  ])
  expect(changes[0].patch.roster.playersById['player-1'].numShirt).toBe(12)
  expect(changes[0].patch.manual.playersById['player-1']).toEqual(expect.objectContaining({
    note: 'keep note', playerUrl: 'https://example.com/player',
  }))
  expect(changes[1].patch.teamsById['team-1'].manual).toEqual({
    note: 'keep team note', playerUrl: 'https://example.com/player',
  })
  expect(changes[2].patch.player).toEqual({ numShirt: '12', playerUrl: 'https://example.com/player' })
})
