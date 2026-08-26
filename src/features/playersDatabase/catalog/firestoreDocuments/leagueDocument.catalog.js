// src/features/playersDatabase/catalog/firestoreDocuments/leagueDocument.catalog.js

// Firestore source of truth: league document.

export const LEAGUE_DOCUMENT_NULLABLE_ARRAY_PATHS = Object.freeze([
  'current.tableRank',
  'history[].tableRank',
])

export const LEAGUES_DATABASE_GENERIC_OBJECTS_CATALOG = {
  id: '',
  leagueId: '',
  leagueName: '',
  region: '',
  ageGroupId: '',
  ageGroupLabel: '',
  level: null,
  createdAt: null,

  current: {
    seasonId: '',
    seasonKey: '',
    seasonUrl: '',
    birthYear: 0, // חובה
    leagueTotalRound: 0,
    // Contract: null = not loaded yet; [] = loaded and empty; rows = loaded table.
    tableRank: [
      {
        rank: 0,
        clubId: '',
        clubLevel: 0,
        birthTeamId: '',
        birthTeamSlot: 1,
        teamId: '',
        teamUrl: '',
        playersCount: 0,
        hasPlayers: false,
        hasStats: false,
        statsComplete: false,
        teamStats: {
          points: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          teamGamePlayed: 0,
        },
        scoutProfilesSummary: {
          total: 0,
          profileCounts: {},
        },
        updatedAt: null,
      },
    ],
    updatedAt: null,
  },

  history: [
    {
      seasonId: '',
      seasonKey: '',
      seasonUrl: '',
      birthYear: 0, // חובה
      leagueTotalRound: 0,
      // Contract: null = not loaded yet; [] = loaded and empty; rows = loaded table.
      tableRank: [
        {
          rank: 0,
          clubId: '',
          clubLevel: 0,
          birthTeamId: '',
          birthTeamSlot: 1,
          teamId: '',
          teamUrl: '',
          playersCount: 0,
          hasPlayers: false,
          hasStats: false,
          statsComplete: false,
          teamStats: {
            points: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            teamGamePlayed: 0,
                    },
          scoutProfilesSummary: {
            total: 0,
            profileCounts: {},
          },
          updatedAt: null,
        },
      ],
      updatedAt: null,
    },
  ],

  updatedAt: null,
};
