// src/features/playersDatabase/services/audit/roster/index.test.js

import { auditRoster } from './index.js'
import { buildRosterAuditExpected } from './buildExpected.js'
import { compareRosterAudit } from './compare.js'
import { readRosterAuditActual } from './readActual.js'
import { readExpectedTeamSignals } from '../signals/readExpectedTeamSignals.js'

jest.mock('./buildExpected.js', () => ({ buildRosterAuditExpected: jest.fn() }))
jest.mock('./compare.js', () => ({ compareRosterAudit: jest.fn() }))
jest.mock('./readActual.js', () => ({ readRosterAuditActual: jest.fn() }))
jest.mock('../signals/readExpectedTeamSignals.js', () => ({ readExpectedTeamSignals: jest.fn() }))

test('roster audit passes the canonical recalculation into summary comparison', async () => {
  const approvedState = { clubId: 'club', teamId: 'team', seasonId: '2026_2027' }
  const summary = { familiesById: { 'club-gap': { level: 1, availability: 'partial' } } }
  buildRosterAuditExpected.mockReturnValue({ complete: true, expected: {} })
  readRosterAuditActual.mockResolvedValue({})
  readExpectedTeamSignals.mockResolvedValue(new Map([['team__2026_2027', summary]]))
  compareRosterAudit.mockReturnValue([])
  await auditRoster({ approvedState })
  expect(readExpectedTeamSignals).toHaveBeenCalledWith({ clubIds: ['club'] })
  expect(compareRosterAudit).toHaveBeenCalledWith(expect.objectContaining({ expectedSignalSummary: summary }))
})
