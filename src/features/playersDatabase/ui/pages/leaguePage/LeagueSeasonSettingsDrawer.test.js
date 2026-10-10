// src/features/playersDatabase/ui/pages/leaguePage/LeagueSeasonSettingsDrawer.test.js

import * as React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import LeagueSeasonSettingsDrawer from './LeagueSeasonSettingsDrawer.js'

jest.mock('../../../../../ui/patterns/drawer/DrawerShell.js', () => ({
  __esModule: true,
  default: ({ children, actions, canSave }) => require('react').createElement(
    'div',
    null,
    children,
    require('react').createElement('button', {
      disabled: !canSave,
      onClick: actions.onSave,
    }, 'שמירת קישור'),
  ),
}))

jest.mock('../../../../../ui/patterns/drawer/DrawerHeaderShell.js', () => ({
  __esModule: true,
  default: () => null,
}))

test('league settings exposes independent URL and competition-rule save actions', () => {
  const editor = {
    open: true,
    context: { leagueName: 'ליגה', seasonKey: '26/27', teamCount: 4 },
    saving: false,
    urlSaving: false,
    rulesSaving: false,
    urlDirty: true,
    urlValid: true,
    rulesDirty: true,
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
    saveUrl: jest.fn(),
    saveRules: jest.fn(),
  }

  render(<LeagueSeasonSettingsDrawer editor={editor} />)
  fireEvent.click(screen.getByRole('button', { name: 'שמירת חוקי התחרות' }))
  expect(editor.saveRules).toHaveBeenCalledTimes(1)
  expect(editor.saveUrl).not.toHaveBeenCalled()

  fireEvent.click(screen.getByRole('button', { name: 'שמירת קישור' }))
  expect(editor.saveUrl).toHaveBeenCalledTimes(1)
})
