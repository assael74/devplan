// src/features/playersDatabase/catalog/firestoreDocuments/clubsCenterSeason.catalog.js
// Target contract: one Club Center projection per season.
// Purpose: club work center, team search/drill-down for a small number of seasons,
// trend comparison between seasons, and club-level movement analysis.
// Canonical facts remain owned by League / Team Root / Team Season / Club Profile.

export const CLUBS_CENTER_SEASON_DOCUMENT_CATALOG = {
  docType: 'clubs_center_season',

  // Technical storage ID, e.g. 2025_2026.
  seasonId: '',
  // Business/display value, e.g. 25/26. Never use it to build Firestore IDs.
  seasonKey: '',
  seasonStatus: '',

  // Small league lookup for a self-contained single read.
  // League display/age-group metadata is stored once per league, not repeated per team.
  leaguesById: {
    '<leagueId>': {
      displayName: '',
      ageGroupLabel: '',
      leagueLevel: null,
      // Updated only when the official league table is imported.
      tableImportedAt: null,
    },
  },

  clubsById: {
    '<clubId>': {
      // Small identity snapshot so the center does not fan out to ClubProfile documents.
      displayName: '',
      shortName: '',
      clubLevel: null,
      clubStrengthLevel: null,

      teamsById: {
        '<teamId>': {
          teamSeasonDocumentId: '',

          birthYear: 0,
          ageGroupId: '',
          teamSlot: null,

          leagueId: '',

          // Operational documentation state.
          // NO_ROSTER | ROSTER_ONLY | STATS_LOADED | STATS_FINAL
          documentationState: 'NO_ROSTER',
          documentationStateUpdatedAt: null,

          // Existing canonical signal names.
          teamTaskSignals: {
            offense: false,
            defense: false,
          },

          // Minimal league performance snapshot for fast club-level trend/problem scanning.
          performance: {
            tableRank: null,
            points: null,
            teamGamePlayed: null,
          },

          // Existing competition-projection naming retained.
          competitionProjection: {
            effective: {
              projectedNextLeagueLevel: null,
              status: 'UNKNOWN',
              source: 'AUTOMATIC',
            },
          },

          // Transfer summary.
          // scope (external/internal) and direction (up/lateral/down/unknown) are separate axes.
          // Counts are derived from map values; no repeated club/team ID arrays are stored.
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

            // Internal movement is also classified by direction.
            // Club-level totals should count one canonical side only to avoid double counting.
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

            // Existing pending summary naming retained.
            // pendingPlayers means unresolved roster disappearance, not a resolved transfer.
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
}
