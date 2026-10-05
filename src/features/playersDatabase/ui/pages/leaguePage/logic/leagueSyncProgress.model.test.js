// src/features/playersDatabase/ui/pages/leaguePage/logic/leagueSyncProgress.model.test.js

import {
  applyLeagueSyncProgressEvent,
  buildLeagueSyncStages,
} from './leagueSyncProgress.model.js'

describe('League sync progress', () => {
  test('keeps completed stages visible when a later stage fails', () => {
    let receipt = applyLeagueSyncProgressEvent({
      event: { type: 'receiptOpened', receiptId: 'receipt-1' },
    })
    receipt = applyLeagueSyncProgressEvent({
      receipt,
      event: { type: 'stageCompleted', receiptId: 'receipt-1', stageId: 'canonical' },
    })
    receipt = applyLeagueSyncProgressEvent({
      receipt,
      event: { type: 'stageFailed', receiptId: 'receipt-1', stageId: 'leaguesCenter' },
    })

    expect(receipt.canonicalOutcome).toBe('confirmed')
    expect(buildLeagueSyncStages({ receipt }).map(stage => stage.state)).toEqual([
      'completed',
      'pending',
      'failed',
      'pending',
      'pending',
    ])
  })

  test('marks only the next incomplete stage as running', () => {
    const stages = buildLeagueSyncStages({
      busy: true,
      receipt: {
        progress: {
          completedByStage: {
            canonical: true,
            teamSeasonCompetitionSnapshots: true,
          },
        },
      },
    })

    expect(stages.map(stage => stage.state)).toEqual([
      'completed',
      'completed',
      'running',
      'pending',
      'pending',
    ])
  })
})
