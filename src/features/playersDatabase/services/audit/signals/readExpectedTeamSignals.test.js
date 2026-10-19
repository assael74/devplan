// src/features/playersDatabase/services/audit/signals/readExpectedTeamSignals.test.js

import { trackedGetDocsFromServer } from '../../../../../services/firestore/usage/index.js'
import { readClubProfiles } from '../league/readActual.js'
import { readExpectedTeamSignals } from './readExpectedTeamSignals.js'

jest.mock('firebase/firestore', () => ({
  collection: (_db, name) => ({ path: name }),
  query: (ref, ...filters) => ({ ...ref, filters }),
  where: (field, operator, value) => ({ field, operator, value }),
}))
jest.mock('../../../../../services/firebase/firebase.js', () => ({ db: {} }))
jest.mock('../../../../../services/firestore/usage/index.js', () => ({ trackedGetDocsFromServer: jest.fn() }))
jest.mock('../league/readActual.js', () => ({ readClubProfiles: jest.fn() }))

const teamId = 'club_2012_1'
const seasonId = '2026_2027'
const snapshot = (id, data) => ({ id, data: () => data })
const season = (seasonKey, rank) => ({
  seasonKey, seasonStatus: 'active', birthYear: 2012,
  table: { teamsById: { [teamId]: {
    clubId: 'club', teamSlot: 1, officialTable: { rank, teamGamePlayed: 16 },
    teamSignalSummary: { familiesById: { 'club-gap': { level: 0 } } },
  } } },
})

beforeEach(() => jest.resetAllMocks())

test('recomputes from all canonical club seasons and movement profiles without reading Centers or NOTES', async () => {
  trackedGetDocsFromServer.mockImplementation(async ref => ({ docs: ref.path === 'dbLeagues'
    ? [snapshot('league', {
      leagueId: 'league', level: 3, ageGroupId: 'u15', seasonsById: {
        '2025_2026': season('25/26', 10), [seasonId]: season('26/27', 2),
      },
    })]
    : [snapshot(`${teamId}__${seasonId}`, {
      identity: { teamId, clubId: 'club', leagueId: 'league', seasonId, seasonKey: '26/27', birthYear: 2012, teamSlot: 1 },
      movement: { transfersOutById: { move: { toClubId: 'other' } } },
    })],
  }))
  readClubProfiles.mockResolvedValue({ club: { clubId: 'club', clubLevel: 1 }, other: { clubId: 'other', clubLevel: 2 } })
  const result = await readExpectedTeamSignals({ clubIds: ['club', 'club'] })
  expect(result.get(`${teamId}__${seasonId}`).familiesById['club-gap'].level).toBe(1)
  expect(result.get(`${teamId}__${seasonId}`).familiesById.performance.level).toBe(2)
  expect(result.has(`${teamId}__2025_2026`)).toBe(true)
  expect(readClubProfiles).toHaveBeenCalledWith({ clubIds: ['club', 'other'] })
  expect(trackedGetDocsFromServer.mock.calls.map(([ref]) => ref.path))
    .toEqual(['dbLeagues', 'dbBirthTeamSeasons'])
  expect(trackedGetDocsFromServer.mock.calls[1][0].filters)
    .toEqual([{ field: 'identity.clubId', operator: '==', value: 'club' }])
})

test('does not interpret a failed canonical read as a clean audit', async () => {
  trackedGetDocsFromServer.mockRejectedValue(new Error('offline'))
  await expect(readExpectedTeamSignals({ clubIds: ['club'] })).rejects.toThrow('offline')
})

test('does not read canonical collections for an empty scope', async () => {
  expect(await readExpectedTeamSignals({ clubIds: [null, ''] })).toEqual(new Map())
  expect(trackedGetDocsFromServer).not.toHaveBeenCalled()
})
