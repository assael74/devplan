// src/features/playersDatabase/services/writeV2/league/deleteSeason/deleteLeagueSeasonReceipt.test.js

import { selectDeleteSeasonReceipt } from './deleteLeagueSeasonReceipt.js'

jest.mock('firebase/firestore', () => ({}))
jest.mock('../../../../../../services/firebase/firebase.js', () => ({ db: {} }))
jest.mock('../../../../../../services/firestore/usage/index.js', () => ({}))
jest.mock('../../receipt/service.js', () => ({}))
jest.mock('../../receipt/repository.js', () => ({}))
const target = { leagueId: 'league', seasonKey: '26/27' }
const receipt = (docId, leagueId = 'league') => ({ docId, data: {
  status: 'open', flowType: 'league', operationType: 'delete', label: 'DELETE_LEAGUE_SEASON',
  auditTarget: { leagueId, seasonKey: '2026_2027' },
} })

test('unrelated open receipts do not block the operation', () => {
  expect(selectDeleteSeasonReceipt([receipt('other', 'foreign')], target)).toBe('')
})
test('one matching receipt is reused even alongside unrelated receipts', () => {
  expect(selectDeleteSeasonReceipt([receipt('same'), receipt('other', 'foreign')], target)).toBe('same')
})
test('multiple matching receipts fail the session documentation check', () => {
  expect(() => selectDeleteSeasonReceipt([receipt('a'), receipt('b')], target)).toThrow('Multiple')
})
