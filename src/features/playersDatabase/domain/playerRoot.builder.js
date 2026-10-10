// src/features/playersDatabase/domain/playerRoot.builder.js

const clean = value => String(value === null || value === undefined ? '' : value).trim()

export const buildPlayerRootDocument = ({
  playerId,
  rosterPlayer,
  seasonRefsById,
  primaryPosition = '',
  positionLayer = '',
  notes = '',
  updatedAt,
}) => ({
  identity: {
    playerId,
    externalPlayerId: clean(rosterPlayer.externalPlayerId),
    fullName: clean(rosterPlayer.fullName),
    normalizedName: clean(rosterPlayer.normalizedName),
    aliases: Array.isArray(rosterPlayer.aliases) ? rosterPlayer.aliases : [],
    birthYear: Number(String(playerId).split('__')[1]),
    birthDate: null,
  },
  primaryPosition,
  positionLayer,
  notes,
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
  seasonRefsById,
  timestamps: {
    createdAt: updatedAt || null,
    updatedAt: updatedAt || null,
  },
})
