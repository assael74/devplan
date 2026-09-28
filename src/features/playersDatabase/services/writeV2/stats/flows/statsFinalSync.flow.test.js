const mockWriteStatsCanonicalV2 = jest.fn()
const mockSyncStatsCounterpartsV2 = jest.fn()
const mockSyncStatsPlayerDocumentsV2 = jest.fn()
const mockSyncStatsPlayerIndexesV2 = jest.fn()
const mockSyncStatsTeamLeagueV2 = jest.fn()
const mockSyncStatsClubsV2 = jest.fn()

jest.mock('./writeStatsCanonical.flow.js', () => ({ writeStatsCanonicalV2: (...args) => mockWriteStatsCanonicalV2(...args) }))
jest.mock('./syncStatsCounterparts.flow.js', () => ({ syncStatsCounterpartsV2: (...args) => mockSyncStatsCounterpartsV2(...args) }))
jest.mock('./syncStatsPlayerDocuments.flow.js', () => ({ syncStatsPlayerDocumentsV2: (...args) => mockSyncStatsPlayerDocumentsV2(...args) }))
jest.mock('./syncStatsPlayerIndexes.flow.js', () => ({ syncStatsPlayerIndexesV2: (...args) => mockSyncStatsPlayerIndexesV2(...args) }))
jest.mock('./syncStatsTeamLeague.flow.js', () => ({ syncStatsTeamLeagueV2: (...args) => mockSyncStatsTeamLeagueV2(...args) }))
jest.mock('./syncStatsClubs.flow.js', () => ({ syncStatsClubsV2: (...args) => mockSyncStatsClubsV2(...args) }))

import { STATS_FINAL_SYNC_STAGES, runStatsFinalSyncStageV2 } from './statsFinalSync.flow.js'

describe('Stats V2 Final Sync routing', () => {
  beforeEach(() => jest.clearAllMocks())

  test('passes the approved state with each writer public contract', async () => {
    const approvedState = { planType: 'approvedStatsState', planVersion: 1 }
    const expected = [
      [mockWriteStatsCanonicalV2, { approvedState }],
      [mockSyncStatsCounterpartsV2, { approvedState }],
      [mockSyncStatsPlayerDocumentsV2, { approvedState }],
      [mockSyncStatsPlayerIndexesV2, { approved: approvedState }],
      [mockSyncStatsTeamLeagueV2, { approved: approvedState }],
      [mockSyncStatsClubsV2, { approvedState }],
    ]

    for (let index = 0; index < STATS_FINAL_SYNC_STAGES.length; index += 1) {
      expected[index][0].mockResolvedValueOnce({ ok: true })
      await runStatsFinalSyncStageV2({ stage: STATS_FINAL_SYNC_STAGES[index], approvedState })
      expect(expected[index][0]).toHaveBeenCalledWith(expected[index][1])
    }
  })

  test('does not invoke a downstream writer when a stage fails', async () => {
    const approvedState = { planType: 'approvedStatsState', planVersion: 1 }
    mockWriteStatsCanonicalV2.mockRejectedValueOnce(new Error('failed'))

    await expect(runStatsFinalSyncStageV2({
      stage: STATS_FINAL_SYNC_STAGES[0],
      approvedState,
    })).rejects.toThrow('failed')

    expect(mockSyncStatsCounterpartsV2).not.toHaveBeenCalled()
  })
})
