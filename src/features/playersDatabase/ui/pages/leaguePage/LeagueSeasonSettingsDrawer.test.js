// src/features/playersDatabase/ui/pages/leaguePage/LeagueSeasonSettingsDrawer.test.js

import * as React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import LeagueSeasonSettingsDrawer from './LeagueSeasonSettingsDrawer.js'
import useLeagueUrlEditor from './hooks/useLeagueUrlEditor.js'
import { updateLeagueSeasonSettings } from '../../../services/write/league/edits/updateLeagueSeasonSettings.js'

jest.mock('../../../services/write/league/edits/updateLeagueSeasonSettings.js', () => ({
  updateLeagueSeasonSettings: jest.fn(),
}))

jest.mock('../../../../../ui/patterns/drawer/DrawerShell.js', () => ({
  __esModule: true,
  default: ({ children, actions, canSave, texts }) => require('react').createElement(
    'div',
    null,
    children,
    require('react').createElement('button', {
      disabled: !canSave,
      onClick: actions.onSave,
    }, texts.save),
  ),
}))

test.each([
  [true, false],
  [false, true],
  [true, true],
])('main save handles URL dirty=%s and rules dirty=%s', (urlDirty, rulesDirty) => {
  const editor = {
    open: true,
    context: { leagueName: 'ליגה', seasonKey: '26/27', teamCount: 4 },
    saving: false,
    urlDirty,
    urlValid: true,
    rulesDirty,
    rulesValid: true,
    draftUrl: 'https://example.com',
    draftRules: {
      promotionDirectPlaces: '1',
      promotionPlayoffPlaces: '0',
      relegationDirectPlaces: '1',
      relegationPlayoffPlaces: '0',
    },
    close: jest.fn(),
    changeUrl: jest.fn(),
    changeRule: jest.fn(),
    save: jest.fn(),
  }

  render(<LeagueSeasonSettingsDrawer editor={editor} />)
  expect(screen.getAllByRole('button')).toHaveLength(1)
  const saveButton = screen.getByRole('button', { name: 'שמירת שינויים' })
  expect(saveButton).toBeEnabled()
  fireEvent.click(saveButton)
  expect(editor.save).toHaveBeenCalledTimes(1)
})

test('editing only a competition quantity enables the main button and submits no URL', async () => {
  updateLeagueSeasonSettings.mockResolvedValue({ completed: true, changedCount: 1 })
  const notify = jest.fn()
  function SettingsDrawer() {
    const editor = useLeagueUrlEditor({
      league: { id: 'league-a', name: 'ליגה', level: 2 },
      selectedSeasonOption: {
        seasonId: '2026_2027',
        seasonKey: '26/27',
        season: {
          seasonUrl: 'https://example.com',
          competitionRules: {
            configured: true,
            promotion: { enabled: true, directPlaces: [1], playoffPlaces: [] },
            relegation: { enabled: true, directPlaces: [4], playoffPlaces: [] },
          },
          table: { teamsById: { a: {}, b: {}, c: {}, d: {} } },
        },
      },
      notify,
    })
    return (
      <>
        <button onClick={editor.show}>פתיחת המגירה</button>
        {editor.open && <LeagueSeasonSettingsDrawer editor={editor} />}
      </>
    )
  }

  render(<SettingsDrawer />)
  fireEvent.click(screen.getByRole('button', { name: 'פתיחת המגירה' }))
  const saveButton = screen.getByRole('button', { name: 'שמירת שינויים' })
  expect(saveButton).toBeDisabled()
  fireEvent.change(screen.getByRole('spinbutton', { name: 'כמות עולות ישירות' }), {
    target: { value: '2' },
  })
  expect(saveButton).toBeEnabled()
  fireEvent.click(saveButton)
  await waitFor(() => expect(notify).toHaveBeenCalledWith(expect.objectContaining({ status: 'success' })))
  expect(saveButton).toBeDisabled()
  expect(updateLeagueSeasonSettings).toHaveBeenCalledTimes(1)
  const submitted = updateLeagueSeasonSettings.mock.calls[0][0]
  expect(Object.keys(submitted).sort()).toEqual(['competitionRules', 'leagueId', 'seasonId'])
  expect(submitted.competitionRules.promotion.directPlaces).toEqual([1, 2])
})
