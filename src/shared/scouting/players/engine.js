// src/shared/scouting/players/engine.js

import {
  SCOUT_PROFILES,
} from './profiles.js'

import {
  buildScoutMetrics,
  getScoutDataAvailability,
} from './metrics.js'

import {
  buildScoutReliability,
} from './rel.js'

import {
  evaluateScoutRules,
} from './rules.js'

import {
  buildScoutProfileCombinations,
} from './combinations.js'

import {
  PLAYER_SCOUT_NORMALIZATION_MODE,
  buildNormalizedPlayerScoutInput,
} from './normalization.js'

import {
  buildPlayerScoutContext,
} from './context/index.js'

import {
  evaluatePlayerScoutTeamGate,
} from './context/playerTeamGate.js'

import {
  aggregatePlayerScoutSpotlights,
  buildPlayerScoutSpotlights,
} from './spotlights/index.js'

import {
  aggregatePlayerScoutOpportunity,
  buildPlayerSignalOpportunity,
} from './opportunity/index.js'

import {
  buildPlayerTrajectory,
} from './trajectory/index.js'

import {
  buildPlayerProfileProgression,
} from './profileProgression/index.js'

import {
  buildPlayerVerification,
} from './verification/index.js'

import {
  buildPlayerProfileDepth,
  buildPlayerProfileHierarchy,
  comparePlayerScoutSignalsByHierarchy,
} from './profileHierarchy/index.js'

const resolvePlayerTrajectory = ({ playerTrajectory, playerSeasonStints }) => {
  if (playerTrajectory) return playerTrajectory
  if (!Array.isArray(playerSeasonStints) || playerSeasonStints.length < 2) return null

  return buildPlayerTrajectory({ stints: playerSeasonStints })
}

const interestScore = (interest) => {
  if (interest === 'super_interesting') return 95
  if (interest === 'interesting') return 75

  return 55
}

const buildSignal = ({
  profile,
  metrics,
  reliabilityMetrics,
  availability,
  ruleResult,
  context,
  scoutContext,
  player,
  futureCompetitionPath,
  playerTrajectory,
}) => {
  const reliability = buildScoutReliability({
    profile,
    metrics: reliabilityMetrics,
    availability,
  })
  const spotlights = buildPlayerScoutSpotlights({
    profile,
    player,
    metrics,
    reliability,
    scoutContext,
    futureCompetitionPath,
    playerTrajectory,
  })
  const profileDepth = buildPlayerProfileDepth({
    profile,
    metrics,
    searchDistance: context.searchDistance,
  })
  const score = Math.round(
    (interestScore(profile.interest) * 0.45) +
    (ruleResult.score * 0.35) +
    (reliability.score * 0.2)
  )

  const signal = {
    profileId: profile.id,
    profileLabel: profile.label,
    perspective: context.perspective || '',
    searchLevels: profile.searchLevels || [],
    teamFilter: profile.teamFilter || '',
    positionContext: profile.positionContext || '',
    scoutContext,
    spotlights,
    interestLevel: profile.interest,
    profileDepth,
    reliability,
    score,
    reasons: ruleResult.reasons,
    warnings: reliability.warnings,
    requiredReview: profile.reviews || [],
    metrics,
    normalization: context.normalization || null,
    matchedRules: ruleResult.matchedRules,
  }

  return {
    ...signal,
    opportunity: buildPlayerSignalOpportunity({ signal }),
  }
}

const buildPlayerScoutSignalsFromNormalizedInput = ({
  normalizedInput,
  perspective,
  searchDistance = 0,
  profiles = SCOUT_PROFILES,
  futureCompetitionPath,
  playerTrajectory,
} = {}) => {
  const metrics = buildScoutMetrics({
    player: normalizedInput.player,
    team: normalizedInput.team,
  })
  const reliabilityMetrics = buildScoutMetrics({
    player: normalizedInput.reliabilityPlayer,
    team: normalizedInput.reliabilityTeam,
  })
  const availability = getScoutDataAvailability({
    player: normalizedInput.reliabilityPlayer,
    team: normalizedInput.reliabilityTeam,
  })
  const context = {
    perspective,
    searchDistance,
    normalization: normalizedInput.normalization,
  }

  return profiles
    .map((profile) => {
      const ruleResult = evaluateScoutRules({ profile, metrics, searchDistance })

      if (!ruleResult.matched) return null

      const scoutContext = buildPlayerScoutContext({
        profile,
        player: normalizedInput.player,
        team: normalizedInput.team,
      })
      const teamGate = evaluatePlayerScoutTeamGate({
        profile,
        team: normalizedInput.team,
        metrics,
        competitionContext: scoutContext.competition,
      })

      if (!teamGate.passed) return null

      return buildSignal({
        profile,
        metrics,
        reliabilityMetrics,
        availability,
        ruleResult,
        context,
        scoutContext: {
          ...scoutContext,
          teamGate,
        },
        player: normalizedInput.player,
        futureCompetitionPath,
        playerTrajectory,
      })
    })
    .filter(Boolean)
    .sort(comparePlayerScoutSignalsByHierarchy)
}

export const buildPlayerScoutSignals = ({
  player,
  team,
  season,
  perspective,
  normalizationMode = PLAYER_SCOUT_NORMALIZATION_MODE.AUTO,
  searchDistance = 0,
  profiles = SCOUT_PROFILES,
  futureCompetitionPath,
  playerTrajectory,
  playerSeasonStints,
} = {}) => {
  const resolvedPlayerTrajectory = resolvePlayerTrajectory({
    playerTrajectory,
    playerSeasonStints,
  })
  const normalizedInput = buildNormalizedPlayerScoutInput({
    player,
    team,
    season,
    mode: normalizationMode,
  })

  return buildPlayerScoutSignalsFromNormalizedInput({
    normalizedInput,
    perspective,
    searchDistance,
    profiles,
    futureCompetitionPath,
    playerTrajectory: resolvedPlayerTrajectory,
  })
}

export const buildPlayerScoutResult = ({
  player,
  team,
  season,
  perspective,
  normalizationMode = PLAYER_SCOUT_NORMALIZATION_MODE.AUTO,
  searchDistance = 0,
  profiles = SCOUT_PROFILES,
  futureCompetitionPath,
  playerTrajectory,
  playerSeasonStints,
  previousProfileDistances,
  verificationAnswers,
} = {}) => {
  const resolvedPlayerTrajectory = resolvePlayerTrajectory({
    playerTrajectory,
    playerSeasonStints,
  })
  const normalizedInput = buildNormalizedPlayerScoutInput({
    player,
    team,
    season,
    mode: normalizationMode,
  })
  const profileProgression = buildPlayerProfileProgression({
    player: normalizedInput.player,
    team: normalizedInput.team,
    searchDistance,
    profiles,
    previousProfileDistances,
  })
  const candidateSignals = profileProgression.nearProfiles.map((item) => ({
    id: 'near_profile',
    profileId: item.profileId,
    profileLabel: item.profileLabel,
    distance: item.distance,
    distancePct: item.distancePct,
    status: item.status,
    trend: item.trend,
    distanceDelta: item.distanceDelta,
    distanceDeltaPct: item.distanceDeltaPct,
  }))
  const signals = buildPlayerScoutSignalsFromNormalizedInput({
    normalizedInput,
    perspective,
    searchDistance,
    profiles,
    futureCompetitionPath,
    playerTrajectory: resolvedPlayerTrajectory,
  })
  const profileHierarchy = buildPlayerProfileHierarchy({ signals })
  const opportunity = aggregatePlayerScoutOpportunity(signals)
  const verification = buildPlayerVerification({
    player: normalizedInput.player,
    signals,
    candidateSignals,
    opportunity,
    answers: verificationAnswers,
    profiles,
  })

  return {
    signals,
    candidateSignals,
    profileProgression,
    spotlights: aggregatePlayerScoutSpotlights(signals),
    opportunity,
    verification,
    combinations: buildScoutProfileCombinations({ signals }),
    profileHierarchy,
    bestSignal: profileHierarchy.primarySignal,
    normalization: normalizedInput.normalization,
    normalizedPlayer: normalizedInput.player,
    normalizedTeam: normalizedInput.team,
    futureCompetitionPath: futureCompetitionPath || null,
    playerTrajectory: resolvedPlayerTrajectory,
  }
}

export const buildPlayersScoutSignals = ({
  players,
  team,
  season,
  perspective,
  normalizationMode = PLAYER_SCOUT_NORMALIZATION_MODE.AUTO,
  searchDistance = 0,
  profiles,
  futureCompetitionPath,
  playerTrajectory,
  playerSeasonStints,
  previousProfileDistances,
  verificationAnswers,
} = {}) => {
  const safePlayers = Array.isArray(players) ? players : []

  return safePlayers
    .map((player) => {
      const result = buildPlayerScoutResult({
        player,
        team: player?.team || team,
        season: player?.season || season,
        perspective,
        normalizationMode,
        searchDistance,
        profiles,
        futureCompetitionPath: player?.futureCompetitionPath || futureCompetitionPath,
        playerTrajectory: player?.playerTrajectory || playerTrajectory,
        playerSeasonStints: player?.playerSeasonStints || playerSeasonStints,
        previousProfileDistances: player?.previousProfileDistances || previousProfileDistances,
        verificationAnswers:
          player?.verification?.answers ||
          player?.verificationAnswers ||
          verificationAnswers,
      })

      return {
        player,
        playerId: player?.id || '',
        signals: result.signals,
        candidateSignals: result.candidateSignals,
        profileProgression: result.profileProgression,
        profileHierarchy: result.profileHierarchy,
        combinations: result.combinations,
        bestSignal: result.bestSignal,
        spotlights: result.spotlights,
        opportunity: result.opportunity,
        verification: result.verification,
        playerTrajectory: result.playerTrajectory,
      }
    })
    .filter((row) => row.signals.length || row.candidateSignals.length)
    .sort((a, b) => {
      const scoreDiff = (b.bestSignal?.score || 0) - (a.bestSignal?.score || 0)

      if (scoreDiff) return scoreDiff

      const aDistance = a.profileProgression?.nearestProfile?.distance
      const bDistance = b.profileProgression?.nearestProfile?.distance
      const safeADistance = Number.isFinite(aDistance) ? aDistance : 1
      const safeBDistance = Number.isFinite(bDistance) ? bDistance : 1

      return safeADistance - safeBDistance
    })
}
