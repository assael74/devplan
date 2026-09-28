import { compareStatsPlayerDocumentsV2 } from './comparePlayerDocuments.js'

const expected = [{
  playerDocumentId: 'p1',
  target: 'current',
  player: {
    scoutProfiles: [{
      profileId: 'profile-1',
    }],
  },
  seasonRow: {
    seasonKey: '26_27',
    statsStatus: 'loaded',
    playerStats: {
      games: 5,
    },
    scoutProfiles: [{
      profileId: 'profile-1',
    }],
  },
}]

describe('Stats Audit V2 Player Documents', () => {
  test('reports a missing document when canonical scouting requires it', () => {
    expect(compareStatsPlayerDocumentsV2({
      expectedPlayerDocuments: expected,
      actualPlayerDocuments: [{
        playerDocumentId: 'p1',
        exists: false,
        document: null,
      }],
      seasonKey: '26_27',
    })).toEqual([
      expect.objectContaining({
        type: 'missing_projection',
        target: 'playerDocument',
      }),
    ])
  })

  test('ignores a missing document when no canonical profile requires creation', () => {
    expect(compareStatsPlayerDocumentsV2({
      expectedPlayerDocuments: [{
        ...expected[0],
        player: {
          scoutProfiles: [],
        },
      }],
      actualPlayerDocuments: [{
        playerDocumentId: 'p1',
        exists: false,
        document: null,
      }],
      seasonKey: '26_27',
    })).toEqual([])
  })

  test('compares only the Stats season row fields expected by the writer', () => {
    expect(compareStatsPlayerDocumentsV2({
      expectedPlayerDocuments: expected,
      actualPlayerDocuments: [{
        playerDocumentId: 'p1',
        exists: true,
        document: {
          fullName: 'Display field outside this comparison',
          current: [{
            ...expected[0].seasonRow,
            unrelatedField: 'preserved',
          }],
        },
      }],
      seasonKey: '26_27',
    })).toEqual([])
  })

  test('does not report a mismatch when Firestore returns object keys in a different order', () => {
    expect(compareStatsPlayerDocumentsV2({
      expectedPlayerDocuments: expected,
      actualPlayerDocuments: [{
        playerDocumentId: 'p1',
        exists: true,
        document: {
          current: [{
            scoutProfiles: [{
              profileId: 'profile-1',
            }],
            playerStats: {
              games: 5,
            },
            statsStatus: 'loaded',
            seasonKey: '26_27',
          }],
        },
      }],
      seasonKey: '26_27',
    })).toEqual([])
  })
})
