// src/features/playersDatabase/ui/pages/teamPage/information/components/TeamAnalysisCard.test.js

import { fireEvent, render, screen } from '@testing-library/react'
import TeamAnalysisCard from './TeamAnalysisCard.js'
import TeamStructureSection from '../../structure/components/TeamStructureSection.js'

jest.mock('../../../../../../../ui/core/icons/iconUi.js', () => ({
  iconUi: ({ id }) => <svg data-testid={`icon-${id}`} />,
}))

test('card text and icons select the filter while a nested action remains independent', () => {
  const onSelect = jest.fn()
  const onAction = jest.fn()
  render(
    <TeamAnalysisCard onSelect={onSelect} ariaLabel='סינון הגנה'>
      <span>הגנה</span>
      <svg data-testid='comparison-icon'><path data-testid='comparison-path' /></svg>
      <button onClick={onAction}>פרטים</button>
    </TeamAnalysisCard>
  )

  fireEvent.click(screen.getByText('הגנה'))
  fireEvent.click(screen.getByTestId('comparison-path'))
  expect(onSelect).toHaveBeenCalledTimes(2)
  fireEvent.click(screen.getByText('פרטים'))
  expect(onAction).toHaveBeenCalledTimes(1)
  expect(onSelect).toHaveBeenCalledTimes(2)
  fireEvent.keyDown(screen.getByRole('button', { name: 'סינון הגנה' }), { key: 'Enter' })
  expect(onSelect).toHaveBeenCalledTimes(3)
})

test('position cards select the corresponding player table filter', () => {
  const onFilterChange = jest.fn()
  render(
    <TeamStructureSection
      structure={{ availability: 'available', lines: { classified: 11 } }}
      onFilterChange={onFilterChange}
    />
  )

  for (const [label, filter] of [
    ['שוער', 'goalkeeper'],
    ['הגנה', 'defense'],
    ['קישור', 'midfield'],
    ['התקפה', 'attack'],
    ['פיזור דקות מסווגות', 'classified'],
  ]) {
    fireEvent.click(screen.getByText(label))
    expect(onFilterChange).toHaveBeenLastCalledWith(filter)
  }
})
