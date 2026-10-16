// src/features/playersDatabase/ui/pages/teamPage/information/components/TeamRosterComparisonSection.test.js

import { fireEvent, render, screen } from '@testing-library/react'
import TeamRosterComparisonSection from './TeamRosterComparisonSection.js'
import DataTableHeader from '../../../../components/tables/dataTable/DataTableHeader.js'

jest.mock('../../../../../../../ui/core/icons/iconUi.js', () => ({
  iconUi: ({ id }) => <svg data-testid={`icon-${id}`} />,
}))

beforeEach(() => {
  global.ResizeObserver = class {
    observe() {}
    disconnect() {}
  }
})

const context = (goals, minutes) => ({ season: { seasonStatus: 'completed', teamPlayers: [{
  playerId: 'p', fullName: 'שחקן בדיקה', playerUrl: 'https://example.com/player',
  playerStats: { goals, minutes, games: 8, starts: 6, teamGames: 8, teamMinutes: 640 },
}] } })

test('spans metric groups across both seasons, keeps single columns and player actions', () => {
  const onPlayerOpen = jest.fn()
  const onFavoriteToggle = jest.fn()
  const { container } = render(<TeamRosterComparisonSection
    comparison={{ current: context(4, 500), previous: context(2, 400) }}
    onPlayerOpen={onPlayerOpen}
    onFavoriteToggle={onFavoriteToggle}
    favoritePlayerKeys={new Set()}
  />)
  const headings = container.querySelectorAll('thead tr')
  expect(headings).toHaveLength(2)
  expect([...headings[0].querySelectorAll('[colspan]')].map(cell => cell.colSpan)).toEqual([3, 3, 2, 2])
  expect(headings[0].querySelectorAll('[rowspan="2"]')).toHaveLength(6)
  expect([...headings[1].children].map(cell => cell.textContent.replace(/[▲▼]/g, '')))
    .toEqual(['26/27', '25/26', '', '26/27', '25/26', '', '26/27', '25/26', '26/27', '25/26'])
  expect(container.querySelectorAll('thead [data-testid="icon-swapVert"]')).toHaveLength(2)
  expect(container.querySelector('th[data-column="gamesStarts"] [data-testid="icon-gamesCount"]')).not.toBeNull()
  expect(container.querySelector('tbody [data-column="scoutProfileCurrent"]').textContent).toBe('—')
  expect(container.querySelector('tbody [data-column="scoutProfilePrevious"]').textContent).toBe('—')
  expect(container.querySelector('tbody [data-column="goalsCurrent"]').textContent).toBe('4')
  expect(container.querySelector('tbody [data-column="goalsPrevious"]').textContent).toBe('2')
  expect(container.querySelector('tbody [data-column="goalsChange"]').textContent).toBe('2')
  expect(container.querySelector('tbody [data-column="minutesChange"]').textContent).toBe('15%')
  expect(container.querySelector('tbody [data-column="minutesChange"]').textContent).not.toContain('דק׳')
  expect(container.querySelector('tbody [data-column="minutesCurrent"]').textContent).not.toContain('דק׳')
  expect(container.querySelector('tbody [data-column="minutesPrevious"]').textContent).toBe('63%')
  expect(container.querySelector('tbody [data-column="gamesStarts"]').textContent).toBe('8')
  expect(container.querySelector('[data-column="substitutedOut"]')).toBeNull()
  expect(container.querySelectorAll('tbody tr')).toHaveLength(1)
  expect([...container.querySelectorAll('colgroup:first-child col')].slice(0, 16)
    .reduce((sum, col) => sum + parseFloat(getComputedStyle(col).width || 0), 0)).toBe(100)
  fireEvent.click(screen.getByRole('button', { name: 'מיון לפי שערים 25/26' }))
  expect(container.querySelector('th[data-column="goalsPrevious"]').getAttribute('aria-sort')).toBe('descending')
  fireEvent.click(screen.getByRole('button', { name: 'כניסה לעמוד השחקן שחקן בדיקה' }))
  expect(onPlayerOpen).toHaveBeenCalledWith(expect.objectContaining({ playerId: 'p' }), '26/27')
  fireEvent.click(screen.getByRole('button', { name: 'הוספה למועדפים זמניים: שחקן בדיקה' }))
  expect(onFavoriteToggle).toHaveBeenCalledWith(expect.objectContaining({ favoriteKey: 'p' }))
})

test('ordinary table headers remain a single row without spans', () => {
  const { container } = render(<table><DataTableHeader
    columns={[{ key: 'name', label: 'שחקן' }, { key: 'goals', label: 'שערים' }]}
    sortState={{ key: '', direction: 'desc' }}
    onSort={jest.fn()}
  /></table>)
  expect(container.querySelectorAll('thead tr')).toHaveLength(1)
  expect(container.querySelector('[rowspan], [colspan]')).toBeNull()
})

test('shows actual goals beside the scout forecast and compares the forecast', () => {
  const current = context(7, 500)
  current.season.seasonStatus = 'active'
  current.season.teamPlayers[0].scoutSeasonProjection = { evidence: {
    actual: { goals: 7 },
    calculationContext: { seasonStatus: 'active', teamGamePlayed: 8, leagueTotalRound: 38 },
  } }
  const { container } = render(<TeamRosterComparisonSection
    comparison={{ current, previous: context(9, 400) }}
    favoritePlayerKeys={new Set()}
  />)
  expect(container.querySelector('tbody [data-column="goalsCurrent"]').textContent).toBe('7צפי 33')
  expect(container.querySelector('tbody [data-column="goalsPrevious"]').textContent).toBe('9')
  expect(container.querySelector('tbody [data-column="goalsChange"]').textContent).toBe('24')
  expect(screen.getByRole('button', { name: 'מיון לפי שינוי בצפי השערים העונתי' })).toBeTruthy()
})

test('every sortable comparison column keeps its direction arrow beside its own label', () => {
  const { container } = render(<TeamRosterComparisonSection
    comparison={{ current: context(4, 500), previous: context(2, 400) }}
    favoritePlayerKeys={new Set()}
  />)
  const activeHeaders = () => container.querySelectorAll('th[aria-sort="ascending"], th[aria-sort="descending"]')
  const assertArrow = (header, direction) => {
    expect(activeHeaders()).toHaveLength(1)
    expect(activeHeaders()[0]).toBe(header)
    const arrow = header.querySelector('button > span[aria-hidden="true"]')
    const iconId = direction === 'ascending' ? 'sortUp' : 'sortDown'
    expect(arrow.querySelector(`[data-testid="icon-${iconId}"]`)).not.toBeNull()
    expect(getComputedStyle(arrow).position).not.toBe('absolute')
    expect(getComputedStyle(arrow).flexShrink).toBe('0')
  }
  assertArrow(container.querySelector('th[data-column="minutesCurrent"]'), 'descending')
  screen.getAllByRole('button', { name: /^מיון לפי/ }).forEach(button => {
    const header = button.closest('th')
    fireEvent.click(button)
    const direction = header.getAttribute('aria-sort')
    assertArrow(header, direction)
    fireEvent.click(button)
    const reversed = direction === 'ascending' ? 'descending' : 'ascending'
    expect(header.getAttribute('aria-sort')).toBe(reversed)
    assertArrow(header, reversed)
  })
})
