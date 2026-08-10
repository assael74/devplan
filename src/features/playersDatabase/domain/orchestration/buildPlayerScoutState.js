// src/features/playersDatabase/domain/orchestration/buildPlayerScoutState.js

import { buildDbPlayerScoutResult } from './buildDbPlayerScoutResult.js'
import { normalizePlayerStats } from '../../model/playerStats.model.js'
import { buildPlayerScoutCalculationContract } from '../contracts/playerScoutInput.contract.js'

const buildScoutPlayer = ({
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

const isScoutExcludedRosterStatus = player => [
  'retired',
  'transferredOut',
].includes(String(player?.rosterStatus || '').trim())

export const buildPlayerScoutState = ({
  player = {},
  team = {},
  season = {},
  perspective = 'players_database',
} = {}) => {
  if (isScoutExcludedRosterStatus(player)) {
    return {
      ...player,
      scoutSignals: [],
      scoutProfiles: [],
      scoutCombinations: [],
      bestScoutSignal: null,
      scoutCalculationStatus: 'success',
    }
  }

  const contract = buildPlayerScoutCalculationContract({
    player: buildScoutPlayer({
      player,
      primaryPosition: player.primaryPosition || '',
      positionLayer: player.positionLayer || '',
      numShirt: player.numShirt || '',
    }),
    team,
    season,
  })
  const scoutResult = buildDbPlayerScoutResult({
    player: contract.player,
    team: contract.team,
    season: contract.season,
    perspective,
  })
  const signals = Array.isArray(scoutResult?.signals)
    ? scoutResult.signals
    : []

  return {
    ...player,
    scoutSignals: signals,
    scoutProfiles: signals,
    scoutCombinations: Array.isArray(scoutResult?.combinations)
      ? scoutResult.combinations
      : [],
    bestScoutSignal: scoutResult?.bestSignal || null,
    scoutCalculationStatus: 'success',
  }
}
