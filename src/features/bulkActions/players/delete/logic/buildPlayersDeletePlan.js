// src/features/bulkActions/players/delete/logic/buildPlayersDeletePlan.js

import { PLAYERS_DELETE_SCOPE } from '../configs/playersDelete.config.js'
import { resolvePlayersDeleteScope } from './resolvePlayersDeleteScope.js'
import { buildPlayersDeleteSummary } from './buildPlayersDeleteSummary.js'
import { validatePlayersDeletePlan } from './validatePlayersDeletePlan.js'

function getPlayerId(player = {}) {
  return player?.id || player?.playerId || player?.player?.id || ''
}

export function buildPlayersDeletePlan(params = {}) {
  const {
    team = {},
    players = [],
    selectedPlayerIds = [],
    scope = PLAYERS_DELETE_SCOPE.SELECTED,
  } = params

  const scopedPlayers = resolvePlayersDeleteScope({
    scope,
    players,
    selectedPlayerIds,
  })

  const playerIds = scopedPlayers.map(getPlayerId).filter(Boolean)
  const summary = buildPlayersDeleteSummary(scopedPlayers)

  const basePlan = {
    teamId: team?.id || team?.teamId || '',
    teamName: team?.teamName || team?.name || '',
    clubName: team?.clubName || '',
    season: team?.season || team?.seasonName || '',
    scope,
    playerIds,
    players: scopedPlayers,
    summary,
    warnings: [],
    blockers: [],
  }

  const validation = validatePlayersDeletePlan(basePlan)

  return {
    ...basePlan,
    warnings: validation.warnings,
    blockers: validation.blockers,
    isValid: validation.isValid,
  }
}
