// src/features/playersDatabase/domain/identity/index.js

export {
  normalizeSeasonIdentity,
  requireSeasonId,
} from './seasonIdentity.js'

export {
  buildTeamId,
  buildTeamSeasonDocumentId,
} from './teamIdentity.js'

export {
  buildPlayerId,
  buildPlayerSeasonDocumentId,
} from './playerIdentity.js'

export {
  buildPlayerSearchIndexDocumentId,
} from './searchProjectionIdentity.js'
