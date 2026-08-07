// src/features/playersDatabase/services/write/flows/shared.js

import { buildPlayerScoutState } from '../../../domain/orchestration/buildPlayerScoutState.js'
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

export const buildPlayerWithScoutSignals = payload => (
  buildPlayerScoutState(payload)
)

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
