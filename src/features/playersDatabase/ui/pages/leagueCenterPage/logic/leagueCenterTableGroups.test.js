// src/features/playersDatabase/ui/pages/leagueCenterPage/logic/leagueCenterTableGroups.test.js
import { buildLeagueCenterTableGroups, sortLeagueCenterTableRows } from './leagueCenterTableGroups.js'
import { buildLeagueCenterColumns } from './leagueCenter.columns.js'
import { PLAYERS_DATABASE_UI_ROUTES as routes } from '../../../logic/routeBuilders.js'
import { readLeagueWorkNavigation } from '../../../logic/leagueWorkNavigation.js'

jest.mock('@mui/joy', () => ({ Box: 'span', Chip: 'button', Stack: 'div' }))
jest.mock('../../../components/entities/LeagueName.js', () => () => null)
jest.mock('../../../../../../ui/core/icons/iconUi.js', () => ({ iconUi: jest.fn() }))

const columns = buildLeagueCenterColumns({})
const sort = (rows, key, direction = 'asc') => sortLeagueCenterTableRows({
  rows, column: columns.find(column => column.key === key), direction,
})

test('sorts league levels from 1 downward and reverses without moving group headings', () => {
  const rows = buildLeagueCenterTableGroups([
    { id: 'low', leagueName: 'א', birthYear: 2012, seasonKey: '26/27', level: 3 },
    { id: 'high', leagueName: 'ב', birthYear: 2012, seasonKey: '26/27', level: 1 },
    { id: 'other', leagueName: 'ג', birthYear: 2011, seasonKey: '26/27', level: 2 },
  ])
  expect(sort(rows, 'leagueName').map(row => row.id)).toEqual([
    'group_2012_26/27', 'high', 'low', 'group_2011_26/27', 'other',
  ])
  expect(sort(rows, 'leagueName', 'desc').map(row => row.id)).toEqual([
    'group_2012_26/27', 'low', 'high', 'group_2011_26/27', 'other',
  ])
})

test('combined table sorts only supported facts', () => {
  expect(columns.filter(column => column.sortable !== false).map(column => column.key)).toEqual([
    'leagueName', 'statsLoaded', 'matchingTeams', 'pendingTeams', 'tableImportedAt',
  ])
})

test('sorts coverage using the existing values', () => {
  const rows = [
    { id: 'a', teamsCount: 10, playersStatsCompleteCount: 0 },
    { id: 'b', teamsCount: 10, playersStatsCompleteCount: 10 },
    { id: 'c', teamsCount: 10, playersStatsCompleteCount: 5 },
  ]
  expect(sort(rows, 'statsLoaded', 'desc').map(row => row.id)).toEqual(['b', 'c', 'a'])
  expect(columns.some(column => column.key === 'professionalPriority')).toBe(false)
})

test('combined table shows statistics and research together with stable widths for all thresholds', () => {
  expect(columns.filter(column => column.workArea).map(column => column.label)).toEqual([
    'טעינת סטטיסטיקות', 'קבוצות עם איתותים חזקים', 'ממתינות לחקירה',
  ])
  for (const strongSignalMinimum of [1, 2, 3]) {
    const next = buildLeagueCenterColumns({ strongSignalMinimum })
    for (const column of columns) {
      expect(next.find(item => item.key === column.key).sx.width).toBe(column.sx.width)
    }
    expect(next.reduce((sum, column) => sum + parseFloat(column.sx.width), 0)).toBeCloseTo(100)
  }
})

test('supports manual sorting of work counts', () => {
  const research = buildLeagueCenterColumns({})
  const rows = [
    { id: 'few', strongSignalWorkCounts: { strongMin1: 1 } },
    { id: 'many', strongSignalWorkCounts: { strongMin1: 4 } },
    { id: 'unknown' },
  ]
  const sorted = sortLeagueCenterTableRows({
    rows, column: research.find(column => column.key === 'matchingTeams'), direction: 'desc',
  })
  expect(sorted.map(row => row.id)).toEqual(['many', 'few', 'unknown'])
})

test.each([1, 2, 3])(
  'minimum %s opens cumulative matching or pending filters with the correct ratios', strongSignalMinimum => {
    const key = `strongMin${strongSignalMinimum}`
    const onOpenLeague = jest.fn()
    const research = buildLeagueCenterColumns({ onOpenLeague, strongSignalMinimum })
    const row = { teamsCount: 19, strongSignalWorkCounts: { [key]: 6, [key + 'Pending']: 4 } }
    const badge = research.find(column => column.key === 'matchingTeams').render(row)
    const pendingBadge = research.find(column => column.key === 'pendingTeams').render(row)
    expect(badge.props.component).toBe('span')
    expect(badge.props.slotProps.action.type).toBe('button')
    expect(badge.props.disabled).toBe(false)
    expect(badge.props.children.props.children).toBe('6/19')
    badge.props.onClick()
    expect(onOpenLeague).toHaveBeenCalledWith(row, key)
    expect(pendingBadge.props.component).toBe('span')
    expect(pendingBadge.props.slotProps.action.type).toBe('button')
    expect(pendingBadge.props.disabled).toBe(false)
    expect(pendingBadge.props.children.props.children).toBe('4/6')
    pendingBadge.props.onClick()
    expect(onOpenLeague).toHaveBeenCalledWith(row, key + 'Pending')
    for (const [, filter] of onOpenLeague.mock.calls) {
      const route = routes.league('league-1', { workMode: 'research', workFilter: filter })
      expect(readLeagueWorkNavigation(new URL(route, 'http://localhost').searchParams)).toEqual({ researchMode: true, filter })
    }
  }
)

test('an empty matching group keeps its zero count and disables the undefined pending ratio', () => {
  const research = buildLeagueCenterColumns({ onOpenLeague: jest.fn() })
  const row = { teamsCount: 14, strongSignalWorkCounts: { strongMin1: 0, strongMin1Pending: 0 } }
  const badge = research.find(column => column.key === 'matchingTeams').render(row)
  const pendingBadge = research.find(column => column.key === 'pendingTeams').render(row)
  expect(badge.props.children.props.children).toBe('0/14')
  expect(pendingBadge.props.disabled).toBe(true)
  expect(pendingBadge.props.children.props.children).toBe('−')
})

test('sorts stored timestamps and ISO dates chronologically with missing dates last', () => {
  const rows = [
    { id: 'missing' },
    { id: 'older', tableImportedAt: { seconds: 1000 } },
    { id: 'newer', tableImportedAt: '2026-10-12T00:00:00Z' },
  ]
  expect(sort(rows, 'tableImportedAt', 'desc').map(row => row.id)).toEqual(['newer', 'older', 'missing'])
})
