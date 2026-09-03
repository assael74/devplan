// src/features/playersDatabase/catalog/firestoreDocuments/searchIndexQueryPlan.catalog.js

/**
 * Firestore query/index readiness contract for playersDatabase SearchIndex.
 *
 * This file documents query shapes that must remain stable through the V1 smoke
 * tests. Equality-only maintenance queries are expected to use Firestore's
 * automatic single-field indexes/index merging. Dynamic search composites are
 * intentionally created only for UI combinations that are exercised in tests.
 */

export const SEARCH_INDEX_MAINTENANCE_QUERY_SHAPES = [
  {
    id: 'player-team-season-scope',
    entityType: 'playerSeason',
    filters: [
      ['birthTeamId', '=='],
      ['seasonKey', '=='],
      ['entityType', '=='],
    ],
    manualCompositeRequired: false,
  },
  {
    id: 'player-league-season-scope',
    entityType: 'playerSeason',
    filters: [
      ['leagueId', '=='],
      ['seasonKey', '=='],
      ['entityType', '=='],
    ],
    manualCompositeRequired: false,
  },
  {
    id: 'team-league-season-scope',
    entityType: 'birthTeamSeason',
    filters: [
      ['leagueId', '=='],
      ['seasonKey', '=='],
      ['entityType', '=='],
    ],
    manualCompositeRequired: false,
  },
  {
    id: 'team-url-fallback-scope',
    entityType: 'birthTeamSeason',
    filters: [
      ['entityType', '=='],
      ['birthTeamId', '=='],
      ['seasonKey', '=='],
    ],
    manualCompositeRequired: false,
  },
  {
    id: 'team-balance-refresh-by-dependency',
    entityType: 'birthTeamSeason',
    filters: [
      ['balanceDependencyKey', '=='],
    ],
    manualCompositeRequired: false,
  },
]

export const SEARCH_INDEX_DYNAMIC_QUERY_FIELDS = {
  commonEquality: [
    'entityType',
    'seasonId',
    'birthYear',
    'leagueLevel',
    'leagueId',
  ],
  playerEquality: [
    'scoutEffectiveImmediacyStatus',
  ],
  playerArrayMembership: [
    'scoutProfileIds',
    'scoutCombinationIds',
    'scoutProfileSearchIds',
  ],
  teamEquality: [
    'attackPriorityLevel',
    'defensePriorityLevel',
  ],
  range: [
    'expectedLevelDelta',
  ],
}

export const SEARCH_INDEX_COMPOSITE_INDEX_POLICY = {
  precreate: [],
  createDuringSmokeTests: [
    'Any tested search query that combines expectedLevelDelta range filtering with one or more equality filters.',
    'Frequently used player search combinations that combine scout array membership with additional equality filters, if Firestore reports or profiling shows index-merging cost.',
  ],
  rules: [
    'Do not precreate the Cartesian product of optional UI filters.',
    'Use Firestore missing-index links during smoke tests to add only combinations the UI actually executes.',
    'Keep maintenance equality-only query shapes free of manual composite indexes unless Firestore proves one is required.',
  ],
}
