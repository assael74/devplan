// src/features/playersDatabase/services/writeV2/league/deleteSeason/deleteLeagueSeasonSession.test.js

import { doc, updateDoc } from 'firebase/firestore'
import { prepareDeleteSeasonProposal, approveDeleteSeason } from '../../../../domain/leagueV2/deleteSeason/deleteLeagueSeasonApprovedState.builder.js'
import { buildCanonicalLeaguesMasterPatch } from '../../../../domain/leagueV2/deleteSeason/deleteLeagueSeason.builder.js'
import { readClearLeagueSources, readClearLeagueDocument } from '../clear/readClearLeagueTeams.js'
import { openDeleteSeasonReceipt } from './deleteLeagueSeasonReceipt.js'
import { startDeleteSeasonSession, writeDeleteSeasonStep, failDeleteSeasonSession } from './deleteLeagueSeasonSession.js'
import { invalidateLeagueImportCacheV2 } from '../invalidateLeagueImportCache.js'
import { patchWriteActionReceiptV2 } from '../../receipt/repository.js'

jest.mock('firebase/firestore', () => ({ doc: jest.fn(), updateDoc: jest.fn(), setDoc: jest.fn(), serverTimestamp: jest.fn() }))
jest.mock('../../../../../../services/firebase/firebase.js', () => ({ db: {} }))
jest.mock('../clear/readClearLeagueTeams.js', () => ({
  readClearLeagueSources: jest.fn(), readClearLeagueDocument: jest.fn(),
  CLEAR_LEAGUE_COLLECTIONS: { league: 'leagues', leaguesMaster: 'master' },
}))
jest.mock('./deleteLeagueSeasonReceipt.js', () => ({ openDeleteSeasonReceipt: jest.fn() }))
jest.mock('../invalidateLeagueImportCache.js', () => ({ invalidateLeagueImportCacheV2: jest.fn() }))
jest.mock('../../receipt/repository.js', () => ({ patchWriteActionReceiptV2: jest.fn() }))
jest.mock('../../receipt/service.js', () => ({ persistWriteActionAuditResultV2: jest.fn() }))
jest.mock('../../../auditV2/league/index.js', () => ({ auditLeagueV2: jest.fn() }))

const identity = { leagueId: 'league', seasonKey: '26/27' }
const time = '2026-09-28T12:00:00Z'
let sources
beforeEach(() => {
  jest.resetAllMocks()
  const leagues = [{ docId: 'league', data: { id: 'league', current: { seasonKey: '26/27', tableRank: null }, history: [] } }]
  sources = { leagues, roots: [], teamSeasons: [], indexes: [], identities: [], clubs: [], clubsMaster: null,
    leaguesMaster: buildCanonicalLeaguesMasterPatch(leagues) }
  doc.mockImplementation((_db, collection, id) => ({ collection, id }))
  openDeleteSeasonReceipt.mockResolvedValue('same-receipt')
  readClearLeagueSources.mockImplementation(async () => sources)
  readClearLeagueDocument.mockImplementation(async kind => kind === 'league' ? sources.leagues[0].data : sources.leaguesMaster)
  updateDoc.mockImplementation(async (reference, patch) => {
    if (reference.collection === 'leagues') sources.leagues[0].data = { ...sources.leagues[0].data, ...patch }
    else sources.leaguesMaster = { ...sources.leaguesMaster, ...patch }
  })
})
const prepare = () => approveDeleteSeason(prepareDeleteSeasonProposal(sources, identity, time))

test('canonical success followed by Master failure retries fresh using the same receipt', async () => {
  const first = prepare()
  const receiptId = await startDeleteSeasonSession(first)
  await writeDeleteSeasonStep({ approvedState: first, receiptId, step: 'league' })
  expect(sources.leagues[0].data.current).toBeNull()
  updateDoc.mockRejectedValueOnce(new Error('offline'))
  await expect(writeDeleteSeasonStep({ approvedState: first, receiptId, step: 'leaguesMaster' })).rejects.toThrow('offline')
  const retry = prepare()
  expect(retry.retryState).toBe('season_absent_master_stale')
  expect(await startDeleteSeasonSession(retry)).toBe(receiptId)
  updateDoc.mockClear()
  await writeDeleteSeasonStep({ approvedState: retry, receiptId, step: 'league' })
  expect(updateDoc).not.toHaveBeenCalled()
  await writeDeleteSeasonStep({ approvedState: retry, receiptId, step: 'leaguesMaster' })
  expect(sources.leaguesMaster.leagues[0].seasons).toEqual([])
  expect(prepare().retryState).toBe('season_absent_clean')
})

test('cache is invalidated after an uncertain failure and Receipt remains open', async () => {
  const approvedState = prepare()
  updateDoc.mockRejectedValueOnce(new Error('unknown result'))
  let caught
  try { await writeDeleteSeasonStep({ approvedState, receiptId: 'receipt', step: 'league' }) }
  catch (error) { caught = error }
  expect(invalidateLeagueImportCacheV2).toHaveBeenCalled()
  await failDeleteSeasonSession({ approvedState, receiptId: 'receipt', step: 'league', error: caught })
  expect(patchWriteActionReceiptV2).toHaveBeenLastCalledWith(expect.objectContaining({ patch: expect.objectContaining({
    status: 'open', executionStatus: 'failed', failedStep: 'league', failedTarget: { targetType: 'league', documentId: 'league' },
  }) }))
})
