// src/features/playersDatabase/services/auditV2/system/structural/movementValidation.test.js

import { validateTeamSeasonMovementV2 } from './movementValidation.js'

describe('validateTeamSeasonMovementV2', () => {
  test('returns no findings for valid movement state', () => {
    expect(validateTeamSeasonMovementV2({
      documentId: 'team-1__26_27',
      teamSeason: {
        birthTeamDocumentId: 'team-1',
        seasonKey: '26_27',
        teamPlayers: [{ playerId: 'player-1' }],
        pendingPlayers: [{ playerId: 'player-2', pendingId: 'pending-2' }],
        transfersIn: [{ movementId: 'move-in-1' }],
        transfersOut: [{ movementId: 'move-out-1' }],
      },
    })).toEqual([])
  })

  test('detects duplicate movement ids on each side', () => {
    const findings = validateTeamSeasonMovementV2({
      documentId: 'team-1__26_27',
      teamSeason: {
        birthTeamDocumentId: 'team-1',
        seasonKey: '26_27',
        transfersIn: [{ movementId: 'move-1' }, { movementId: 'move-1' }],
        transfersOut: [{ movementId: 'move-2' }, { movementId: 'move-2' }],
      },
    })

    expect(findings).toEqual(expect.arrayContaining([
      expect.objectContaining({ relationKey: 'move-1' }),
      expect.objectContaining({ relationKey: 'move-2' }),
    ]))
  })

  test('detects player present in roster and pending simultaneously', () => {
    const findings = validateTeamSeasonMovementV2({
      documentId: 'team-1__26_27',
      teamSeason: {
        birthTeamDocumentId: 'team-1',
        seasonKey: '26_27',
        teamPlayers: [{ playerId: 'player-1' }],
        pendingPlayers: [{ playerId: 'player-1', pendingId: 'pending-1' }],
      },
    })

    expect(findings).toEqual([
      expect.objectContaining({
        playerId: 'player-1',
        title: 'Pending פתוח לשחקן שנמצא בסגל',
      }),
    ])
  })
})
