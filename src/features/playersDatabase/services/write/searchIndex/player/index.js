// features/playersDatabase/services/write/searchIndex/player/index.js

/**
 * Player-season search-index write services
 *
 * playerSeasonIndex.identity.js
 * - Defines the four-part player-season index identity.
 * - Builds document IDs, scopes, lookups and duplicate matches.
 *
 * playerSeasonIndex.scout.js
 * - Normalizes scout profiles from scoutSignals or scoutProfiles.
 * - Builds profile, combination and search identifier arrays.
 *
 * playerSeasonIndex.model.js
 * - Builds the complete player-season index document.
 * - Re-exports identity and scout model helpers for compatibility.
 *
 * playerSeasonIndex.upsert.js
 * - Creates or replaces player-season index documents for roster imports.
 *
 * playerSeasonIndex.stats.model.js
 * - Builds pure statistics-import mutations for one player index.
 * - Contains no Firestore reads, writes or batches.
 *
 * playerSeasonIndex.stats.js
 * - Locates target indexes and executes statistics-import batches.
 * - Reports created, updated, deleted, failed and duplicate rows.
 *
 * playerSeasonIndex.patch.js
 * - Applies focused updates such as URL, notes, role and profile removal.
 *
 * playerSeasonIndex.bulk.js
 * - Applies cross-document updates such as team URL and season meta.
 *
 * playerSeasonIndex.query.js
 * - Locates player-season index documents by explicit scope and identity.
 *
 * playerSeasonIndex.write.js
 * - Exposes the low-level document write helper.
 */

export {
  upsertPlayerSeasonSearchIndexMany,
} from './playerSeasonIndex.upsert.js'

export {
  updatePlayerSeasonSearchIndexStatsMany,
} from './playerSeasonIndex.stats.js'

export {
  clearPlayerSeasonSearchIndexScoutProfile,
  updatePlayerSeasonSearchIndexScoutProfiles,
  updatePlayerSeasonSearchIndexFields,
  updatePlayerSeasonSearchIndexNotes,
  updatePlayerSeasonSearchIndexPlayerUrl,
  updatePlayerSeasonSearchIndexRole,
} from './playerSeasonIndex.patch.js'

export {
  updatePlayerSeasonSearchIndexesSeasonMeta,
  updatePlayerSeasonSearchIndexTeamUrl,
} from './playerSeasonIndex.bulk.js'
