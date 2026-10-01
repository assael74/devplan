// src/features/playersDatabase/catalog/firestoreDocuments/teamSeason.catalog.js

export const TEAM_SEASON_DOCUMENT = {
  collection: 'dbBirthTeamSeasons',
  documentId: 'teamSeasonDocumentId',

  purpose: 'Canonical state for one Team Root in one season, partitioned by ownership.',

  identity: {
    teamSeasonDocumentId: '',
    teamId: '',

    seasonId: '',   // Technical id, e.g. 2025_2026.
    seasonKey: '',  // Display/business value, e.g. 25/26.
    seasonStatus: '',

    clubId: '',
    birthYear: null,
    teamSlot: null,

    externalTeamId: '',
    leagueId: '',
    ageGroupId: '',

    teamUrl: '',
  },

  roster: {
    // Keyed by stable playerId/player key.
    playersById: {
      '<playerId>': {
        playerDocumentId: '',
        externalPlayerId: '',
        identityKey: '',
        fullName: '',
        normalizedName: '',
        aliases: [],

        rosterStatus: '',
        isYoungerAgeGroup: false,
        isOlderAgeGroup: false,
        numShirt: null,

        updatedAt: null,
      },
    },

    // Player is unresolved in roster reconciliation and is not yet a resolved movement.
    pendingById: {
      '<playerId>': {
        playerId: '',
        externalPlayerId: '',
        identityKey: '',
        fullName: '',

        previousSeasonId: '',
        previousTeamId: '',
        previousTeamSeasonDocumentId: '',

        identitySnapshot: {},

        updatedAt: null,
      },
    },

    rosterImport: {},
    updatedAt: null,
  },

  stats: {
    playersById: {
      '<playerId>': {
        statsStatus: '',

        playerStats: {
          games: null,
          goals: null,
          yellowCards: null,
          minutes: null,
          starts: null,
          substituteIn: null,
          substitutedOut: null,
          teamMinutes: null,
          teamGames: null,
          teamRank: null,
          teamGoalsFor: null,
          teamGoalsAgainst: null,
        },

        // Derived from stats. UI can be adapted to consume line only.
        lineClassification: {
          line: '',
        },

        updatedAt: null,
      },
    },

    teamStats: {
      points: null,
      goalsFor: null,
      goalsAgainst: null,
      teamGamePlayed: null,
    },

    // Keep current rich team-balance contract; task signals/availability are stored once
    // at Team Season top level and should not be duplicated inside teamBalance.
    teamBalance: {},

    statsLoadState: '',
    updatedAt: null,
  },

  movement: {
    // Keyed by movementId to allow deterministic upsert/delete and safe retry.
    transfersInById: {
      '<movementId>': {},
    },

    transfersOutById: {
      '<movementId>': {},
    },

    updatedAt: null,
  },

  scouting: {
    // Snapshot for Team Page. Player remains canonical source for professional/manual scouting data.
    playersById: {
      '<playerId>': {
        primaryPosition: '',
        positionLayer: '',

        primaryScoutProfileId: '',
        primaryScoutProfileStrengthDepthPct: null,
        professionalScoutProfileIds: [],
        preliminaryScoutProfileIds: [],
        scoutEffectiveImmediacyStatus: '',
        scoutPlayerInterestLevel: '',

        updatedAt: null,
      },
    },

    scoutProfilesSummary: {},
    updatedAt: null,
  },

  manual: {
    playersById: {
      '<playerId>': {
        playerUrl: '',
        updatedAt: null,
      },
    },

    updatedAt: null,
  },

  // Automatically derived system signals. These are not the user's personal task records.
  teamTaskSignals: {
    offense: false,
    defense: false,
    updatedAt: null,
  },

  teamTaskAvailability: {
    availability: '',
    reason: '',
  },

  timestamps: {
    createdAt: null,
    updatedAt: null,
  },

  derivedFieldsNotPersisted: [
    'minutesPerGame',
    'goalsPer90',
  ],

  ownership: {
    roster: 'Roster flow',
    stats: 'Stats flow',
    movement: 'Roster/Movement flow',
    scouting: 'Scouting projection for Team Page',
    manual: 'Manual edit flow',
    teamTaskSignals: 'Automatically derived team logic',
    teamTaskAvailability: 'Automatically derived team logic',
  },

  writeModel: [
    'Projection targets are written by known ids without reading the projection first.',
    'Read-before-write is not a default requirement.',
    'Prepare reads canonical sources only when the current action needs an actual business decision.',
    'Roster history/previous season is read only when the action needs reconciliation, pending or movement decisions.',
    'After Approval, writes are deterministic field-path writes followed by fresh Audit.',
    'Movement uses movementId keyed maps to make retry idempotent.',
  ],

  invariants: [
    'primaryPosition and positionLayer are canonical on Player; Team Season stores Team Page snapshots.',
    'lineClassification is derived from Stats and persists line only.',
    'pendingById is unresolved roster state and is not a resolved movement.',
    'teamTaskSignals and teamTaskAvailability are stored once at Team Season level.',
    'Personal Tasks are owned by the separate internal Tasks system and are not embedded here.',
    'notes are multi-season and belong to Team Root, not Team Season.',
    'seasonId is technical and must not be built ad hoc from seasonKey.',
  ],
};

export default TEAM_SEASON_DOCUMENT;
