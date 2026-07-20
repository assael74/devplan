// features/playersDatabase/services/write/flows/shared.js

import {
  buildPlayerScoutResult,
} from '../../../../../shared/players/scouting/index.js'

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
  const playerStats = player.playerStats || {}

  return {
    ...player,
    primaryPosition,
    position: primaryPosition,
    positionLayer,
    numShirt,
    games: playerStats.games ?? player.games,
    goals: playerStats.goals ?? player.goals,
    yellowCards: playerStats.yellowCards ?? player.yellowCards,
    minutes: playerStats.minutes ?? player.minutes,
    starts: playerStats.starts ?? player.starts,
    subIn: playerStats.substituteIn ?? player.subIn,
    subOut: playerStats.substitutedOut ?? player.subOut,
  }
}

const buildScoutTeamForRoleUpdate = ({
  team = {},
  season = {},
} = {}) => {
  const teamStats = team.teamStats || {}

  return {
    ...team,
    season,
    games: teamStats.teamGamePlayed ?? team.teamGamePlayed ?? team.games,
    gamesPlayed: teamStats.teamGamePlayed ?? team.teamGamePlayed ?? team.gamesPlayed,
    teamGamesCount: teamStats.teamGamePlayed ?? team.teamGamePlayed ?? team.teamGamesCount,
    teamGamePlayed: teamStats.teamGamePlayed ?? team.teamGamePlayed,
    leagueTotalRound: team.leagueTotalRound ?? season.leagueTotalRound,
    leagueGameTime: team.leagueGameTime ?? season.leagueGameTime,
    goalsFor: teamStats.goalsFor ?? team.goalsFor,
    leagueGoalsFor: teamStats.goalsFor ?? team.leagueGoalsFor ?? team.goalsFor,
    teamGoals: teamStats.goalsFor ?? team.teamGoals ?? team.goalsFor,
    offense: team.offense,
    defense: team.defense,
    teamScout: team.teamScout,
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
