// src/features/playersDatabase/ui/pages/DataOpsPage/logic/inventorySnapshot.logic.test.js

import {
  addInventoryDeltas,
  readInventorySnapshot,
  restoreInventorySnapshot,
  writeInventorySnapshot,
} from './inventorySnapshot.logic.js'

describe('DataOps inventory snapshot', () => {
  test('adds changes compared with the previous count', () => {
    const result = addInventoryDeltas({
      previous: { collections: [{ id: 'players', count: 10 }] },
      current: { collections: [{ id: 'players', count: 13 }, { id: 'teams', count: 2 }] },
    })

    expect(result.collections).toEqual([
      expect.objectContaining({ id: 'players', delta: 3 }),
      expect.objectContaining({ id: 'teams', delta: null }),
    ])
  })

  test('persists and reads a valid snapshot', () => {
    const values = new Map()
    const storage = {
      getItem: key => values.get(key) || null,
      setItem: (key, value) => values.set(key, value),
    }
    const snapshot = { checkedAt: '2026-10-09T00:00:00.000Z', collections: [] }

    writeInventorySnapshot({ storage, snapshot })

    expect(readInventorySnapshot(storage)).toEqual(snapshot)
  })

  test('restores stored counts without losing the last known change', () => {
    const snapshot = {
      checkedAt: '2026-10-09T00:00:00.000Z',
      collections: [
        { id: 'players', count: 13, delta: 3 },
        { id: 'teams', count: 2 },
      ],
    }

    expect(restoreInventorySnapshot(snapshot).collections).toEqual([
      expect.objectContaining({ id: 'players', delta: 3 }),
      expect.objectContaining({ id: 'teams', delta: null }),
    ])
  })
})

