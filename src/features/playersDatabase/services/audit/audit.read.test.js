jest.mock('../../../../services/firebase/firebase.js', () => ({ db: {} }))
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  limit: jest.fn(),
  query: jest.fn(),
  startAfter: jest.fn(),
  where: jest.fn(),
}))

import { buildScopedMovementCounterpartSeasonIds } from './audit.read.js'
import { buildTeamSeasonDocumentId } from '../../model/team/teamIdentity.model.js'

test('scoped movement audit reads only source Team Seasons explicitly referenced by incoming facts', () => {
  const ids = buildScopedMovementCounterpartSeasonIds({
    teamSeasons: [{
      id: 'target__26-27',
      data: {
        seasonKey: '26-27',
        transfersIn: [
          { movementId: 'm1', fromBirthTeamDocumentId: 'source-a' },
          { movementId: 'm2', fromBirthTeamDocumentId: 'source-a' },
          { movementId: 'm3', fromBirthTeamDocumentId: 'source-b' },
          { movementId: 'ignored' },
        ],
      },
    }],
  })

  expect(ids).toEqual(expect.arrayContaining([
    buildTeamSeasonDocumentId('source-a', '26-27'),
    buildTeamSeasonDocumentId('source-b', '26-27'),
  ]))
  expect(ids).toHaveLength(2)
})
