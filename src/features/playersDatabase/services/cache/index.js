// features/playersDatabase/services/cache/index.js

/**
 * In-memory document cache for Players Database.
 *
 * cacheKeys.js
 * - Builds stable cache keys for league, team, player and master documents.
 *
 * documentCache.js
 * - Stores document values in memory.
 * - Deduplicates concurrent reads.
 * - Prevents stale pending reads from repopulating the cache after a write.
 *
 * cacheInvalidation.js
 * - Invalidates the affected document keys after successful write actions.
 */

export * from './cacheKeys.js'
export * from './documentCache.js'
export * from './cacheInvalidation.js'
