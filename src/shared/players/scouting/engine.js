// src/shared/players/scouting/engine.js

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
  passesPlayerScoutTeamFilter,
} from './team.js'

import {
  PLAYER_SCOUT_NORMALIZATION_MODE,
  buildNormalizedPlayerScoutInput,
} from './normalization.js'

const interestScore = (interest) => {
  if (interest === 'super_interesting') return 95
  if (interest === 'interesting') return 75

  return 55
}

const buildSignal = ({ profile, metrics, availability, ruleResult, context }) => {
  const reliability = buildScoutReliability({ profile, metrics, availability })
  const score = Math.round(
    (interestScore(profile.interest) * 0.45) +
    (ruleResult.score * 0.35) +
    (reliability.score * 0.2)
  )

  return {
    profileId: profile.id,
    profileLabel: profile.label,
    perspective: context.perspective || '',
    searchLevels: profile.searchLevels || [],
    teamFilter: profile.teamFilter || '',
    positionContext: profile.positionContext || '',
    interestLevel: profile.interest,
    reliability,
    score,
    reasons: ruleResult.reasons,
    warnings: reliability.warnings,
    requiredReview: profile.reviews || [],
    metrics,
    normalization: context.normalization || null,
    matchedRules: ruleResult.matchedRules,
  }
}

const buildPlayerScoutSignalsFromNormalizedInput = ({
  normalizedInput,
  perspective,
  searchDistance = 0,
  profiles = SCOUT_PROFILES,
} = {}) => {
  const metrics = buildScoutMetrics({
    player: normalizedInput.player,
    team: normalizedInput.team,
  })
  const availability = getScoutDataAvailability({
    player: normalizedInput.player,
    team: normalizedInput.team,
  })
  const context = {
    perspective,
    normalization: normalizedInput.normalization,
  }

  return profiles
    .map((profile) => {
      const teamFilterPassed = passesPlayerScoutTeamFilter({
        profile,
        team: normalizedInput.team,
        metrics,
      })

      if (!teamFilterPassed) return null

      const ruleResult = evaluateScoutRules({ profile, metrics, searchDistance })

      if (!ruleResult.matched) return null

      return buildSignal({
        profile,
        metrics,
        availability,
        ruleResult,
        context,
      })
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
}

export const buildPlayerScoutSignals = ({
  player,
  team,
  season,
  perspective,
  normalizationMode = PLAYER_SCOUT_NORMALIZATION_MODE.AUTO,
  searchDistance = 0,
  profiles = SCOUT_PROFILES,
} = {}) => {
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
} = {}) => {
  const normalizedInput = buildNormalizedPlayerScoutInput({
    player,
    team,
    season,
    mode: normalizationMode,
  })
  const signals = buildPlayerScoutSignalsFromNormalizedInput({
    normalizedInput,
    perspective,
    searchDistance,
    profiles,
  })

  return {
    signals,
    combinations: buildScoutProfileCombinations({ signals }),
    bestSignal: signals[0] || null,
    normalization: normalizedInput.normalization,
    normalizedPlayer: normalizedInput.player,
    normalizedTeam: normalizedInput.team,
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
      })

      return {
        player,
        playerId: player?.id || '',
        signals: result.signals,
        combinations: result.combinations,
        bestSignal: result.bestSignal,
      }
    })
    .filter((row) => row.signals.length)
    .sort((a, b) => {
      return (b.bestSignal?.score || 0) - (a.bestSignal?.score || 0)
    })
}
