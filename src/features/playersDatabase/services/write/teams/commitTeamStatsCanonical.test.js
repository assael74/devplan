jest.mock('../../../../../services/firebase/firebase.js', () => ({ db: {} }))
jest.mock('firebase/firestore', () => ({
  doc: jest.fn((...args) => ({ id: args.at(-1) })),
  serverTimestamp: jest.fn(() => '__timestamp__'),
}))
jest.mock('../../../../../services/firestore/usage/index.js', () => ({ trackedRunTransaction: jest.fn() }))
jest.mock('../leagues/leagueDoc.js', () => ({ clean: value => String(value || '').trim() }))
jest.mock('./teamDoc.js', () => ({ teamDocRef: id => ({ id }) }))
jest.mock('./teamSeasonDoc.js', () => ({ teamSeasonDocRef: ({ birthTeamDocumentId, seasonKey }) => ({ id: `${birthTeamDocumentId}__${seasonKey}` }) }))
jest.mock('../teamStatsProjectionJobs/index.js', () => ({
  buildQueuedTeamStatsProjectionJob: jest.fn(() => ({
    id: 'job-1', jobType: 'team_stats_projection_sync', teamId: 'team-a',
    seasonId: 'season-1', seasonKey: '25-26', sourceRevision: 'revision-1',
    document: { status: 'queued', schemaVersion: 1, writeActionId: 'action-1' },
  })),
}))

import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
import { buildQueuedTeamStatsProjectionJob } from '../teamStatsProjectionJobs/index.js'
import { buildStatsSourceFingerprint } from './statsPlanFingerprint.js'
import { commitTeamStatsCanonical } from './commitTeamStatsCanonical.js'

const snapshot = value => ({ exists: () => value !== null && value !== undefined, data: () => value })

const root = { seasons: [{ seasonKey: '24-25' }] }
const currentSeason = { teamPlayers: [{ playerId: 'p1' }] }
const previousSeason = { teamPlayers: [{ playerId: 'p0' }] }
const receipt = { writeActionId: 'action-1', actionType: 'pasteTeamPlayerStats', status: 'in_progress' }

const approvedPlan = {
  planType: 'approvedStatsCanonicalPlan',
  planVersion: 1,
  birthTeamDocumentId: 'team-a',
  seasonKey: '25-26',
  statsProjectionRevision: 'revision-1',
  league: { id: 'league-1' },
  season: { seasonId: 'season-1', seasonKey: '25-26', seasonStatus: 'active' },
  team: { birthTeamDocumentId: 'team-a' },
  sourceFingerprints: {
    teamRoot: buildStatsSourceFingerprint(root),
    currentSeason: buildStatsSourceFingerprint(currentSeason),
    previousSeason: buildStatsSourceFingerprint(previousSeason),
    previousSeasonKey: '24-25',
  },
  canonicalCommit: {
    birthTeamDocumentId: 'team-a', teamDocumentId: 'team-a', teamSeasonDocumentId: 'team-a__25-26',
    seasonId: 'season-1', seasonKey: '25-26', writeSkipped: false,
    seasonData: { canonical: 'season' }, rootData: { canonical: 'root' }, players: [], movementState: null,
  },
}

const runTransactionWith = ({ nextRoot = root, nextCurrent = currentSeason, nextPrevious = previousSeason, nextReceipt = receipt } = {}) => {
  const writes = []
  trackedRunTransaction.mockImplementationOnce(async (_db, callback) => callback({
    get: jest.fn(ref => {
      if (ref.id === 'team-a') return Promise.resolve(snapshot(nextRoot))
      if (ref.id === 'team-a__25-26') return Promise.resolve(snapshot(nextCurrent))
      if (ref.id === 'team-a__24-25') return Promise.resolve(snapshot(nextPrevious))
      if (ref.id === 'action-1') return Promise.resolve(snapshot(nextReceipt))
      return Promise.resolve(snapshot(null))
    }),
    set: jest.fn((ref, data, options) => writes.push({ kind: 'set', ref, data, options })),
    update: jest.fn((ref, data) => writes.push({ kind: 'update', ref, data })),
  }))
  return writes
}

describe('commitTeamStatsCanonical approved plan', () => {
  beforeEach(() => jest.clearAllMocks())

  test('commits the prepared canonical source, queued job and receipt linkage together', async () => {
    const writes = runTransactionWith()
    const result = await commitTeamStatsCanonical({ approvedPlan, writeActionId: 'action-1' })

    expect(buildQueuedTeamStatsProjectionJob).toHaveBeenCalledWith(expect.objectContaining({
      sourceRevision: 'revision-1', writeActionId: 'action-1',
    }))
    expect(result).toMatchObject({
      projectionJob: { id: 'job-1', sourceRevision: 'revision-1' },
      writeActionId: 'action-1', writeActionLinkedInCanonicalCommit: true,
    })
    expect(writes).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: 'set', ref: { id: 'team-a__25-26' }, data: { canonical: 'season' } }),
      expect.objectContaining({ kind: 'set', ref: { id: 'team-a' }, data: { canonical: 'root' } }),
      expect.objectContaining({ kind: 'set', data: expect.objectContaining({ status: 'queued', writeActionId: 'action-1' }) }),
      expect.objectContaining({ kind: 'update', data: expect.objectContaining({ projectionJobId: 'job-1', sourceRevision: 'revision-1' }) }),
    ]))
  })

  test.each([
    ['teamRoot', { nextRoot: { ...root, changed: true } }],
    ['currentSeason', { nextCurrent: { ...currentSeason, changed: true } }],
    ['previousSeason', { nextPrevious: { ...previousSeason, changed: true } }],
  ])('rejects a stale plan when %s changed', async (source, values) => {
    const writes = runTransactionWith(values)
    await expect(commitTeamStatsCanonical({ approvedPlan, writeActionId: 'action-1' })).rejects.toMatchObject({
      code: 'STATS_IMPORT_PLAN_STALE', source,
    })
    expect(writes).toHaveLength(0)
    expect(buildQueuedTeamStatsProjectionJob).not.toHaveBeenCalled()
  })

  test('fails before business writes when the pre-created receipt is absent', async () => {
    const writes = runTransactionWith({ nextReceipt: null })
    await expect(commitTeamStatsCanonical({ approvedPlan, writeActionId: 'action-1' })).rejects.toThrow('Write action receipt was not found')
    expect(writes).toHaveLength(0)
  })

  test.each([
    ['another action type', { ...receipt, actionType: 'pasteTeamPlayers' }, 'WRITE_ACTION_NOT_LINKABLE'],
    ['a mismatched receipt id', { ...receipt, writeActionId: 'other-action' }, 'WRITE_ACTION_NOT_LINKABLE'],
    ['a completed receipt', { ...receipt, status: 'completed' }, 'WRITE_ACTION_NOT_LINKABLE'],
    ['an existing Job linkage', { ...receipt, projectionJobId: 'job-old', sourceRevision: 'revision-old' }, 'WRITE_ACTION_ALREADY_LINKED'],
  ])('rejects %s before canonical or Job writes', async (_label, nextReceipt, code) => {
    const writes = runTransactionWith({ nextReceipt })
    await expect(commitTeamStatsCanonical({ approvedPlan, writeActionId: 'action-1' })).rejects.toMatchObject({ code })
    expect(writes).toHaveLength(0)
    expect(buildQueuedTeamStatsProjectionJob).not.toHaveBeenCalled()
  })
})
