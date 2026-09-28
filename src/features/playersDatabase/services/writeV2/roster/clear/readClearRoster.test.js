// src/features/playersDatabase/services/writeV2/roster/clear/readClearRoster.test.js

import { where } from 'firebase/firestore'
import { trackedGetDocFromServer, trackedGetDocsFromServer } from '../../../../../../services/firestore/usage/index.js'
import { buildStatsAbsentTeamSeasonState } from '../../../../domain/statsV2/statsAbsence.builder.js'
import { readClearRosterSources, resolveNextTeamSeasonDeleteAction } from './readClearRoster.js'

jest.mock('firebase/firestore', () => ({
  doc: jest.fn((db, collectionName, id) => ({ collectionName, id })),
  collection: jest.fn(), query: jest.fn(), where: jest.fn(),
}))
jest.mock('../../../../../../services/firebase/firebase.js', () => ({ db: {} }))
jest.mock('../../../../../../services/firestore/usage/index.js', () => ({
  trackedGetDocFromServer: jest.fn(), trackedGetDocsFromServer: jest.fn(),
}))

const identity = {
  birthTeamDocumentId: 'team-1', seasonKey: '26/27', leagueId: 'league-1',
}
const rosterSeason = () => buildStatsAbsentTeamSeasonState({
  ...identity,
  teamPlayers: [{ playerId: 'player-1' }],
  playersCount: 1,
  pendingPlayers: [],
  transfersIn: [],
  transfersOut: [],
  rosterImport: { mode: 'PATCH', sourceSnapshotKey: 'source', contentHash: 'hash', effectiveAt: null },
})
test('selects only the next approved delete action for a season', () => {
  const season = rosterSeason()
  expect(resolveNextTeamSeasonDeleteAction({ identity, season })).toBe('roster')

  season.teamPlayers[0].playerStats.goals = 1
  expect(resolveNextTeamSeasonDeleteAction({ identity, season })).toBe('stats')

  const absentSeason = rosterSeason()
  absentSeason.teamPlayers = []
  absentSeason.playersCount = 0
  absentSeason.rosterImport = {
    mode: 'AUTHORITATIVE_SNAPSHOT', sourceSnapshotKey: '', contentHash: '', effectiveAt: null,
  }
  expect(resolveNextTeamSeasonDeleteAction({ identity, season: absentSeason })).toBe(null)
})

test('reads the team scope and retains all equivalent seasons for writer and Audit', async () => {
  trackedGetDocFromServer.mockImplementation(async reference => ({
    exists: () => true,
    data: () => reference.id === 'team-1'
      ? { clubId: 'club-1' }
      : { leagueId: 'league-1', seasonKey: '26/27' },
  }))
  trackedGetDocsFromServer
    .mockResolvedValueOnce({
      docs: ['26/27', '26_27', '26-27', '2026/2027', '25/26'].map((seasonKey, index) => ({
        id: `index-${index}`,
        data: () => ({ seasonKey, birthTeamDocumentId: 'team-1', entityType: 'playerSeason' }),
      })),
    })
    .mockResolvedValueOnce({ docs: [] })
  const result = await readClearRosterSources({
    birthTeamDocumentId: 'team-1', seasonKey: '26/27', leagueId: 'league-1',
  })
  expect(where).toHaveBeenCalledWith('birthTeamDocumentId', '==', 'team-1')
  expect(where.mock.calls.some(call => call[0] === 'seasonKey')).toBe(false)
  expect(result.playerIndexes.map(row => row.id)).toEqual(['index-0', 'index-1', 'index-2', 'index-3'])
})
