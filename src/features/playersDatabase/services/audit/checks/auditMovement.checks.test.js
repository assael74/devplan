import { appendTeamSeasonMovementAuditFindings } from './auditMovement.checks.js'
import { AUDIT_REPAIR_TYPE } from '../audit.contract.js'

const buildContext = overrides => ({
  id: 'season_target',
  teamId: 'team_target',
  seasonKey: '26-27',
  teamSeasons: [],
  findings: [],
  season: {
    teamPlayers: [],
    transfersIn: [],
    transfersOut: [],
    pendingPlayers: [],
  },
  ...overrides,
})

test('reports open pending when player is already back in roster', () => {
  const context = buildContext({
    season: {
      teamPlayers: [{ playerId: 'p1' }],
      transfersIn: [],
      transfersOut: [],
      pendingPlayers: [{ pendingId: 'pending__p1', playerId: 'p1' }],
    },
  })

  appendTeamSeasonMovementAuditFindings(context)

  expect(context.findings).toHaveLength(1)
  expect(context.findings[0].entityType).toBe('teamSeasonMovement')
})

test('reports missing counterpart only when source Team Season exists', () => {
  const incoming = {
    movementId: 'movement__p1',
    playerId: 'p1',
    fromBirthTeamDocumentId: 'team_source',
  }
  const context = buildContext({
    season: {
      teamPlayers: [{ playerId: 'p1' }],
      transfersIn: [incoming],
      transfersOut: [],
      pendingPlayers: [],
    },
    teamSeasons: [{
      id: 'season_source',
      data: {
        birthTeamDocumentId: 'team_source',
        seasonKey: '26-27',
        transfersOut: [],
      },
    }],
  })

  appendTeamSeasonMovementAuditFindings(context)

  expect(context.findings).toHaveLength(1)
  expect(context.findings[0].entityType).toBe('teamSeasonMovementCounterpart')
  expect(context.findings[0].severity).toBe('low')
  expect(context.findings[0].repairType).toBe(AUDIT_REPAIR_TYPE.RETRY_MOVEMENT_COUNTERPART)
})

test('does not report missing counterpart when source Team Season is absent', () => {
  const context = buildContext({
    season: {
      teamPlayers: [{ playerId: 'p1' }],
      transfersIn: [{
        movementId: 'movement__p1',
        playerId: 'p1',
        fromBirthTeamDocumentId: 'team_source',
      }],
      transfersOut: [],
      pendingPlayers: [],
    },
  })

  appendTeamSeasonMovementAuditFindings(context)

  expect(context.findings).toHaveLength(0)
})

test('reports duplicate movement ids', () => {
  const fact = { movementId: 'movement__p1', playerId: 'p1' }
  const context = buildContext({
    season: {
      teamPlayers: [],
      transfersIn: [fact, { ...fact }],
      transfersOut: [],
      pendingPlayers: [],
    },
  })

  appendTeamSeasonMovementAuditFindings(context)

  expect(context.findings).toHaveLength(1)
  expect(context.findings[0].relationKey).toBe('movement__p1')
})
