// src/features/playersDatabase/catalog/firestoreDocuments/playerRoot.catalog.js

export const PLAYER_ROOT_DOCUMENT = {
  collection: 'dbPlayers',
  documentId: 'playerId',

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

  primaryPosition: '',
  positionLayer: '',
  notes: '',
  agent: {},
  tracking: {},
  verification: {},

  manualImmediacyDecision: {
    actionStatus: '',
    reason: '',
    note: '',
    decidedAt: null,
    profileIds: [],
  },

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

  invariants: [
    'Player Root is the canonical source for player identity and long-lived manual/professional state.',
    'primaryPosition and positionLayer are current player-level facts and are not stored historically per season.',
    'manualImmediacyDecision is current player-level manual override and is not duplicated into Player Season.',
    'status is not persisted because no active business meaning was found.',
    'avatarUrl is not persisted until an active product requirement exists.',
    'events are not persisted until an active business use is defined.',
    'current/history are removed; season navigation uses seasonRefsById.',
    'seasonRefsById keys are technical seasonId values and are safe Firestore map keys.',
  ],
};

export default PLAYER_ROOT_DOCUMENT;
