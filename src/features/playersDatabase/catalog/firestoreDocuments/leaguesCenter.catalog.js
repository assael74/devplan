// src/features/playersDatabase/catalog/firestoreDocuments/leaguesCenter.catalog.js
// Canonical document contract.

export const LEAGUES_CENTER_DOCUMENT = {
  collection: 'dbLeaguesCenter',
  documentId: 'all',

  purpose: 'Global lightweight League Center projection loaded once into the PlayersDatabase Read Store.',

  leaguesById: {
    '<leagueId>': {
      identity: {
        leagueName: '',
        region: '',
        ageGroupId: '',
        ageGroupLabel: '',
        level: null,
      },

      seasonsById: {
        '<seasonId>': {
          seasonKey: '',
          seasonStatus: '',
          birthYear: null,
          seasonUrl: '',

          hasCompetitionRules: false,

          // NOT_LOADED | LOADED_EMPTY | LOADED
          tableState: 'NOT_LOADED',
          tableImportedAt: null,

          teamsById: {
            '<teamId>': {
              clubId: '',
              teamSlot: null,

              // NO_ROSTER | ROSTER_ONLY | STATS_LOADED | STATS_FINAL
              documentationState: 'NO_ROSTER',
              documentationStateUpdatedAt: null,

              teamTaskSignals: {
                offense: false,
                defense: false,
                updatedAt: null,
              },
            },
          },

          updatedAt: null,
        },
      },
    },
  },

  updatedAt: null,

  rebuildSources: [
    'League provides league identity, season identity, seasonUrl, competitionRules configured state, tableState, tableImportedAt and team registry.',
    'Team Season provides documentationState inputs and teamTaskSignals.',
  ],

  documentationStateRules: [
    'NO_ROSTER: Team Season is absent or roster.playersById is empty.',
    'ROSTER_ONLY: roster exists and stats.statsLoadState.status is not loaded.',
    'STATS_LOADED: roster exists, stats.statsLoadState.status is loaded and seasonStatus is not completed.',
    'STATS_FINAL: roster exists, stats.statsLoadState.status is loaded and seasonStatus is completed.',
    'documentationStateUpdatedAt changes only when documentationState changes.',
  ],

  writeModel: [
    'This document is a projection and never a canonical source of League, Team or Stats truth.',
    'Update one league/season/team by direct field path whenever possible.',
    'League Season Delete removes only the season projection while the canonical League Root still exists; if the canonical League Root is already absent, remove the whole leaguesById.{leagueId} projection.',
    'Do not read-modify-write the full leaguesById map for a single affected target.',
    'The document is loaded once into the central Read Store and reused across PlayersDatabase navigation.',
    'The projection contains only canonical League documents and must be fully rebuildable from League and Team Season documents.',
  ],

  sizePolicy: {
    warningBytes: 716800,
    blockWriteBytes: 870400,
    action: 'Measure serialized document size during migration and before wide rewrites. Split/archive historical seasons only if the measured document crosses the guard.',
  },

  invariants: [
    'seasonId keys use YYYY_YYYY form and are never built from seasonKey.',
    'teamId is the teamsById map key and is not duplicated inside the team value.',
    'teamSlot is the canonical field name; slot is not used.',
    'Only canonical League documents appear in leaguesById; catalog-only/non-canonical league placeholders are not persisted here.',
    'No Player counts or Player scouting counts are stored in League Center.',
    'No official table rows or detailed performance payloads are stored here.',
    'No Team SearchIndex or ClubSeasonIdentityIndex data is required to rebuild this projection.',
    'Deep dynamic maps should be excluded from Firestore indexing because they are not queried by field path.',
  ],
};

export default LEAGUES_CENTER_DOCUMENT;
