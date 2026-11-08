// src/ui/forms/gameStats/GameStatsCreateForm.test.js

import React from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import GameStatsCreateForm from './GameStatsCreateForm.js'

jest.mock('../../core/icons/iconUi.js', () => ({ iconUi: () => null }))
jest.mock('./GameStatsMetaPanel.js', () => () => null)
jest.mock('./steps/GameStatsSteps.js', () => ({
  renderGameStatsStep: ({ draft }) => <span>נתוני משחק {draft?.gameId}</span>,
}))
jest.mock('./modals/SaveConfirmModal.js', () => () => null)
jest.mock('./modals/DeleteDraftConfirmModal.js', () => () => null)

test('closing retains drawer content for the transition and reopening loads the new game', () => {
  const onClose = jest.fn()
  const game = { id: 'g1', rivel: 'בני סכנין' }
  const savedDraft = { gameId: 'g1', status: 'draft' }
  const { rerender } = render(<GameStatsCreateForm open game={game} savedDraft={savedDraft} onClose={onClose} />)
  const dialog = screen.getByRole('dialog')
  expect(within(dialog).getByText('נתוני משחק g1')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'סגירת עריכת הסטטיסטיקה' }))
  expect(onClose).toHaveBeenCalledTimes(1)
  rerender(<GameStatsCreateForm open={false} game={null} savedDraft={null} onClose={onClose} />)
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(dialog).toBeInTheDocument()
  expect(dialog).toHaveTextContent('נתוני משחק g1')
  expect(dialog).toHaveTextContent('בני סכנין')
  rerender(<GameStatsCreateForm open game={{ id: 'g2', rivel: 'מכבי תא' }} savedDraft={{ gameId: 'g2', status: 'committed' }} onClose={onClose} />)
  expect(screen.getByRole('dialog')).toHaveTextContent('נתוני משחק g2')
  expect(screen.getByRole('dialog')).toHaveTextContent('מכבי תא')
  expect(screen.getByRole('dialog')).not.toHaveTextContent('נתוני משחק g1')
})
