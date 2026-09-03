// src/shared/scouting/teams/lines/teamLineClassification.js

import {
  TEAM_LINE_CLASSIFICATION_SOURCE,
  TEAM_LINE_CLASSIFICATION_VERSION,
  TEAM_LINE_EVIDENCE_LEVEL,
  TEAM_LINE_MINUTES_BAND,
  TEAM_LINE_SUBSTITUTION_BAND,
  TEAM_PLAYER_LINE,
  TEAM_PLAYER_POSITION,
} from './teamLineClassification.model.js'
import { TEAM_LINE_STRUCTURE_THRESHOLDS } from '../../config/lineStructureThresholds.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const toKnownNonNegativeNumber = value => {
  if (value === null || value === undefined || value === '') return null

  const number = Number(value)
  if (!Number.isFinite(number) || number < 0) return null

  return number
}

const getPlayerStats = player => (
  player?.playerStats && typeof player.playerStats === 'object'
    ? player.playerStats
    : player || {}
)

const hasKnownGoalkeeperRole = player => (
  clean(player?.positionLayer).toLowerCase() === 'goalkeeper' ||
  clean(player?.primaryPosition).toUpperCase() === 'GK'
)

export const isTeamPlayerKnownGoalkeeper = ({ player = {} } = {}) => (
  hasKnownGoalkeeperRole(player)
)

// A player belongs to the seasonal line-structure population only after the
// common games gate of the classification model. Goals never bypass it.
export const isTeamPlayerLineClassificationEligible = ({ player = {} } = {}) => {
  if (hasKnownGoalkeeperRole(player)) return false

  const stats = getPlayerStats(player)
  const games = toKnownNonNegativeNumber(stats.games)
  return games !== null && games >= TEAM_LINE_STRUCTURE_THRESHOLDS.MINIMUM_GAMES
}

const buildMinutesBand = minutesRate => {
  if (minutesRate >= 0.9) return TEAM_LINE_MINUTES_BAND.HIGH
  if (minutesRate >= 0.75) return TEAM_LINE_MINUTES_BAND.MEDIUM_HIGH
  if (minutesRate >= 0.7) return TEAM_LINE_MINUTES_BAND.MEDIUM
  return TEAM_LINE_MINUTES_BAND.LOW
}

const buildSubstitutionBand = substitutionRate => {
  if (substitutionRate >= 0.5) return TEAM_LINE_SUBSTITUTION_BAND.HIGH
  if (substitutionRate >= 0.3) return TEAM_LINE_SUBSTITUTION_BAND.MEDIUM
  return TEAM_LINE_SUBSTITUTION_BAND.LOW
}

const buildInferredClassification = ({ minutesBand, substitutionBand, goals }) => {
  if (goals >= 10) {
    return {
      line: TEAM_PLAYER_LINE.ATTACK,
      position: null,
      evidenceLevel: TEAM_LINE_EVIDENCE_LEVEL.HIGH,
    }
  }

  if (goals >= 5) {
    return {
      line: TEAM_PLAYER_LINE.MIDFIELD,
      position: TEAM_PLAYER_POSITION.ATTACKING_MIDFIELDER,
      evidenceLevel: TEAM_LINE_EVIDENCE_LEVEL.HIGH,
    }
  }

  if (minutesBand === TEAM_LINE_MINUTES_BAND.HIGH) {
    return {
      line: TEAM_PLAYER_LINE.DEFENSE,
      position: substitutionBand === TEAM_LINE_SUBSTITUTION_BAND.HIGH
        ? TEAM_PLAYER_POSITION.FULLBACK
        : null,
      evidenceLevel: TEAM_LINE_EVIDENCE_LEVEL.HIGH,
    }
  }

  if (minutesBand === TEAM_LINE_MINUTES_BAND.MEDIUM_HIGH) {
    return {
      line: TEAM_PLAYER_LINE.DEFENSE,
      position: null,
      evidenceLevel: TEAM_LINE_EVIDENCE_LEVEL.HIGH,
    }
  }

  if (minutesBand === TEAM_LINE_MINUTES_BAND.MEDIUM) {
    if (substitutionBand === TEAM_LINE_SUBSTITUTION_BAND.HIGH) {
      return {
        line: TEAM_PLAYER_LINE.MIDFIELD,
        position: null,
        evidenceLevel: TEAM_LINE_EVIDENCE_LEVEL.MEDIUM,
      }
    }

    return {
      line: TEAM_PLAYER_LINE.DEFENSE,
      position: null,
      evidenceLevel: TEAM_LINE_EVIDENCE_LEVEL.HIGH,
    }
  }

  return null
}

export const buildTeamPlayerLineClassification = ({ player = {} } = {}) => {
  if (hasKnownGoalkeeperRole(player)) return null

  const stats = getPlayerStats(player)
  const games = toKnownNonNegativeNumber(stats.games)

  if (games === null || games < TEAM_LINE_STRUCTURE_THRESHOLDS.MINIMUM_GAMES) {
    return null
  }

  const goals = toKnownNonNegativeNumber(stats.goals)

  if (goals === null) return null

  if (goals >= 10) {
    const classification = buildInferredClassification({ goals })

    return {
      ...classification,
      source: TEAM_LINE_CLASSIFICATION_SOURCE.INFERRED,
      evidenceLevel: classification.evidenceLevel,
      modelVersion: TEAM_LINE_CLASSIFICATION_VERSION,
    }
  }

  const minutes = toKnownNonNegativeNumber(stats.minutes)
  const teamMinutes = toKnownNonNegativeNumber(stats.teamMinutes)
  const teamGames = toKnownNonNegativeNumber(stats.teamGames)
  const starts = toKnownNonNegativeNumber(stats.starts)
  const substitutedOut = toKnownNonNegativeNumber(stats.substitutedOut)

  if (
    minutes === null ||
    teamMinutes === null ||
    teamGames === null ||
    teamGames <= 0 ||
    starts === null
  ) {
    return null
  }

  const gameMinutes = teamMinutes / teamGames
  if (!Number.isFinite(gameMinutes) || gameMinutes <= 0) return null

  const minutesRate = minutes / (games * gameMinutes)
  const substitutionRate = starts > 0
    ? (substitutedOut === null ? 0 : substitutedOut) / starts
    : 0

  if (minutesRate < 0.7) return null

  const classification = buildInferredClassification({
    minutesBand: buildMinutesBand(minutesRate),
    substitutionBand: buildSubstitutionBand(substitutionRate),
    goals,
  })

  if (!classification) return null

  return {
    ...classification,
    source: TEAM_LINE_CLASSIFICATION_SOURCE.INFERRED,
    evidenceLevel: classification.evidenceLevel,
    modelVersion: TEAM_LINE_CLASSIFICATION_VERSION,
  }
}
