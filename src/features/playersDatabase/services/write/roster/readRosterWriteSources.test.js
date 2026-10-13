// src/features/playersDatabase/services/write/roster/readRosterWriteSources.test.js
import { trackedGetDocFromServer } from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS as collections } from '../../../constants/pdb.constants.js'
import { readRosterLoadSources } from './readRosterWriteSources.js'

jest.mock('firebase/firestore', () => ({
  doc: (_db, collection, id) => ({ path: `${collection}/${id}`, id }),
  collection: jest.fn(),
}))
jest.mock('../../../../../services/firebase/firebase.js', () => ({ db: {} }))
jest.mock('../../../../../services/firestore/usage/index.js', () => ({
  trackedGetDocFromServer: jest.fn(),
  trackedGetDocsFromServer: jest.fn(),
}))

test('reads previous roster and decision counterparts from canonical server documents', async () => {
  const teamId = 'club-a_2010_1'
  const targetId = 'club-a_2010_2'
  const seasonId = '2025_2026'
  const previousId = `${teamId}__2024_2025`
  const targetDocumentId = `${targetId}__${seasonId}`
  const previous = { identity: { teamId, seasonId: '2024_2025' }, roster: { playersById: {} } }
  const target = { identity: {
    teamId: targetId, teamSeasonDocumentId: targetDocumentId, seasonId, clubId: 'club-a', leagueId: 'league-1',
  } }
  const documents = {
    [`${collections.teamRoots}/${teamId}`]: { seasonRefsById: {
      '2024_2025': { teamSeasonDocumentId: previousId },
    } },
    [`${collections.teamSeasons}/${previousId}`]: previous,
    [`${collections.teamSeasons}/${targetDocumentId}`]: target,
    [`${collections.leagues}/league-1`]: {
      leagueId: 'league-1',
      seasonsById: { [seasonId]: { table: { teamsById: {
        [teamId]: { clubId: 'club-a' }, [targetId]: { clubId: 'club-a' },
      } } } },
    },
    [`${collections.clubProfiles}/club-a`]: { clubId: 'club-a' },
  }
  trackedGetDocFromServer.mockImplementation(async ref => ({
    id: ref.id, exists: () => Boolean(documents[ref.path]), data: () => documents[ref.path],
  }))
  const result = await readRosterLoadSources({ input: {
    leagueId: 'league-1',
    team: { clubId: 'club-a', birthYear: 2010, teamSlot: 1 },
    season: { seasonId },
    players: [],
    participantDecisions: [{ decision: 'left', team: { teamId: targetId, clubId: 'club-a', teamSlot: 2 } }],
  } })
  expect(result.previousTeamSeason).toMatchObject(previous)
  expect(result.existingCounterpartTeamSeasonsById[targetDocumentId]).toMatchObject(target)
  expect(result.counterpartProjectionSourcesByDocumentId[targetDocumentId].clubProfile.clubId).toBe('club-a')
})
