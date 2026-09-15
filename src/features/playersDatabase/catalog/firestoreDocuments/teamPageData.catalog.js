// Runtime source-of-truth contract for the Team Page.
// This is NOT a Firestore document. It is assembled from the relevant Firestore
// documents once, when entering a team page, and is the only shape UI components
// should need to consume.

export const TEAM_PAGE_DATA_OPTIONAL_SCHEMA_PATHS = Object.freeze([])

export const TEAM_PAGE_DATA_GENERIC_OBJECT_CATALOG = {
  id: '',
  identity: {
    teamId: '',
    clubId: '',
    birthYear: null,
    displayName: '',
    teamSlot: 1,
  },
  root: {
    documentExists: false,
    availability: 'missing', // available | missing
    identity: {
      teamId: '',
      teamDocumentId: '',
      birthTeamId: '',
      birthTeamDocumentId: '',
      clubId: '',
      teamSlot: 1,
      birthTeamSlot: 1,
      teamSlotId: '',
    },
    document: null, // dbBirthTeams document, when it exists
  },
  seasonOrder: [], // newest to oldest, for example: ['26/27', '25/26']
  seasons: [
    {
      seasonKey: '',
      sources: {
        league: {
          documentExists: false,
          documentId: '',
          seasonKey: '',
          tableRowExists: false,
        },
        teamSeason: {
          documentExists: false,
          documentId: '',
        },
      },
      resolved: {
        identity: {
          teamId: '',
          teamDocumentId: '',
          clubId: '',
          displayName: '',
          teamSlot: 1,
        },
        season: {
          seasonId: '',
          seasonKey: '',
          birthYear: null,
        },
        league: {
          leagueId: '',
          leagueLevel: null,
          ageGroupId: '',
          ageGroupLabel: '',
          region: '',
          leagueGames: null,
        },
        stats: {
          actual: {
            gamesPlayed: null,
            points: null,
            goalsFor: null,
            goalsAgainst: null,
            goalsForPerGame: null,
            goalsAgainstPerGame: null,
          },
          projected: null,
        },
        ranking: {
          tableRank: null,
          attackRank: null,
          defenseRank: null,
        },
        performance: null,
        scoutProfilesSummary: null,
        teamPlayers: null,
        teamBalance: null,
      },
      availability: {
        leagueDocument: 'missing',
        teamSeasonDocument: 'missing',
        roster: 'missing',
        balance: 'missing',
        scoutProfiles: 'missing',
        performance: 'missing',
      },
    },
  ],
  seasonsByKey: {},
}
