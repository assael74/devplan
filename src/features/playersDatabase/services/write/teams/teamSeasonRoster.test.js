jest.mock('../../../../../services/firebase/firebase.js', () => ({ db: {} }))
jest.mock('../../../../../services/firestore/usage/index.js', () => ({
  trackedRunTransaction: jest.fn(),
}))
jest.mock('firebase/firestore', () => ({
  doc: jest.fn((...args) => ({ id: args.at(-1) })),
  serverTimestamp: jest.fn(() => null),
}))

import { ROSTER_IMPORT_MODE } from '../../../domain/movement/index.js'
import { mergeRosterImportPlayers } from './teamSeasonRoster.js'

const season = { seasonId: '26/27', seasonKey: '26/27', seasonStatus: 'active' }
const existingPlayers = [
  { playerId: 'p1', externalPlayerId: '10001', fullName: 'A', notes: 'keep' },
  { playerId: 'p2', externalPlayerId: '10002', fullName: 'B' },
]

describe('Team Season roster import merge', () => {
  test('AUTHORITATIVE_SNAPSHOT replaces absent players while preserving matched player state', () => {
    const result = mergeRosterImportPlayers({
      existingPlayers,
      season,
      mode: ROSTER_IMPORT_MODE.AUTHORITATIVE_SNAPSHOT,
      players: [{ playerId: 'p1', externalPlayerId: '10001', fullName: 'A updated' }],
    })

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual(expect.objectContaining({ playerId: 'p1', notes: 'keep' }))
  })

  test('PATCH keeps absent players and adds incoming players', () => {
    const result = mergeRosterImportPlayers({
      existingPlayers,
      season,
      mode: ROSTER_IMPORT_MODE.PATCH,
      players: [{ externalPlayerId: '10003', fullName: 'C' }],
    })

    expect(result.map(player => player.externalPlayerId)).toEqual(['10001', '10002', '10003'])
  })

  test('deduplicates repeated players in one import', () => {
    const result = mergeRosterImportPlayers({
      season,
      mode: ROSTER_IMPORT_MODE.AUTHORITATIVE_SNAPSHOT,
      players: [
        { externalPlayerId: '10001', fullName: 'A' },
        { externalPlayerId: '10001', fullName: 'A', primaryPosition: 'CB' },
      ],
    })

    expect(result).toHaveLength(1)
    expect(result[0].primaryPosition).toBe('CB')
  })
})
