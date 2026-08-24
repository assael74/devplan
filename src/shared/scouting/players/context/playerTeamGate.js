// src/shared/scouting/players/context/playerTeamGate.js

import {
  passesPlayerScoutTeamFilter,
} from '../team.js'

export const PLAYER_TEAM_GATE_MODE = {
  OPEN_CONTEXT: 'open_context',
  LEGACY_FILTER: 'legacy_filter',
}

export const PLAYER_TEAM_GATE_REASON = {
  LEAGUE_LEVEL: 'league_level_1_2',
  CLUB_STRENGTH: 'club_strength_1_1_5',
  PROFILE_LEAGUE_LEVEL: 'profile_league_level_open_context',
  PROFILE_CLUB_STRENGTH: 'profile_club_strength_open_context',
  LEGACY_FILTER: 'legacy_filter',
}

const toLevel = (value) => {
  const level = Number(value)

  return Number.isFinite(level) && level > 0 ? level : null
}

const resolveOpenContextReason = ({ profile, clubStrengthLevel, leagueLevel } = {}) => {
  const normalizedClubStrengthLevel = toLevel(clubStrengthLevel)
  const normalizedLeagueLevel = toLevel(leagueLevel)
  const profileLeagueLevelMax = toLevel(profile?.openContext?.leagueLevelMax)
  const profileClubStrengthLevelMax = toLevel(profile?.openContext?.clubStrengthLevelMax)

  if (
    profileLeagueLevelMax &&
    normalizedLeagueLevel &&
    normalizedLeagueLevel <= profileLeagueLevelMax
  ) {
    return PLAYER_TEAM_GATE_REASON.PROFILE_LEAGUE_LEVEL
  }

  if (
    profileClubStrengthLevelMax &&
    normalizedClubStrengthLevel &&
    normalizedClubStrengthLevel <= profileClubStrengthLevelMax
  ) {
    return PLAYER_TEAM_GATE_REASON.PROFILE_CLUB_STRENGTH
  }

  if (normalizedLeagueLevel && normalizedLeagueLevel <= 2) {
    return PLAYER_TEAM_GATE_REASON.LEAGUE_LEVEL
  }

  if (normalizedClubStrengthLevel && normalizedClubStrengthLevel <= 1.5) {
    return PLAYER_TEAM_GATE_REASON.CLUB_STRENGTH
  }

  return ''
}

export const evaluatePlayerScoutTeamGate = ({ profile, team, metrics, competitionContext } = {}) => {
  const clubStrengthLevel = competitionContext?.clubStrengthLevel
  const leagueLevel = competitionContext?.leagueLevel
  const openReason = resolveOpenContextReason({
    profile,
    clubStrengthLevel,
    leagueLevel,
  })

  if (openReason) {
    return {
      passed: true,
      mode: PLAYER_TEAM_GATE_MODE.OPEN_CONTEXT,
      reason: openReason,
      legacyFilterPassed: null,
      clubStrengthLevel: toLevel(clubStrengthLevel),
      leagueLevel: toLevel(leagueLevel),
    }
  }

  const legacyFilterPassed = passesPlayerScoutTeamFilter({
    profile,
    team,
    metrics,
  })

  return {
    passed: legacyFilterPassed,
    mode: PLAYER_TEAM_GATE_MODE.LEGACY_FILTER,
    reason: PLAYER_TEAM_GATE_REASON.LEGACY_FILTER,
    legacyFilterPassed,
    clubStrengthLevel: toLevel(clubStrengthLevel),
    leagueLevel: toLevel(leagueLevel),
  }
}
