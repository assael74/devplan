import { fireEvent, render, screen } from '@testing-library/react'

import StatsV2FinalSyncPanel from './StatsV2FinalSyncPanel.js'

const stages = ['canonical', 'counterparts', 'playerDocuments', 'playerIndexes', 'teamLeague', 'clubs']
const pendingResults = () => Object.fromEntries(stages.map(stage => [stage, { status: 'pending' }]))

describe('StatsV2FinalSyncPanel', () => {
  test('runs stages manually and never auto-starts the next stage', () => {
    const runStage = jest.fn()
    const { rerender } = render(
      <StatsV2FinalSyncPanel controller={{ stages, results: pendingResults(), runningStage: '', runStage }} />
    )

    const buttons = screen.getAllByRole('button', { name: 'הפעל שלב' })
    expect(buttons[0]).toBeEnabled()
    expect(buttons[1]).toBeDisabled()

    fireEvent.click(buttons[0])
    expect(runStage).toHaveBeenCalledTimes(1)
    expect(runStage).toHaveBeenCalledWith('canonical')

    const results = pendingResults()
    results.canonical = { status: 'completed' }
    rerender(<StatsV2FinalSyncPanel controller={{ stages, results, runningStage: '', runStage }} />)

    expect(runStage).toHaveBeenCalledTimes(1)
    expect(screen.getAllByRole('button', { name: 'הפעל שלב' })[1]).toBeEnabled()
  })
})
