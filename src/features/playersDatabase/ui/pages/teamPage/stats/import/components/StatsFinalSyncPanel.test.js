// src/features/playersDatabase/ui/pages/teamPage/stats/import/components/StatsFinalSyncPanel.test.js

import { render, screen } from '@testing-library/react'

import StatsFinalSyncPanel from './StatsFinalSyncPanel.js'

describe('StatsFinalSyncPanel active Stats Load contract', () => {
  test('shows the shared sync cards and leaves retry to the modal primary action', () => {
    render(
      <StatsFinalSyncPanel
        controller={{
          executionStatus: 'audit_failed',
          auditResult: { findings: [{ target: 'playerSearchIndex' }] },
          syncStages: [{
            id: 'canonical',
            title: 'שמירת הסטטיסטיקות',
            target: 'dbTeamSeasons',
            state: 'completed',
          }],
          receiptId: 'receipt-1',
        }}
      />
    )

    expect(screen.getByText('שמירת הסטטיסטיקות')).toBeInTheDocument()
    expect(screen.getByText('הושלם')).toBeInTheDocument()
    const panelTitle = screen.getByText('סדר עדכון המסמכים')
    expect(panelTitle.parentElement).not.toHaveTextContent('קבלה: receipt-1')
    const statusTitle = screen.getByText('בדיקת הסנכרון אינה נקייה')
    expect(statusTitle.parentElement).toHaveTextContent('קבלה: receipt-1')
    expect(screen.getByText('1 ממצאים. ניתן לנסות שוב עם אותה קבלה.')).toBeInTheDocument()
  })

  test('uses the execution receipt id when the direct receipt id is not available', () => {
    render(
      <StatsFinalSyncPanel
        controller={{
          executionStatus: 'success',
          receiptId: '',
          executionReceipt: { id: 'receipt-from-state' },
          syncStages: [],
          auditResult: { findings: [], coverage: { complete: true } },
          listenerConfirmed: true,
        }}
      />
    )

    const statusTitle = screen.getByText('טעינת הסטטיסטיקות והבדיקה הושלמו')
    expect(statusTitle.parentElement).toHaveTextContent('קבלה: receipt-from-state')
  })
})
