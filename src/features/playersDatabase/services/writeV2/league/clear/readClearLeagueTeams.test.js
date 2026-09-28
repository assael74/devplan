// src/features/playersDatabase/services/writeV2/league/clear/readClearLeagueTeams.test.js

import { trackedGetDocsFromServer } from '../../../../../../services/firestore/usage/index.js'
import { findClearLeagueReceipt } from './readClearLeagueTeams.js'

jest.mock('firebase/firestore', () => ({ collection: jest.fn(), query: jest.fn(), where: jest.fn() }))
jest.mock('../../../../../../services/firebase/firebase.js', () => ({ db: {} }))
jest.mock('../../../../../../services/firestore/usage/index.js', () => ({ trackedGetDocsFromServer: jest.fn() }))

const identity = { leagueId: 'league', seasonKey: '26/27' }
const receipt = { flowType: 'league', operationType: 'clear', label: 'CLEAR_LEAGUE_TEAMS', auditTarget: { ...identity, seasonKey: '2026_2027' } }
const row = (id, data) => ({ id, data: () => data })

test('reuses the single matching receipt across normalized seasons', async () => {
  trackedGetDocsFromServer.mockResolvedValue({ docs: [row('original', receipt)] })
  await expect(findClearLeagueReceipt(identity)).resolves.toBe('original')
})

test.each([
  [row('other', { ...receipt, flowType: 'stats' })],
  [row('other-target', { ...receipt, auditTarget: { leagueId: 'other', seasonKey: '26/27' } })],
])('ignores unrelated open receipts', async (...docs) => {
  trackedGetDocsFromServer.mockResolvedValue({ docs })
  await expect(findClearLeagueReceipt(identity)).resolves.toBe('')
})

test('reuses a matching receipt when unrelated receipts are also open', async () => {
  trackedGetDocsFromServer.mockResolvedValue({
    docs: [
      row('other', { ...receipt, flowType: 'stats' }),
      row('original', receipt),
    ],
  })

  await expect(findClearLeagueReceipt(identity)).resolves.toBe('original')
})
