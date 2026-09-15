import { AUDIT_FINDING_TYPE, AUDIT_REPAIR_TYPE } from '../audit.contract.js'
import { AUDIT_SCOPE_TYPE } from '../audit.scope.js'
import { appendWriteRecoveryAuditFindings } from './auditWriteRecovery.checks.js'

describe('write recovery Audit findings', () => {
  const scope = {
    type: AUDIT_SCOPE_TYPE.TEAM_SEASON,
    teamDocumentId: 'team-a',
    seasonKey: '2025/26',
  }

  test('exposes a failed Club projection as a repairable partial write', () => {
    const findings = []
    appendWriteRecoveryAuditFindings({
      normalizedScope: scope,
      findings,
      writeActions: [{
        id: 'write-1',
        data: {
          actionType: 'pasteTeamPlayers',
          failedStage: 'clubProjection',
          recoveryRequired: true,
          auditScope: scope,
        },
      }],
    })

    expect(findings).toEqual([expect.objectContaining({
      type: AUDIT_FINDING_TYPE.PARTIAL_WRITE,
      documentId: 'write-1',
      teamDocumentId: 'team-a',
      seasonKey: '2025/26',
      repairType: AUDIT_REPAIR_TYPE.REBUILD_CLUB_PROJECTION,
    })])
  })

  test('does not expose a recovery record outside the requested Team Season', () => {
    const findings = []
    appendWriteRecoveryAuditFindings({
      normalizedScope: scope,
      findings,
      writeActions: [{
        id: 'write-2',
        data: {
          failedStage: 'clubProjection',
          recoveryRequired: true,
          auditScope: {
            ...scope,
            teamDocumentId: 'team-b',
          },
        },
      }],
    })

    expect(findings).toEqual([])
  })
})
