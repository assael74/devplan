import { fireEvent, render, screen } from '@testing-library/react'

import ClearStatsModal from './ClearStatsModal.js'

jest.mock('../../../../../components/modals/RegularModal.js', () => {
  const React = require('react')

  return {
    __esModule: true,
    default: ({ children, hideFooter = false }) => React.createElement(
      'div',
      null,
      children,
      hideFooter ? null : React.createElement('button', null, 'שמירה')
    ),
  }
})

const controller = overrides => ({
  open: true,
  status: 'ready',
  proposedPlan: {
    identity: { birthTeamDocumentId: 'team-1', seasonKey: '2026' },
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
    expect(screen.getByText('נתוני טבלה רשמיים או ביצועי קבוצה.', { exact: false }))
      .toBeInTheDocument()
    expect(screen.getByText('שחקנים שפרופיל הסקאוט שלהם ינוקה')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'מחק נתוני סטטיסטיקה' }))
    expect(value.execute).toHaveBeenCalledTimes(1)
  })

  test('renders a complete no-op without an execute action', () => {
    render(<ClearStatsModal
      controller={controller({
        proposedPlan: {
          identity: { birthTeamDocumentId: 'team-1', seasonKey: '2026' },
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
    expect(screen.getByRole('button', { name: 'אישור ביקורת וסיום' })).toBeEnabled()
    expect(screen.queryByRole('button', { name: 'מחק נתוני סטטיסטיקה' }))
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
              { targetType: 'playerDocument', status: 'written' },
              { targetType: 'playerDocument', status: 'written' },
              { targetType: 'playerSearchIndex', status: 'written' },
              { targetType: 'league', status: 'skipped' },
            ],
          },
          audit: { status: 'passed' },
        },
        error: new Error('reload failed'),
      })}
    />)

    expect(screen.getByText('נתוני הסטטיסטיקה נמחקו בהצלחה')).toBeInTheDocument()
    expect(screen.getByText(/רענון הנתונים בעמוד נכשל/)).toBeInTheDocument()
    expect(screen.getByText('מסמכי השחקנים')).toBeInTheDocument()
    expect(screen.getByText('2 נכתבו')).toBeInTheDocument()
    expect(screen.getByText('מסמך הליגה')).toBeInTheDocument()
    expect(screen.getByText('1 כבר היו תקינים')).toBeInTheDocument()
    expect(screen.queryByText('receipt-1')).not.toBeInTheDocument()
  })

  test('shows the failed stage, partial progress, Receipt and Audit findings', () => {
    render(<ClearStatsModal
      controller={controller({
        status: 'failed',
        error: Object.assign(new Error('audit failed'), {
          code: 'CLEAR_STATS_AUDIT_FAILED',
          failedStep: 'audit',
          receiptId: 'receipt-failed-1',
          canonicalWrite: { writeSkipped: false, playersAffected: 2 },
          projectionWrite: {
            writesCompleted: 4,
            writesSkipped: 1,
            targets: [{ targetType: 'playerDocument', status: 'written' }],
            failedTarget: {
              targetType: 'playerSearchIndex',
              docId: 'hidden-player-index-id',
              status: 'failed',
              code: 'CLEAR_STATS_PROJECTION_SOURCE_MISMATCH',
            },
          },
          audit: {
            status: 'failed',
            failuresCount: 1,
            checks: [{
              targetType: 'playerSearchIndex',
              check: 'setFields.primaryScoutProfileId',
              status: 'failed',
              reason: 'Approved field does not match actual state',
            }],
          },
        }),
      })}
    />)

    expect(screen.getByText('בדיקת תקינות וסנכרון')).toBeInTheDocument()
    expect(screen.queryByText('receipt-failed-1')).not.toBeInTheDocument()
    expect(screen.getByText('פערים שנמצאו בבדיקת התקינות')).toBeInTheDocument()
    expect(screen.getByText('נמצא פער ב־אינדקסי השחקנים')).toBeInTheDocument()
    expect(screen.getByText('העדכון נעצר כאן')).toBeInTheDocument()
    expect(screen.queryByText(/setFields.primaryScoutProfileId/)).not.toBeInTheDocument()
    expect(screen.queryByText('hidden-player-index-id')).not.toBeInTheDocument()
  })
})
