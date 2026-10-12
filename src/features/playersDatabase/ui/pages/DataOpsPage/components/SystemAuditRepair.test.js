// src/features/playersDatabase/ui/pages/DataOpsPage/components/SystemAuditRepair.test.js

import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import {
  prepareSystemAuditRepair,
  repairSystemAuditFinding,
} from '../../../../services/audit/system/repair/index.js'
import useSystemAuditRepair from '../hooks/useSystemAuditRepair.js'
import SystemAuditRepairDialog from './SystemAuditRepairDialog.js'

jest.mock('../../../../services/audit/system/repair/index.js', () => ({
  inspectSystemAuditRepair: () => ({ allowed: true, description: 'תיקון ההפניה ממסמכי המקור' }),
  prepareSystemAuditRepair: jest.fn(),
  repairSystemAuditFinding: jest.fn(),
}))

const checks = ['documentReferences']
const finding = {
  type: 'broken_relation',
  target: 'teamRoots',
  documentId: 'team-1',
  title: 'הפניית קבוצה חסרה',
}
const preview = {
  allowed: true,
  previewKey: 'preview-1',
  description: 'עדכון הפניית העונה בלבד',
  changes: [{ target: 'teamRoots', documentId: 'team-1', summary: 'עדכון הפניית העונה', action: 'update' }],
  fields: [],
}

function RepairHarness({ onAuditUpdated }) {
  const repair = useSystemAuditRepair({ checks, onAuditUpdated })
  return (
    <MemoryRouter>
      <button disabled={repair.busy || Boolean(repair.pending)} onClick={() => repair.requestRepair(finding)}>
        פתח תיקון
      </button>
      <SystemAuditRepairDialog
        pending={repair.pending}
        preparing={repair.preparing}
        repairing={repair.repairing}
        onInputChange={repair.changeInput}
        onRefresh={repair.refreshPreview}
        onClose={repair.cancelRepair}
        onConfirm={repair.confirmRepair}
      />
      {repair.feedback ? <p>{repair.feedback.title}</p> : null}
    </MemoryRouter>
  )
}

beforeEach(() => {
  jest.clearAllMocks()
  prepareSystemAuditRepair.mockResolvedValue(preview)
})

test('shows the prepared changes before confirmation and locks a pending write', async () => {
  let finish
  repairSystemAuditFinding.mockImplementation(() => new Promise(resolve => { finish = resolve }))
  const onAuditUpdated = jest.fn()
  render(<RepairHarness onAuditUpdated={onAuditUpdated} />)
  fireEvent.click(screen.getByRole('button', { name: 'פתח תיקון' }))

  const confirm = await screen.findByRole('button', { name: 'אשר ובצע תיקון' })
  expect(screen.getByText('עדכון הפניית העונה')).toBeInTheDocument()
  expect(repairSystemAuditFinding).not.toHaveBeenCalled()
  fireEvent.click(confirm)
  fireEvent.click(confirm)
  expect(screen.getByRole('button', { name: 'ביטול' })).toBeDisabled()
  expect(repairSystemAuditFinding).toHaveBeenCalledTimes(1)
  expect(repairSystemAuditFinding).toHaveBeenCalledWith({
    finding, checks, input: {}, previewKey: 'preview-1', confirmed: true,
  })

  const audit = { findings: [] }
  await act(async () => finish({ audit, repaired: true, skipped: false }))
  expect(onAuditUpdated).toHaveBeenCalledWith(audit)
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(screen.getByText('התיקון נשמר והבדיקה הורצה מחדש')).toBeInTheDocument()
})

test('does not choose a league automatically and requires a new preview after changing input', async () => {
  const choicePreview = {
    ...preview,
    allowed: false,
    previewKey: '',
    changes: [],
    fields: [{
      name: 'leagueId', label: 'ליגה לשיוך', required: true,
      options: [{ value: 'league-1', label: 'ליגה א' }, { value: 'league-2', label: 'ליגה ב' }],
    }],
  }
  prepareSystemAuditRepair.mockResolvedValueOnce(choicePreview)
  render(<RepairHarness onAuditUpdated={jest.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: 'פתח תיקון' }))
  const selector = await screen.findByRole('combobox', { name: /ליגה לשיוך/ })
  expect(selector).toHaveTextContent('בחר...')
  expect(screen.queryByRole('button', { name: 'אשר ובצע תיקון' })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'הצג הצעת תיקון' })).toBeDisabled()

  fireEvent.click(selector)
  fireEvent.click(await screen.findByRole('option', { name: 'ליגה ב' }))
  fireEvent.click(screen.getByRole('button', { name: 'הצג הצעת תיקון' }))
  await screen.findByRole('button', { name: 'אשר ובצע תיקון' })
  expect(prepareSystemAuditRepair).toHaveBeenLastCalledWith({
    finding, checks, input: { leagueId: 'league-2' },
  })
  expect(repairSystemAuditFinding).not.toHaveBeenCalled()
})

test('anchors audit checks and invalidates the confirmed preview when source input changes', async () => {
  const { result, rerender } = renderHook(
    props => useSystemAuditRepair({ checks: props.checks, onAuditUpdated: jest.fn() }),
    { initialProps: { checks } }
  )
  act(() => result.current.requestRepair(finding))
  await waitFor(() => expect(result.current.pending.preview).toEqual(preview))
  rerender({ checks: ['documentIds'] })
  act(() => result.current.changeInput('officialName', 'מועדון חדש'))
  expect(result.current.pending.preview.previewKey).toBe('')
  await act(async () => result.current.confirmRepair())
  expect(repairSystemAuditFinding).not.toHaveBeenCalled()
  act(() => result.current.refreshPreview())
  await waitFor(() => expect(result.current.preparing).toBe(false))
  expect(prepareSystemAuditRepair).toHaveBeenLastCalledWith({
    finding, checks, input: { officialName: 'מועדון חדש' },
  })
})

test('retains source fields and removes approval after a failed write', async () => {
  const fields = [{ name: 'officialName', label: 'שם רשמי', type: 'text', required: true }]
  prepareSystemAuditRepair.mockResolvedValue({ ...preview, fields })
  const auditResult = { findings: [finding] }
  repairSystemAuditFinding.mockRejectedValue(Object.assign(new Error('הנתונים השתנו'), { auditResult }))
  const onAuditUpdated = jest.fn()
  const { result } = renderHook(() => useSystemAuditRepair({ checks, onAuditUpdated }))
  act(() => result.current.requestRepair(finding))
  await waitFor(() => expect(result.current.preparing).toBe(false))
  act(() => result.current.changeInput('officialName', 'מועדון'))
  act(() => result.current.refreshPreview())
  await waitFor(() => expect(result.current.preparing).toBe(false))
  await act(async () => result.current.confirmRepair())
  expect(onAuditUpdated).toHaveBeenCalledWith(auditResult)
  expect(result.current.pending.error).toBe('הנתונים השתנו')
  expect(result.current.pending.preview.fields).toEqual(fields)
  expect(result.current.pending.preview.previewKey).toBe('')
  await act(async () => result.current.confirmRepair())
  expect(repairSystemAuditFinding).toHaveBeenCalledTimes(1)
})

test('shows a source reload link without offering an automatic write', async () => {
  prepareSystemAuditRepair.mockResolvedValue({
    allowed: false,
    reload: { route: '/players-database/leagues?repairReload=1', label: 'טען ליגה מחדש' },
  })
  render(<RepairHarness onAuditUpdated={jest.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: 'פתח תיקון' }))
  const link = await screen.findByRole('link', { name: 'טען ליגה מחדש' })
  expect(link).toHaveAttribute('href', '/players-database/leagues?repairReload=1')
  expect(screen.queryByRole('button', { name: 'אשר ובצע תיקון' })).not.toBeInTheDocument()
  expect(repairSystemAuditFinding).not.toHaveBeenCalled()
})

test('refreshes results when preparation discovers the finding was already resolved', async () => {
  const audit = { findings: [] }
  prepareSystemAuditRepair.mockResolvedValue({ allowed: false, skipped: true, audit })
  const onAuditUpdated = jest.fn()
  render(<RepairHarness onAuditUpdated={onAuditUpdated} />)
  fireEvent.click(screen.getByRole('button', { name: 'פתח תיקון' }))
  await screen.findByText('הממצא כבר אינו קיים בבדיקה החדשה. אין צורך בתיקון.')
  expect(onAuditUpdated).toHaveBeenCalledWith(audit)
  expect(screen.queryByRole('button', { name: 'אשר ובצע תיקון' })).not.toBeInTheDocument()
  expect(repairSystemAuditFinding).not.toHaveBeenCalled()
})
