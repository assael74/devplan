// src/features/playersDatabase/ui/pages/teamPage/stats/import/components/StatsFinalSyncPanel.test.js

import { fireEvent, render, screen } from '@testing-library/react'

import StatsFinalSyncPanel from './StatsFinalSyncPanel.js'

describe('StatsFinalSyncPanel active Stats Load contract', () => {
  test('does not expose manual writer stages and retries the whole API action', () => {
    const retry = jest.fn()
    render(
      <StatsFinalSyncPanel
        controller={{
          status: 'audit_failed',
          auditResult: { findings: [{ target: 'playerSearchIndex' }] },
          retry,
          receiptId: 'receipt-1',
        }}
      />
    )

    expect(screen.queryByRole('button', { name: 'הפעל שלב' })).not.toBeInTheDocument()
    const retryButton = screen.getByRole('button', { name: 'נסה שוב' })
    fireEvent.click(retryButton)
    expect(retry).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Receipt: receipt-1')).toBeInTheDocument()
  })
})
