// src/services/firestore/shorts/shortsCreate.test.js

import { createEntity } from '../../../application/actions/entities/createEntity.action.js'
import { shortsRefs } from './shorts.refs.js'

let mockStore
let mockTransactionCalls
let mockCommitError

jest.mock('../../firebase/firebase.js', () => ({ db: {} }))
jest.mock('../usage/trackShortsTransaction.js', () => ({ trackShortsTransaction: jest.fn() }))
jest.mock('./abilities/abilitiesUpsertHistory.js', () => ({}))
jest.mock('./gameStats/index.js', () => ({}))
jest.mock('./trainings/trainingsShorts.service.js', () => ({}))
jest.mock('firebase/firestore', () => ({
  doc: (_, collection, id) => `${collection}/${id}`,
  Timestamp: { now: () => 200 },
  runTransaction: async (_, callback) => {
    mockTransactionCalls += 1
    const writes = new Map()
    const result = await callback({
      async get(ref) {
        if (writes.size) throw new Error('Read after write')
        return { exists: () => mockStore.has(ref), data: () => mockStore.get(ref) }
      },
      set: (ref, value) => writes.set(ref, value),
    })
    if (mockCommitError === 'before') throw new Error('Write failed')
    writes.forEach((value, ref) => mockStore.set(ref, value))
    if (mockCommitError === 'after') throw new Error('Response lost')
    return result
  },
}))

const request = { id: 'request-1', startedAt: 100 }
const getDoc = ({ collection, docId }) => mockStore.get(`${collection}/${docId}`)
const player = {
  playerFirstName: 'Test',
  playerLastName: 'Player',
  birth: '2010',
  active: false,
}

beforeEach(() => {
  mockStore = new Map()
  mockTransactionCalls = 0
  mockCommitError = null
})

test('validates every player before writing and retries the whole import without duplicates', async () => {
  const draft = { teamId: 'team', clubId: 'club', players: [player, { ...player, playerLastName: '' }] }
  const create = () => createEntity({ entityType: 'players', draft, request })
  expect((await create()).ok).toBe(false)
  expect(mockTransactionCalls).toBe(0)
  expect(mockStore.size).toBe(0)

  draft.players[1].playerLastName = 'Second'
  mockCommitError = 'before'
  expect((await create()).ok).toBe(false)
  expect(mockStore.size).toBe(0)

  mockCommitError = 'after'
  expect((await create()).ok).toBe(false)
  mockCommitError = null
  expect(await create()).toMatchObject({ ok: true, data: { total: 2 } })
  expect(mockTransactionCalls).toBe(3)

  const { playersInfo, playersNames, playersTeam } = shortsRefs.players
  const ids = ['request-1_0', 'request-1_1']
  for (const meta of [playersInfo, playersNames, playersTeam]) {
    expect(getDoc(meta).list.map(item => item.id)).toEqual(ids)
  }
  expect(getDoc(playersInfo)).toMatchObject({ docName: 'playersInfo', list: [{ active: false }, { active: false }] })
  expect(getDoc(playersTeam).list[0]).toMatchObject({ teamId: 'team', clubId: 'club' })

  draft.players[1].playerLastName = 'Changed'
  expect((await create()).ok).toBe(false)
  expect(getDoc(playersNames).list[1].playerLastName).toBe('Second')
})

test.each([
  ['games', { games: [{ rivel: 'A' }, { rivel: 'B' }] }, Object.values(shortsRefs.games).slice(0, 3), 2],
  ['externalGames', { playerId: 'p1', games: [{ rivel: 'A' }] }, Object.values(shortsRefs.externalGames), 1],
  ['payment', { playerId: 'p1', type: 'test', paymentFor: 'Test', price: 100 }, Object.values(shortsRefs.payments), 1],
  ['privatePaymentAgreement', { playerId: 'p1', totalAmount: 100 }, Object.values(shortsRefs.payments), 1],
])('%s writes all its records in one transaction', async (entityType, draft, docs, count) => {
  const create = () => createEntity({ entityType, draft, request })
  mockCommitError = 'before'
  expect((await create()).ok).toBe(false)
  expect(mockStore.size).toBe(0)

  mockCommitError = null
  expect((await create()).ok).toBe(true)
  expect(mockTransactionCalls).toBe(2)
  expect(mockStore.size).toBe(docs.length)
  for (const meta of docs) expect(getDoc(meta).list).toHaveLength(count)
})
