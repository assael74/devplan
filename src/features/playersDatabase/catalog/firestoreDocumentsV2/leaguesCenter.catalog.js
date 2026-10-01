// src/features/playersDatabase/catalog/firestoreDocuments/leaguesCenter.catalog.js
// Target contract: one lightweight, always-available League Center projection.
// Purpose: work routing, league/team registry, duplicate-team detection, and fast navigation.
// Historical seasons may be archived/removed later if document size requires it.

export const LEAGUES_CENTER_DOCUMENT_ID = 'all'

export const LEAGUES_CENTER_DOCUMENT_CATALOG = {
  docType: 'leagues_center',

  leaguesById: {
    '<leagueId>': {
      canonicalExists: false,

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
          birthYear: 0,
          seasonUrl: '',

          // Projection of competitionRules.configured only.
          hasCompetitionRules: false,

          // NOT_LOADED | LOADED_EMPTY | LOADED
          tableState: 'NOT_LOADED',

          // Timestamp of the last official league-table import into the system.
          // This is intentionally separate from the generic updatedAt.
          tableImportedAt: null,

          teamsById: {
            '<teamId>': {
              clubId: '',
              slot: null,

              // Operational field.
              // NO_ROSTER | ROSTER_ONLY | STATS_LOADED | STATS_FINAL
              documentationState: 'NO_ROSTER',
              documentationStateUpdatedAt: null,

              // Existing canonical signal names projected from the team/league model.
              teamTaskSignals: {
                offense: false,
                defense: false,
              },
            },
          },

          updatedAt: null,
        },
      },
    },
  },
}
