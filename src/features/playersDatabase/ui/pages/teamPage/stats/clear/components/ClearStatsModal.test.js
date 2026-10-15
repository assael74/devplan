// src/features/playersDatabase/ui/pages/teamPage/stats/clear/components/ClearStatsModal.test.js
import { fireEvent, render, screen, within } from '@testing-library/react'

import ClearStatsModal from './ClearStatsModal.js'

jest.mock('../../../../../components/modals/RegularModal.js', () => {
  const React = require('react')

  return {
    __esModule: true,
    default: ({ children, hideFooter = false, footerContent = null }) => React.createElement(
      'div',
      null,
      children,
      hideFooter ? null : (footerContent || React.createElement('button', null, 'שמירה'))
    ),
  }
})

const controller = overrides => ({
  open: true,
  status: 'ready',
  proposedPlan: {
    identity: { teamId: 'team-1', seasonId: '2025_2026', seasonKey: '25/26' },
    currentStatsState: 'present',
    isIdempotent: false,
    impact: {
      playersAffected: 2,
      scoutProfilePlayersAffected: 1,
      scoutingFieldsRemoved: 3,
    },
    projectionPlan: { impact: { operationsRequired: 4 } },
  },
  result: null,
  error: null,
  executionReceipt: null,
  syncStages: [],
  close: jest.fn(),
  execute: jest.fn(),
  retry: jest.fn(),
  ...overrides,
})

describe('ClearStatsModal', () => {
  test('shows only the dedicated confirmation controls', () => {
    const value = controller()
    render(<ClearStatsModal controller={value} teamName='קבוצה א' seasonKey='2026' />)

    expect(screen.queryByRole('button', { name: 'שמירה' })).not.toBeInTheDocument()
    const scoutProfileCountLabel = screen.getByText('שחקנים שפרופיל הסקאוט שלהם ינוקה')
    expect(within(scoutProfileCountLabel.parentElement).getByText('1')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'אישור מחיקה' }))
    expect(value.execute).toHaveBeenCalledTimes(1)
  })

  test('renders a complete no-op without an execute action', () => {
    render(<ClearStatsModal
      controller={controller({
        proposedPlan: {
          identity: { teamId: 'team-1', seasonId: '2025_2026', seasonKey: '25/26' },
          currentStatsState: 'absent',
          isIdempotent: true,
          impact: {
            playersAffected: 0,
            scoutProfilePlayersAffected: 0,
            scoutingFieldsRemoved: 0,
          },
          projectionPlan: { impact: { operationsRequired: 0 } },
        },
      })}
    />)

    expect(screen.getByText(/נתוני הסטטיסטיקה כבר נקיים/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'בדיקת סנכרון וסיום' })).toBeEnabled()
    expect(screen.queryByRole('button', { name: 'אישור מחיקה' }))
      .not.toBeInTheDocument()
  })

  test('keeps delete success visible when only the page refresh failed', () => {
    render(<ClearStatsModal
      controller={controller({
        status: 'succeeded',
        result: {
          receiptId: 'receipt-1',
          canonicalWrite: { playersAffected: 2 },
          projectionWrite: {
            writesCompleted: 3,
            writesSkipped: 1,
            targets: [
              { targetType: 'playerRoots', status: 'written' },
              { targetType: 'playerRoots', status: 'written' },
              { targetType: 'playerSearchIndexes', status: 'written' },
              { targetType: 'leagueProjection', status: 'skipped' },
            ],
          },
          audit: { status: 'CLEAN' },
        },
        error: new Error('reload failed'),
        executionReceipt: {
          id: 'receipt-1',
          progress: { completedByStage: { canonical: true } },
        },
        syncStages: [{
          id: 'canonical',
          title: 'מחיקת נתוני הסטטיסטיקה',
          target: 'dbTeamSeasons',
          state: 'completed',
        }],
      })}
    />)

    expect(screen.getByText('נתוני הסטטיסטיקה נמחקו בהצלחה')).toBeInTheDocument()
    expect(screen.getByText(/רענון הנתונים בעמוד נכשל/)).toBeInTheDocument()
    expect(screen.getByText('מסמכי השחקנים')).toBeInTheDocument()
    expect(screen.getByText('2 נכתבו')).toBeInTheDocument()
    expect(screen.getByText('מסמך הליגה')).toBeInTheDocument()
    expect(screen.getByText('1 כבר היו תקינים')).toBeInTheDocument()
    const syncTitle = screen.getByText('סדר עדכון המסמכים')
    expect(syncTitle.parentElement).not.toHaveTextContent('קבלה: receipt-1')
    const statusTitle = screen.getByText('נתוני הסטטיסטיקה נמחקו בהצלחה')
    expect(statusTitle.parentElement).toHaveTextContent('קבלה: receipt-1')
    expect(screen.getByText('מחיקת נתוני הסטטיסטיקה')).toBeInTheDocument()
  })

  test('shows the failed stage, partial progress, Receipt and Audit findings', () => {
    render(<ClearStatsModal
      controller={controller({
        status: 'failed',
        error: Object.assign(new Error('audit failed'), {
          code: 'STATS_CLEAR_AUDIT_FAILED',
          failedStep: 'audit',
          receiptId: 'receipt-failed-1',
          canonicalWrite: { writeSkipped: false, playersAffected: 2 },
          projectionWrite: {
            writesCompleted: 4,
            writesSkipped: 1,
            targets: [{ targetType: 'playerRoots', status: 'written' }],
            failedTarget: {
              targetType: 'playerSearchIndexes',
              docId: 'hidden-player-index-id',
              status: 'failed',
              code: 'STATS_CLEAR_PROJECTION_SOURCE_MISMATCH',
            },
          },
          audit: {
            status: 'FINDINGS',
            findings: [{
              target: 'playerSearchIndex',
              field: 'scoutProfileIds',
            }],
          },
        }),
      })}
    />)

    expect(screen.getAllByText('בדיקת סנכרון')).toHaveLength(1)
    const syncTitle = screen.getByText('סדר עדכון המסמכים')
    expect(syncTitle.parentElement).not.toHaveTextContent('קבלה: receipt-failed-1')
    const statusTitle = screen.getByText('מחיקת נתוני הסטטיסטיקה לא הושלמה')
    expect(statusTitle.parentElement).toHaveTextContent('קבלה: receipt-failed-1')
    expect(screen.getByText('פערים שנמצאו בבדיקת הסנכרון')).toBeInTheDocument()
    expect(screen.getByText('נמצא פער ב־תוצרי חיפוש השחקנים')).toBeInTheDocument()
    expect(screen.getByText('העדכון נעצר כאן')).toBeInTheDocument()
    expect(screen.queryByText(/scoutProfileIds/)).not.toBeInTheDocument()
    expect(screen.queryByText('hidden-player-index-id')).not.toBeInTheDocument()
  })
})
