// src/features/playersDatabase/ui/pages/DataOpsPage/components/FocusedAuditRepair.test.js

import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { repairFocusedAuditFinding } from '../../../../services/audit/repair/index.js'
import useFocusedAuditRepair from '../hooks/useFocusedAuditRepair.js'
import FocusedAuditFindingCard from './FocusedAuditFindingCard.js'
import FocusedAuditRepairDialog from './FocusedAuditRepairDialog.js'

jest.mock('../../../../services/audit/repair/index.js', () => ({
  ...jest.requireActual('../../../../services/audit/repair/eligibility.js'),
  repairFocusedAuditFinding: jest.fn(),
}))

jest.mock('../../../../../../ui/core/icons/iconUi.js', () => ({ iconUi: () => null }))

const scope = { type: 'team', leagueId: 'league-1', teamId: 'team-1', seasonId: '2025_2026' }
const finding = {
  type: 'projection_mismatch',
  target: 'playerSeason',
  documentId: 'player-1__2025_2026',
  field: 'teamsById.team-1.stats',
  expected: { goals: 4 },
  actual: { goals: 2 },
}

function RepairHarness({ onAuditUpdated }) {
  const repair = useFocusedAuditRepair({ scope, onAuditUpdated })
  return (
    <>
      <FocusedAuditFindingCard
        finding={finding}
        scope={scope}
        disabled={repair.repairing}
        repairing={repair.repairing}
        onRepair={() => repair.requestRepair(finding)}
        onOpenContext={() => {}}
      />
      <FocusedAuditRepairDialog
        pending={repair.pending}
        busy={repair.repairing}
        onClose={repair.cancelRepair}
        onConfirm={repair.confirmRepair}
      />
      {repair.feedback ? <p>{repair.feedback.title}</p> : null}
    </>
  )
}

beforeEach(() => jest.clearAllMocks())

test('requires confirmation and locks actions while repair is in flight', async () => {
  let finish
  repairFocusedAuditFinding.mockImplementation(() => new Promise(resolve => { finish = resolve }))
  const onAuditUpdated = jest.fn()
  render(<RepairHarness onAuditUpdated={onAuditUpdated} />)

  const repairButton = screen.getByRole('button', { name: 'תקן עונת שחקן' })
  const contextButton = screen.getByRole('button', { name: 'פתח הקשר עסקי' })
  fireEvent.click(repairButton)
  expect(screen.getByRole('dialog')).toHaveTextContent('קבוצה: team-1')
  expect(repairFocusedAuditFinding).not.toHaveBeenCalled()

  fireEvent.click(screen.getByRole('button', { name: 'אשר ובצע תיקון' }))
  expect(repairButton).toBeDisabled()
  expect(contextButton).toBeDisabled()
  expect(screen.getByRole('button', { name: 'ביטול' })).toBeDisabled()
  expect(repairFocusedAuditFinding).toHaveBeenCalledWith({ scope, finding, confirmed: true })

  const audit = { findings: [] }
  await act(async () => finish({ audit, repaired: true, skipped: false }))
  expect(onAuditUpdated).toHaveBeenCalledWith(audit)
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(screen.getByText('התיקון נשמר והבדיקה הורצה מחדש')).toBeInTheDocument()
})

test('opens source reload in the audited team and season without writing', () => {
  const onRepair = jest.fn()
  render(<MemoryRouter><FocusedAuditFindingCard
    finding={{ type: 'missing_canonical_dependency', target: 'statsAudit', field: 'missing_team_season' }}
    scope={scope}
    onRepair={onRepair}
    onOpenContext={() => {}}
  /></MemoryRouter>)

  const link = screen.getByRole('link', { name: 'פתח טעינת סגל' })
  expect(link).toHaveAttribute('href', '/players-database/leagues/league-1/teams/team-1?auditSeason=25%2F26&openRosterImport=1&repairReload=1')
  expect(screen.getByText('מסמך עונת הקבוצה חסר. יש להזין ולאשר מחדש את נתוני הסגל ממקור.')).toBeInTheDocument()
  expect(onRepair).not.toHaveBeenCalled()
})

test('uses the confirmed snapshot scope and prevents duplicate submission', async () => {
  let finish
  repairFocusedAuditFinding.mockImplementation(() => new Promise(resolve => { finish = resolve }))
  const onAuditUpdated = jest.fn()
  const { result, rerender } = renderHook(
    props => useFocusedAuditRepair({ scope: props.scope, onAuditUpdated }),
    { initialProps: { scope } }
  )
  act(() => result.current.requestRepair(finding))
  rerender({ scope: { ...scope, teamId: 'team-2' } })
  let first
  act(() => {
    first = result.current.confirmRepair()
    result.current.confirmRepair()
  })
  expect(repairFocusedAuditFinding).toHaveBeenCalledTimes(1)
  expect(repairFocusedAuditFinding.mock.calls[0][0].scope.teamId).toBe('team-1')
  await act(async () => {
    finish({ audit: { findings: [] }, repaired: false, skipped: true })
    await first
  })
  expect(result.current.feedback.message).toContain('לא נדרשה כתיבה נוספת')
})

test('keeps a remaining finding as a warning after the post-repair audit', async () => {
  repairFocusedAuditFinding.mockResolvedValue({ audit: { findings: [finding] }, repaired: false, skipped: false })
  const { result } = renderHook(() => useFocusedAuditRepair({ scope, onAuditUpdated: jest.fn() }))
  act(() => result.current.requestRepair(finding))
  await act(async () => result.current.confirmRepair())
  expect(result.current.feedback.tone).toBe('warning')
  expect(result.current.feedback.title).toContain('הממצא עדיין מופיע')
})

test('preserves the error and refreshes findings returned after a failed write', async () => {
  const auditResult = { findings: [finding] }
  repairFocusedAuditFinding.mockRejectedValue(Object.assign(new Error('השמירה נכשלה'), { auditResult }))
  const onAuditUpdated = jest.fn()
  const { result } = renderHook(() => useFocusedAuditRepair({ scope, onAuditUpdated }))
  act(() => result.current.requestRepair(finding))
  await act(async () => result.current.confirmRepair())
  await waitFor(() => expect(result.current.repairing).toBe(false))
  expect(onAuditUpdated).toHaveBeenCalledWith(auditResult)
  expect(result.current.feedback).toEqual(expect.objectContaining({ tone: 'danger', message: 'השמירה נכשלה' }))
})
