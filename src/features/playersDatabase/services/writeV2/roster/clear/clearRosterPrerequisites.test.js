// src/features/playersDatabase/services/writeV2/roster/clear/clearRosterPrerequisites.test.js

import { trackedGetDocsFromServer } from '../../../../../../services/firestore/usage/index.js'
import { findOpenClearRosterReceipt } from './clearRosterPrerequisites.js'

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(), query: jest.fn(), where: jest.fn(),
}))
jest.mock('../../../../../../services/firebase/firebase.js', () => ({ db: {} }))
jest.mock('../../../../../../services/firestore/usage/index.js', () => ({
  trackedGetDocsFromServer: jest.fn(),
}))

const identity = { birthTeamDocumentId: 'team-1', seasonKey: '26/27' }
const receipt = () => ({
  flowType: 'stats', status: 'closed', canonicalStatus: 'reported',
  auditTarget: { ...identity, seasonKey: '26_27' },
  createdAt: '2026-09-28T00:00:00Z',
  lastAuditSummary: { coverage: 'complete', findingsCount: 0, ranAt: '2026-09-28T01:00:00Z' },
})

beforeEach(() => jest.clearAllMocks())

test.each(['pending', 'reported', 'failed_or_unknown'])('reuses the same open receipt with canonical status %s', async canonicalStatus => {
  trackedGetDocsFromServer.mockResolvedValue({ docs: [{
    id: 'original',
    data: () => ({ ...receipt(), flowType: 'roster', operationType: 'clear', status: 'open', canonicalStatus }),
  }] })
  await expect(findOpenClearRosterReceipt(identity)).resolves.toBe('original')
})

test('a failed server read prevents selecting or creating a replacement', async () => {
  trackedGetDocsFromServer.mockRejectedValueOnce(new Error('offline'))
  await expect(findOpenClearRosterReceipt(identity)).rejects.toThrow('offline')
})

test('does not pick a foreign target, a closed receipt or an abandoned attempt', async () => {
  trackedGetDocsFromServer.mockResolvedValue({ docs: [
    { id: 'closed', data: () => ({ ...receipt(), flowType: 'roster', operationType: 'clear' }) },
    { id: 'other', data: () => ({ ...receipt(), flowType: 'roster', operationType: 'clear', status: 'open', auditTarget: { birthTeamDocumentId: 'other' } }) },
    { id: 'abandoned', data: () => ({ ...receipt(), flowType: 'roster', operationType: 'clear', status: 'abandoned' }) },
  ] })
  await expect(findOpenClearRosterReceipt(identity)).resolves.toBe('')
})

test('multiple matching open receipts block rather than choose silently', async () => {
  trackedGetDocsFromServer.mockResolvedValue({ docs: ['one', 'two'].map(id => ({
    id, data: () => ({ ...receipt(), flowType: 'roster', operationType: 'clear', status: 'open' }),
  })) })
  await expect(findOpenClearRosterReceipt(identity)).rejects.toThrow('Multiple open')
})
