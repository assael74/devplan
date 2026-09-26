// src/features/playersDatabase/services/writeV2/receipt/contract.test.js

import {
  buildWriteActionAuditSummaryV2,
  buildWriteActionAuditTargetV2,
  WRITE_ACTION_V2_FLOW_TYPE,
} from './contract.js'

describe('WriteAction V2 contract', () => {
  test('builds a minimal League audit target', () => {
    expect(buildWriteActionAuditTargetV2({
      flowType: WRITE_ACTION_V2_FLOW_TYPE.LEAGUE,
      auditTarget: {
        leagueId: 'league-1',
        seasonKey: '2026-2027',
        ignored: 'not-persisted',
      },
    })).toEqual({
      leagueId: 'league-1',
      seasonKey: '2026-2027',
    })
  })

  test.each([
    WRITE_ACTION_V2_FLOW_TYPE.ROSTER,
    WRITE_ACTION_V2_FLOW_TYPE.STATS,
  ])('builds a minimal %s audit target', flowType => {
    expect(buildWriteActionAuditTargetV2({
      flowType,
      auditTarget: {
        birthTeamDocumentId: 'team-1',
        seasonKey: '2026-2027',
        ignored: 'not-persisted',
      },
    })).toEqual({
      birthTeamDocumentId: 'team-1',
      seasonKey: '2026-2027',
    })
  })

  test('keeps the Audit summary small', () => {
    expect(buildWriteActionAuditSummaryV2({
      ranAt: '2026-09-26T12:00:00.000Z',
      coverage: 'partial',
      findingsCount: 2,
      checkedDomains: ['teamSearchIndexes', 'teamSearchIndexes', 'clubs'],
    })).toEqual({
      ranAt: '2026-09-26T12:00:00.000Z',
      coverage: 'partial',
      findingsCount: 2,
      checkedDomains: ['teamSearchIndexes', 'clubs'],
    })
  })

  test('rejects unsupported target shapes', () => {
    expect(() => buildWriteActionAuditTargetV2({
      flowType: WRITE_ACTION_V2_FLOW_TYPE.LEAGUE,
      auditTarget: {
        seasonKey: '2026-2027',
      },
    })).toThrow('Missing leagueId for League receipt')
  })

  test.each([
    null,
    [],
    'league-1',
    123,
  ])('rejects a non-object auditTarget: %p', auditTarget => {
    expect(() => buildWriteActionAuditTargetV2({
      flowType: WRITE_ACTION_V2_FLOW_TYPE.LEAGUE,
      auditTarget,
    })).toThrow('WriteAction V2 auditTarget must be an object')
  })
})
