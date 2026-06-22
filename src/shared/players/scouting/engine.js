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
    interestLevel: profile.interest,
    reliability,
    score,
    reasons: ruleResult.reasons,
    warnings: reliability.warnings,
    requiredReview: profile.reviews || [],
    metrics,
    matchedRules: ruleResult.matchedRules,
  }
}

export const buildPlayerScoutSignals = ({
  player,
  team,
  perspective,
  searchDistance = 0,
  profiles = SCOUT_PROFILES,
} = {}) => {
  const metrics = buildScoutMetrics({ player, team })
  const availability = getScoutDataAvailability({ player, team })
  const context = { perspective }

  return profiles
    .map((profile) => {
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

export const buildPlayersScoutSignals = ({
  players,
  team,
  perspective,
  searchDistance = 0,
  profiles,
} = {}) => {
  const safePlayers = Array.isArray(players) ? players : []

  return safePlayers
    .map((player) => {
      const signals = buildPlayerScoutSignals({
        player,
        team: player?.team || team,
        perspective,
        searchDistance,
        profiles,
      })

      return {
        player,
        playerId: player?.id || '',
        signals,
        bestSignal: signals[0] || null,
      }
    })
    .filter((row) => row.signals.length)
    .sort((a, b) => {
      return (b.bestSignal?.score || 0) - (a.bestSignal?.score || 0)
    })
}
