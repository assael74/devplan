// hub/playerProfile/modules/games/logic/playerGames.filters.logic.js

import { createGameRowNormalizer } from '../../../../../../shared/games/games.normalize.logic.js'
import { createInitialPlayerGamesFilters as createInitialFilters } from './playerGames.filters.constants.js'
import {
  applyPlayerGamesFilters,
  buildPlayerGamesSummary,
} from './playerGames.filters.apply.js'
import {
  buildPlayerGamesOptions,
  buildPlayerGamesIndicators,
} from './playerGames.filters.options.js'

const normalize = createGameRowNormalizer({})

export const createInitialPlayerGamesFilters = () => createInitialFilters()

export const resolvePlayerGamesFiltersDomain = (player, filters) => {
  const raw = Array.isArray(player?.playerGames) ? player.playerGames : []

  const normalized = raw.map(normalize)

  const enriched = normalized.map((row) => ({
    ...row,
    player: player || null,
    team: row?.team || row?.game?.team || player?.team || null,
  }))

  const filtered = applyPlayerGamesFilters(enriched, filters)

  return {
    games: filtered,
    summary: buildPlayerGamesSummary(enriched, filtered, filters),
    options: buildPlayerGamesOptions(enriched),
    indicators: buildPlayerGamesIndicators(filters),
  }
}
