// teamProfile/sharedLogic/games/moduleLogic/teamGames.filters.logic.js

import { createGameRowNormalizer } from '../../../../../../shared/games/games.normalize.logic.js'

import { createInitialTeamGamesFilters } from './teamGames.filters.constants.js'
import {
  applyTeamGamesFilters,
  buildTeamGamesSummary,
} from './teamGames.filters.apply.js'
import {
  buildTeamGamesOptions,
  buildTeamGamesIndicators,
} from './teamGames.filters.options.js'
import { enrichGameWithTeam } from './teamGames.filters.enrich.js'

const normalize = createGameRowNormalizer({})

export { createInitialTeamGamesFilters }

export const resolveTeamGamesFiltersDomain = (team, filters) => {
  const raw = Array.isArray(team?.teamGames) ? team.teamGames : []

  const normalized = raw.map(normalize)
  const enriched = normalized.map((game) => enrichGameWithTeam(game, team))
  const filtered = applyTeamGamesFilters(enriched, filters)

  return {
    games: filtered,
    summary: buildTeamGamesSummary(enriched, filtered, filters),
    options: buildTeamGamesOptions(enriched),
    indicators: buildTeamGamesIndicators(filters),
  }
}
