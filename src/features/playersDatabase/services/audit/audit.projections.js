// Audit consumes canonical, pure projections through this boundary.  The
// write-layer modules own persistence; they must not be imported by the audit
// orchestrator itself.
export { buildLeagueTeamPerformanceProjection } from '../../domain/projections/teamPerformance.projection.js'
export { buildTeamBalanceSearchIndexProjection } from '../../domain/projections/teamBalanceSearchIndex.projection.js'
export { buildTeamSeasonSearchMetrics } from '../../domain/projections/searchIndexNormalization.projection.js'
export { buildTeamPlayerSeasonalScoutProjection } from '../../domain/projections/playerScout.projection.js'
export { resolvePlayerTrackingReasons } from '../write/players/scoutingPlayerLifecycle.model.js'
export {
  buildLeaguesMasterLeagueEntry,
  buildLeaguesMasterSummary,
} from '../../domain/projections/leaguesMaster.projection.js'
