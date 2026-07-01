// teamProfile/sharedModules/players/teamPlayersModule.constants.js

export const TEAM_PLAYERS_VIEW_MODES = {
  OVERVIEW: 'overview',
  PERFORMANCE: 'performance',
}

export const performanceScopeInitial = {
  mode: 'season',
  limit: null,
  fromGameKey: null,
  toGameKey: null,
}

export const emptyTeamPlayersFilters = {
  search: '',
  onlyActive: false,
  onlyWithTargets: false,
  squadRole: '',
  seasonPlanStatus: '',
  projectStatus: '',
  positionCode: '',
  generalPositionKey: '',
  performanceProfile: '',
}

export const getInsightsStatus = ({ rows, enabled, model }) => {
  if (!rows.length) return 'empty'
  if (!enabled || model?.isBuilding !== false) return 'loading'

  return 'ready'
}
