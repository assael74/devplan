jest.mock('../../../../../services/firebase/firebase.js', () => ({ db: {} }))
jest.mock('firebase/firestore', () => ({
  doc: jest.fn((...args) => ({ id: args.at(-1) })),
  serverTimestamp: jest.fn(() => '__timestamp__'),
}))
jest.mock('../../../../../services/firestore/usage/index.js', () => ({ trackedRunTransaction: jest.fn() }))
jest.mock('../../../model/team/teamIdentity.model.js', () => ({ resolveTeamLookupKey: team => team.birthTeamDocumentId }))
jest.mock('../leagues/leagueDoc.js', () => ({ clean: value => String(value || '').trim(), buildSeasonKey: value => value }))
jest.mock('../../../domain/movement/index.js', () => ({ compareSeasonKeys: (a, b) => String(a).localeCompare(String(b)) }))
jest.mock('./teamDoc.js', () => ({ teamDocRef: id => ({ id }) }))
jest.mock('./teamSeasonDoc.js', () => ({ teamSeasonDocRef: ({ birthTeamDocumentId, seasonKey }) => ({ id: `${birthTeamDocumentId}__${seasonKey}` }) }))
jest.mock('./teamSeasonStats.js', () => ({
  buildTeamStatsCanonicalCommit: jest.fn(() => ({
    birthTeamDocumentId: 'team-a', teamDocumentId: 'team-a', teamSeasonDocumentId: 'team-a__25-26',
    seasonId: 'season-1', seasonKey: '25-26', writeSkipped: false, seasonData: { canonical: 'season' },
    rootData: { canonical: 'root' }, players: [], movementState: null,
  })),
}))
jest.mock('../teamStatsProjectionJobs/index.js', () => ({
  buildQueuedTeamStatsProjectionJob: jest.fn(() => ({
    id: 'job-1', jobType: 'team_stats_projection_sync', teamId: 'team-a',
    seasonId: 'season-1', seasonKey: '25-26', sourceRevision: 'revision-1',
    document: { status: 'queued', schemaVersion: 1, writeActionId: 'action-1' },
  })),
}))

import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
import { buildQueuedTeamStatsProjectionJob } from '../teamStatsProjectionJobs/index.js'
import { buildTeamStatsCanonicalCommit } from './teamSeasonStats.js'
import { commitTeamStatsCanonical } from './commitTeamStatsCanonical.js'

const snapshot = value => ({ exists: () => Boolean(value), data: () => value })
const request = {
  league: { id: 'league-1' }, season: { seasonId: 'season-1', seasonKey: '25-26', seasonStatus: 'active' },
  team: { birthTeamDocumentId: 'team-a' }, players: [], statsProjectionRevision: 'revision-1', writeActionId: 'action-1',
}

describe('commitTeamStatsCanonical', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    buildTeamStatsCanonicalCommit.mockReturnValue({
      birthTeamDocumentId: 'team-a', teamDocumentId: 'team-a', teamSeasonDocumentId: 'team-a__25-26',
      seasonId: 'season-1', seasonKey: '25-26', writeSkipped: false, seasonData: { canonical: 'season' },
      rootData: { canonical: 'root' }, players: [], movementState: null,
    })
    buildQueuedTeamStatsProjectionJob.mockReturnValue({
      id: 'job-1', jobType: 'team_stats_projection_sync', teamId: 'team-a',
      seasonId: 'season-1', seasonKey: '25-26', sourceRevision: 'revision-1',
      document: { status: 'queued', schemaVersion: 1, writeActionId: 'action-1' },
    })
  })

  test('commits canonical source, queued job and receipt linkage together', async () => {
    const writes = []
    trackedRunTransaction.mockImplementationOnce(async (_db, callback) => callback({
      get: jest.fn()
        .mockResolvedValueOnce(snapshot(null))
        .mockResolvedValueOnce(snapshot(null))
        .mockResolvedValueOnce(snapshot({
          writeActionId: 'action-1', actionType: 'pasteTeamPlayerStats', status: 'in_progress',
        })),
      set: jest.fn((ref, data, options) => writes.push({ kind: 'set', ref, data, options })),
      update: jest.fn((ref, data) => writes.push({ kind: 'update', ref, data })),
    }))
    const result = await commitTeamStatsCanonical(request)

    expect(buildQueuedTeamStatsProjectionJob).toHaveBeenCalledWith(expect.objectContaining({ writeActionId: 'action-1' }))
    expect(result).toMatchObject({
      projectionJob: { id: 'job-1', sourceRevision: 'revision-1' },
      writeActionId: 'action-1', writeActionLinkedInCanonicalCommit: true,
    })
    expect(writes).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: 'set', ref: { id: 'team-a__25-26' }, data: { canonical: 'season' } }),
      expect.objectContaining({ kind: 'set', ref: { id: 'team-a' }, data: { canonical: 'root' } }),
      expect.objectContaining({ kind: 'set', data: expect.objectContaining({ status: 'queued', writeActionId: 'action-1' }) }),
      expect.objectContaining({ kind: 'update', data: expect.objectContaining({ status: 'in_progress', projectionJobId: 'job-1', sourceRevision: 'revision-1' }) }),
    ]))
  })

  test('fails before business writes when the pre-created receipt is absent', async () => {
    const set = jest.fn()
    trackedRunTransaction.mockImplementationOnce(async (_db, callback) => callback({
      get: jest.fn(() => Promise.resolve(snapshot(null))), set, update: jest.fn(),
    }))
    await expect(commitTeamStatsCanonical(request)).rejects.toThrow('Write action receipt was not found')
    expect(set).not.toHaveBeenCalled()
  })
  test.each([
    ['another action type', { writeActionId: 'action-1', actionType: 'pasteTeamPlayers', status: 'in_progress' }, 'WRITE_ACTION_NOT_LINKABLE'],
    ['a mismatched receipt id', { writeActionId: 'other-action', actionType: 'pasteTeamPlayerStats', status: 'in_progress' }, 'WRITE_ACTION_NOT_LINKABLE'],
    ['a completed receipt', { writeActionId: 'action-1', actionType: 'pasteTeamPlayerStats', status: 'completed' }, 'WRITE_ACTION_NOT_LINKABLE'],
    ['a failed receipt', { writeActionId: 'action-1', actionType: 'pasteTeamPlayerStats', status: 'failed_after_canonical_commit' }, 'WRITE_ACTION_NOT_LINKABLE'],
    ['a superseded receipt', { writeActionId: 'action-1', actionType: 'pasteTeamPlayerStats', status: 'superseded' }, 'WRITE_ACTION_NOT_LINKABLE'],
    ['an existing Job linkage', { writeActionId: 'action-1', actionType: 'pasteTeamPlayerStats', status: 'in_progress', projectionJobId: 'job-old', sourceRevision: 'revision-old' }, 'WRITE_ACTION_ALREADY_LINKED'],
  ])('rejects %s before any canonical or Job write', async (_label, receipt, code) => {
    const set = jest.fn()
    const update = jest.fn()
    trackedRunTransaction.mockImplementationOnce(async (_db, callback) => callback({
      get: jest.fn()
        .mockResolvedValueOnce(snapshot(null))
        .mockResolvedValueOnce(snapshot(null))
        .mockResolvedValueOnce(snapshot(receipt)),
      set,
      update,
    }))

    await expect(commitTeamStatsCanonical(request)).rejects.toMatchObject({ code })
    expect(set).not.toHaveBeenCalled()
    expect(update).not.toHaveBeenCalled()
    expect(buildTeamStatsCanonicalCommit).not.toHaveBeenCalled()
    expect(buildQueuedTeamStatsProjectionJob).not.toHaveBeenCalled()
  })
})