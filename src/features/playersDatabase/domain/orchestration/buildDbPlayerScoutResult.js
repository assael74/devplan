// src/features/playersDatabase/domain/orchestration/buildDbPlayerScoutResult.js

import { buildPlayerScoutResult } from '../../../../shared/scouting/players/index.js'

export const PLAYER_SCOUT_ACTIVE_ENGINE = 'scouting-v2'

export const buildDbPlayerScoutResult = ({
  player,
  team,
  season,
  perspective,
  normalizationMode,
  searchDistance,
  profiles,
  futureCompetitionPath,
  playerTrajectory,
  playerSeasonStints,
  previousProfileDistances,
  verificationAnswers,
} = {}) => {
  const result = buildPlayerScoutResult({
    player,
    team,
    season,
    perspective,
    normalizationMode,
    searchDistance,
    profiles,
    futureCompetitionPath,
    playerTrajectory,
    playerSeasonStints,
    previousProfileDistances,
    verificationAnswers,
  })

  return {
    ...result,
    engineVersion: PLAYER_SCOUT_ACTIVE_ENGINE,
    engineMode: 'primary',
  }
}
