// src/shared/scouting/players/engine.js

import {
  SCOUT_PROFILES,
} from './profiles.js'

import {
  buildScoutMetrics,
  getScoutDataAvailability,
} from './metrics.js'

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
  buildPlayerScoutOpportunity,
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

import {
  buildPlayerProfileStrength,
} from './profileStrength/index.js'

import {
  buildPlayerProfileCaseStrength,
} from './profileCaseStrength/index.js'

import {
  buildPlayerManualReview,
} from './manualReview/index.js'

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
  ruleResult,
  context,
  scoutContext,
  player,
  futureCompetitionPath,
  playerTrajectory,
  currentSeasonKey,
  currentSeasonStatus,
}) => {
  const spotlights = buildPlayerScoutSpotlights({
    profile,
    player,
    metrics,
    scoutContext,
    futureCompetitionPath,
    playerTrajectory,
    currentSeasonKey,
    currentSeasonStatus,
  })
  const profileDepth = buildPlayerProfileDepth({ profile, metrics })
  const profileStrength = buildPlayerProfileStrength({ profileDepth })
  const score = Math.round(
    (interestScore(profile.interest) * 0.55) +
    (ruleResult.score * 0.45)
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
    profileStrength,
    score,
    reasons: ruleResult.reasons,
    warnings: profile.warnings || [],
    requiredReview: profile.reviews || [],
    metrics,
    normalization: context.normalization || null,
    matchEvidence: ruleResult.matchEvidence,
  }

  return signal
}

const buildPlayerScoutSignalsFromNormalizedInput = ({
  normalizedInput,
  perspective,
  searchDistance = 0,
  profiles = SCOUT_PROFILES,
  futureCompetitionPath,
  playerTrajectory,
  currentSeasonKey,
  currentSeasonStatus,
} = {}) => {
  const metrics = buildScoutMetrics({
    player: normalizedInput.player,
    team: normalizedInput.team,
  })
  const context = {
    perspective,
    searchDistance,
    normalization: normalizedInput.normalization,
  }

  return profiles
    .map((profile) => {
      const ruleResult = evaluateScoutRules({ profile, metrics })

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
        ruleResult,
        context,
        scoutContext: {
          ...scoutContext,
          teamGate,
        },
        player: normalizedInput.player,
        futureCompetitionPath,
        playerTrajectory,
        currentSeasonKey,
        currentSeasonStatus,
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
    currentSeasonKey: season?.seasonKey || season?.season || '',
    currentSeasonStatus: season?.seasonStatus || '',
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
  immediacyContext,
  manualReview,
  manualImmediacyDecision,
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
    currentSeasonKey: season?.seasonKey || season?.season || '',
    currentSeasonStatus: season?.seasonStatus || '',
  })
  const combinations = buildScoutProfileCombinations({ signals })
  const profileHierarchy = buildPlayerProfileHierarchy({ signals })
  const profileCaseStrength = buildPlayerProfileCaseStrength({
    signals,
    combinations,
    profileHierarchy,
  })
  const opportunity = buildPlayerScoutOpportunity({
    signals,
    candidateSignals,
    combinations,
    profileCaseStrength,
    playerTrajectory: resolvedPlayerTrajectory,
    futureCompetitionPath,
    immediacyContext,
    currentSeasonKey: season?.seasonKey || season?.season || '',
    currentSeasonStatus: season?.seasonStatus || '',
    manualImmediacyDecision,
  })
  const verification = buildPlayerVerification({
    player: normalizedInput.player,
    signals,
    candidateSignals,
    opportunity,
    answers: verificationAnswers,
    profiles,
  })
  const playerReview = buildPlayerManualReview({ review: manualReview })

  return {
    signals,
    candidateSignals,
    profileProgression,
    spotlights: aggregatePlayerScoutSpotlights(signals),
    opportunity,
    verification,
    playerReview,
    combinations,
    profileHierarchy,
    profileCaseStrength,
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
  immediacyContext,
  manualReview,
  manualImmediacyDecision,
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
        immediacyContext: player?.immediacyContext || immediacyContext,
        manualReview: player?.manualReview || manualReview,
        manualImmediacyDecision:
          player?.manualImmediacyDecision ||
          player?.opportunity?.manualDecision ||
          manualImmediacyDecision,
      })

      return {
        player,
        playerId: player?.id || '',
        signals: result.signals,
        candidateSignals: result.candidateSignals,
        profileProgression: result.profileProgression,
        profileHierarchy: result.profileHierarchy,
        profileCaseStrength: result.profileCaseStrength,
        combinations: result.combinations,
        bestSignal: result.bestSignal,
        spotlights: result.spotlights,
        opportunity: result.opportunity,
        verification: result.verification,
        playerReview: result.playerReview,
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
