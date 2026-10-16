// src/features/playersDatabase/ui/components/tables/dataTable/DataTable.selection.test.js

import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import DataTable from './DataTable.js'

jest.mock('../../../../../../ui/core/icons/iconUi.js', () => ({
  iconUi: ({ id }) => <svg data-testid={`icon-${id}`} />,
}))

beforeEach(() => {
  global.ResizeObserver = class {
    observe() {}
    disconnect() {}
  }
})

const columns = [
  { key: 'name', label: 'שחקן' },
  { key: 'games', label: 'משחקים' },
  { key: 'action', label: '', render: () => <button>פתיחת שחקן</button> },
]

function Harness({ rows }) {
  const [selected, setSelected] = useState('')
  return <DataTable columns={columns} rows={rows} getRowKey={row => row.id}
    selectedRowKey={selected} onRowSelect={row => setSelected(row.id === selected ? '' : row.id)} />
}

test('selection follows identity across season rows, sort changes, absence and return', () => {
  const current = [{ id: 'a', name: 'אלון', games: 8 }, { id: 'b', name: 'בן', games: 7 }]
  const { container, rerender } = render(<Harness rows={current} />)
  fireEvent.click(screen.getByText('אלון'))
  expect(container.querySelector('tr[aria-selected="true"]').textContent).toContain('אלון')
  rerender(<Harness rows={[{ id: 'b', name: 'בן', games: 25 }, { id: 'a', name: 'אלון', games: 20 }]} />)
  expect(container.querySelector('tr[aria-selected="true"]').textContent).toContain('20')
  fireEvent.click(screen.getByRole('button', { name: 'מיון לפי משחקים' }))
  expect(container.querySelector('tr[aria-selected="true"]').textContent).toContain('אלון')
  rerender(<Harness rows={[current[1]]} />)
  expect(container.querySelector('tr[aria-selected="true"]')).toBeNull()
  rerender(<Harness rows={current} />)
  expect(container.querySelector('tr[aria-selected="true"]').textContent).toContain('אלון')
})

test('nested actions do not select a row, while keyboard selection works', () => {
  const { container } = render(<Harness rows={[{ id: 'a', name: 'אלון', games: 8 }]} />)
  fireEvent.click(screen.getByRole('button', { name: 'פתיחת שחקן' }))
  expect(container.querySelector('tr[aria-selected="true"]')).toBeNull()
  fireEvent.keyDown(screen.getByText('אלון').closest('tr'), { key: 'Enter' })
  expect(container.querySelector('tr[aria-selected="true"]')).not.toBeNull()
  fireEvent.keyDown(screen.getByRole('button', { name: 'פתיחת שחקן' }), { key: 'Enter' })
  expect(container.querySelector('tr[aria-selected="true"]')).not.toBeNull()
})
