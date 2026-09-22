jest.mock('../../../../../services/firebase/firebase.js', () => ({ db: {} }))
jest.mock('firebase/firestore', () => ({
  doc: jest.fn((...args) => ({ id: args.at(-1) })),
}))
jest.mock('../../read/entities/team.js', () => ({ getTeamById: jest.fn() }))

jest.mock('./teamSeasonDoc.js', () => ({
  teamSeasonDocRef: ({ birthTeamDocumentId, seasonKey }) => ({
    id: `${birthTeamDocumentId}__${seasonKey}`,
  }),
}))
jest.mock('../../../../../services/firestore/usage/index.js', () => ({
  trackedRunTransaction: jest.fn(),
}))

import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
import { getTeamById } from '../../read/entities/team.js'
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

    expect(result.map(row => row.status)).toEqual(['complete', 'no_op'])
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
test('reconciles a known cross-season counterpart directly and closes only its Pending', async () => {
  const state = {
    birthTeamDocumentId: 'team-a',
    pendingPlayers: [{ playerId: 'p1', previousBirthTeamDocumentId: 'team-a' }],
    transfersOut: [],
  }
  trackedRunTransaction.mockImplementationOnce(async (_db, callback) => callback({
    get: async () => ({ exists: () => true, data: () => state }),
    set: (_ref, value) => Object.assign(state, value),
  }))

  await expect(reconcileTeamSeasonMovementCounterpart({ request: {
    sourceBirthTeamDocumentId: 'team-a',
    seasonKey: '26/27',
    counterpartSeasonKey: '25/26',
    outgoing: { movementId: 'movement-cross', playerId: 'p1', toBirthTeamDocumentId: 'team-b' },
  } })).resolves.toMatchObject({
    status: 'complete', teamSeasonDocumentId: 'team-a__25/26', changed: true,
  })

  expect(state.pendingPlayers).toEqual([])
  expect(state.transfersOut).toEqual([expect.objectContaining({ movementId: 'movement-cross' })])
})

test('does not overwrite a different counterpart movement for the same player', async () => {
  const state = {
    birthTeamDocumentId: 'team-a',
    pendingPlayers: [{ playerId: 'p1', previousBirthTeamDocumentId: 'team-a' }],
    transfersOut: [{ movementId: 'movement-other', playerId: 'p1', toBirthTeamDocumentId: 'team-c' }],
  }
  const set = jest.fn()
  trackedRunTransaction.mockImplementationOnce(async (_db, callback) => callback({
    get: async () => ({ exists: () => true, data: () => state }),
    set,
  }))

  await expect(reconcileTeamSeasonMovementCounterpart({ request: {
    sourceBirthTeamDocumentId: 'team-a', seasonKey: '26/27',
    outgoing: { movementId: 'movement-new', playerId: 'p1', toBirthTeamDocumentId: 'team-b' },
  } })).resolves.toMatchObject({ status: 'conflict', changed: false })

  expect(set).not.toHaveBeenCalled()
  expect(state.pendingPlayers).toHaveLength(1)
  expect(state.transfersOut).toHaveLength(1)
})
test('uses Team Root seasons only when the counterpart season is unknown', async () => {
  const state = { birthTeamDocumentId: 'team-a', pendingPlayers: [], transfersOut: [] }
  getTeamById.mockResolvedValue({ seasons: [{ seasonKey: '25/26' }] })
  trackedRunTransaction.mockImplementation(async (_db, callback) => callback({
    get: async ref => (
      ref.id === 'team-a__26/27'
        ? { exists: () => false, data: () => null }
        : { exists: () => true, data: () => state }
    ),
    set: (_ref, value) => Object.assign(state, value),
  }))

  await expect(reconcileTeamSeasonMovementCounterpart({ request: {
    sourceBirthTeamDocumentId: 'team-a', seasonKey: '26/27', counterpartSeasonUnknown: true,
    outgoing: { movementId: 'movement-root-search', playerId: 'p1', toBirthTeamDocumentId: 'team-b' },
  } })).resolves.toMatchObject({ status: 'complete', teamSeasonDocumentId: 'team-a__25/26' })

  expect(getTeamById).toHaveBeenCalledWith('team-a')
})
test('closes at most one matching Pending episode', async () => {
  const state = {
    birthTeamDocumentId: 'team-a',
    pendingPlayers: [
      { pendingId: 'pending-1', playerId: 'p1', previousBirthTeamDocumentId: 'team-a' },
      { pendingId: 'pending-2', playerId: 'p1', previousBirthTeamDocumentId: 'team-a' },
    ],
    transfersOut: [],
  }
  trackedRunTransaction.mockImplementationOnce(async (_db, callback) => callback({
    get: async () => ({ exists: () => true, data: () => state }),
    set: (_ref, value) => Object.assign(state, value),
  }))

  await reconcileTeamSeasonMovementCounterpart({ request: {
    sourceBirthTeamDocumentId: 'team-a', seasonKey: '26/27',
    outgoing: { movementId: 'movement-one-pending', playerId: 'p1', toBirthTeamDocumentId: 'team-b' },
  } })

  expect(state.pendingPlayers).toEqual([
    expect.objectContaining({ pendingId: 'pending-2' }),
  ])
})
