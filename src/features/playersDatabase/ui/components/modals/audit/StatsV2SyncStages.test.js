import { fireEvent, render, screen } from '@testing-library/react'

import StatsV2SyncStages from './StatsV2SyncStages.js'

const auditResult = findings => ({
  coverage: {
    complete: true,
    coveredTargets: [],
    uncoveredTargets: [],
  },
  findings,
})

describe('StatsV2SyncStages', () => {
  test('shows one repair action per Final Sync stage instead of one per finding', () => {
    const onSyncStage = jest.fn()

    render(
      <StatsV2SyncStages
        result={auditResult([
          { target: 'teamSearchIndex' },
          { target: 'leagueMetadata' },
          { target: 'leaguesMaster' },
        ])}
        onSyncStage={onSyncStage}
      />
    )

    const repairButtons = screen.getAllByRole('button', { name: 'תקן' })
    expect(repairButtons).toHaveLength(1)

    fireEvent.click(repairButtons[0])
    expect(onSyncStage).toHaveBeenCalledWith('teamLeague')
  })

  test('blocks Clubs while Counterparts is not clean but leaves independent stages available', () => {
    render(
      <StatsV2SyncStages
        result={auditResult([
          { target: 'counterpart' },
          { target: 'playerSearchIndex' },
          { target: 'club' },
        ])}
      />
    )

    expect(screen.getByText('ממתין לסנכרון העברות')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'תקן' })).toHaveLength(2)
  })

  test('final sync check remains explicit and calls the full Audit action', () => {
    const onCheckSync = jest.fn()

    render(
      <StatsV2SyncStages
        result={auditResult([])}
        onCheckSync={onCheckSync}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'בדוק סנכרון' }))
    expect(onCheckSync).toHaveBeenCalledTimes(1)
    expect(
      screen.getByText('הבדיקה האחרונה מלאה ונקייה. הקבלה יכולה להישאר סגורה.')
    ).toBeInTheDocument()
  })

  test('shows repair state and final check when audit still has findings', () => {
    render(
      <StatsV2SyncStages
        result={auditResult([
          { target: 'playerDocument' },
        ])}
      />
    )

    expect(screen.getByText('דורש סנכרון')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'תקן' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'בדוק סנכרון' })).toBeInTheDocument()
  })

  test('offers a canonical repair action for a Team Season Stats finding', () => {
    const finding = {
      target: 'teamSeason',
      type: 'canonical_invariant_mismatch',
    }
    const onRepairCanonical = jest.fn()

    render(
      <StatsV2SyncStages
        result={auditResult([finding])}
        onRepairCanonical={onRepairCanonical}
      />
    )

    expect(screen.getByText('דורש תיקון קנוני')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'תקן' }))
    expect(onRepairCanonical).toHaveBeenCalledWith(finding)
  })

  test('offers Team + League repair when Team SearchIndex is missing', () => {
    const onSyncStage = jest.fn()

    render(
      <StatsV2SyncStages
        result={auditResult([
          { target: 'teamSearchIndex', type: 'missing_projection' },
        ])}
        onSyncStage={onSyncStage}
      />
    )

    expect(screen.getByText('דורש סנכרון')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'תקן' }))
    expect(onSyncStage).toHaveBeenCalledWith('teamLeague')
  })

})
