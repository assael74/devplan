// src/features/playersDatabase/ui/pages/teamPage/roster/clear/ClearRosterModal.test.js

import { render, screen } from '@testing-library/react'

import ClearRosterModal from './ClearRosterModal.js'

jest.mock('../../../../components/modals/SteppedModal.js', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}))

test('shows the clear receipt inside the status box below the synchronization cards', () => {
  render(<ClearRosterModal controller={{
    open: true,
    status: 'succeeded',
    proposal: { impact: {} },
    syncStages: [],
    receiptId: 'roster-clear-receipt',
    close: jest.fn(),
  }} />)

  const title = screen.getByText('סדר עדכון המסמכים')
  expect(title).not.toHaveTextContent('קבלה: roster-clear-receipt')
  const statusTitle = screen.getByText('מחיקת הסגל והסנכרון הושלמו')
  expect(statusTitle.parentElement).toHaveTextContent('קבלה: roster-clear-receipt')
})
