// src/features/playersDatabase/catalog/firestoreDocuments/clubsCenterSeason.catalog.js
// Canonical document contract.

export const CLUBS_CENTER_SEASON_DOCUMENT = {
  collection: 'dbClubsCenter',
  documentId: '{seasonId}',

  purpose: 'One Club Center projection per technical season for club work, team drill-down, trends and movement analysis.',

  seasonId: '',
  seasonKey: '',
  seasonStatus: '',

  leaguesById: {
    '<leagueId>': {
      displayName: '',
      ageGroupLabel: '',
      leagueLevel: null,
      tableImportedAt: null,
    },
  },

  clubsById: {
    '<clubId>': {
      displayName: '',
      shortName: '',
      clubLevel: null,
      clubStrengthLevel: null,

      teamsById: {
        '<teamId>': {
          teamSeasonDocumentId: '',

          birthYear: null,
          ageGroupId: '',
          teamSlot: null,
          leagueId: '',

          // NO_ROSTER | ROSTER_ONLY | STATS_LOADED | STATS_FINAL
          documentationState: 'NO_ROSTER',
          documentationStateUpdatedAt: null,

          teamTaskSignals: {
            offense: false,
            defense: false,
            updatedAt: null,
          },

          // Compact official League snapshot for club-level scanning.
          performance: {
            tableRank: null,
            points: null,
            teamGamePlayed: null,
          },

          competitionProjection: {
            effective: {
              projectedNextLeagueLevel: null,
              status: 'UNKNOWN',
              source: 'AUTOMATIC',
            },
          },

          // Rebuildable summary from canonical Team Season movement maps.
          transfers: {
            coverageStatus: 'NOT_LOADED',

            external: {
              in: {
                up: { clubsById: {} },
                lateral: { clubsById: {} },
                down: { clubsById: {} },
                unknown: { clubsById: {} },
              },
              out: {
                up: { clubsById: {} },
                lateral: { clubsById: {} },
                down: { clubsById: {} },
                unknown: { clubsById: {} },
              },
            },

            internal: {
              in: {
                up: { teamsById: {} },
                lateral: { teamsById: {} },
                down: { teamsById: {} },
                unknown: { teamsById: {} },
              },
              out: {
                up: { teamsById: {} },
                lateral: { teamsById: {} },
                down: { teamsById: {} },
                unknown: { teamsById: {} },
              },
            },

            pending: {
              total: 0,
            },

            updatedAt: null,
          },

          updatedAt: null,
        },
      },
    },
  },

  updatedAt: null,

  rebuildSources: [
    'ClubProfile provides club display identity, clubLevel and clubStrengthLevel.',
    'League provides league metadata, official table facts, tableImportedAt and team-to-league registry.',
    'Team Season provides documentation state inputs, teamTaskSignals, pending roster state and canonical movement maps.',
  ],

  documentationStateRules: [
    'NO_ROSTER: Team Season is absent or roster.playersById is empty.',
    'ROSTER_ONLY: roster exists and stats.statsLoadState.status is not loaded.',
    'STATS_LOADED: roster exists, stats.statsLoadState.status is loaded and seasonStatus is not completed.',
    'STATS_FINAL: roster exists, stats.statsLoadState.status is loaded and seasonStatus is completed.',
    'documentationStateUpdatedAt changes only when documentationState changes.',
  ],

  transferRules: [
    'scope and levelDirection are separate axes.',
    'External movement aggregates by counterpart clubId.',
    'Internal movement aggregates by counterpart teamId.',
    'pending.total counts unresolved roster disappearance and is not a resolved transfer.',
    'The summary is rebuilt from Team Season movement/pending state and must not become movement truth.',
  ],

  writeModel: [
    'This document is a season projection and never a canonical Club, League, Team or Movement source.',
    'Update one clubsById.{clubId}.teamsById.{teamId} path directly whenever possible.',
    'Do not read-modify-write the full clubsById map for one affected team.',
    'The projection is fully rebuildable from ClubProfile, League and Team Season documents.',
    'A retry rebuilds the affected transfer summary from canonical Team Season state instead of incrementing counters.',
  ],

  sizePolicy: {
    warningBytes: 716800,
    blockWriteBytes: 870400,
    action: 'Measure serialized size during migration and before wide rewrites. Introduce deterministic bucketing only if measured data approaches the guard.',
  },

  invariants: [
    'documentId equals technical seasonId in YYYY_YYYY form.',
    'seasonKey is display/business data and never participates in the document id.',
    'teamSlot is the canonical field name; slot is not used.',
    'teamGamePlayed is the canonical compact games-played field name in this projection.',
    'clubId and teamId are map keys and are not duplicated inside their respective values.',
    'League display metadata is stored once in leaguesById rather than repeated per team.',
    'Movement details remain canonical in Team Season; only aggregate counts are stored here.',
    'No current/history structure is stored here.',
    'Deep dynamic maps should be excluded from Firestore indexing because they are not queried by field path.',
  ],
};

export default CLUBS_CENTER_SEASON_DOCUMENT;
