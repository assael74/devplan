import {
  compareStatsCounterpartsV2,
} from './compareCounterparts.js'

const expected = ({
  side = 'transfersIn',
} = {}) => ({
  movementId: 'm1',
  target: {
    birthTeamDocumentId: 'team-b',
    seasonKey: '26_27',
    side,
  },
  fact: {
    movementId: 'm1',
    playerId: 'p1',
    fromBirthTeamDocumentId: 'team-a',
    toBirthTeamDocumentId: 'team-b',
  },
})

const actual = teamSeason => [{
  birthTeamDocumentId: 'team-b',
  seasonKey: '26_27',
  teamSeason,
}]

describe('Stats Audit V2 counterpart canonical scope', () => {
  test('skips unavailable target Team Season', () => {
    expect(compareStatsCounterpartsV2({
      expectedCounterparts: [expected()],
      actualCounterparts: actual(null),
    })).toEqual([])
  })

  test('does not fall back to another season', () => {
    expect(compareStatsCounterpartsV2({
      expectedCounterparts: [expected()],
      actualCounterparts: [{
        birthTeamDocumentId: 'team-b',
        seasonKey: '25_26',
        teamSeason: {
          transfersIn: [],
        },
      }],
    })).toEqual([])
  })

  test('reports missing canonical movement', () => {
    expect(compareStatsCounterpartsV2({
      expectedCounterparts: [expected()],
      actualCounterparts: actual({
        transfersIn: [],
      }),
    })).toEqual([
      expect.objectContaining({
        type: 'missing_projection',
        target: 'counterpart',
      }),
    ])
  })

  test('reports mismatch in canonical movement-owned fields', () => {
    expect(compareStatsCounterpartsV2({
      expectedCounterparts: [expected()],
      actualCounterparts: actual({
        transfersIn: [{
          movementId: 'm1',
          playerId: 'wrong-player',
          fromBirthTeamDocumentId: 'team-a',
          toBirthTeamDocumentId: 'team-b',
        }],
      }),
    })).toEqual([
      expect.objectContaining({
        type: 'projection_mismatch',
        target: 'counterpart',
      }),
    ])
  })

  test('ignores unrelated extra movements and pendingPlayers', () => {
    expect(compareStatsCounterpartsV2({
      expectedCounterparts: [expected()],
      actualCounterparts: actual({
        transfersIn: [
          expected().fact,
          {
            movementId: 'other',
            playerId: 'p2',
          },
        ],
        transfersOut: [{
          movementId: 'unrelated-out',
        }],
        pendingPlayers: [{
          playerId: 'legacy-pending',
        }],
      }),
    })).toEqual([])
  })

  test('ignores fields outside the canonical movement contract', () => {
    expect(compareStatsCounterpartsV2({
      expectedCounterparts: [expected()],
      actualCounterparts: actual({
        transfersIn: [{
          ...expected().fact,
          displayOnlyField: 'preserved',
        }],
      }),
    })).toEqual([])
  })
})
