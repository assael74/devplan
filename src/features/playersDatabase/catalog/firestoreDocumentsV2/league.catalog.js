// src/features/playersDatabase/catalog/firestoreDocuments/league.catalog.js

export const LEAGUE_DOCUMENT = {
  collection: 'dbLeagues',
  documentId: 'leagueId',

  purpose: 'Canonical league document with keyed seasons and keyed team rows.',

  leagueId: '',

  names: {
    official: '',
    display: '',
    short: '',
    source: '',
  },

  region: '',
  ageGroupId: '',
  ageGroupLabel: '',
  level: null,

  seasonsById: {
    '<seasonId>': {
      // Technical Firestore-safe id, e.g. 2025_2026, is the map key.
      seasonKey: '', // Business/display value, e.g. 25/26.
      seasonStatus: '',
      birthYear: null,

      seasonUrl: '',
      leagueTotalRound: null,

      // Snapshot of the competition rule for this season.
      // Default is resolved from ageGroupId only when the season is created/migrated.
      // Later catalog changes must not rewrite historical seasons automatically.
      gameDurationMinutes: null,

      // Updated only when the official league table is imported/observed successfully,
      // including a successful import whose table is empty.
      tableImportedAt: null,

      competitionRules: {
        configured: false,

        promotion: {
          enabled: false,
          directPlaces: [],
          playoffPlaces: [],
        },

        relegation: {
          enabled: false,
          directPlaces: [],
          playoffPlaces: [],
        },
      },

      table: {
        // NOT_LOADED | LOADED_EMPTY | LOADED
        tableState: '',

        teamsById: {
          '<teamId>': {
            clubId: '',
            teamSlot: null,

            // Small stable snapshot so the League document remains self-contained.
            clubLevel: null,

            // Team URL is season-scoped.
            teamUrl: '',

            // Official table facts only.
            officialTable: {
              rank: null,
              points: null,
              goalsFor: null,
              goalsAgainst: null,
              gamesPlayed: null,
            },

            // Calculated professional/team performance projection.
            // Keep the current offense/defense contract; it is not the official table.
            performance: {
              offense: {
                targetRate: null,
                targetNormalized: null,
                targetLevel: '',
                rankingRate: null,
                rankingNormalized: null,
                rankingLevel: '',
                anomalyRate: null,
                anomalyLevel: '',
                qualityRate: null,
                scoutPriorityScore: null,
                priorityLevel: '',
                opportunityType: '',
                rank: null,
                benchmark: {
                  expectedValue: null,
                  actualValue: null,
                  projectedValue: null,
                  gap: null,
                },
              },

              defense: {
                targetRate: null,
                targetNormalized: null,
                targetLevel: '',
                rankingRate: null,
                rankingNormalized: null,
                rankingLevel: '',
                anomalyRate: null,
                anomalyLevel: '',
                qualityRate: null,
                scoutPriorityScore: null,
                priorityLevel: '',
                opportunityType: '',
                rank: null,
                benchmark: {
                  expectedValue: null,
                  actualValue: null,
                  projectedValue: null,
                  gap: null,
                },
              },
            },

            roster: {
              playersCount: null,
              hasPlayers: false,
            },

            stats: {
              hasStats: false,
              statsComplete: false,
            },

            scouting: {
              // Number of players with at least one scout profile.
              playersWithScoutProfileCount: null,

              teamTaskSignals: {
                offense: false,
                defense: false,
                updatedAt: null,
              },
            },

            updatedAt: null,
          },
        },
      },

      // Compact receipt/cache for the performance calculation.
      performanceCalculation: {
        engineVersion: '',
        normalizationMode: '',
        appliedFactor: null,
        calculatedAt: null,
      },

      updatedAt: null,
    },
  },

  timestamps: {
    createdAt: null,
    updatedAt: null,
  },

  ownership: {
    league: [
      'league identity',
      'season identity',
      'seasonUrl',
      'leagueTotalRound',
      'gameDurationMinutes',
      'competitionRules',
      'tableImportedAt',
      'table.tableState',
      'table.teamsById.*.clubId',
      'table.teamsById.*.teamSlot',
      'table.teamsById.*.clubLevel',
      'table.teamsById.*.teamUrl',
      'table.teamsById.*.officialTable',
      'table.teamsById.*.performance',
      'performanceCalculation',
    ],

    roster: [
      'table.teamsById.*.roster.playersCount',
      'table.teamsById.*.roster.hasPlayers',
    ],

    stats: [
      'table.teamsById.*.stats.hasStats',
      'table.teamsById.*.stats.statsComplete',
      'table.teamsById.*.scouting.playersWithScoutProfileCount',
      'table.teamsById.*.scouting.teamTaskSignals',
    ],
  },

  writeModel: [
    'current/history are removed.',
    'Season updates target seasonsById.{seasonId}.',
    'Team updates target seasonsById.{seasonId}.table.teamsById.{teamId}.',
    'Projection-owned fields are updated by known field paths without reading the full League projection first.',
    'Official table import is authoritative for the season table snapshot: it replaces teamsById or explicitly deletes removed team keys.',
    'gameDurationMinutes is resolved once when a season is created or migrated and then remains a historical season snapshot unless manually overridden.',
    'tableImportedAt changes only on a successful official table import/observation, including an empty table.',
  ],

  invariants: [
    'seasonId is the technical Firestore-safe id and is never built ad hoc from seasonKey.',
    'seasonKey is the business/display season value.',
    'birthYear, seasonUrl, leagueTotalRound, gameDurationMinutes and competitionRules are season-owned.',
    'tableState distinguishes not loaded, loaded empty and loaded with teams.',
    'teamId is the teamsById map key and is not duplicated inside the team value.',
    'officialTable contains only official ranking/table facts.',
    'performance contains calculated professional/scouting performance only.',
    'playersCount means current roster player count.',
    'playersWithScoutProfileCount means players with at least one scout profile.',
    'scoutProfilesCount/profile assignment count is intentionally not persisted.',
    'clubLevel is intentionally snapshotted so League remains self-contained.',
    'No current/history arrays are persisted.',
  ],
};

export default LEAGUE_DOCUMENT;
