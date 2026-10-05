// src/features/playersDatabase/ui/pages/searchPage/logic/search.model.test.js

import { normalizeSearchRow } from './search.model.js'

describe('Canonical player search row', () => {
  test('reads the canonical nested display fields without playerDocumentId', () => {
    const row = normalizeSearchRow({
      id: 'playerSeason__player__2012__77__club-a_2012_1__2026_2027',
      playerId: 'player__2012__77',
      seasonId: '2026_2027',
      birthYear: 2012,
      leagueId: 'league_1',
      leagueLevel: 1,
      references: {
        teamSeasonDocumentId: 'club-a_2012_1__2026_2027',
      },
      identity: { displayName: 'שחקן א' },
      season: { seasonKey: '26/27' },
      team: {
        teamId: 'club-a_2012_1',
        clubId: 'club-a',
        teamSlot: 1,
        ageGroupLabel: 'נערים ג׳',
      },
      player: {
        playerUrl: 'https://example.com/player',
        primaryPosition: 'forward',
        notes: 'הערה',
      },
      stats: {
        actual: { games: 5, goals: 3, minutes: 320, starts: 4 },
      },
      scout: {
        primary: { profileId: 'finisher', score: 81, strengthDepthPct: 75 },
      },
      scoutProfileIds: ['finisher'],
    })

    expect(row).toMatchObject({
      id: 'playerSeason__player__2012__77__club-a_2012_1__2026_2027',
      playerId: 'player__2012__77',
      playerName: 'שחקן א',
      seasonId: '2026_2027',
      seasonKey: '26/27',
      appearances: 5,
      goals: 3,
      minutes: 320,
      primaryProfile: 'finisher',
      playerUrl: 'https://example.com/player',
      notes: 'הערה',
    })
    expect(row.playerDocumentId).toBeUndefined()
  })
})
