// features/playersDatabase/services/write/searchIndex/index.js

/**
 * Search-index write services
 *
 * player/
 * - Player-season index creation, statistics, focused patches and bulk updates.
 * - Player index identity is based on playerId, seasonId, birthTeamId and birthTeamSlot.
 *
 * team/
 * - Team-season index creation and focused or bulk updates.
 *
 * read/
 * - Reads metadata required by write flows; it is not a page-read service.
 *
 * delete/
 * - Removes player-season and team-season index documents at season scope.
 *
 * shared/
 * - Shared batch and structured write-result helpers.
 */

export * from './player/index.js'
export * from './team/index.js'
export * from './read/searchIndexMeta.read.js'
export * from './delete/searchIndex.delete.js'
export * from './shared/searchIndexResult.model.js'
