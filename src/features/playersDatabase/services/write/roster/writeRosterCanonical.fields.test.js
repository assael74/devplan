// src/features/playersDatabase/services/write/roster/writeRosterCanonical.fields.test.js

import { setDoc } from 'firebase/firestore'
import { writeRosterCanonical } from './writeRosterCanonical.js'

jest.mock('firebase/firestore', () => ({
  doc: (_db, collection, id) => ({ path: `${collection}/${id}` }),
  deleteField: jest.fn(), deleteDoc: jest.fn(), setDoc: jest.fn(),
}))
jest.mock('../../../../../services/firebase/firebase.js', () => ({ db: {} }))
jest.mock('../../../../../services/firestore/usage/index.js', () => ({ trackedRunTransaction: jest.fn() }))

test('roster writes only current top-level fields and retains stored legacy signals and summaries', async () => {
  const identity = {
    teamId: 'club_2012_1', seasonId: '2026_2027', teamSeasonDocumentId: 'club_2012_1__2026_2027',
  }
  const current = {
    teamTaskSignals: { offense: true, defense: false, updatedAt: 'old' },
    teamTaskAvailability: { availability: 'available', reason: '' },
    teamSignalSummary: { computedAt: 'previous' },
    roster: { playersById: { old: {} } },
  }
  const canonical = { identity, roster: { playersById: { current: {} } } }
  await writeRosterCanonical({ approvedState: {
    ...identity,
    canonical: { teamRootOperation: 'NONE', teamSeasonOperation: 'SET', teamSeason: canonical },
  } })
  const [, data, options] = setDoc.mock.calls[0]
  const persisted = { ...current }
  options.mergeFields.forEach(field => { persisted[field] = data[field] })
  expect(persisted.roster).toEqual(canonical.roster)
  expect(persisted.teamTaskSignals).toBe(current.teamTaskSignals)
  expect(persisted.teamTaskAvailability).toBe(current.teamTaskAvailability)
  expect(persisted.teamSignalSummary).toBe(current.teamSignalSummary)
  expect(data).not.toHaveProperty('teamTaskSignals')
  expect(data).not.toHaveProperty('teamTaskAvailability')
})
