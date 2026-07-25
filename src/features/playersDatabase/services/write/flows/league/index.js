// features/playersDatabase/services/write/flows/league/index.js

/**
 * League write flows
 *
 * createLeagueSeason.flow.js
 * - Creates or updates a league season and synchronizes the master document.
 *
 * pasteLeagueTable.flow.js
 * - Writes league table data, creates team-season indexes and synchronizes
 *   the master document.
 *
 * updateLeagueSeasonMeta.flow.js
 * - Orchestrates a season-scoped league metadata update.
 *
 * updateLeagueSeasonUrl.flow.js
 * - Updates the URL of one league season only.
 *
 * clearLeagueSeasonTeams.flow.js
 * - Removes all team-season data belonging to one league season.
 *
 * deleteLeagueSeason.flow.js
 * - Removes one league season and its dependent season-scoped records.
 *
 * leagueTableRank.js
 * - Compatibility export only; it is not an orchestration flow.
 */

export {
  createLeagueSeasonFlow,
} from './createLeagueSeason.flow.js'

export {
  deleteLeagueSeasonFlow,
} from './deleteLeagueSeason.flow.js'

export {
  pasteLeagueTableFlow,
} from './pasteLeagueTable.flow.js'

export {
  updateLeagueSeasonMetaFlow,
} from './updateLeagueSeasonMeta.flow.js'

export {
  updateLeagueSeasonUrlFlow,
} from './updateLeagueSeasonUrl.flow.js'

export {
  clearLeagueSeasonTeamsFlow,
} from './clearLeagueSeasonTeams.flow.js'
