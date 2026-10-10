// src/features/playersDatabase/domain/clubIntelligence/clubIntelligence.canonical.test.js

import {
  buildAllClubIntelligencesFromCanonicalSources,
  buildClubIntelligenceFromCanonicalSources,
} from './clubIntelligence.canonical.js'

const sources = {
  clubId: 'club-a',
  profile: {
    clubId: 'club-a',
    externalClubId: '55',
    names: {
      official: 'מועדון א',
      display: 'מועדון א',
      short: 'א',
    },
    clubUrl: 'https://example.com/club-a',
    clubLevel: 2,
    clubStrengthLevel: 3,
  },
  directoryEntry: {
    names: { display: 'שם ישן', short: 'ישן' },
    clubLevel: 4,
  },
  centers: [{
    season: {
      seasonId: '2026_2027',
      seasonKey: '26/27',
      target: 'current',
    },
    document: {
      seasonId: '2026_2027',
      seasonKey: '26/27',
      seasonStatus: 'active',
      leaguesById: {
        league_1: {
          displayName: 'ליגה 1',
          ageGroupLabel: 'נערים ג׳',
          leagueLevel: 1,
          seasonStatus: 'completed',
        },
      },
      clubsById: {
        'club-a': {
          displayName: 'מועדון א',
          teamsById: {
            'club-a_2012_1': {
              teamSeasonDocumentId: 'club-a_2012_1__2026_2027',
              birthYear: 2012,
              ageGroupId: 'u15',
              teamSlot: 1,
              leagueId: 'league_1',
              documentationState: 'ROSTER_ONLY',
              teamTaskSignals: { offense: true, defense: false },
              performance: { tableRank: 2, points: 12, teamGamePlayed: 6 },
              transfers: { coverageStatus: 'NOT_LOADED' },
            },
          },
        },
      },
    },
  }],
}

describe('Canonical club intelligence', () => {
  test('uses ClubProfile for identity and ClubsCenter for seasonal teams', () => {
    const intelligence = buildClubIntelligenceFromCanonicalSources(sources)
    const team = intelligence.birthYearTeams[0].seasons.current.teams[0]

    expect(intelligence.club).toMatchObject({
      clubId: 'club-a',
      externalClubId: '55',
      name: 'מועדון א',
      shortName: 'א',
      clubLevel: 2,
      clubStrengthLevel: 3,
    })
    expect(team).toMatchObject({
      teamId: 'club-a_2012_1',
      teamSeasonDocumentId: 'club-a_2012_1__2026_2027',
      seasonId: '2026_2027',
      seasonKey: '26/27',
      seasonStatus: 'completed',
      teamSlot: 1,
      league: {
        leagueId: 'league_1',
        leagueName: 'ליגה 1',
        leagueLevel: 1,
      },
    })
  })

  test('includes a directory-only club when no season has been loaded', () => {
    const intelligences = buildAllClubIntelligencesFromCanonicalSources({
      directory: {
        clubsById: {
          'club-empty': {
            names: { display: 'מועדון ללא עונה', short: 'ללא עונה' },
          },
        },
      },
      centers: [],
    })

    expect(intelligences.get('club-empty')).toMatchObject({
      club: {
        clubId: 'club-empty',
        name: 'מועדון ללא עונה',
      },
      birthYearTeams: [],
    })
  })
})
