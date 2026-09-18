import { buildClubTransferSummary } from './clubTransfers.projection.js'


describe('Club Movement projection', () => {
  test('builds external, internal and pending counts from Team Season Movement facts', () => {
    const summary = buildClubTransferSummary({
      clubId: 'club-a',
      transfersIn: [
        {
          movementId: 'in-1',
          fromClubId: 'club-b',
        },
        {
          movementId: 'internal-in',
          fromClubId: 'club-a',
        },
      ],
      transfersOut: [
        {
          movementId: 'out-1',
          toClubId: 'club-c',
        },
      ],
      pendingPlayers: [
        {
          pendingId: 'pending-1',
          playerId: 'player-1',
        },
      ],
      coverageStatus: 'COMPLETE',
    })

    expect(summary.in.total).toBe(1)
    expect(summary.in.unknown).toBe(1)
    expect(summary.in.clubIds).toEqual(['club-b'])
    expect(summary.out.total).toBe(1)
    expect(summary.out.clubIds).toEqual(['club-c'])
    expect(summary.internal.total).toBe(1)
    expect(summary.pending.total).toBe(1)
  })

  test('does not read legacy roster status fields', () => {
    const summary = buildClubTransferSummary({
      transfersIn: [],
      transfersOut: [],
      pendingPlayers: [],
      coverageStatus: 'COMPLETE',
    })

    expect(summary.in.total).toBe(0)
    expect(summary.out.total).toBe(0)
    expect(summary.internal.total).toBe(0)
  })
})
