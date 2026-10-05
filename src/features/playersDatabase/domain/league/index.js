// src/features/playersDatabase/domain/league/index.js

export {
  normalizeLeagueIdentity,
  requireLeagueId,
} from './leagueIdentity.js'

export { resolveLeagueLoadContext } from './leagueLoadContext.resolver.js'
export { buildLeagueLoadDocument } from './leagueLoad.builder.js'
export { buildLeaguePerformanceProjection } from './leaguePerformance.builder.js'
export {
  buildCenterTeamStateProjection,
  buildClubsCenterTeamProjection,
} from './clubsCenterTeam.builder.js'
export {
  buildLeagueTeamsClearApprovedState,
  buildLeagueSeasonDeleteApprovedState,
} from './leagueClear.builder.js'

export {
  buildLeagueOpenWritePlan,
  buildLeagueLoadProjectionRepairPlan,
  buildLeagueLoadWritePlan,
  buildLeagueTeamsClearWritePlan,
  buildLeagueSeasonDeleteWritePlan,
} from './leagueWritePlan.builder.js'
