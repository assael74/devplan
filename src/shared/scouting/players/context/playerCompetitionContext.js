// src/shared/scouting/players/context/playerCompetitionContext.js

import {
  PLAYER_COMPETITION_CONTEXT,
} from './playerContext.model.js'

const toLevel = (value) => {
  const level = Number(value)

  return Number.isFinite(level) && level > 0 ? level : null
}

export const buildPlayerCompetitionContext = ({ clubLevel, clubStrengthLevel, leagueLevel } = {}) => {
  const normalizedClubLevel = toLevel(clubLevel)
  const normalizedClubStrengthLevel = toLevel(clubStrengthLevel) || normalizedClubLevel
  const normalizedLeagueLevel = toLevel(leagueLevel)

  if (!normalizedClubStrengthLevel || !normalizedLeagueLevel) {
    return {
      classification: PLAYER_COMPETITION_CONTEXT.UNAVAILABLE,
      clubLevel: normalizedClubLevel,
      clubStrengthLevel: normalizedClubStrengthLevel,
      leagueLevel: normalizedLeagueLevel,
      levelGap: null,
    }
  }

  const levelGap = normalizedClubStrengthLevel - normalizedLeagueLevel

  if (levelGap > 0) {
    return {
      classification: PLAYER_COMPETITION_CONTEXT.ABOVE_CLUB_LEVEL,
      clubLevel: normalizedClubLevel,
      clubStrengthLevel: normalizedClubStrengthLevel,
      leagueLevel: normalizedLeagueLevel,
      levelGap,
    }
  }

  if (levelGap < 0) {
    return {
      classification: PLAYER_COMPETITION_CONTEXT.BELOW_CLUB_LEVEL,
      clubLevel: normalizedClubLevel,
      clubStrengthLevel: normalizedClubStrengthLevel,
      leagueLevel: normalizedLeagueLevel,
      levelGap,
    }
  }

  return {
    classification: PLAYER_COMPETITION_CONTEXT.AT_CLUB_LEVEL,
    clubLevel: normalizedClubLevel,
    clubStrengthLevel: normalizedClubStrengthLevel,
    leagueLevel: normalizedLeagueLevel,
    levelGap,
  }
}
