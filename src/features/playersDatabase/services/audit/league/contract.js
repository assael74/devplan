// src/features/playersDatabase/services/audit/league/contract.js

export const LEAGUE_AUDIT_RESULT = Object.freeze({
  CLEAN: 'clean',
  FINDINGS: 'findings',
  PARTIAL: 'partial',
})

export const LEAGUE_AUDIT_TARGET = Object.freeze({
  LEAGUES_CENTER: 'leaguesCenter',
  CLUBS_CENTER: 'clubsCenter',
  TEAM_SEASON_COMPETITION_SNAPSHOTS: 'teamSeasonCompetitionSnapshots',
})

export const LEAGUE_AUDIT_ALL_TARGETS = Object.freeze(
  Object.values(LEAGUE_AUDIT_TARGET)
)
