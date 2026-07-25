// features/playersDatabase/services/write/leagues/leaguesMaster.js

/**
 * Compatibility entry for the leagues master service.
 *
 * leaguesMaster.model.js
 * - Builds league and season projection rows for the master document.
 * - Calculates the master summary and normalizes master collections.
 *
 * leaguesMaster.sync.js
 * - Reads source league documents and writes the master document transaction.
 */

export {
  syncLeaguesMasterDocument,
} from './leaguesMaster.sync.js'
