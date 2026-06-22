// src/features/playersDatabase/scouting/adapter.js

import {
  buildPlayersScoutSignals,
  buildTeamDrilldown,
} from '../../../shared/players/scouting/index.js'

const withTeamContext = ({ row, teamsById = {} }) => {
  const team =
    row?.team ||
    teamsById[row?.teamId] ||
    teamsById[row?.teamName] ||
    {}

  return {
    ...row,
    team: {
      ...team,
      goalsFor: team?.goalsFor ?? row?.teamGoalsFor ?? row?.teamGoals,
      gamesPlayed: team?.gamesPlayed ?? row?.teamGames,
      leagueGameTime: team?.leagueGameTime ?? row?.leagueGameTime,
      birthYear: team?.birthYear ?? row?.teamBirthYear,
    },
  }
}

export const buildPlayersDatabaseScoutCandidates = ({
  rows,
  teamsById,
  league,
  settings,
  profiles,
} = {}) => {
  const players = (Array.isArray(rows) ? rows : []).map((row) => {
    return withTeamContext({ row, teamsById })
  })

  return players.flatMap((player) => {
    const drilldown = buildTeamDrilldown({
      team: player.team,
      league,
      settings,
      profiles,
    })
    const candidates = buildPlayersScoutSignals({
      players: [player],
      perspective: drilldown.perspective,
      searchDistance: drilldown.settings?.searchDistance || 0,
      profiles: drilldown.profiles,
    })

    return candidates.map((candidate) => {
      const best = candidate.bestSignal

      return {
        player: candidate.player,
        playerId: candidate.playerId,
        signals: candidate.signals,
        bestSignal: best,
        teamDrilldown: drilldown,
        scoutDiscovery: {
          profileId: best?.profileId || '',
          profileLabel: best?.profileLabel || '',
          interestLevel: best?.interestLevel || '',
          reliabilityLevel: best?.reliability?.level || '',
          reliabilityScore: best?.reliability?.score || 0,
          score: best?.score || 0,
          warnings: best?.warnings || [],
          requiredReview: best?.requiredReview || [],
        },
      }
    })
  })
}
