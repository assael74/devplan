// src/features/playersDatabase/catalog/firestoreDocuments/leaguesMaster.catalog.js

// Firestore source of truth: leagues master document.

export const PLAYERS_DATABASE_LEAGUES_MASTER_DOCUMENT_CATALOG = {
  id: 'all',
  docType: 'leagues_master',
  updatedAt: null,

  summary: {
    leaguesCount: 0,
    seasonsCount: 0,
    teamsCount: 0,
    playersCount: 0,
    playersWithScoutProfileCount: 0,
    scoutProfilesCount: 0,
  },

  leagues: [
    {
      leagueId: '',
      leagueDocumentId: '',
      leagueName: '',
      leagueUrl: '',
      region: '',
      ageGroupId: '',
      ageGroupLabel: '',
      active: true,
      updatedAt: null,

      seasons: [
        {
          seasonId: '',
          seasonKey: '',
          leagueDocumentId: '',
          leagueName: '',
          leagueUrl: '',
          ageGroupId: '',
          ageGroupLabel: '',
          birthYear: 0,
          teamsCount: 0,
          playersCount: 0,
          playersWithScoutProfileCount: 0,
          scoutProfilesCount: 0,
          tableRankCount: 0,
          currentDocRef: '',
          historyDocRef: '',
          updatedAt: null,
        },
      ],
    },
  ],
};

