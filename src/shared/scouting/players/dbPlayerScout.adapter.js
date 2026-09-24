import { SCOUTING_MODEL_VERSION } from '../scouting.version.js'
import { buildPlayerScoutResult } from './engine.js'

export const PLAYER_SCOUT_ACTIVE_ENGINE = SCOUTING_MODEL_VERSION

export const buildDbPlayerScoutResult = ({
  player, team, season, perspective, normalizationMode, searchDistance, profiles,
  futureCompetitionPath, playerTrajectory, playerSeasonStints, previousProfileDistances,
  verificationAnswers, immediacyContext, manualReview, manualImmediacyDecision,
} = {}) => ({
  ...buildPlayerScoutResult({
    player, team, season, perspective, normalizationMode, searchDistance, profiles,
    futureCompetitionPath, playerTrajectory, playerSeasonStints, previousProfileDistances,
    verificationAnswers, immediacyContext, manualReview, manualImmediacyDecision,
  }),
  engineVersion: PLAYER_SCOUT_ACTIVE_ENGINE,
  engineMode: 'primary',
})
