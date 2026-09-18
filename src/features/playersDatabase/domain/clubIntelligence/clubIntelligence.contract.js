export const CLUB_LEAGUE_LEVEL_GAP_THRESHOLD = 1

export const CLUB_INTELLIGENCE_SEASON_VIEW = Object.freeze({
  CURRENT: 'current',
  PREVIOUS: 'previous',
})

export const CLUB_INTELLIGENCE_AVAILABILITY = Object.freeze({
  AVAILABLE: 'available',
  UNAVAILABLE: 'unavailable',
  UNKNOWN: 'unknown',
})

export const CLUB_SIGNAL_COVERAGE_STATUS = Object.freeze({
  FULL: 'full',
  PARTIAL: 'partial',
  NONE: 'none',
})

export const CLUB_SIGNAL_COVERAGE_FAMILY = Object.freeze({
  FUTURE_LEAGUE_PATH: 'futureLeaguePath',
  LEAGUE_VS_CLUB_LEVEL: 'leagueVsClubLevel',
  SQUAD_TASK: 'squadTask',
})

export const CLUB_SIGNAL_COVERAGE_REASON = Object.freeze({
  FOCUS_PRIMARY_TEAM_MISSING: 'focus_primary_team_missing',
  FOCUS_PRIMARY_TEAM_AMBIGUOUS: 'focus_primary_team_ambiguous',
  CLUB_LEVEL_MISSING: 'club_level_missing',
  LEAGUE_LEVEL_MISSING: 'league_level_missing',
  SOURCE_FOCUS_TEAM_MISSING: 'source_focus_team_missing',
  FUTURE_PATH_UNAVAILABLE: 'future_path_unavailable',
  FUTURE_PATH_SOURCE_MISMATCH: 'future_path_source_mismatch',
  TEAM_TASK_AVAILABILITY_UNKNOWN: 'team_task_availability_unknown',
})

export const isClubIntelligenceAvailability = value => (
  Object.values(CLUB_INTELLIGENCE_AVAILABILITY).includes(value)
)

export const CLUB_SPOTLIGHT_TYPE = Object.freeze({
  FUTURE_LEAGUE_PATH_RISE: 'FUTURE_LEAGUE_PATH_RISE',
  FUTURE_LEAGUE_PATH_DROP: 'FUTURE_LEAGUE_PATH_DROP',
  LEAGUE_ABOVE_CLUB_LEVEL: 'LEAGUE_ABOVE_CLUB_LEVEL',
  LEAGUE_BELOW_CLUB_LEVEL: 'LEAGUE_BELOW_CLUB_LEVEL',
  OFFENSE_SQUAD_TASK: 'OFFENSE_SQUAD_TASK',
  DEFENSE_SQUAD_TASK: 'DEFENSE_SQUAD_TASK',
})

export const CLUB_SPOTLIGHT_ORDER = Object.freeze([
  CLUB_SPOTLIGHT_TYPE.FUTURE_LEAGUE_PATH_RISE,
  CLUB_SPOTLIGHT_TYPE.FUTURE_LEAGUE_PATH_DROP,
  CLUB_SPOTLIGHT_TYPE.LEAGUE_ABOVE_CLUB_LEVEL,
  CLUB_SPOTLIGHT_TYPE.LEAGUE_BELOW_CLUB_LEVEL,
  CLUB_SPOTLIGHT_TYPE.OFFENSE_SQUAD_TASK,
  CLUB_SPOTLIGHT_TYPE.DEFENSE_SQUAD_TASK,
])

export const CLUB_INTELLIGENCE_EMPTY_AVAILABILITY = Object.freeze({
  availability: CLUB_INTELLIGENCE_AVAILABILITY.UNKNOWN,
  reason: null,
})
