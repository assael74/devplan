// src/features/playersDatabase/ui/pages/leaguePage/hooks/useLeagueDataRepair.test.js

jest.mock('../../../../services/read/index.js', () => ({
  readLeaguePageData: jest.fn(),
  readLeaguesMasterDocument: jest.fn(),
}))

jest.mock('../../../../services/cache/index.js', () => ({
  invalidateLeagueDocumentCache: jest.fn(),
}))

jest.mock('../../../../services/write/leagues/index.js', () => ({
  syncLeaguesMasterDocument: jest.fn(),
}))

jest.mock('../../../../services/dataRepair/club/index.js', () => ({
  rebuildClubProjectionsForLeagueTable: jest.fn(),
}))

jest.mock('../../../../services/audit/index.js', () => ({
  readActiveAuditFindingById: jest.fn(),
}))

import {
  leagueAuditFindingBelongsToLeague,
  loadLeagueAuditFinding,
} from './useLeagueDataRepair.js'

const finding = (overrides = {}) => ({
  id: 'finding-1',
  relatedDocumentId: 'league-1',
  ...overrides,
})

describe('League Audit referral', () => {
  test('loads a finding that belongs to the current League', async () => {
    const readFinding = jest.fn().mockResolvedValue(finding())

    await expect(loadLeagueAuditFinding({
      auditFindingId: 'finding-1',
      leagueId: 'league-1',
      readFinding,
    })).resolves.toEqual(finding())
    expect(readFinding).toHaveBeenCalledWith({ findingId: 'finding-1' })
  })

  test('does not read a finding when there is no referral id', async () => {
    const readFinding = jest.fn()

    await expect(loadLeagueAuditFinding({
      leagueId: 'league-1',
      readFinding,
    })).resolves.toBeNull()
    expect(readFinding).not.toHaveBeenCalled()
  })

  test('handles a missing finding safely', async () => {
    await expect(loadLeagueAuditFinding({
      auditFindingId: 'missing',
      leagueId: 'league-1',
      readFinding: jest.fn().mockResolvedValue(null),
    })).resolves.toBeNull()
  })

  test('rejects a finding for another League', async () => {
    await expect(loadLeagueAuditFinding({
      auditFindingId: 'finding-2',
      leagueId: 'league-1',
      readFinding: jest.fn().mockResolvedValue(finding({ relatedDocumentId: 'league-2' })),
    })).resolves.toBeNull()
  })

  test('does not retain a finding after the referral changes to another League', async () => {
    const readFinding = jest.fn()
      .mockResolvedValueOnce(finding())
      .mockResolvedValueOnce(finding({ relatedDocumentId: 'league-2' }))

    await expect(loadLeagueAuditFinding({
      auditFindingId: 'finding-1',
      leagueId: 'league-1',
      readFinding,
    })).resolves.toEqual(finding())
    await expect(loadLeagueAuditFinding({
      auditFindingId: 'finding-2',
      leagueId: 'league-1',
      readFinding,
    })).resolves.toBeNull()
  })

  test('uses canonical leagueId before legacy relation identity', () => {
    expect(leagueAuditFindingBelongsToLeague({
      leagueId: 'league-1',
      finding: finding({ leagueId: 'league-1', relatedDocumentId: 'other' }),
    })).toBe(true)
  })
})
