// src/shared/scouting/teams/context/teamContext.js

import { buildTeamCompetitionContext } from './teamCompetitionContext.js'
import { buildTeamFutureCompetitionContext } from './teamFutureCompetitionContext.js'
import { buildTeamPerformanceContext } from './teamPerformanceContext.js'

export const buildTeamScoutContext = ({
  row,
  clubLevel,
  clubStrengthLevel,
  leagueLevel,
  futureCompetitionPath,
} = {}) => {
  const source = row || {}

  return {
    competition: buildTeamCompetitionContext({
      clubLevel,
      clubStrengthLevel,
      leagueLevel,
    }),
    performance: buildTeamPerformanceContext({
      offense: source.offense,
      defense: source.defense,
    }),
    futureCompetition: buildTeamFutureCompetitionContext({ futureCompetitionPath }),
  }
}
