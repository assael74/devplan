// features/playersDatabase/model/teamStats.model.js

import {
  hasValue,
  pickFirstValue,
  toNumberOrZero,
} from './value.model.js'

const pickCandidates = (candidates = []) => {
  const match = candidates.find(hasValue)

  return match === undefined ? '' : match
}

const resolveNumber = ({ candidates = [], fallbackCandidates = [] } = {}) => {
  const directValue = pickCandidates(candidates)
  if (hasValue(directValue)) return toNumberOrZero(directValue)

  return toNumberOrZero(pickCandidates(fallbackCandidates))
}

export const normalizeTeamStats = (
  team = {},
  {
    season = {},
    gamesCandidates = [],
    goalsForCandidates = [],
    goalsAgainstCandidates = [],
    pointsCandidates = [],
  } = {}
) => {
  const stats = team.teamStats || {}

  const gamesPlayed = resolveNumber({
    candidates: gamesCandidates,
    fallbackCandidates: [
      team.gamesPlayed,
      team.games,
      team.teamGamePlayed,
      stats.gamesPlayed,
      stats.teamGamePlayed,
      season.gamesPlayed,
      season.teamGamePlayed,
    ],
  })
  const goalsFor = resolveNumber({
    candidates: goalsForCandidates,
    fallbackCandidates: [
      team.goalsFor,
      stats.goalsFor,
      team.leagueGoalsFor,
      team.teamGoals,
      season.goalsFor,
    ],
  })
  const goalsAgainst = resolveNumber({
    candidates: goalsAgainstCandidates,
    fallbackCandidates: [
      team.goalsAgainst,
      stats.goalsAgainst,
      team.leagueGoalsAgainst,
      season.goalsAgainst,
    ],
  })
  const points = resolveNumber({
    candidates: pointsCandidates,
    fallbackCandidates: [team.points, stats.points, season.points],
  })

  return {
    gamesPlayed,
    goalsFor,
    goalsAgainst,
    wins: resolveNumber({ fallbackCandidates: [team.wins, stats.wins, season.wins] }),
    draws: resolveNumber({ fallbackCandidates: [team.draws, stats.draws, season.draws] }),
    losses: resolveNumber({ fallbackCandidates: [team.losses, stats.losses, season.losses] }),
    points,
    attackPerformance: pickFirstValue(
      team.attackPerformance,
      stats.attackPerformance,
      team.offense?.priorityRate,
      team.offense?.scoutPriorityRate
    ),
    defensePerformance: pickFirstValue(
      team.defensePerformance,
      stats.defensePerformance,
      team.defense?.priorityRate,
      team.defense?.scoutPriorityRate
    ),
  }
}

export const buildTeamStatsAliases = (teamStats = {}) => ({
  games: toNumberOrZero(teamStats.gamesPlayed),
  gamesPlayed: toNumberOrZero(teamStats.gamesPlayed),
  teamGamesCount: toNumberOrZero(teamStats.gamesPlayed),
  teamGamePlayed: toNumberOrZero(teamStats.gamesPlayed),
  goalsFor: toNumberOrZero(teamStats.goalsFor),
  leagueGoalsFor: toNumberOrZero(teamStats.goalsFor),
  teamGoals: toNumberOrZero(teamStats.goalsFor),
  goalsAgainst: toNumberOrZero(teamStats.goalsAgainst),
})
