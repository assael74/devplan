const writeStatsCanonicalV2 = jest.fn()
const syncStatsCounterpartsV2 = jest.fn()
const syncStatsPlayerDocumentsV2 = jest.fn()
const syncStatsPlayerIndexesV2 = jest.fn()
const syncStatsTeamLeagueV2 = jest.fn()
const syncStatsClubsV2 = jest.fn()

jest.mock('./writeStatsCanonical.flow.js', () => ({ writeStatsCanonicalV2: (...args) => writeStatsCanonicalV2(...args) }))
jest.mock('./syncStatsCounterparts.flow.js', () => ({ syncStatsCounterpartsV2: (...args) => syncStatsCounterpartsV2(...args) }))
jest.mock('./syncStatsPlayerDocuments.flow.js', () => ({ syncStatsPlayerDocumentsV2: (...args) => syncStatsPlayerDocumentsV2(...args) }))
jest.mock('./syncStatsPlayerIndexes.flow.js', () => ({ syncStatsPlayerIndexesV2: (...args) => syncStatsPlayerIndexesV2(...args) }))
jest.mock('./syncStatsTeamLeague.flow.js', () => ({ syncStatsTeamLeagueV2: (...args) => syncStatsTeamLeagueV2(...args) }))
jest.mock('./syncStatsClubs.flow.js', () => ({ syncStatsClubsV2: (...args) => syncStatsClubsV2(...args) }))

import { STATS_FINAL_SYNC_STAGES, runStatsFinalSyncStageV2 } from './statsFinalSync.flow.js'

describe('Stats V2 Final Sync routing', () => {
  beforeEach(() => jest.clearAllMocks())

  test('passes the approved state with each writer public contract', async () => {
    const approvedState = { planType: 'approvedStatsState', planVersion: 1 }
    const expected = [
      [writeStatsCanonicalV2, { approvedState }],
      [syncStatsCounterpartsV2, { approvedState }],
      [syncStatsPlayerDocumentsV2, { approvedState }],
      [syncStatsPlayerIndexesV2, { approved: approvedState }],
      [syncStatsTeamLeagueV2, { approved: approvedState }],
      [syncStatsClubsV2, { approvedState }],
    ]

    for (let index = 0; index < STATS_FINAL_SYNC_STAGES.length; index += 1) {
      expected[index][0].mockResolvedValueOnce({ ok: true })
      await runStatsFinalSyncStageV2({ stage: STATS_FINAL_SYNC_STAGES[index], approvedState })
      expect(expected[index][0]).toHaveBeenCalledWith(expected[index][1])
    }
  })

  test('does not invoke a downstream writer when a stage fails', async () => {
    const approvedState = { planType: 'approvedStatsState', planVersion: 1 }
    writeStatsCanonicalV2.mockRejectedValueOnce(new Error('failed'))

    await expect(runStatsFinalSyncStageV2({
      stage: STATS_FINAL_SYNC_STAGES[0],
      approvedState,
    })).rejects.toThrow('failed')

    expect(syncStatsCounterpartsV2).not.toHaveBeenCalled()
  })
})
