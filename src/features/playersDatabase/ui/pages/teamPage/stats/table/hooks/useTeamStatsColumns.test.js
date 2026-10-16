// src/features/playersDatabase/ui/pages/teamPage/stats/table/hooks/useTeamStatsColumns.test.js

import { fireEvent, render, screen } from '@testing-library/react'
import useTeamStatsColumns from './useTeamStatsColumns.js'
import PreviewCell from '../../../../../components/modals/paste/PreviewCell.js'

jest.mock('../../../../../../../../ui/core/icons/iconUi.js', () => ({
  iconUi: ({ id }) => <svg data-testid={`icon-${id}`} />,
}))

function Harness({ row, onCellChange }) {
  const columns = useTeamStatsColumns({ players: [], rosterLookup: {} })
  return <PreviewCell column={columns.find(column => column.key === 'goals')} row={row} rowIndex={0} onCellChange={onCellChange} />
}

test('forecast chip rounds the value while the actual goal count remains editable', () => {
  const row = { goals: 7, scoutSeasonProjection: { evidence: {
    actual: { goals: 7 },
    calculationContext: { seasonStatus: 'active', teamGamePlayed: 8, leagueTotalRound: 38 },
  } } }
  const onCellChange = jest.fn()
  const { rerender } = render(<Harness row={row} onCellChange={onCellChange} />)
  expect(screen.getByText('צפי 33')).toBeTruthy()
  fireEvent.change(screen.getByDisplayValue('7'), { target: { value: '8' } })
  expect(onCellChange).toHaveBeenCalledWith(expect.objectContaining({ value: '8', column: expect.objectContaining({ key: 'goals' }) }))
  rerender(<Harness row={{ ...row, goals: 8 }} onCellChange={onCellChange} />)
  expect(screen.queryByText('צפי 33')).toBeNull()
})
