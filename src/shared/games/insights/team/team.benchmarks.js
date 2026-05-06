// shared/games/insights/team/team.benchmarks.js

export {
  TEAM_GAMES_TARGET_GROUPS,
  TEAM_GAMES_TARGET_PROFILES,
} from './targets/teamTargetProfiles.js'

export {
  TEAM_GAMES_BENCHMARK_GROUPS,
  TEAM_GAMES_BENCHMARKS_CATALOG,
  getTeamGamesBenchmarkById,
  getTeamGamesBenchmarksByGroup,
  getTeamGamesBenchmarksByComparedMetric,
} from './targets/teamBenchmarks.catalog.js'

export {
  getTeamGamesTargetProfiles,
  getTeamGamesTargetProfileById,
  getTeamGamesTargetGroup,
  getTeamGamesBenchmarkLevelById,
  getTeamGamesHomeAwayTargetsByLevelId,
  getTeamGamesDifficultyTargetsByLevelId,
  getTeamGamesScorersTargetsByLevelId,
  getTeamGamesSquadUsageTargetsByLevelId,
  getTeamGamesTableLevels,
  resolveTeamGamesTargetProfileByProjectedPoints as resolveTeamGamesTableLevelByProjectedPoints,
} from './targets/teamTargets.selectors.js'

export {
  TEAM_TARGET_POSITION_INPUT_TYPES,
  resolveTeamTargetPosition,
  resolveTeamTargetPositionFromTeam,
} from './targets/teamTargetPosition.resolve.js'

export {
  resolveTeamTargetProfileFromTeam,
  resolveTeamForecastProfileFromActive,
} from './targets/teamTargetProfile.resolve.js'

export {
  resolveTeamTargetGap,
} from './targets/teamTargetGap.resolve.js'

// legacy alias
export { TEAM_GAMES_TARGET_PROFILES as TEAM_GAMES_TABLE_LEVELS } from './targets/teamTargetProfiles.js'
