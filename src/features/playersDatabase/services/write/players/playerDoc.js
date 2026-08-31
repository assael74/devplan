// src/features/playersDatabase/services/write/players/playerDoc.js

// Compatibility barrel. Keep existing imports stable while player write
// responsibilities live in focused files inside this folder.

export {
  buildPlayerDocumentId,
  hasPlayerScoutProfiles,
  normalizePlayerScoutCombinationIds,
  normalizePlayerScoutCombinations,
  normalizePlayerScoutProfiles,
  normalizePlayerScoutStory,
  playerDocRef,
} from './playerDoc.model.js'

export {
  upsertOfficialPlayerDoc,
  upsertProfiledPlayerDoc,
} from './playerDoc.upsert.js'

export {
  buildPlayerSeasonScoutProfileRemoval,
  patchPlayerSeason,
  updatePlayerSeasonNotes,
  updatePlayerSeasonUrl,
} from './playerSeason.patch.js'

export {
  clearExistingPlayerSeasonProfiles,
  clearExistingPlayerSeasonProfilesMany,
  resolveExistingPlayerDocumentIds,
  syncPlayerRoleAndScoutProfileDoc,
  syncPlayerScoutProfileDocsMany,
  upsertProfiledPlayerDocsMany,
} from './playerScoutProfiles.js'

export {
  updateScoutingPlayerReview,
} from './scoutingPlayerReview.write.js'
