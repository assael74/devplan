// src/features/playersDatabase/services/write/stats/writeStatsCanonical.test.js
import { updateDoc } from 'firebase/firestore'
import { writeStatsCanonical } from './writeStatsCanonical.js'

jest.mock('firebase/firestore', () => ({ doc: (_db, collection, id) => `${collection}/${id}`, updateDoc: jest.fn() }))
jest.mock('../../../../../services/firebase/firebase.js', () => ({ db: {} }))

test('writes only approved URL fields and preserves unrelated manual data', async () => {
  const playerId = 'player__2012__12345'
  const playerUrl = 'https://www.football.org.il/players/player/?player_id=12345'
  await writeStatsCanonical({ approvedState: {
    teamId: 'club_2012_1', seasonId: '2026_2027', teamSeasonDocumentId: 'club_2012_1__2026_2027',
    updatedAt: 'now', playerUrlsById: { [playerId]: playerUrl },
    canonicalTeamSeason: { roster: { playersById: { [playerId]: {} } }, stats: {}, scouting: {}, teamTaskSignals: {}, teamTaskAvailability: {} },
  } })
  const patch = updateDoc.mock.calls[0][1]
  expect(patch[`manual.playersById.${playerId}.playerUrl`]).toBe(playerUrl)
  expect(patch).not.toHaveProperty('manual')
  expect(patch).not.toHaveProperty('roster')
})
