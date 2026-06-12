// src/features/bulkActions/games/delete/logic/buildGamesDeletePlan.js

import { GAMES_DELETE_SCOPE } from '../configs/gamesDelete.config.js'
import { resolveGamesDeleteScope } from './resolveGamesDeleteScope.js'
import { buildGamesDeleteSummary } from './buildGamesDeleteSummary.js'
import { validateGamesDeletePlan } from './validateGamesDeletePlan.js'

const getGameId = game => game?.id || game?.gameId

export function buildGamesDeletePlan(params = {}) {
  const {
    team = {},
    games = [],
    selectedGameIds = [],
    scope = GAMES_DELETE_SCOPE.SELECTED,
  } = params

  const scopedGames = resolveGamesDeleteScope({
    scope,
    games,
    selectedGameIds,
  })

  const gameIds = scopedGames.map(getGameId).filter(Boolean)

  const summary = buildGamesDeleteSummary(scopedGames)

  const basePlan = {
    teamId: team?.id || team?.teamId || '',
    teamName: team?.teamName || team?.name || '',
    clubName: team?.clubName || '',
    season: team?.season || team?.seasonName || '',
    scope,
    gameIds,
    games: scopedGames,
    summary,
    warnings: [],
    blockers: [],
  }

  const validation = validateGamesDeletePlan(basePlan)

  return {
    ...basePlan,
    warnings: validation.warnings,
    blockers: validation.blockers,
    isValid: validation.isValid,
  }
}
