// features/playersDatabase/services/cache/cacheInvalidation.js

import {
  buildLeagueDocumentCacheKey,
  buildClubSeasonIdentityIndexCacheKey,
  buildClubsMasterCacheKey,
  buildLeaguesCollectionCacheKey,
  buildLeaguesMasterCacheKey,
  buildPlayerDocumentCacheKey,
  buildTeamDocumentCacheKey,
  buildTeamSeasonDocumentCacheKey,
  PLAYERS_DATABASE_CACHE_PREFIXES,
} from './cacheKeys.js'
import {
  deleteDocumentCacheValue,
  invalidateDocumentCacheByPrefix,
} from './documentCache.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const resolveLeagueId = payload => clean(
  payload?.league?.id ||
  payload?.leagueId ||
  payload?.season?.leagueId ||
  payload?.team?.leagueId
)

const resolveTeamId = payload => clean(
  payload?.team?.birthTeamDocumentId ||
  payload?.team?.teamDocumentId ||
  payload?.team?.birthTeamId ||
  payload?.team?.teamId ||
  payload?.birthTeamDocumentId ||
  payload?.teamDocumentId ||
  payload?.birthTeamId ||
  payload?.teamId
)

const resolvePlayerId = payload => clean(
  payload?.player?.playerDocumentId ||
  payload?.playerDocumentId ||
  payload?.player?.playerId ||
  payload?.playerId
)

const resolveSeasonKey = payload => clean(
  payload?.season?.seasonKey ||
  payload?.season?.seasonId ||
  payload?.seasonKey ||
  payload?.seasonId
)

const resolveBirthYear = payload => Number(
  payload?.season?.birthYear ||
  payload?.birthYear ||
  payload?.team?.birthYear ||
  0
) || 0

export const invalidateLeagueDocumentCache = leagueId => {
  const safeLeagueId = clean(leagueId)
  if (safeLeagueId) {
    deleteDocumentCacheValue(buildLeagueDocumentCacheKey(safeLeagueId))
  }

  deleteDocumentCacheValue(buildLeaguesCollectionCacheKey())
}

export const invalidateTeamDocumentCache = teamId => {
  const safeTeamId = clean(teamId)
  if (safeTeamId) {
    deleteDocumentCacheValue(buildTeamDocumentCacheKey(safeTeamId))
  }

  invalidateDocumentCacheByPrefix(PLAYERS_DATABASE_CACHE_PREFIXES.teams)
  invalidateDocumentCacheByPrefix(PLAYERS_DATABASE_CACHE_PREFIXES.teamSeason)
}

export const invalidateTeamSeasonDocumentCache = teamSeasonDocumentId => {
  const safeTeamSeasonDocumentId = clean(teamSeasonDocumentId)
  if (safeTeamSeasonDocumentId) {
    deleteDocumentCacheValue(buildTeamSeasonDocumentCacheKey(safeTeamSeasonDocumentId))
  }
}

export const invalidatePlayerDocumentCache = playerId => {
  const safePlayerId = clean(playerId)
  if (!safePlayerId) return

  deleteDocumentCacheValue(buildPlayerDocumentCacheKey(safePlayerId))
}

export const invalidateLeaguesMasterDocumentCache = () => {
  deleteDocumentCacheValue(buildLeaguesMasterCacheKey())
}

export const invalidateClubsMasterDocumentCache = () => {
  deleteDocumentCacheValue(buildClubsMasterCacheKey())
}

export const invalidateClubSeasonIdentityIndexCache = ({
  seasonKey,
  birthYear,
} = {}) => {
  if (!clean(seasonKey) || !Number(birthYear)) return

  deleteDocumentCacheValue(buildClubSeasonIdentityIndexCacheKey({
    seasonKey,
    birthYear,
  }))
}

const LEAGUE_ONLY_ACTIONS = new Set([
  'ensureLeagueDoc',
  'upsertLeagueSeason',
  'updateLeagueSeasonTableRank',
  'pasteLeagueTable',
  'updateLeagueSeasonUrl',
  'updateLeagueSeasonSettings',
  'deleteLeagueSeason',
])

const TEAM_ACTIONS = new Set([
  'pasteTeamPlayers',
  'pasteTeamPlayerStats',
  'updateTeamUrl',
  'clearTeamSeasonPlayers',
  'clearTeamSeasonStats',
  'deleteTeamPlayerFromSeason',
  'createTeamDisplayPlayer',
])

const PLAYER_ACTIONS = new Set([
  'updatePlayerSeasonNotes',
  'updatePlayerSeasonRole',
  'removePlayerScoutProfile',
  'updatePlayerSeasonUrl',
  'updatePlayerAgent',
  'updatePlayerSeasonGoalDistribution',
])

export const invalidatePlayersDatabaseWriteCache = ({
  actionType,
  payload = {},
} = {}) => {
  const leagueId = resolveLeagueId(payload)
  const teamId = resolveTeamId(payload)
  const playerId = resolvePlayerId(payload)
  const seasonKey = resolveSeasonKey(payload)
  const birthYear = resolveBirthYear(payload)

  if (LEAGUE_ONLY_ACTIONS.has(actionType)) {
    invalidateLeagueDocumentCache(leagueId)
    invalidateLeaguesMasterDocumentCache()
    invalidateClubsMasterDocumentCache()
    invalidateClubSeasonIdentityIndexCache({ seasonKey, birthYear })
  }

  if (TEAM_ACTIONS.has(actionType)) {
    invalidateLeagueDocumentCache(leagueId)
    invalidateTeamDocumentCache(teamId)
    invalidateDocumentCacheByPrefix(PLAYERS_DATABASE_CACHE_PREFIXES.player)
    invalidateLeaguesMasterDocumentCache()
  }

  if (PLAYER_ACTIONS.has(actionType)) {
    invalidatePlayerDocumentCache(playerId)

    if (teamId) {
      invalidateTeamDocumentCache(teamId)
    }

    if (leagueId) {
      invalidateLeagueDocumentCache(leagueId)
    }
  }


  if (actionType === 'clearLeagueSeasonTeams') {
    invalidateLeagueDocumentCache(leagueId)
    invalidateDocumentCacheByPrefix(PLAYERS_DATABASE_CACHE_PREFIXES.team)
    invalidateDocumentCacheByPrefix(PLAYERS_DATABASE_CACHE_PREFIXES.teams)
    invalidateDocumentCacheByPrefix(PLAYERS_DATABASE_CACHE_PREFIXES.player)
    invalidateLeaguesMasterDocumentCache()
    invalidateClubsMasterDocumentCache()
    invalidateClubSeasonIdentityIndexCache({ seasonKey, birthYear })
  }
}
