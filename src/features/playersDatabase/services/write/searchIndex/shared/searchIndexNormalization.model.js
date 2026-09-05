// features/playersDatabase/services/write/searchIndex/shared/searchIndexNormalization.model.js

import { resolvePlayersDatabaseLeagueGameTime } from '../../../../catalog/leagues.catalog.js'

export const SEARCH_INDEX_NORMALIZATION_VERSION = 1

const toSafeNumber = value => {
  const nextValue = Number(value)
  return Number.isFinite(nextValue) ? nextValue : 0
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const roundMetric = (value, digits = 3) => {
  const nextValue = toSafeNumber(value)
  const factor = 10 ** digits
  return Math.round(nextValue * factor) / factor
}

const roundSearchValue = value => Math.round(toSafeNumber(value))

const resolveSeasonProjectionState = ({
  target = 'current',
  seasonStatus = '',
  gamesPlayed = 0,
  leagueTotalRound = 0,
} = {}) => {
  const safeGamesPlayed = Math.max(0, toSafeNumber(gamesPlayed))
  const safeLeagueTotalRound = Math.max(0, toSafeNumber(leagueTotalRound))
  const remainingTeamGames = Math.max(0, safeLeagueTotalRound - safeGamesPlayed)
  const hasProjectionBase = safeGamesPlayed > 0 && safeLeagueTotalRound > 0
  const normalizedSeasonStatus = String(seasonStatus || '').trim().toLowerCase()
  const isCompleted = (
    normalizedSeasonStatus === 'completed' ||
    String(target || '').trim() === 'history' ||
    remainingTeamGames === 0
  )
  const canProject = !isCompleted && hasProjectionBase

  return {
    seasonStatus: isCompleted ? 'completed' : 'active',
    normalizationStatus: canProject ? 'projected' : 'final',
    remainingTeamGames,
    canProject,
  }
}

export const buildPlayerSeasonSearchMetrics = ({
  target = 'current',
  ageGroupId = '',
  seasonStatus = '',
  leagueTotalRound = 0,
  teamGamePlayed = 0,
  stats = {},
} = {}) => {
  const games = Math.max(0, toSafeNumber(stats.games))
  const goals = Math.max(0, toSafeNumber(stats.goals))
  const minutes = Math.max(0, toSafeNumber(stats.minutes))
  const starts = Math.max(0, toSafeNumber(stats.starts))
  const safeTeamGamePlayed = Math.max(
    0,
    toSafeNumber(teamGamePlayed)
  )
  const gameMinutes = resolvePlayersDatabaseLeagueGameTime(ageGroupId)
  const state = resolveSeasonProjectionState({
    target,
    seasonStatus,
    gamesPlayed: safeTeamGamePlayed,
    leagueTotalRound,
  })
  const teamMinutesPlayed = safeTeamGamePlayed * gameMinutes
  const minutesShareRate = teamMinutesPlayed > 0
    ? clamp(minutes / teamMinutesPlayed, 0, 1)
    : 0
  const remainingTeamMinutes = state.remainingTeamGames * gameMinutes
  const projectedRemainingMinutes = state.canProject
    ? remainingTeamMinutes * minutesShareRate
    : 0
  const projectedMinutesRaw = state.canProject
    ? minutes + projectedRemainingMinutes
    : minutes
  const goalsPerMinute = minutes > 0 ? goals / minutes : 0
  const projectedGoalsRaw = state.canProject
    ? goals + (goalsPerMinute * projectedRemainingMinutes)
    : goals
  const seasonFactor = state.canProject && safeTeamGamePlayed > 0
    ? Math.max(1, toSafeNumber(leagueTotalRound) / safeTeamGamePlayed)
    : 1
  const projectedGamesRaw = state.canProject ? games * seasonFactor : games
  const projectedStartsRaw = state.canProject ? starts * seasonFactor : starts
  const goalsPer90 = minutes > 0 ? (goals / minutes) * 90 : 0
  const goalsPerGameDuration = minutes > 0
    ? (goals / minutes) * gameMinutes
    : 0

  return {
    gameMinutes,
    seasonStatus: state.seasonStatus,
    normalizationStatus: state.normalizationStatus,
    normalizationVersion: SEARCH_INDEX_NORMALIZATION_VERSION,
    remainingTeamGames: state.remainingTeamGames,
    teamMinutesPlayed: roundSearchValue(teamMinutesPlayed),
    minutesShareRate: roundMetric(minutesShareRate),
    projectedRemainingMinutes: roundMetric(projectedRemainingMinutes),
    projectedMinutesRaw: roundMetric(projectedMinutesRaw),
    projectedMinutes: roundSearchValue(projectedMinutesRaw),
    projectedGoalsRaw: roundMetric(projectedGoalsRaw),
    projectedGoals: roundSearchValue(projectedGoalsRaw),
    projectedGamesRaw: roundMetric(projectedGamesRaw),
    projectedGames: roundSearchValue(projectedGamesRaw),
    projectedStartsRaw: roundMetric(projectedStartsRaw),
    projectedStarts: roundSearchValue(projectedStartsRaw),
    goalsPer90: roundMetric(goalsPer90),
    goalsPerGameDuration: roundMetric(goalsPerGameDuration),
  }
}

export const buildTeamSeasonSearchMetrics = ({
  target = 'current',
  seasonStatus = '',
  leagueTotalRound = 0,
  teamGamePlayed = 0,
  points = 0,
  goalsFor = 0,
  goalsAgainst = 0,
} = {}) => {
  const safeGamesPlayed = Math.max(0, toSafeNumber(teamGamePlayed))
  const safePoints = Math.max(0, toSafeNumber(points))
  const safeGoalsFor = Math.max(0, toSafeNumber(goalsFor))
  const safeGoalsAgainst = Math.max(0, toSafeNumber(goalsAgainst))
  const state = resolveSeasonProjectionState({
    target,
    seasonStatus,
    gamesPlayed: safeGamesPlayed,
    leagueTotalRound,
  })
  const seasonFactor = state.canProject && safeGamesPlayed > 0
    ? Math.max(1, toSafeNumber(leagueTotalRound) / safeGamesPlayed)
    : 1
  const projectedPointsRaw = safePoints * seasonFactor
  const projectedGoalsForRaw = safeGoalsFor * seasonFactor
  const projectedGoalsAgainstRaw = safeGoalsAgainst * seasonFactor
  const projectedTeamGamePlayedRaw = state.canProject
    ? toSafeNumber(leagueTotalRound)
    : safeGamesPlayed

  return {
    seasonStatus: state.seasonStatus,
    normalizationStatus: state.normalizationStatus,
    normalizationVersion: SEARCH_INDEX_NORMALIZATION_VERSION,
    remainingTeamGames: state.remainingTeamGames,
    projectedPointsRaw: roundMetric(projectedPointsRaw),
    projectedPoints: roundSearchValue(projectedPointsRaw),
    projectedGoalsForRaw: roundMetric(projectedGoalsForRaw),
    projectedGoalsFor: roundSearchValue(projectedGoalsForRaw),
    projectedGoalsAgainstRaw: roundMetric(projectedGoalsAgainstRaw),
    projectedGoalsAgainst: roundSearchValue(projectedGoalsAgainstRaw),
    projectedTeamGamePlayedRaw: roundMetric(projectedTeamGamePlayedRaw),
    projectedTeamGamePlayed: roundSearchValue(projectedTeamGamePlayedRaw),
  }
}
