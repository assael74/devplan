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
  LEGACY_FILTER: 'legacy_filter',
}

const toLevel = (value) => {
  const level = Number(value)

  return Number.isFinite(level) && level > 0 ? level : null
}

const resolveOpenContextReason = ({ clubStrengthLevel, leagueLevel } = {}) => {
  const normalizedClubStrengthLevel = toLevel(clubStrengthLevel)
  const normalizedLeagueLevel = toLevel(leagueLevel)

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
  const openReason = resolveOpenContextReason({ clubStrengthLevel, leagueLevel })

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
