import {
  buildStatsFinalSyncRetryResults,
} from './useStatsV2FinalSync.js'

describe('Stats V2 Final Sync retry state', () => {
  test('reenables only the writer stages affected by Audit findings', () => {
    const current = {
      canonical: { status: 'completed' },
      counterparts: { status: 'completed' },
      playerDocuments: { status: 'completed' },
      playerIndexes: { status: 'completed' },
      teamLeague: { status: 'completed' },
      clubs: { status: 'completed' },
      audit: { status: 'completed' },
    }
    const audit = {
      findings: [
        { target: 'playerDocument' },
        { target: 'leagueMetadata' },
      ],
    }

    expect(buildStatsFinalSyncRetryResults(current, audit)).toEqual({
      canonical: { status: 'completed' },
      counterparts: { status: 'completed' },
      playerDocuments: { status: 'needs_sync', error: null },
      playerIndexes: { status: 'completed' },
      teamLeague: { status: 'needs_sync', error: null },
      clubs: { status: 'completed' },
      audit: {
        status: 'needs_sync',
        result: audit,
        error: null,
      },
    })
  })
})
