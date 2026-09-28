import { fireEvent, render, screen } from '@testing-library/react'

import StatsV2FinalSyncPanel from './StatsV2FinalSyncPanel.js'

const stages = ['canonical', 'counterparts', 'playerDocuments', 'playerIndexes', 'teamLeague', 'clubs', 'audit']
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
    expect(screen.getByText('בדיקת סנכרון כוללת וסגירת קבלה')).toBeInTheDocument()
  })


  test('shows receipt closed confirmation only after receipt is closed', () => {
    render(
      <StatsV2FinalSyncPanel
        controller={{
          stages,
          results: pendingResults(),
          runningStage: '',
          receiptClosed: true,
          runStage: jest.fn(),
        }}
      />
    )

    expect(screen.getByText('בדיקת סנכרון כוללת וסגירת קבלה')).toBeInTheDocument()
    expect(screen.getByText('הסנכרון תקין · הקבלה נסגרה')).toBeInTheDocument()
  })

  test('allows rerunning a completed audit while the receipt is still open', () => {
    const runStage = jest.fn()
    const results = Object.fromEntries(
      stages.map(stage => [stage, { status: 'completed' }])
    )

    render(
      <StatsV2FinalSyncPanel
        controller={{
          stages,
          results,
          runningStage: '',
          receiptClosed: false,
          auditResult: {
            findings: [{ target: 'playerDocument' }],
          },
          runStage,
        }}
      />
    )

    const retryButton = screen.getByRole('button', { name: 'בדוק שוב' })
    expect(retryButton).toBeEnabled()
    expect(screen.getByText('הבדיקה עדיין לא נקייה · יש לבדוק שוב')).toBeInTheDocument()

    fireEvent.click(retryButton)
    expect(runStage).toHaveBeenCalledWith('audit')
  })

  test('reenables affected writers and blocks audit until all repairs complete', () => {
    const runStage = jest.fn()
    const results = Object.fromEntries(
      stages.map(stage => [stage, { status: 'completed' }])
    )
    results.playerDocuments = { status: 'needs_sync' }
    results.audit = { status: 'needs_sync' }

    const { rerender } = render(
      <StatsV2FinalSyncPanel
        controller={{
          stages,
          results,
          runningStage: '',
          receiptClosed: false,
          auditResult: { findings: [{ target: 'playerDocument' }] },
          runStage,
        }}
      />
    )

    const repairButton = screen.getByRole('button', { name: 'סנכרן שוב' })
    const auditButton = screen.getByRole('button', { name: 'בדוק שוב' })
    expect(repairButton).toBeEnabled()
    expect(auditButton).toBeDisabled()

    fireEvent.click(repairButton)
    expect(runStage).toHaveBeenCalledWith('playerDocuments')

    results.playerDocuments = { status: 'completed' }
    rerender(
      <StatsV2FinalSyncPanel
        controller={{
          stages,
          results,
          runningStage: '',
          receiptClosed: false,
          auditResult: { findings: [{ target: 'playerDocument' }] },
          runStage,
        }}
      />
    )

    expect(screen.getByRole('button', { name: 'בדוק שוב' })).toBeEnabled()
  })

})
