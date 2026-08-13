// src/shared/scouting/teams/context/teamCompetitionContext.js

import {
  TEAM_SCOUT_COMPETITION_RELATION,
  TEAM_SCOUT_CONTEXT_CONFIDENCE,
} from './teamContext.model.js'

const toLevel = value => {
  const level = Number(value)
  if (!Number.isFinite(level) || level < 1) return null

  return level
}

export const buildTeamCompetitionContext = ({ clubLevel, clubStrengthLevel, leagueLevel } = {}) => {
  const club = toLevel(clubLevel)
  const clubStrength = toLevel(clubStrengthLevel) || club
  const league = toLevel(leagueLevel)

  if (!clubStrength || !league) {
    return {
      relation: TEAM_SCOUT_COMPETITION_RELATION.UNKNOWN,
      gap: null,
      clubLevel: club,
      clubStrengthLevel: clubStrength,
      leagueLevel: league,
      confidence: TEAM_SCOUT_CONTEXT_CONFIDENCE.LOW,
      evidence: [],
    }
  }

  const gap = clubStrength - league
  let relation = TEAM_SCOUT_COMPETITION_RELATION.AT_CLUB_LEVEL

  if (gap > 0) {
    relation = TEAM_SCOUT_COMPETITION_RELATION.ABOVE_CLUB_LEVEL
  }

  if (gap < 0) {
    relation = TEAM_SCOUT_COMPETITION_RELATION.BELOW_CLUB_LEVEL
  }

  return {
    relation,
    gap,
    clubLevel: club,
    clubStrengthLevel: clubStrength,
    leagueLevel: league,
    confidence: TEAM_SCOUT_CONTEXT_CONFIDENCE.HIGH,
    evidence: [
      `club_level:${club}`,
      `club_strength_level:${clubStrength}`,
      `league_level:${league}`,
    ],
  }
}
