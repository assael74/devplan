// features/playersDatabase/services/write/flows/shared.js

import {
  buildPlayerScoutResult,
} from '../../../../../shared/players/scouting/index.js'
import { normalizePlayerStats } from '../../../model/playerStats.model.js'
import {
  buildTeamStatsAliases,
  normalizeTeamStats,
} from '../../../model/teamStats.model.js'

export const buildScoutProfilesSummary = (players = []) => {
  const profileCounts = {}
  let total = 0

  ;(Array.isArray(players) ? players : []).forEach(player => {
    const signals = Array.isArray(player?.scoutSignals) ? player.scoutSignals : []
    if (!signals.length) return

    total += 1
    signals.forEach(signal => {
      const profileId = String(signal?.profileId || '').trim()
      if (!profileId) return

      profileCounts[profileId] = (profileCounts[profileId] || 0) + 1
    })
  })

  return {
    total,
    profileCounts,
  }
}

const buildScoutPlayerForRoleUpdate = ({
  player = {},
  primaryPosition = '',
  positionLayer = '',
  numShirt = '',
} = {}) => {
  const playerStats = normalizePlayerStats(player)

  return {
    ...player,
    primaryPosition,
    position: primaryPosition,
    positionLayer,
    numShirt,
    games: playerStats.games,
    goals: playerStats.goals,
    yellowCards: playerStats.yellowCards,
    minutes: playerStats.minutes,
    starts: playerStats.starts,
    subIn: playerStats.substituteIn,
    subOut: playerStats.substitutedOut,
    playerStats,
  }
}

const buildScoutTeamForRoleUpdate = ({
  team = {},
  season = {},
} = {}) => {
  const teamStats = normalizeTeamStats(team, {
    season,
    gamesCandidates: [
      team.teamStats?.teamGamePlayed,
      team.teamGamePlayed,
      team.games,
      team.gamesPlayed,
    ],
    goalsForCandidates: [team.teamStats?.goalsFor, team.goalsFor],
  })

  return {
    ...team,
    season,
    ...buildTeamStatsAliases(teamStats),
    leagueTotalRound: team.leagueTotalRound ?? season.leagueTotalRound,
    leagueGameTime: team.leagueGameTime ?? season.leagueGameTime,
    offense: team.offense,
    defense: team.defense,
    teamScout: team.teamScout,
    teamStats: {
      ...(team.teamStats || {}),
      gamesPlayed: teamStats.gamesPlayed,
      teamGamePlayed: teamStats.gamesPlayed,
      goalsFor: teamStats.goalsFor,
      goalsAgainst: teamStats.goalsAgainst,
    },
  }
}

export const buildRoleUpdatedPlayerWithScoutSignals = (payload = {}) => {
  const player = payload.player || {}
  const primaryPosition = payload.primaryPosition || player.primaryPosition || ''
  const positionLayer = payload.positionLayer || player.positionLayer || ''
  const numShirt = payload.numShirt || player.numShirt || ''
  const rolePlayer = {
    ...player,
    primaryPosition,
    positionLayer,
    numShirt,
  }
  const scoutResult = buildPlayerScoutResult({
    player: buildScoutPlayerForRoleUpdate({
      player: rolePlayer,
      primaryPosition,
      positionLayer,
      numShirt,
    }),
    team: buildScoutTeamForRoleUpdate({
      team: payload.team || {},
      season: payload.season || {},
    }),
    season: payload.season || {},
    perspective: 'players_database_role_update',
  })

  return {
    ...rolePlayer,
    scoutSignals: scoutResult.signals,
    scoutCombinations: scoutResult.combinations,
    bestScoutSignal: scoutResult.bestSignal,
  }
}
