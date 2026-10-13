// src/features/playersDatabase/ui/pages/teamPage/stats/import/components/StatsIdentityDetailsModal.test.js
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import StatsIdentityDetailsModal from './StatsIdentityDetailsModal.js'

jest.mock('@mui/joy', () => ({
  Stack: ({ children }) => <div>{children}</div>,
  FormControl: ({ children }) => <div>{children}</div>,
  FormLabel: ({ children }) => <span>{children}</span>,
  Input: ({ value, onChange }) => <input value={value} onChange={onChange} />,
  Typography: ({ children, role }) => <div role={role}>{children}</div>,
}))
jest.mock('../../../../../components/modals/RegularModal.js', () => ({
  __esModule: true,
  default: ({ open, children, onConfirm, disabled }) => open ? <div>{children}<button disabled={disabled} onClick={onConfirm}>אישור</button></div> : null,
}))

test('submits both identity fields and keeps failures visible without closing', async () => {
  const onClose = jest.fn()
  const onSave = jest.fn().mockRejectedValueOnce(new Error('המזהים אינם תואמים')).mockResolvedValueOnce()
  render(<StatsIdentityDetailsModal selection={{ rowIndex: 2, row: { id: 'row3', fullName: 'שחקן' } }} onSave={onSave} onClose={onClose} />)
  const fields = screen.getAllByRole('textbox')
  fireEvent.change(fields[0], { target: { value: '12345' } })
  fireEvent.change(fields[1], { target: { value: '/players/player/?player_id=12345' } })
  fireEvent.click(screen.getByText('אישור'))
  await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('המזהים אינם תואמים'))
  expect(onClose).not.toHaveBeenCalled()
  expect(onSave).toHaveBeenCalledWith({ rowIndex: 2, rowId: 'row3', externalPlayerId: '12345', playerUrl: '/players/player/?player_id=12345' })
  fireEvent.click(screen.getByText('אישור'))
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
})
