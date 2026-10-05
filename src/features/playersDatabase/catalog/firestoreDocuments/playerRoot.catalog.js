// src/features/playersDatabase/catalog/firestoreDocuments/playerRoot.catalog.js
// Canonical document contract.

export const PLAYER_ROOT_DOCUMENT = {
  collection: 'dbPlayers',
  documentId: 'player__{birthYear}__{externalPlayerId}',

  purpose: 'Canonical multi-season player identity and long-lived manual/professional state.',

  identity: {
    playerId: '',
    externalPlayerId: '',

    fullName: '',
    normalizedName: '',
    aliases: [],

    birthYear: null,
    birthDate: null,
  },

  // Current player-level professional facts.
  // Historical position is intentionally not persisted.
  primaryPosition: '',
  positionLayer: '',

  // Multi-season manual player information.
  notes: '',

  agent: {},
  tracking: {},
  verification: {},

  // Current manual player-level immediacy decision.
  // Historical decisions are intentionally not persisted in Player Root.
  manualImmediacyDecision: {
    actionStatus: '',
    reason: '',
    note: '',
    decidedAt: null,
    profileIds: [],
  },

  // Navigation only. Seasonal facts remain in Team Season / Player Season.
  seasonRefsById: {
    '<seasonId>': {
      seasonKey: '',
      playerSeasonDocumentId: '',
      seasonStatus: '',
    },
  },

  timestamps: {
    createdAt: null,
    updatedAt: null,
  },

  writeModel: [
    'Player Root is written only for identified players with externalPlayerId.',
    'playerId is deterministic and is also the Firestore document id.',
    'Long-lived manual/professional player state is written here.',
    'Seasonal roster, stats, scouting evidence, movement and seasonal manual fields are not written here.',
    'seasonRefsById is navigation metadata only and must not become a second seasonal source of truth.',
  ],

  invariants: [
    'externalPlayerId is required in the current product contract; players without an external id are not created.',
    'playerId equals player__{birthYear}__{externalPlayerId}.',
    'playerDocumentId is intentionally not a separate identifier in the new schema.',
    'primaryPosition and positionLayer are current player-level facts and are not stored historically per season.',
    'notes are multi-season and belong to Player Root.',
    'agent, tracking and verification are long-lived Player Root state.',
    'manualImmediacyDecision is current player-level manual state and is not duplicated into Player Season.',
    'manualImmediacyHistory is intentionally not persisted.',
    'playerReview is intentionally not persisted as one monolithic object.',
    'Legacy playerReview fields must migrate only to an explicitly owned target; unsupported review fields must be reported during migration rather than copied blindly.',
    'status is not persisted because no active business meaning was established.',
    'avatarUrl is not persisted until an active product requirement exists.',
    'events are not persisted until an active business use is defined.',
    'current/history are removed; season navigation uses seasonRefsById.',
    'seasonRefsById keys are technical seasonId values in YYYY_YYYY form.',
    'playerSeasonDocumentId equals playerSeason__{playerId}__{seasonId}.',
  ],
};

export default PLAYER_ROOT_DOCUMENT;
