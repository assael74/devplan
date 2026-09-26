import { buildExpectedRosterCounterpartsV2 } from './buildExpectedCounterparts.js'
import { compareRosterCounterpartsV2 } from './compareCounterparts.js'

describe('Roster Audit V2 counterparts', () => {
  test('derives counterpart facts from persisted local canonical Movement', () => {
    const rows = buildExpectedRosterCounterpartsV2({
      canonical: {
        birthTeamDocumentId: 'team-a',
        seasonKey: '26_27',
        teamSeason: {
          transfersOut: [{
            movementId: 'm1',
            playerId: 'p1',
            toBirthTeamDocumentId: 'team-b',
            toBirthTeamId: 'team-b',
            toBirthTeamSlot: 1,
            fromClubLevel: 2,
            toClubLevel: 1,
            direction: 'up',
            timing: 'in_season',
            targetSnapshotKey: 'r2',
            effectiveAt: '2026-10-01',
          }],
        },
      },
    })

    expect(rows).toEqual([expect.objectContaining({
      movementId: 'm1',
      target: expect.objectContaining({
        birthTeamDocumentId: 'team-b',
        side: 'transfersIn',
      }),
      fact: expect.objectContaining({
        playerId: 'p1',
        fromBirthTeamDocumentId: 'team-a',
      }),
    })])
  })

  test('does not create a Finding when counterpart Team Season is unavailable', () => {
    const findings = compareRosterCounterpartsV2({
      expectedCounterparts: [{
        movementId: 'm1',
        target: {
          birthTeamDocumentId: 'team-b',
          seasonKey: '26_27',
          side: 'transfersIn',
        },
        fact: {
          movementId: 'm1',
          playerId: 'p1',
          fromBirthTeamDocumentId: 'team-a',
        },
      }],
      actualCounterparts: [{
        birthTeamDocumentId: 'team-b',
        seasonKey: '26_27',
        teamSeason: null,
      }],
    })

    expect(findings).toEqual([])
  })

  test('accepts an existing exact movementId without comparing fields the writer preserves', () => {
    const findings = compareRosterCounterpartsV2({
      expectedCounterparts: [{
        movementId: 'm1',
        target: {
          birthTeamDocumentId: 'team-b',
          seasonKey: '26_27',
          side: 'transfersIn',
        },
        fact: {
          movementId: 'm1',
          playerId: 'p1',
          fromClubId: '',
          fromBirthTeamDocumentId: 'team-a',
        },
      }],
      actualCounterparts: [{
        birthTeamDocumentId: 'team-b',
        seasonKey: '26_27',
        teamSeason: {
          transfersIn: [{
            movementId: 'm1',
            playerId: 'p1',
            fromClubId: 'mk-hvlvn-yrmyhv',
            fromBirthTeamDocumentId: 'team-a',
          }],
          pendingPlayers: [],
        },
      }],
    })

    expect(findings).toEqual([])
  })

  test('reports a movement missing from an available counterpart Team Season', () => {
    const findings = compareRosterCounterpartsV2({
      expectedCounterparts: [{
        movementId: 'm1',
        target: {
          birthTeamDocumentId: 'team-b',
          seasonKey: '26_27',
          side: 'transfersIn',
        },
        fact: {
          movementId: 'm1',
          playerId: 'p1',
          fromBirthTeamDocumentId: 'team-a',
          timing: 'in_season',
          targetSnapshotKey: 'r2',
        },
      }],
      actualCounterparts: [{
        birthTeamDocumentId: 'team-b',
        seasonKey: '26_27',
        teamSeason: {
          birthTeamDocumentId: 'team-b',
          transfersIn: [],
          pendingPlayers: [],
        },
      }],
    })

    expect(findings).toEqual([expect.objectContaining({
      type: 'missing_projection',
      target: 'counterpart',
      movementId: 'm1',
    })])
  })

  test('does not create a Finding for a conflict the writer intentionally skips', () => {
    const findings = compareRosterCounterpartsV2({
      expectedCounterparts: [{
        movementId: 'm1',
        target: {
          birthTeamDocumentId: 'team-b',
          seasonKey: '26_27',
          side: 'transfersIn',
        },
        fact: {
          movementId: 'm1',
          playerId: 'p1',
          fromBirthTeamDocumentId: 'team-a',
          timing: 'in_season',
          targetSnapshotKey: 'r2',
        },
      }],
      actualCounterparts: [{
        birthTeamDocumentId: 'team-b',
        seasonKey: '26_27',
        teamSeason: {
          birthTeamDocumentId: 'team-b',
          transfersIn: [{
            movementId: 'other',
            playerId: 'p1',
            fromBirthTeamDocumentId: 'team-c',
            timing: 'in_season',
            targetSnapshotKey: 'r3',
          }],
          pendingPlayers: [],
        },
      }],
    })

    expect(findings).toEqual([])
  })
  test('does not fall back to another season when the target season is unavailable', () => {
    const findings = compareRosterCounterpartsV2({
      expectedCounterparts: [{
        movementId: 'm1',
        target: {
          birthTeamDocumentId: 'team-b',
          seasonKey: '26_27',
          side: 'transfersIn',
        },
        fact: {
          movementId: 'm1',
          playerId: 'p1',
          fromBirthTeamDocumentId: 'team-a',
          timing: 'in_season',
          targetSnapshotKey: 'r2',
        },
      }],
      actualCounterparts: [{
        birthTeamDocumentId: 'team-b',
        seasonKey: '26_27',
        teamSeason: null,
      }, {
        birthTeamDocumentId: 'team-b',
        seasonKey: '25_26',
        teamSeason: {
          birthTeamDocumentId: 'team-b',
          transfersIn: [],
          pendingPlayers: [],
        },
      }],
    })

    expect(findings).toEqual([])
  })

  test('accepts an existing movementId even when matching pendingPlayer cleanup is still possible', () => {
    const findings = compareRosterCounterpartsV2({
      expectedCounterparts: [{
        movementId: 'm1',
        target: {
          birthTeamDocumentId: 'team-b',
          seasonKey: '26_27',
          side: 'transfersIn',
        },
        fact: {
          movementId: 'm1',
          playerId: 'p1',
          fromBirthTeamDocumentId: 'team-a',
          timing: 'in_season',
          targetSnapshotKey: 'r2',
        },
      }],
      actualCounterparts: [{
        birthTeamDocumentId: 'team-b',
        seasonKey: '26_27',
        teamSeason: {
          birthTeamDocumentId: 'team-b',
          transfersIn: [{
            movementId: 'm1',
            playerId: 'p1',
            fromBirthTeamDocumentId: 'team-a',
          }],
          pendingPlayers: [{
            playerId: 'p1',
            previousBirthTeamDocumentId: 'team-b',
          }],
        },
      }],
    })

    expect(findings).toEqual([])
  })

})
