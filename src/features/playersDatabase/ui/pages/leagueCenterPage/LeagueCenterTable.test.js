// src/features/playersDatabase/ui/pages/leagueCenterPage/LeagueCenterTable.test.js

import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import LeagueCenterTable from './LeagueCenterTable.js'
import { buildLeagueCenterColumns } from './logic/leagueCenter.columns.js'
import { devPlanColors } from '../../../../../ui/core/theme/Colors.js'

const mockRow = {
  teamsCount: 19,
  playersStatsCompleteCount: 12,
  strongSignalWorkCounts: {
    strongMin1: 9, strongMin1Pending: 7,
    strongMin2: 6, strongMin2Pending: 4,
    strongMin3: 2, strongMin3Pending: 1,
  },
}

jest.mock('../../../../../ui/core/icons/iconUi.js', () => ({ iconUi: () => null }))
jest.mock('../../components/page/PageContentPanel.js', () => ({ headerActions, children }) => (
  <div>{headerActions}{children}</div>
))
jest.mock('../../components/tables/dataTable/index.js', () => ({ columns }) => (
  <div>{columns.filter(column => column.workArea).map(column => (
    <span key={column.key}>{column.render(mockRow)}</span>
  ))}</div>
))
jest.mock('./logic/leagueCenter.export.js', () => ({ buildLeagueCenterExportConfig: () => ({}) }))

const model = { birthYears: [2012], leagueLevel: 'all', leagues: [], allRows: [] }

function TableHarness({ onOpenLeague }) {
  const [minimum, setMinimum] = useState(1)
  return (
    <LeagueCenterTable
      model={model}
      columns={buildLeagueCenterColumns({ strongSignalMinimum: minimum, onOpenLeague })}
      strongSignalMinimum={minimum}
      onStrongSignalMinimumChange={setMinimum}
    />
  )
}

test('minimum selection updates both ratios and opens the matching threshold filters', () => {
  const onOpenLeague = jest.fn()
  render(<TableHarness onOpenLeague={onOpenLeague} />)
  expect(screen.getByRole('button', { name: '1' })).toHaveAttribute('aria-pressed', 'true')
  const selectedButton = screen.getByRole('button', { name: '1' })
  // JSDOM can match :hover without an explicit pointer event.
  expect(selectedButton).toHaveStyle({
    'background-color': selectedButton.matches(':hover') ? devPlanColors.petrolDark : devPlanColors.petrol,
  })
  expect(screen.getByText('9/19')).toBeInTheDocument()
  expect(screen.getByText('7/9')).toBeInTheDocument()
  expect(screen.getByText('12/19')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'טעינה' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'חקירה' })).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: '2' }))
  expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-pressed', 'true')
  fireEvent.click(screen.getByRole('button', { name: /קבוצות עם איתותים חזקים: 6 מתוך 19/ }))
  fireEvent.click(screen.getByRole('button', { name: /ממתינות לחקירה: 4 מתוך 6/ }))
  expect(onOpenLeague).toHaveBeenNthCalledWith(1, mockRow, 'strongMin2')
  expect(onOpenLeague).toHaveBeenNthCalledWith(2, mockRow, 'strongMin2Pending')
  fireEvent.click(screen.getByRole('button', { name: /פתיחת קבוצות ללא טעינת סטטיסטיקות מלאה/ }))
  expect(onOpenLeague).toHaveBeenNthCalledWith(3, mockRow, 'incompleteStats')

  fireEvent.click(screen.getByRole('button', { name: '3 ומעלה' }))
  expect(screen.getByText('2/19')).toBeInTheDocument()
  expect(screen.getByText('1/2')).toBeInTheDocument()
  expect(screen.getByText('12/19')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '3 ומעלה' })).toHaveAttribute('aria-pressed', 'true')
})
