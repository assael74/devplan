// src/features/playersDatabase/ui/pages/leagueCenterPage/OpenLeagueModal.test.js

import { fireEvent, render, screen } from '@testing-library/react'

import OpenLeagueModal from './OpenLeagueModal.js'

jest.mock('../../components/modals/RegularModal.js', () => props => props.open ? (
  <div>
    <h1>{props.title}</h1>
    {props.children}
    <button disabled={props.disabled || props.busy} onClick={props.onConfirm}>{props.confirmLabel}</button>
  </div>
) : null)

const options = [{
  value: 'league-1', ageGroupId: 'youth', ageGroupLabel: 'נוער', name: 'ליגת נוער',
  label: 'ליגת נוער', region: 'national', level: 1, existingSeasonIds: ['2026_2027'],
}]

test('locks the audited league and season and permits repairing a stale center entry', () => {
  const onConfirm = jest.fn()
  render(<OpenLeagueModal
    open
    options={options}
    repairContext={{ leagueId: 'league-1', seasonId: '2026_2027' }}
    onConfirm={onConfirm}
  />)
  screen.getAllByRole('combobox').forEach(selector => expect(selector).toBeDisabled())
  const confirm = screen.getByRole('button', { name: 'אשר ופתח מקור ליגה' })
  expect(confirm).not.toBeDisabled()
  fireEvent.click(confirm)
  expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({
    value: 'league-1', seasonId: '2026_2027', seasonKey: '26/27',
  }))
})

test('blocks a missing league catalog entry instead of selecting a different league', () => {
  const onConfirm = jest.fn()
  render(<OpenLeagueModal
    open
    options={options}
    repairContext={{ leagueId: 'unknown', seasonId: '2026_2027' }}
    onConfirm={onConfirm}
  />)
  expect(screen.getByText(/הליגה או העונה אינן זמינות בקטלוג/)).toBeInTheDocument()
  const confirm = screen.getByRole('button', { name: 'אשר ופתח מקור ליגה' })
  expect(confirm).toBeDisabled()
  fireEvent.click(confirm)
  expect(onConfirm).not.toHaveBeenCalled()
})
