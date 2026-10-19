// src/features/playersDatabase/ui/components/scout/shared/TeamPriorityBadge.test.js

import * as React from 'react'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import useMediaQuery from '@mui/material/useMediaQuery'
import { CssVarsProvider } from '@mui/joy/styles'
import TeamPriorityBadge from './TeamPriorityBadge.js'
import DataTableCell from '../../tables/dataTable/DataTableCell.js'

jest.mock('@mui/material/useMediaQuery', () => ({ __esModule: true, default: jest.fn() }))
jest.mock('../../../../../../ui/core/icons/iconUi.js', () => ({ iconUi: () => null }))

const view = {
  priority: { score: 78, level: 'high' },
  quality: { rate: 90 },
  target: { rate: 120 },
  ranking: { rate: 150 },
}

const originalMatchMedia = window.matchMedia

beforeAll(() => {
  window.matchMedia = query => ({
    matches: false,
    media: query,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })
})

afterAll(() => { window.matchMedia = originalMatchMedia })

beforeEach(() => useMediaQuery.mockReturnValue(false))

const click = element => act(() => userEvent.click(element))

const renderBadge = (props = {}, parentProps = {}) => render(
  <CssVarsProvider>
    <div {...parentProps}>
      <TeamPriorityBadge side='defense' view={view} teamName='קבוצה א' {...props} />
    </div>
  </CssVarsProvider>
)

test('click opens three explanations and closing preserves the exit transition and restores focus', async () => {
  const onClick = jest.fn()
  renderBadge({}, { onClick })
  const trigger = screen.getByRole('button', { name: 'הסבר עדיפות הגנתית · קבוצה א' })

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  click(trigger)
  const dialog = await screen.findByRole('dialog', { name: 'עדיפות הגנתית' })
  expect(within(dialog).getByText('ביחס לליגה')).toBeInTheDocument()
  expect(within(dialog).getByText('מול הצפי')).toBeInTheDocument()
  expect(within(dialog).getByText('ביחס למיקום בטבלה')).toBeInTheDocument()
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

  click(within(dialog).getByText('ביחס לליגה'))
  click(within(dialog).getByRole('button', { name: 'סגירת הסבר העדיפות' }))
  expect(trigger).toHaveAttribute('aria-expanded', 'false')
  expect(dialog).toBeInTheDocument()
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  expect(trigger).toHaveFocus()
  expect(onClick).not.toHaveBeenCalled()
})

test('keyboard activation and Escape work without activating the containing row', async () => {
  const onKeyDown = jest.fn()
  renderBadge({}, { onKeyDown })
  const trigger = screen.getByRole('button', { name: 'הסבר עדיפות הגנתית · קבוצה א' })

  act(() => userEvent.tab())
  expect(trigger).toHaveFocus()
  act(() => userEvent.keyboard('{Enter}'))
  const dialog = await screen.findByRole('dialog')
  fireEvent.keyDown(dialog, { key: 'Escape' })
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  expect(trigger).toHaveFocus()
  expect(onKeyDown).not.toHaveBeenCalled()
})

test('clicking outside dismisses the popover without selecting the row', async () => {
  const onClick = jest.fn()
  renderBadge({}, { onClick })
  click(screen.getByRole('button', { name: 'הסבר עדיפות הגנתית · קבוצה א' }))
  await screen.findByRole('dialog')
  fireEvent.click(document.querySelector('.MuiBackdrop-root'))
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  expect(onClick).not.toHaveBeenCalled()
})

test('a narrow screen uses a bottom drawer and keeps its content mounted during close', async () => {
  useMediaQuery.mockImplementation(query => query === '(max-width: 599px)')
  renderBadge()
  const trigger = screen.getByRole('button', { name: 'הסבר עדיפות הגנתית · קבוצה א' })

  click(trigger)
  const dialog = await screen.findByRole('dialog', { name: 'עדיפות הגנתית' })
  expect(dialog).toHaveClass('MuiDrawer-content')
  expect(dialog).toHaveStyle({ bottom: '0px' })
  click(within(dialog).getByRole('button', { name: 'סגירת הסבר העדיפות' }))
  expect(trigger).toHaveAttribute('aria-expanded', 'false')
  expect(dialog).toBeInTheDocument()
  await waitFor(() => expect(trigger).toHaveFocus())
})

test('missing performance opens an explanation of unavailable data', async () => {
  renderBadge({ view: {} })
  click(screen.getByRole('button', { name: 'הסבר עדיפות הגנתית · קבוצה א' }))
  const dialog = await screen.findByRole('dialog')

  expect(within(dialog).getAllByText('לא זמין')).toHaveLength(4)
  expect(within(dialog).getByText(/המידע חלקי/)).toBeInTheDocument()
  expect(within(dialog).queryByText(/ציון 0/)).not.toBeInTheDocument()
})

test.each([false, true])('keeps calculation hidden until requested and collapses it gently in drawer=%s', async mobile => {
  useMediaQuery.mockImplementation(query => mobile && query === '(max-width: 599px)')
  renderBadge({
    view: {
      priority: { score: 84, level: 'elite' },
      quality: { rate: 79 }, target: { rate: 139 }, ranking: { rate: 180 },
    },
    team: {
      games: 8, goalsAgainst: 12, tableRank: 9,
      priorityContext: {
        teamsCount: 19, goalsAgainstRank: 5,
        defense: { qualityRate: 79, targetRate: 139 },
        projectedGoalsAgainst: 57,
        benchmark: { goalsAgainstPerGame: 2.081, goalsAgainst: 79, leagueNumGames: 38 },
      },
    },
  })
  click(screen.getByRole('button', { name: 'הסבר עדיפות הגנתית · קבוצה א' }))
  const dialog = await screen.findByRole('dialog')
  expect(within(dialog).getByText(/יעד מותאם 2.08/)).toBeInTheDocument()
  expect(within(dialog).getAllByText('מקדם')).toHaveLength(3)
  const targetSection = within(dialog).getByRole('region', { name: 'מול הצפי', exact: true })
  const rankingSection = within(dialog).getByRole('region', { name: 'ביחס למיקום בטבלה', exact: true })
  const toggle = within(targetSection).getByRole('button', { name: 'עוד: מול הצפי' })
  const rankingToggle = within(rankingSection).getByRole('button', { name: 'עוד: ביחס למיקום בטבלה' })
  const formula = within(dialog).getByText('47.4 + 23.25 + 13.5 = 84.15')
  const targetFormula = within(targetSection).getByText('93 × 25% = 23.25')
  expect(within(dialog).getAllByRole('button', { name: /^עוד:/ })).toHaveLength(3)
  expect(toggle).toHaveAttribute('aria-expanded', 'false')
  expect(formula).not.toBeVisible()
  expect(within(dialog).getByText(/לעונה של 38/)).not.toBeVisible()
  expect(within(dialog).getByText(/ציון הרכיב 93/)).not.toBeVisible()
  expect(within(dialog).queryByRole('region', { name: 'פירוט חישוב הציון: מול הצפי' })).not.toBeInTheDocument()

  click(toggle)
  expect(toggle).toHaveAttribute('aria-expanded', 'true')
  expect(toggle).toHaveTextContent('פחות')
  expect(toggle).toHaveAccessibleName('פחות: מול הצפי')
  expect(targetFormula).toBeVisible()
  expect(formula).not.toBeVisible()
  expect(within(dialog).getByText('79 × 60% = 47.4')).not.toBeVisible()
  expect(rankingToggle).toHaveAttribute('aria-expanded', 'false')

  act(() => userEvent.keyboard(' '))
  expect(toggle).toHaveAttribute('aria-expanded', 'false')
  expect(toggle).toHaveTextContent('עוד')
  expect(toggle).toHaveAccessibleName('עוד: מול הצפי')
  expect(targetFormula).toBeInTheDocument()
  expect(targetFormula).not.toBeVisible()
  expect(within(dialog).getByText(/יעד מותאם 2.08/)).toBeVisible()

  act(() => userEvent.keyboard('{Enter}'))
  expect(targetFormula).toBeVisible()
  click(rankingToggle)
  expect(rankingToggle).toHaveTextContent('פחות')
  expect(formula).toBeVisible()
  expect(targetFormula).toBeVisible()
  expect(within(dialog).getByText('לאחר עיגול: 84 מתוך 100')).toBeVisible()
  click(within(dialog).getByRole('button', { name: 'סגירת הסבר העדיפות' }))
  const trigger = screen.getByRole('button', { name: 'הסבר עדיפות הגנתית · קבוצה א' })
  await waitFor(() => expect(trigger).toHaveFocus())
  click(trigger)
  const reopened = await screen.findByRole('dialog')
  expect(within(reopened).getAllByRole('button', { name: /^עוד:/ }).every(button => button.getAttribute('aria-expanded') === 'false')).toBe(true)
  expect(within(reopened).getByText('47.4 + 23.25 + 13.5 = 84.15')).not.toBeVisible()
})

test.each([
  ['defense', 'goalsAgainst', 'הגנתית'],
  ['offense', 'goalsFor', 'התקפית'],
])('highlights only the %s goals number and clears it on close', async (side, column, label) => {
  render(
    <CssVarsProvider>
      <table><tbody>
        <tr>
          <DataTableCell column={{ key: column }} row={{ [column]: 6 }} />
          <td><TeamPriorityBadge side={side} view={view} teamName='קבוצה א' /></td>
        </tr>
        <tr><DataTableCell column={{ key: column }} row={{ [column]: 11 }} /></tr>
      </tbody></table>
    </CssVarsProvider>
  )

  click(screen.getByRole('button', { name: `הסבר עדיפות ${label} · קבוצה א` }))
  const dialog = await screen.findByRole('dialog')
  expect(screen.getByText('6')).toHaveAttribute('data-scout-source', 'true')
  expect(screen.getByText('6').closest('td')).not.toHaveAttribute('data-scout-source')
  expect(screen.getByText('11')).not.toHaveAttribute('data-scout-source')
  click(within(dialog).getByRole('button', { name: 'סגירת הסבר העדיפות' }))
  expect(screen.getByText('6')).not.toHaveAttribute('data-scout-source')
})
