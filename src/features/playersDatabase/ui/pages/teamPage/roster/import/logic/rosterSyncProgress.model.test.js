// src/features/playersDatabase/ui/pages/teamPage/roster/import/logic/rosterSyncProgress.model.test.js

import {
  applyRosterSyncProgressEvent,
  buildRosterSyncStages,
  resolveRosterRetryMode,
} from './rosterSyncProgress.model.js'

test('keeps completed Roster stages when a later projection fails', () => {
  let receipt = applyRosterSyncProgressEvent({
    event: { type: 'receiptOpened', receiptId: 'receipt-1' },
  })
  receipt = applyRosterSyncProgressEvent({
    receipt,
    event: { type: 'stageCompleted', receiptId: 'receipt-1', stageId: 'canonical' },
  })
  receipt = applyRosterSyncProgressEvent({
    receipt,
    event: { type: 'stageCompleted', receiptId: 'receipt-1', stageId: 'counterparts' },
  })
  receipt = applyRosterSyncProgressEvent({
    receipt,
    event: { type: 'stageFailed', receiptId: 'receipt-1', stageId: 'leaguesCenter' },
  })

  const stages = buildRosterSyncStages({ receipt })
  expect(stages.find(stage => stage.id === 'canonical').state).toBe('completed')
  expect(stages.find(stage => stage.id === 'counterparts').state).toBe('completed')
  expect(stages.find(stage => stage.id === 'leaguesCenter').state).toBe('failed')
  expect(resolveRosterRetryMode(receipt)).toBe('repair')
})

test('marks only the next pending stage as running', () => {
  const stages = buildRosterSyncStages({
    busy: true,
    receipt: {
      progress: {
        completedByStage: { canonical: true },
        failed: {},
      },
    },
  })

  expect(stages.find(stage => stage.id === 'counterparts').state).toBe('running')
  expect(stages.filter(stage => stage.state === 'running')).toHaveLength(1)
})
