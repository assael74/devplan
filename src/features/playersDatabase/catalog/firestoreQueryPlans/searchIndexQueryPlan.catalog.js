// src/features/playersDatabase/catalog/firestoreQueryPlans/searchIndexQueryPlan.catalog.js

export const PLAYER_SEARCH_QUERY_PLAN = {
  collection: 'dbSearchIndexes',

  purpose: 'Query contract for Player SearchIndex documents only.',

  firestoreQueryFields: {
    seasonId: {
      operators: ['=='],
    },

    birthYear: {
      operators: ['=='],
    },

    leagueLevel: {
      operators: ['=='],
    },

    leagueId: {
      operators: ['=='],
    },

    playerId: {
      operators: ['==', 'in'],
    },

    expectedLevelDelta: {
      operators: ['<', '==', '>'],
      nullable: true,
    },

    scoutEffectiveImmediacyStatus: {
      operators: ['=='],
    },

    scoutProfileIds: {
      operators: ['array-contains', 'array-contains-any'],
    },

    scoutCombinationIds: {
      operators: ['array-contains-any'],
    },

    scoutProfileSearchIds: {
      operators: ['array-contains-any'],
    },
  },

  firestoreOrderByFields: [],

  clientSideFilters: {
    seasonKey: 'season.seasonKey',

    teamId: 'team.teamId',
    clubId: 'team.clubId',

    displayName: 'identity.displayName',
    normalizedDisplayName: 'identity.normalizedDisplayName',

    primaryProfileId: 'scout.primary.profileId',

    games: 'stats.projected.games',
    goals: 'stats.projected.goals',
    minutes: 'stats.projected.minutes',
    starts: 'stats.projected.starts',
  },

  clientSideSortFields: {
    displayName: 'identity.displayName',

    games: 'stats.actual.games',
    goals: 'stats.actual.goals',
    minutes: 'stats.actual.minutes',
    starts: 'stats.actual.starts',

    projectedGames: 'stats.projected.games',
    projectedGoals: 'stats.projected.goals',
    projectedMinutes: 'stats.projected.minutes',
    projectedStarts: 'stats.projected.starts',

    primaryProfileStrengthDepthPct: 'scout.primary.strengthDepthPct',
  },

  directLookup: {
    documentId: 'playerSeason__{playerId}__{teamSeasonDocumentId}',

    inputs: {
      playerId: 'stable player id',
      teamSeasonDocumentId: 'canonical Team Season document id built from technical seasonId',
    },
  },

  projectionMaintenance: {
    discoveryQueries: [],

    rules: [
      'Do not discover Player SearchIndex documents by seasonKey, teamId or entityType.',
      'Build expected document ids from the canonical Team Season roster and teamSeasonDocumentId.',
      'Roster replacement compares the previous canonical Team Season roster with the approved new roster to determine deletes.',
      'Clear flows build the exact affected document ids before projection writes.',
      'Legacy/orphan cleanup belongs to migration or audit, not normal projection maintenance.',
    ],
  },

  removedLegacyQueryFields: [
    'entityType',
    'seasonKey',
    'birthTeamId',
    'birthTeamDocumentId',
    'teamId',
  ],

  invariants: [
    'Only fields used directly by Firestore Player Search queries are required to stay flat in Player SearchIndex.',
    'There is no Firestore orderBy requirement in the current Player Search contract.',
    'Numeric stats filters are client-side and therefore read nested stats.projected fields.',
    'SearchIndex maintenance must not require collection-scope discovery queries.',
    'teamSeasonDocumentId is derived from technical seasonId and never from seasonKey.',
    'Team SearchIndex is not part of this query plan.',
  ],
};

export default PLAYER_SEARCH_QUERY_PLAN;
