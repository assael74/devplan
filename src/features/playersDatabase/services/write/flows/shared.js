// features/playersDatabase/services/write/flows/shared.js

import {
  buildPlayerScoutResult,
} from '../../../../../shared/players/scouting/index.js'
import { buildPlayerScoutCalculationContract } from '../../../domain/index.js'
import {
  normalizePlayerStats,
  PLAYER_STATS_STATUS,
} from '../../../model/playerStats.model.js'
export { buildScoutProfilesSummary } from '../../../model/scoutProfilesSummary.model.js'

export const SCOUT_SYNC_MODE = {
  PRESERVE: 'preserve',
  REPLACE: 'replace',
}

export const resolveScoutSyncMode = ({ season = {} } = {}) => (
  String(season.seasonStatus || '').trim().toLowerCase() === 'completed'
    ? SCOUT_SYNC_MODE.PRESERVE
    : SCOUT_SYNC_MODE.REPLACE
)

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

const isScoutExcludedRosterStatus = player => [
  'retired',
  'transferredOut',
].includes(String(player?.rosterStatus || '').trim())

export const buildPlayerWithScoutSignals = ({
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
    player: buildScoutPlayerForRoleUpdate({
      player,
      primaryPosition: player.primaryPosition || '',
      positionLayer: player.positionLayer || '',
      numShirt: player.numShirt || '',
    }),
    team,
    season,
  })
  const scoutResult = buildPlayerScoutResult({
    player: contract.player,
    team: contract.team,
    season: contract.season,
    perspective,
  })

  return {
    ...player,
    scoutSignals: Array.isArray(scoutResult?.signals)
      ? scoutResult.signals
      : [],
    scoutProfiles: Array.isArray(scoutResult?.signals)
      ? scoutResult.signals
      : [],
    scoutCombinations: Array.isArray(scoutResult?.combinations)
      ? scoutResult.combinations
      : [],
    bestScoutSignal: scoutResult?.bestSignal || null,
    scoutCalculationStatus: 'success',
  }
}

export const buildStatsPlayersWithScoutSignals = ({
  players = [],
  team = {},
  season = {},
} = {}) => (Array.isArray(players) ? players : []).map(player => (
  buildPlayerWithScoutSignals({
    player: {
      ...player,
      statsStatus: PLAYER_STATS_STATUS.LOADED,
      scoutSignals: undefined,
      scoutProfiles: undefined,
      scoutCombinations: undefined,
      bestScoutSignal: undefined,
    },
    team,
    season,
    perspective: 'players_database_stats_write',
  })
))

export const buildRoleUpdatedPlayerWithScoutSignals = (payload = {}) => {
  const player = payload.player || {}
  const rolePlayer = {
    ...player,
    primaryPosition: payload.primaryPosition || player.primaryPosition || '',
    positionLayer: payload.positionLayer || player.positionLayer || '',
    numShirt: payload.numShirt || player.numShirt || '',
  }

  return buildPlayerWithScoutSignals({
    player: rolePlayer,
    team: payload.team || {},
    season: payload.season || {},
    perspective: 'players_database_role_update',
  })
}
