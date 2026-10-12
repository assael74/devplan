// src/features/playersDatabase/ui/pages/clubsPage/components/ClubIdentityEditor.test.js

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import ClubIdentityEditor from './ClubIdentityEditor.js'
import { readClubProfileDocument } from '../../../../services/read/pages/clubs.read.js'
import { updateClubIdentity } from '../../../../services/write/club/clubIdentity.write.js'

jest.mock('../../../../services/read/pages/clubs.read.js', () => ({ readClubProfileDocument: jest.fn() }))
jest.mock('../../../../services/write/club/clubIdentity.write.js', () => ({ updateClubIdentity: jest.fn() }))
jest.mock('../../../components/modals/RegularModal.js', () => ({ children, onConfirm, onClose, busy, disabled }) => (
  <div>
    {children}
    <button disabled={busy || disabled} onClick={onConfirm}>שמירה</button>
    <button disabled={busy} onClick={onClose}>ביטול</button>
  </div>
))

beforeEach(() => {
  jest.resetAllMocks()
  readClubProfileDocument.mockResolvedValue({
    documentExists: true,
    names: { display: 'ביתר תל אביב', short: 'ביתר ת״א' },
    aliases: ['כינוי שנלמד'], searchAliases: ['חיפוש נוסף'],
  })
})

test('loads canonical names and learned aliases; cancel does not write', async () => {
  const onClose = jest.fn()
  render(<ClubIdentityEditor clubId='a' onClose={onClose} onSaved={jest.fn()} />)
  await screen.findByDisplayValue('ביתר תל אביב')
  expect(screen.getByRole('textbox', { name: /שמות נוספים לזיהוי/ }).value).toBe('כינוי שנלמד\nחיפוש נוסף')
  expect(screen.getByText('שמירה').disabled).toBe(true)
  fireEvent.change(screen.getByDisplayValue('ביתר תל אביב'), { target: { value: 'חדש' } })
  fireEvent.click(screen.getByText('ביטול'))
  expect(onClose).toHaveBeenCalledTimes(1)
  expect(updateClubIdentity).not.toHaveBeenCalled()
})

test('failed save retains draft and successful save refreshes and closes', async () => {
  const onClose = jest.fn()
  const onSaved = jest.fn().mockResolvedValue(undefined)
  updateClubIdentity.mockRejectedValueOnce(new Error('שם כבר משויך')).mockResolvedValueOnce({ completed: true })
  render(<ClubIdentityEditor clubId='a' onClose={onClose} onSaved={onSaved} />)
  fireEvent.change(await screen.findByDisplayValue('ביתר ת״א'), { target: { value: 'בית״ר ת״א' } })
  fireEvent.click(screen.getByText('שמירה'))
  await screen.findByText('שם כבר משויך')
  expect(onClose).not.toHaveBeenCalled()
  expect(screen.getByDisplayValue('בית״ר ת״א')).toBeTruthy()
  fireEvent.click(screen.getByText('שמירה'))
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
  expect(onSaved).toHaveBeenCalledTimes(1)
  expect(updateClubIdentity).toHaveBeenLastCalledWith({
    clubId: 'a', displayName: 'ביתר תל אביב', shortName: 'בית״ר ת״א', aliases: ['כינוי שנלמד', 'חיפוש נוסף'],
  })
})
