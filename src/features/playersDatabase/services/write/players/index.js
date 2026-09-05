// src/features/playersDatabase/services/write/players/index.js

/**
 * Player write services
 *
 * playerDoc.model.js
 * - Builds the stable player document identity and root document shape.
 * - Normalizes scout-profile data shared by player write operations.
 *
 * playerSeason.model.js
 * - Builds and identifies player-season rows.
 * - Manages current/history row matching, replacement and hydration from a team document.
 *
 * playerDoc.upsert.js
 * - Creates or updates a player document when the canonical lifecycle requires it.
 * - Ensures the requested season exists in only one current/history partition.
 *
 * playerSeason.patch.js
 * - Applies focused season updates such as URL, notes, role, shirt number and profile removal.
 * - Never creates a missing player document or missing season row.
 *
 * playerScoutProfiles.js
 * - Creates, updates and clears season scout profiles.
 * - Synchronizes profile-driven player documents during statistics and role flows.
 *
 * playerSeasonDelete.js
 * - Removes one team-season context from player documents.
 * - Deletes the whole player document when current and history are both empty afterward.
 *
 */

export {
  buildPlayerDocumentId,
  hasPlayerScoutProfiles,
  normalizePlayerScoutCombinationIds,
  normalizePlayerScoutCombinations,
  normalizePlayerScoutProfiles,
  normalizePlayerScoutStory,
} from './playerDoc.model.js'

export {
  updatePlayerSeasonNotes,
  updatePlayerSeasonUrl,
} from './playerSeason.patch.js'

export {
  clearExistingPlayerSeasonProfilesMany,
  resolveExistingPlayerDocumentIds,
  syncPlayerScoutProfileDocsMany,
  syncPlayerRoleAndScoutProfileDoc,
  upsertProfiledPlayerDocsMany,
} from './playerScoutProfiles.js'

export {
  removePlayerSeasonDocsMany,
} from './playerSeasonDelete.js'

export {
  resolveTeamPlayerIdentities,
  resolveTeamPlayerIdentityPreview,
} from './playerIdentity.resolve.js'


export {
  ensureFavoriteScoutingPlayerDoc,
  ensureManualScoutingPlayerDoc,
  ensureScoutingPlayerDoc,
  ensureTransferredScoutingPlayerDoc,
  ensureWatchlistScoutingPlayerDoc,
  updateScoutingPlayerFavoriteState,
  updateScoutingPlayerVerificationAnswer,
  resolvePlayerTrackingReasons,
  shouldHavePlayerDocument,
  SCOUTING_PLAYER_EVENT_TYPES,
  SCOUTING_PLAYER_TRACKING_REASONS,
} from './scoutingPlayerDoc.js'

export {
  deleteApprovedNarrative,
  saveApprovedNarrative,
} from './playerNarrative.js'


export {
  updateScoutingPlayerReview,
} from './scoutingPlayerReview.write.js'
