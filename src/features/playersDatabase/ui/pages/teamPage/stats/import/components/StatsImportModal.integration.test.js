// src/features/playersDatabase/ui/pages/teamPage/stats/import/components/StatsImportModal.integration.test.js

import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import StatsImportModal from './StatsImportModal.js'

jest.mock('../../../../../components/modals/RegularModal.js', () => ({
  __esModule: true,
  default: ({ open, confirmLabel, footerActions, onConfirm, children }) => open ? (
    <div>
      <button type='button' onClick={onConfirm}>{confirmLabel}</button>
      {footerActions}
      {children}
    </div>
  ) : null,
}))

jest.mock('../../../../../components/modals/ImportModalContextDescription.js', () => ({ __esModule: true, default: () => null }))
jest.mock('../../../../../components/modals/ModalStepper.js', () => ({ __esModule: true, default: () => null }))
jest.mock('../../../../../components/modals/ImportActionArea.js', () => ({
  __esModule: true,
  default: ({ actions = [] }) => (
    <div>
      {actions.map(action => (
        <button key={action.id} type='button' onClick={action.onClick}>
          {action.label}
        </button>
      ))}
    </div>
  ),
}))
jest.mock('../../../../../components/modals/paste/PasteArea.js', () => ({ __esModule: true, default: () => null }))
jest.mock('../../../../../components/modals/paste/PreviewTable.js', () => ({ __esModule: true, default: () => null }))
jest.mock('../../../../../components/modals/paste/TeamSeasonChoiceCards.js', () => ({ __esModule: true, default: () => null }))
jest.mock('./StatsFinalSyncPanel.js', () => ({ __esModule: true, default: () => <div>final-sync</div> }))

const controller = overrides => ({
  open: true,
  rows: [],
  seasonOptions: [],
  selectedSeasonOptionKey: 'season-1',
  selectedSeasonOption: { seasonId: '2026_2027' },
  seasonStatus: 'active',
  validation: { checks: [] },
  hasInvalidRows: false,
  movementPreview: { requiresDecision: false },
  approvedStatsPlanPreparing: false,
  approvedStatsPlan: { actionType: 'statsLoad' },
  reloadDecisionState: { unresolved: [] },
  pasteValue: '',
  busy: false,
  finalSync: { status: 'idle', receiptClosed: false },
  parse: jest.fn(),
  confirm: jest.fn(async () => true),
  clearPaste: jest.fn(),
  close: jest.fn(),
  selectSeasonOption: jest.fn(),
  ...overrides,
})

describe('StatsImportModal active Stats Load flow', () => {
  test('advances to the active Stats Load flow without importing V2 orchestration', () => {
    const state = controller()
    render(
      <StatsImportModal
        team={{ name: 'Team', birthYear: 2011 }}
        seasonKey='26/27'
        activeSeasonOptionKey='season-1'
        hasTeamPlayers
        columns={[]}
        source={{}}
        controller={state}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'המשך לקליטת נתונים' }))
    expect(screen.getByRole('button', { name: 'המשך לזיהוי ואישור' })).toBeInTheDocument()
  })

  test('does not allow returning to approval after synchronization succeeded', async () => {
    const state = controller({
      rows: [{ id: 'player-1' }],
      pasteValue: 'player data',
      validation: { checks: [], valid: true },
      finalSync: {
        executionStatus: 'success',
        syncComplete: true,
        receiptClosed: true,
      },
    })
    render(
      <StatsImportModal
        team={{ name: 'Team', birthYear: 2011 }}
        seasonKey='26/27'
        activeSeasonOptionKey='season-1'
        hasTeamPlayers
        columns={[]}
        source={{}}
        controller={state}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'המשך לקליטת נתונים' }))
    fireEvent.click(screen.getByRole('button', { name: 'המשך לזיהוי ואישור' }))
    fireEvent.click(screen.getByRole('button', { name: 'עבור לסנכרון' }))

    await waitFor(() => expect(screen.getByText('final-sync')).toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'סגור' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'חזרה לזיהוי ואישור' }))
      .not.toBeInTheDocument()
  })
})
