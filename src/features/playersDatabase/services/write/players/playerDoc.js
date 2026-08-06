// features/playersDatabase/services/write/players/playerDoc.js

// Compatibility barrel. Keep existing imports stable while player write
// responsibilities live in focused files inside this folder.

export {
  buildPlayerDocumentId,
  hasPlayerScoutProfiles,
  normalizePlayerScoutCombinations,
  normalizePlayerScoutProfiles,
} from './playerDoc.model.js'

export {
  upsertOfficialPlayerDoc,
  upsertProfiledPlayerDoc,
} from './playerDoc.upsert.js'

export {
  patchPlayerSeason,
  removePlayerSeasonScoutProfile,
  updatePlayerSeasonNotes,
  updatePlayerSeasonRole,
  updatePlayerSeasonUrl,
} from './playerSeason.patch.js'

export {
  clearExistingPlayerSeasonProfiles,
  syncPlayerRoleAndScoutProfileDoc,
  syncPlayerScoutProfileDocsMany,
  upsertProfiledPlayerDocsMany,
} from './playerScoutProfiles.js'

