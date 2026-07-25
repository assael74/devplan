// features/playersDatabase/services/write/searchIndex/team/teamSeason.js

/**
 * Compatibility export for older imports.
 *
 * Team-season search-index implementation is split between:
 * - teamSeasonIndex.model.js
 * - teamSeasonIndex.upsert.js
 * - teamSeasonIndex.patch.js
 * - teamSeasonIndex.bulk.js
 *
 * New code should import from ./index.js.
 */
export * from './teamSeasonIndex.write.js'
