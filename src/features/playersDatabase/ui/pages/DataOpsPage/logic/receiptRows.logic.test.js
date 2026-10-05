// src/features/playersDatabase/ui/pages/DataOpsPage/logic/receiptRows.logic.test.js

import { buildReceiptDetails, buildReceiptRow } from './receiptRows.logic.js'

describe('DataOps receipt rows', () => {
  test('maps a completed Club bootstrap receipt to the visible table contract', () => {
    const row = buildReceiptRow({
      id: 'receipt-1',
      actionType: 'clubsBootstrap',
      targetKey: 'clubs:bootstrap',
      target: { domain: 'clubs' },
      display: {
        actionLabel: 'אתחול מועדונים',
        targetLabel: 'כל המועדונים',
      },
      status: 'closed',
      executionStatus: 'succeeded',
      timestamps: {
        updatedAt: { toDate: () => new Date('2026-10-03T08:30:00.000Z') },
      },
    })

    expect(row).toMatchObject({
      id: 'receipt-1',
      scope: 'כל המועדונים',
      action: 'אתחול מועדונים',
      status: 'הושלם',
      tone: 'success',
    })
    expect(row.time).not.toBe('—')
  })

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
      canonicalOutcome: 'confirmed',
      completedStages: ['canonical', 'counterparts'],
      failedStage: 'playerSearchIndexes',
      failedReason: 'write failed',
      auditCoverage: 'partial',
      findingsCount: 2,
    })
  })
})

