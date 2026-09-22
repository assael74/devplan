jest.mock('../../../../../services/firebase/firebase.js', () => ({ db: {} }))
jest.mock('firebase/firestore', () => ({
  doc: jest.fn((...args) => ({ id: args.at(-1) })),
  serverTimestamp: jest.fn(() => '__timestamp__'),
  setDoc: jest.fn(() => Promise.resolve()),
}))

import { setDoc } from 'firebase/firestore'
import {
  buildQueuedTeamStatsProjectionJob,
  queueTeamStatsProjectionJob,
} from './teamStatsProjectionJob.write.js'

const input = {
  league: { id: 'league-1' },
  season: { seasonId: 'season-1', seasonKey: '25-26', seasonStatus: 'active' },
  team: { birthTeamDocumentId: 'team-a' }, teamSeasonDocumentId: 'team-a__25-26',
  sourceRevision: 'revision-1', writeActionId: 'action-1',
}

describe('Team Stats Projection Job V1/V2 contract', () => {
  test('V2 atomic builder produces a queued durable job with its receipt linkage', () => {
    const job = buildQueuedTeamStatsProjectionJob(input)
    expect(job).toMatchObject({ id: expect.any(String), sourceRevision: 'revision-1' })
    expect(job.document).toMatchObject({
      schemaVersion: 1, status: 'queued', writeActionId: 'action-1',
      teamSeasonDocumentId: 'team-a__25-26', sourceRevision: 'revision-1',
    })
  })

  test('V1 direct queue helper uses the same queued contract', async () => {
    const result = await queueTeamStatsProjectionJob(input)
    expect(result).toMatchObject({ sourceRevision: 'revision-1', jobType: 'team_stats_projection_sync' })
    expect(setDoc).toHaveBeenCalledTimes(1)
    expect(setDoc.mock.calls[0][1]).toEqual(expect.objectContaining({
      status: 'queued', writeActionId: 'action-1', sourceRevision: 'revision-1',
    }))
  })
})

