jest.mock('../../../../../services/firebase/firebase.js', () => ({ db: {} }))
jest.mock('firebase/firestore', () => ({
  doc: jest.fn((...args) => ({ id: args.at(-1) })),
}))
jest.mock('./teamSeasonDoc.js', () => ({
  teamSeasonDocRef: ({ birthTeamDocumentId, seasonKey }) => ({
    id: `${birthTeamDocumentId}__${seasonKey}`,
  }),
}))
jest.mock('../../../../../services/firestore/usage/index.js', () => ({
  trackedRunTransaction: jest.fn(),
}))

import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
import {
  reconcileTeamSeasonMovementCounterpart,
  reconcileTeamSeasonMovementCounterparts,
} from './teamSeasonMovement.js'

const request = {
  sourceBirthTeamDocumentId: 'team-a',
  seasonKey: '26/27',
  outgoing: { movementId: 'movement-1', playerId: 'p1' },
}

describe('Team Season Movement counterpart', () => {
  test('concurrent duplicate counterpart requests commit one outgoing fact', async () => {
    const state = { transfersOut: [], pendingPlayers: [{ playerId: 'p1' }] }
    let releaseLock = Promise.resolve()
    trackedRunTransaction.mockImplementation(async (_db, callback) => {
      const previousLock = releaseLock
      let release
      releaseLock = new Promise(resolve => { release = resolve })
      await previousLock
      try {
        return await callback({
          get: async () => ({ exists: () => true, data: () => state }),
          set: (_ref, value) => Object.assign(state, value),
        })
      } finally {
        release()
      }
    })

    const result = await Promise.all([
      reconcileTeamSeasonMovementCounterpart({ request }),
      reconcileTeamSeasonMovementCounterpart({ request }),
    ])

    expect(result.map(row => row.status)).toEqual(['complete', 'complete'])
    expect(state.transfersOut).toHaveLength(1)
    expect(state.pendingPlayers).toHaveLength(0)
  })

  test('reports a failed counterpart without throwing or invalidating local truth', async () => {
    trackedRunTransaction.mockRejectedValueOnce(new Error('network failure'))

    await expect(reconcileTeamSeasonMovementCounterpart({ request })).resolves.toMatchObject({
      status: 'failed',
      teamSeasonDocumentId: 'team-a__26/27',
    })
  })

  test('does not create a missing counterpart Team Season', async () => {
    const set = jest.fn()
    trackedRunTransaction.mockImplementationOnce(async (_db, callback) => callback({
      get: async () => ({ exists: () => false, data: () => null }),
      set,
    }))

    await expect(reconcileTeamSeasonMovementCounterpart({ request })).resolves.toMatchObject({
      status: 'not_found',
      teamSeasonDocumentId: 'team-a__26/27',
    })
    expect(set).not.toHaveBeenCalled()
  })

  test('writes an incoming counterpart for a local outgoing fact', async () => {
    const state = { transfersIn: [], pendingPlayers: [] }
    trackedRunTransaction.mockImplementationOnce(async (_db, callback) => callback({
      get: async () => ({ exists: () => true, data: () => state }),
      set: (_ref, value) => Object.assign(state, value),
    }))

    await expect(reconcileTeamSeasonMovementCounterpart({ request: {
      counterpartBirthTeamDocumentId: 'team-b',
      seasonKey: '26/27',
      incoming: { movementId: 'movement-2', playerId: 'p2' },
    } })).resolves.toMatchObject({ status: 'complete', teamSeasonDocumentId: 'team-b__26/27' })

    expect(state.transfersIn).toEqual([expect.objectContaining({ movementId: 'movement-2' })])
  })
})
