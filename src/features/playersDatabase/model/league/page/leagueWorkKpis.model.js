// src/features/playersDatabase/model/league/page/leagueWorkKpis.model.js

import {
  groupTeamsByResearchWork,
  groupTeamsByStrongSignalCount,
  groupTeamsByStrongSignalMinimum,
  readTeamSignalStrength,
} from '../../../domain/signals/teamSignalSummary.js'
import { TEAM_SCOUT_PRIORITY_LEVEL } from '../../../../../shared/scouting/teams/teamScout.model.js'

const POSITIVE_PRIORITIES = [
  TEAM_SCOUT_PRIORITY_LEVEL.POSITIVE,
  TEAM_SCOUT_PRIORITY_LEVEL.HIGH,
  TEAM_SCOUT_PRIORITY_LEVEL.ELITE,
]

export const buildLeagueWorkKpis = ({ teams = [], leagueLevel } = {}) => {
  const allTeamsRequired = Number(leagueLevel) === 1
  const loadTargets = teams.filter(team => (
    allTeamsRequired ||
    POSITIVE_PRIORITIES.includes(team.attackPriority) ||
    POSITIVE_PRIORITIES.includes(team.defensePriority)
  ))
  const loading = {
    allTeamsRequired,
    targetsCount: loadTargets.length,
    missingStatsCount: 0,
    gamesGapCount: 0,
    unknownGapCount: 0,
  }
  const teamsByFilter = {
    all: teams,
    missingStats: [],
    incompleteStats: teams.filter(team => team.statsComplete !== true),
    gamesGap: [],
    unknownGap: [],
    strongSignals: [],
    watchSignals: [],
    unmarkedInvestigation: [],
    ...groupTeamsByResearchWork(teams),
    ...groupTeamsByStrongSignalCount(teams),
    ...groupTeamsByStrongSignalMinimum(teams),
  }
  for (const team of loadTargets) {
    if (team.hasStats !== true) {
      teamsByFilter.missingStats.push(team)
    } else if (!Number.isFinite(team.statsStatus?.gap)) {
      teamsByFilter.unknownGap.push(team)
    } else if (team.statsStatus.gap !== 0) {
      teamsByFilter.gamesGap.push(team)
    }
  }
  loading.missingStatsCount = teamsByFilter.missingStats.length
  loading.gamesGapCount = teamsByFilter.gamesGap.length
  loading.unknownGapCount = teamsByFilter.unknownGap.length

  for (const team of teams) {
    const strength = readTeamSignalStrength(team.teamSignalSummary)
    const strong = strength === 'strong'
    const watch = strength === 'watch'
    if (strong) teamsByFilter.strongSignals.push(team)
    else if (watch) teamsByFilter.watchSignals.push(team)
    if ((strong || watch) && team.showInvestigationIndicator !== true) {
      teamsByFilter.unmarkedInvestigation.push(team)
    }
  }
  const research = {
    strongCount: teamsByFilter.strongSignals.length,
    watchOnlyCount: teamsByFilter.watchSignals.length,
    unmarkedCount: teamsByFilter.unmarkedInvestigation.length,
  }

  return { teamsCount: teams.length, loading, research, teamsByFilter }
}
