// features/playersDatabase/components/profilesPage/logic/index.js

export {
  DEFAULT_PROFILE_SEASON_ID,
  PROFILE_FILTER_OPTIONS,
  PROFILE_SCOPE_LABELS,
  PROFILE_SCOPE_OPTIONS,
  PROFILE_STATUS_COLORS,
  PROFILE_STATUS_LABELS,
  PROFILE_STATUS_OPTIONS,
  SCOUT_LEVEL_LABELS,
  SCOUT_METRIC_LABELS,
  SCOUT_OPERATOR_LABELS,
  SCOUT_TEAM_FILTER_LABELS,
  SEARCH_MODE_OPTIONS,
} from './constants.js'

export {
  buildLeagueOptions,
  buildRegionOptions,
  buildYearOptions,
  filterProfilesBySearch,
  getProfileChipCounts,
  profileMatchesRegion,
} from './filters.logic.js'

export {
  buildProfiles,
  getLeagueExpectedTeamsCount,
  getLeagueLoadedPlayersCount,
  getLeagueLoadedTeamsCount,
  getLeagueProfileCounts,
  getLeagueScoutProfilesCount,
  getProfileBreakdownRows,
  getProfileLeagues,
  getProfileStatus,
  getProfileStatusColor,
  getProfileStatusLabel,
  getProfileTeams,
} from './profiles.logic.js'

export {
  PROFILE_LIST_SORT_OPTIONS,
  sortProfilesByState,
} from './sort.logic.js'

export {
  buildSeasonOptions,
  getLeagueBirthYear,
  getLeagueSeasonIds,
  getLeagueSnapshotDate,
  getLeagueSnapshotId,
  getPrimarySeason,
  getSeasonForId,
  leagueMatchesSeason,
} from './season.logic.js'

export {
  clean,
  listText,
  mergeCountMaps,
  unique,
  valueOrDash,
} from './utils.js'
