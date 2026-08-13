// src/shared/scouting/players/spotlights/playerCurrentSpotlights.js

import {
  PLAYER_COMPETITION_CONTEXT,
  PLAYER_TEAM_CONTEXT,
} from '../context/playerContext.model.js'

import {
  PLAYER_SCOUT_SPOTLIGHT,
  PLAYER_SCOUT_SPOTLIGHT_CONFIDENCE,
  PLAYER_SCOUT_SPOTLIGHT_EFFECT,
} from './playerSpotlights.model.js'

import {
  buildSpotlight,
  isDefensivePosition,
  resolveSpotlightConfidence,
} from './playerSpotlights.utils.js'

const buildEarlyBreakthroughSpotlight = ({ profile, metrics, reliability }) => {
  if (!metrics.isYoungerAgeGroup) return null
  if (metrics.games < 3) return null

  const sampleLevel = reliability.factors?.sampleSize?.level || ''
  const confidence = metrics.games >= 6
    ? sampleLevel || PLAYER_SCOUT_SPOTLIGHT_CONFIDENCE.MEDIUM
    : PLAYER_SCOUT_SPOTLIGHT_CONFIDENCE.LOW

  return buildSpotlight({
    id: PLAYER_SCOUT_SPOTLIGHT.EARLY_BREAKTHROUGH,
    confidence,
    effect: PLAYER_SCOUT_SPOTLIGHT_EFFECT.SUPPORTS_ACTION,
    evidence: [
      'younger_age_group',
      'meaningful_games_sample',
    ],
    details: {
      profileId: profile.id,
      games: metrics.games,
      minutesPct: metrics.minutesPct,
    },
  })
}

const buildCompetitionSpotlight = ({ scoutContext, reliability }) => {
  const competition = scoutContext.competition || {}

  if (competition.classification === PLAYER_COMPETITION_CONTEXT.ABOVE_CLUB_LEVEL) {
    return buildSpotlight({
      id: PLAYER_SCOUT_SPOTLIGHT.PLAYS_ABOVE_CLUB_LEVEL,
      confidence: PLAYER_SCOUT_SPOTLIGHT_CONFIDENCE.HIGH,
      effect: PLAYER_SCOUT_SPOTLIGHT_EFFECT.SUPPORTS_ACTION,
      evidence: ['league_stronger_than_club_level'],
      details: {
        clubLevel: competition.clubLevel,
        clubStrengthLevel: competition.clubStrengthLevel,
        leagueLevel: competition.leagueLevel,
        levelGap: competition.levelGap,
      },
    })
  }

  if (competition.classification === PLAYER_COMPETITION_CONTEXT.BELOW_CLUB_LEVEL) {
    return buildSpotlight({
      id: PLAYER_SCOUT_SPOTLIGHT.PLAYS_BELOW_CLUB_LEVEL,
      confidence: PLAYER_SCOUT_SPOTLIGHT_CONFIDENCE.HIGH,
      effect: PLAYER_SCOUT_SPOTLIGHT_EFFECT.CONTEXT_ONLY,
      evidence: ['league_weaker_than_club_level'],
      details: {
        clubLevel: competition.clubLevel,
        clubStrengthLevel: competition.clubStrengthLevel,
        leagueLevel: competition.leagueLevel,
        levelGap: competition.levelGap,
      },
    })
  }

  return null
}

const buildTeamContextSpotlight = ({ scoutContext, reliability }) => {
  const teamContext = scoutContext.team || {}

  if (teamContext.classification === PLAYER_TEAM_CONTEXT.ADVERSE) {
    return buildSpotlight({
      id: PLAYER_SCOUT_SPOTLIGHT.ADVERSE_TEAM_CONTEXT,
      confidence: PLAYER_SCOUT_SPOTLIGHT_CONFIDENCE.HIGH,
      effect: PLAYER_SCOUT_SPOTLIGHT_EFFECT.CONTEXT_ONLY,
      evidence: ['profile_detected_in_adverse_team_context'],
      details: {
        relevantSide: teamContext.relevantSide,
        attack: teamContext.attack?.classification || '',
        defense: teamContext.defense?.classification || '',
      },
    })
  }

  if (teamContext.classification === PLAYER_TEAM_CONTEXT.SUPPORTIVE) {
    return buildSpotlight({
      id: PLAYER_SCOUT_SPOTLIGHT.STRONG_TEAM_CONTEXT,
      confidence: PLAYER_SCOUT_SPOTLIGHT_CONFIDENCE.HIGH,
      effect: PLAYER_SCOUT_SPOTLIGHT_EFFECT.CONTEXT_ONLY,
      evidence: ['profile_detected_in_supportive_team_context'],
      details: {
        relevantSide: teamContext.relevantSide,
        attack: teamContext.attack?.classification || '',
        defense: teamContext.defense?.classification || '',
      },
    })
  }

  return null
}

const buildUnderexposedSpotlight = ({ metrics, reliability }) => {
  if (!metrics.clubStrengthLevel || metrics.clubStrengthLevel < 3) return null
  if (reliability.level === 'low') return null

  return buildSpotlight({
    id: PLAYER_SCOUT_SPOTLIGHT.UNDEREXPOSED,
    confidence: resolveSpotlightConfidence(reliability),
    effect: PLAYER_SCOUT_SPOTLIGHT_EFFECT.SUPPORTS_ACTION,
    evidence: ['signal_outside_top_club_levels'],
    details: {
      clubLevel: metrics.clubLevel,
      clubStrengthLevel: metrics.clubStrengthLevel,
    },
  })
}

const buildHiddenPerformerSpotlight = ({ metrics, scoutContext, reliability }) => {
  const teamContext = scoutContext.team || {}

  if (teamContext.classification !== PLAYER_TEAM_CONTEXT.ADVERSE) return null
  if (reliability.level === 'low') return null

  const hasOutputSignal = metrics.goals >= 5 || metrics.minutesPct >= 0.85

  if (!hasOutputSignal) return null

  return buildSpotlight({
    id: PLAYER_SCOUT_SPOTLIGHT.HIDDEN_PERFORMER,
    confidence: resolveSpotlightConfidence(reliability),
    effect: PLAYER_SCOUT_SPOTLIGHT_EFFECT.SUPPORTS_ACTION,
    evidence: [
      'profile_detected_in_adverse_environment',
      'meaningful_individual_output',
    ],
    details: {
      goals: metrics.goals,
      minutesPct: metrics.minutesPct,
      relevantSide: teamContext.relevantSide,
    },
  })
}

const buildPositionalOutlierSpotlight = ({ profile, player, metrics, reliability }) => {
  const attackingProfile = profile.group === 'attack' || profile.group === 'attack_creation'

  if (!attackingProfile) return null
  if (!isDefensivePosition(player)) return null
  if (metrics.goals < 5) return null

  return buildSpotlight({
    id: PLAYER_SCOUT_SPOTLIGHT.POSITIONAL_OUTLIER,
    confidence: resolveSpotlightConfidence(reliability),
    effect: PLAYER_SCOUT_SPOTLIGHT_EFFECT.SUPPORTS_ACTION,
    evidence: [
      'attacking_signal_from_defensive_position',
      'meaningful_goal_output',
    ],
    details: {
      goals: metrics.goals,
      profileId: profile.id,
    },
  })
}

export const buildPlayerCurrentSpotlights = ({
  profile,
  player,
  metrics,
  reliability,
  scoutContext,
}) => {
  const candidates = [
    buildEarlyBreakthroughSpotlight({ profile, metrics, reliability }),
    buildCompetitionSpotlight({ scoutContext, reliability }),
    buildTeamContextSpotlight({ scoutContext, reliability }),
    buildUnderexposedSpotlight({ metrics, reliability }),
    buildHiddenPerformerSpotlight({ metrics, scoutContext, reliability }),
    buildPositionalOutlierSpotlight({ profile, player, metrics, reliability }),
  ]

  return candidates.filter(Boolean)
}
