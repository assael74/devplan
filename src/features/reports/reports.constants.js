// src/features/reports/reports.constants.js

export const REPORT_TYPES = {
  SEASON_PLAN: 'seasonPlan',
  MINUTES_PLAN: 'minutesPlan',
  PERFORMANCE: 'performance',
  TEAM_TARGETS: 'teamTargets',
  PLAYER_TARGETS: 'playerTargets',
  EXTERNAL_LEAGUE_TABLE: 'externalLeagueTable',
  EXTERNAL_TEAM_DETAILS: 'externalTeamDetails',
  EXTERNAL_PLAYER_DETAILS: 'externalPlayerDetails',
  EXTERNAL_PLAYER_SEARCH_RESULTS: 'externalPlayerSearchResults',
}

export const REPORT_ENTITY_TYPES = {
  TEAM: 'team',
  PLAYER: 'player',
  LEAGUE_SEASON: 'leagueSeason',
  BIRTH_TEAM_SEASON: 'birthTeamSeason',
  EXTERNAL_PLAYER: 'externalPlayer',
  PLAYER_SEARCH: 'playerSearch',
}

export const PUBLIC_REPORT_STATUS = {
  PUBLISHED: 'published',
  REVOKED: 'revoked',
  ARCHIVED: 'archived',
}

export const PUBLIC_REPORT_SCHEMA_VERSION = 1
