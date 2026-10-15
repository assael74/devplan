// src/features/playersDatabase/ui/pages/DataOpsPage/logic/receiptRows.logic.test.js

import { buildReceiptDetails, buildReceiptRow } from './receiptRows.logic.js'

describe('DataOps receipt rows', () => {
  test('shows a failed receipt as stopped', () => {
    expect(buildReceiptRow({
      id: 'receipt-2',
      actionType: 'statsLoad',
      target: { domain: 'stats' },
      status: 'open',
      executionStatus: 'failed',
      recoveryRequired: true,
    })).toMatchObject({
      scope: 'סטטיסטיקות',
      action: 'טעינת סטטיסטיקות',
      status: 'נעצר',
      tone: 'danger',
    })
  })

  test('labels a League Open receipt separately from League Load', () => {
    expect(buildReceiptRow({
      id: 'receipt-open',
      actionType: 'leagueOpen',
      target: { domain: 'league' },
      status: 'closed',
      executionStatus: 'succeeded',
    })).toMatchObject({
      action: 'פתיחת ליגה',
      status: 'הושלם',
    })
  })

  test('does not label a recovery receipt as complete even when execution succeeded', () => {
    expect(buildReceiptRow({
      id: 'receipt-recovery',
      actionType: 'statsLoad',
      status: 'open',
      executionStatus: 'succeeded',
      recoveryRequired: true,
    })).toMatchObject({
      status: 'דורש תיקון',
      tone: 'warning',
    })
  })

  test('builds receipt details from persisted progress and target identity', () => {
    expect(buildReceiptDetails({
      id: 'receipt-3',
      actionType: 'statsLoad',
      target: {
        leagueId: 'league-a',
        teamId: 'team-a',
        seasonId: '2026_2027',
      },
      canonicalOutcome: 'confirmed',
      recoveryRequired: true,
      status: 'open',
      executionStatus: 'failed',
      progress: {
        completedByStage: {
          canonical: {},
          counterparts: {},
        },
        failed: {
          stageId: 'playerSearchIndexes',
          errorCode: 'write failed',
        },
      },
      audit: {
        coverage: 'partial',
        findingsCount: 2,
      },
    })).toMatchObject({
      id: 'receipt-3',
      canonicalOutcome: 'נשמר בהצלחה',
      completedStages: ['שמירת הנתונים הראשיים', 'עדכון מעברים בין קבוצות'],
      failedStage: 'עדכון חיפוש השחקנים',
      failedReason: 'הפעולה נעצרה עקב שגיאה',
      auditCoverage: 'partial',
      findingsCount: 2,
    })
  })
})

