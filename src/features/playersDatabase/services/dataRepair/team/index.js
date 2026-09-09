export {
  TEAM_DATA_ISSUE_CODE,
  canRepairTeamDataIssue,
  getTeamDataRepairLabel,
  repairTeamDataIssue,
} from './teamDataRepair.catalog.js'

export {
  repairTeamSearchIndexLifecycleMany,
} from './teamDataRepair.write.js'

// UI diagnostics use this service boundary rather than importing write-layer
// projection builders directly.
export { buildTeamSeasonSearchMetrics } from '../../../domain/projections/searchIndexNormalization.projection.js'
export { buildTeamPlayerSeasonalScoutProjection } from '../../../domain/projections/playerScout.projection.js'
