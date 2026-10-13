// src/features/playersDatabase/ui/pages/leagueCenterPage/logic/leagueCenterTableGroups.test.js
import { buildLeagueCenterTableGroups, sortLeagueCenterTableRows } from './leagueCenterTableGroups.js'
import { buildLeagueCenterColumns } from './leagueCenter.columns.js'

jest.mock('@mui/joy', () => ({}))
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

test('enables only the four requested headings', () => {
  expect(columns.filter(column => column.sortable !== false).map(column => column.key)).toEqual([
    'leagueName', 'playersStatsStatus', 'professionalPriority', 'tableImportedAt',
  ])
})

test('sorts coverage and professional priority using the existing values', () => {
  const rows = [
    { id: 'a', playersStatsStatus: 'missing', offensePriorityCount: 1 },
    { id: 'b', playersStatsStatus: 'full', offensePriorityCount: 3 },
    { id: 'c', playersStatsStatus: 'partial', defensePriorityCount: 2 },
  ]
  expect(sort(rows, 'playersStatsStatus', 'desc').map(row => row.id)).toEqual(['b', 'c', 'a'])
  expect(sort(rows, 'professionalPriority', 'desc').map(row => row.id)).toEqual(['b', 'c', 'a'])
})

test('sorts stored timestamps and ISO dates chronologically with missing dates last', () => {
  const rows = [
    { id: 'missing' },
    { id: 'older', tableImportedAt: { seconds: 1000 } },
    { id: 'newer', tableImportedAt: '2026-10-12T00:00:00Z' },
  ]
  expect(sort(rows, 'tableImportedAt', 'desc').map(row => row.id)).toEqual(['newer', 'older', 'missing'])
})
