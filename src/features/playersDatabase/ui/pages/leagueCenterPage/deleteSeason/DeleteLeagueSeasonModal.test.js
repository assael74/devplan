// src/features/playersDatabase/ui/pages/leagueCenterPage/deleteSeason/DeleteLeagueSeasonModal.test.js

import { render, screen } from '@testing-library/react'

import DeleteLeagueSeasonModal from './DeleteLeagueSeasonModal.js'

jest.mock('../../../components/modals/SteppedModal.js', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}))

test('shows the delete receipt beside the result message', () => {
  render(<DeleteLeagueSeasonModal flow={{
    selected: { leagueName: 'ליגה', seasonKey: '25/26' },
    status: 'succeeded',
    message: 'עונת הליגה נמחקה',
    receiptId: 'season-delete-receipt',
    close: jest.fn(),
  }} />)

  const message = screen.getByText('עונת הליגה נמחקה')
  expect(message.parentElement).toHaveTextContent('קבלה: season-delete-receipt')
})
