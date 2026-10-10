// src/features/playersDatabase/ui/pages/leaguePage/clear/ClearLeagueTeamsModal.test.js

import { render, screen } from '@testing-library/react'

import ClearLeagueTeamsModal from './ClearLeagueTeamsModal.js'

jest.mock('../../../components/modals/SteppedModal.js', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}))

test('shows the clear receipt inside the status box below the synchronization cards', () => {
  render(<ClearLeagueTeamsModal flow={{
    open: true,
    status: 'succeeded',
    syncStages: [],
    receiptId: 'league-clear-receipt',
    close: jest.fn(),
  }} />)

  const title = screen.getByText('סדר עדכון המסמכים')
  expect(title).not.toHaveTextContent('קבלה: league-clear-receipt')
  const statusTitle = screen.getByText('מחיקת קבוצות העונה והסנכרון הושלמו')
  expect(statusTitle.parentElement).toHaveTextContent('קבלה: league-clear-receipt')
})
