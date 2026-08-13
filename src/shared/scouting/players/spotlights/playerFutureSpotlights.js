// src/shared/scouting/players/spotlights/playerFutureSpotlights.js

import {
  FUTURE_COMPETITION_LEVEL_STATUS,
  FUTURE_COMPETITION_OUTLOOK,
} from '../../common/futureCompetition/index.js'

import {
  PLAYER_SCOUT_SPOTLIGHT,
  PLAYER_SCOUT_SPOTLIGHT_CONFIDENCE,
  PLAYER_SCOUT_SPOTLIGHT_EFFECT,
} from './playerSpotlights.model.js'

import {
  buildSpotlight,
} from './playerSpotlights.utils.js'

const resolveFutureConfidence = (steps = []) => {
  const firstAvailable = steps.find(step => step && step.leagueLevel)

  if (!firstAvailable) return PLAYER_SCOUT_SPOTLIGHT_CONFIDENCE.LOW

  if (firstAvailable.levelStatus === FUTURE_COMPETITION_LEVEL_STATUS.CONFIRMED) {
    return PLAYER_SCOUT_SPOTLIGHT_CONFIDENCE.HIGH
  }

  if (firstAvailable.levelStatus === FUTURE_COMPETITION_LEVEL_STATUS.PROJECTED) {
    return PLAYER_SCOUT_SPOTLIGHT_CONFIDENCE.MEDIUM
  }

  return PLAYER_SCOUT_SPOTLIGHT_CONFIDENCE.LOW
}

const buildFutureLevelRiskSpotlight = (futureCompetitionPath) => {
  if (futureCompetitionPath?.outlook !== FUTURE_COMPETITION_OUTLOOK.RISK) return null

  const steps = Array.isArray(futureCompetitionPath.steps)
    ? futureCompetitionPath.steps
    : []

  return buildSpotlight({
    id: PLAYER_SCOUT_SPOTLIGHT.FUTURE_LEVEL_RISK,
    confidence: resolveFutureConfidence(steps),
    effect: PLAYER_SCOUT_SPOTLIGHT_EFFECT.SUPPORTS_ACTION,
    evidence: ['future_competition_level_expected_to_drop'],
    details: {
      currentLeagueLevel: futureCompetitionPath.current?.leagueLevel || null,
      steps,
    },
  })
}

const buildFutureLevelUpsideSpotlight = (futureCompetitionPath) => {
  if (futureCompetitionPath?.outlook !== FUTURE_COMPETITION_OUTLOOK.UPSIDE) return null

  const steps = Array.isArray(futureCompetitionPath.steps)
    ? futureCompetitionPath.steps
    : []

  return buildSpotlight({
    id: PLAYER_SCOUT_SPOTLIGHT.FUTURE_LEVEL_UPSIDE,
    confidence: resolveFutureConfidence(steps),
    effect: PLAYER_SCOUT_SPOTLIGHT_EFFECT.REDUCES_IMMEDIACY,
    evidence: ['future_competition_level_expected_to_improve'],
    details: {
      currentLeagueLevel: futureCompetitionPath.current?.leagueLevel || null,
      steps,
    },
  })
}

export const buildPlayerFutureSpotlights = ({ futureCompetitionPath } = {}) => {
  const candidates = [
    buildFutureLevelRiskSpotlight(futureCompetitionPath),
    buildFutureLevelUpsideSpotlight(futureCompetitionPath),
  ]

  return candidates.filter(Boolean)
}
