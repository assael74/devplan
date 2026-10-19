// src/features/playersDatabase/model/team/teamPriorityContext.model.js

import {
  buildTeamScoutLeagueModel,
  TEAM_SCOUT_NORMALIZATION_MODE,
} from '../../../../shared/scouting/teams/index.js'

export const buildTeamPriorityContext = (row = {}, result = {}) => ({
  benchmark: row.benchmark || null,
  projectedGoalsFor: row.projectedGoalsFor,
  projectedGoalsAgainst: row.projectedGoalsAgainst,
  goalsForRank: row.goalsForRank,
  goalsAgainstRank: row.goalsAgainstRank,
  teamsCount: result.teamsCount,
  offense: row.offense,
  defense: row.defense,
})

export const buildLeaguePriorityContexts = ({ season = {}, leagueLevel } = {}) => {
  const factor = season.performanceCalculation?.appliedFactor
  if (!(leagueLevel > 0) || !(season.leagueTotalRound > 0) || !(factor > 0)) return {}

  // Reuse the saved league adjustment, so the explanation follows the stored score.
  const result = buildTeamScoutLeagueModel({
    leagueLevel,
    leagueNumGames: season.leagueTotalRound,
    normalizationMode: TEAM_SCOUT_NORMALIZATION_MODE.MANUAL,
    normalizationFactor: factor,
    rows: Object.entries(season.table?.teamsById || {}).map(([teamId, team]) => ({
      teamId,
      position: team.officialTable?.rank,
      gamesPlayed: team.officialTable?.teamGamePlayed,
      goalsFor: team.officialTable?.goalsFor,
      goalsAgainst: team.officialTable?.goalsAgainst,
      points: team.officialTable?.points,
    })),
  })

  return Object.fromEntries(result.rows.map(row => [
    row.teamId,
    buildTeamPriorityContext(row, result),
  ]))
}
