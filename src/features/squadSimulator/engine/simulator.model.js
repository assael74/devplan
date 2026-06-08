// src/features/squadSimulator/engine/simulator.model.js

import {
  resolveTeamTargetBenchmark,
} from '../../../shared/teams/targets/index.js'
import {
  SQUAD_TARGET_SIMULATOR_SOURCE,
} from './simulator.constants.js'
import {
  buildTargetContext,
  normalizeSeasonContext,
} from './simulator.normalize.js'
import {
  buildSquadTargetPlayerRows,
} from './simulator.playerTargets.js'
import {
  buildGoalTierSummary,
  buildRoleSummary,
  buildSquadTargetTotals,
} from './simulator.summary.js'

export const buildSquadTargetSimulatorModel = ({
  team = {},
  players = [],
  targetPositionMode,
  targetPosition,
  targetPositionProfile,
  targetProfileId,
  leagueNumGames,
  leagueGameTime,
  squadSize,
} = {}) => {
  const teamBenchmark = resolveTeamTargetBenchmark({
    targetPositionMode: targetPositionMode || team?.targetPositionMode,
    targetPosition: targetPosition || team?.targetPosition,
    targetPositionProfile:
      targetPositionProfile || team?.targetPositionProfile,
    targetProfileId: targetProfileId || team?.targetProfileId,
  })

  const targetContext = buildTargetContext({
    team,
    teamBenchmark,
    targetPositionMode,
    targetPosition,
    targetPositionProfile,
    targetProfileId,
  })

  const seasonContext = normalizeSeasonContext({
    team,
    leagueNumGames,
    leagueGameTime,
    squadSize,
  })

  const rows = buildSquadTargetPlayerRows({
    players,
    team: {
      ...team,
      targetPositionProfile: targetContext.targetPositionProfile,
      targetProfileId: targetContext.targetProfileId,
      leagueNumGames: seasonContext.leagueNumGames,
      leagueGameTime: seasonContext.leagueGameTime,
      squadSize: seasonContext.squadSize,
    },
    targetPositionProfile: targetContext.targetPositionProfile,
    leagueNumGames: seasonContext.leagueNumGames,
    leagueGameTime: seasonContext.leagueGameTime,
  })

  const goalTiers = buildGoalTierSummary({
    rows,
    teamBenchmark,
  })

  const totals = buildSquadTargetTotals({
    rows,
    teamBenchmark,
  })

  return {
    hasModel: Boolean(teamBenchmark && targetContext.targetPositionProfile),
    source: SQUAD_TARGET_SIMULATOR_SOURCE,
    version: 1,
    team,
    targetContext,
    seasonContext,
    teamBenchmark,
    rows,
    summaries: {
      goalTiers,
      roles: buildRoleSummary(rows),
    },
    totals,
    diagnostics: {
      playersCount: rows.length,
      playersWithoutBenchmark: rows.filter((row) => !row.hasBenchmark).length,
      missingTeamBenchmark: !teamBenchmark,
    },
  }
}
