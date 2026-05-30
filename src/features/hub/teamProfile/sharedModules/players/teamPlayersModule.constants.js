// teamProfile/sharedModules/players/teamPlayersModule.constants.js

export const performanceScopeInitial = {
  mode: 'season',
  limit: null,
  fromGameKey: null,
  toGameKey: null,
}

export const emptyTeamPlayersFilters = {
  search: '',
  onlyActive: false,
  squadRole: '',
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
