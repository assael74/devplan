// src/features/playersDatabase/services/write/searchIndex/team/teamSeasonIndex.patch.test.js

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  deleteField: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
  serverTimestamp: jest.fn(),
  where: jest.fn(),
}))

jest.mock('../../../../../../services/firebase/firebase.js', () => ({ db: {} }))

jest.mock('../../../../../../services/firestore/usage/index.js', () => ({
  createTrackedWriteBatch: jest.fn(),
  trackedGetDoc: jest.fn(),
  trackedGetDocs: jest.fn(),
  trackedDeleteDoc: jest.fn(),
  trackedUpdateDoc: jest.fn(),
}))

import { buildTeamSearchIndexStatsDerivedReset } from './teamSeasonIndex.patch.js'

test('clearing stats preserves the canonical no-stats Balance projection', () => {
  const result = buildTeamSearchIndexStatsDerivedReset({
    teamBalance: {
      dependencyKey: 'team-balance-summary-v14|team-balance-v13',
      persistenceContractVersion: 'team-balance-persistence-v21',
      scoutInterpretation: {
        modelVersion: 'team-scout-interpretation-v5',
        availability: 'unavailable',
        availabilityReason: 'stats_not_loaded',
        offense: { finding: '' },
        defense: { finding: '' },
        teamInterest: { isInteresting: false, squad: { isInteresting: false } },
      },
    },
  })

  expect(result).toMatchObject({
    attackScoutPriorityScore: null,
    defenseScoutPriorityScore: null,
    balanceDependencyKey: 'team-balance-summary-v14|team-balance-v13',
    balancePersistenceContractVersion: 'team-balance-persistence-v21',
    scoutInterpretationModelVersion: 'team-scout-interpretation-v5',
    scoutInterpretationAvailability: 'unavailable',
    scoutInterpretationAvailabilityReason: 'stats_not_loaded',
    teamInterest: false,
  })
})
