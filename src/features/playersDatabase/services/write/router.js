// src/features/playersDatabase/services/write/router.js

import { invalidatePlayersDatabaseWriteCache } from '../cache/index.js'
import {
  rememberLastWriteAuditScopeFromResult,
} from '../audit/audit.lastWrite.js'
import {
  ensureLeagueDoc,
  updateLeagueSeasonTableRank,
} from './leagues/index.js'
import {
  addFavoriteFlow,
  clearLeagueSeasonTeamsFlow,
  clearTeamSeasonPlayersFlow,
  clearTeamSeasonStatsFlow,
  createLeagueSeasonFlow,
  createTeamDisplayPlayerFlow,
  createTeamOfficialPlayerFlow,
  deleteLeagueSeasonFlow,
  deleteTeamFromSeasonFlow,
  deleteTeamPlayerFromSeasonFlow,
  pasteLeagueTableFlow,
  pasteTeamPlayerStatsFlow,
  pasteTeamPlayersFlow,
  removeFavoriteFlow,
  removePlayerScoutProfileFlow,
  updateLeagueSeasonMetaFlow,
  updateLeagueSeasonUrlFlow,
  updatePlayerRoleFlow,
  updatePlayerScoutReviewFlow,
  updatePlayerSeasonNotesFlow,
  updatePlayerVerificationFlow,
  updatePlayerSeasonUrlFlow,
  updateTeamUrlFlow,
} from './flows/index.js'
import {
  ensureManualScoutingPlayerDoc,
  ensureTransferredScoutingPlayerDoc,
  ensureWatchlistScoutingPlayerDoc,
} from './players/index.js'

export const PLAYERS_DATABASE_WRITE_ACTIONS = {
  ENSURE_LEAGUE_DOC: 'ensureLeagueDoc',
  UPSERT_LEAGUE_SEASON: 'upsertLeagueSeason',
  UPDATE_LEAGUE_SEASON_TABLE_RANK: 'updateLeagueSeasonTableRank',
  PASTE_LEAGUE_TABLE: 'pasteLeagueTable',
  PASTE_TEAM_PLAYERS: 'pasteTeamPlayers',
  PASTE_TEAM_PLAYER_STATS: 'pasteTeamPlayerStats',
  UPDATE_TEAM_URL: 'updateTeamUrl',
  CLEAR_LEAGUE_SEASON_TEAMS: 'clearLeagueSeasonTeams',
  CLEAR_TEAM_SEASON_PLAYERS: 'clearTeamSeasonPlayers',
  CLEAR_TEAM_SEASON_STATS: 'clearTeamSeasonStats',
  DELETE_LEAGUE_SEASON: 'deleteLeagueSeason',
  DELETE_TEAM_FROM_SEASON: 'deleteTeamFromSeason',
  DELETE_TEAM_PLAYER_FROM_SEASON: 'deleteTeamPlayerFromSeason',
  CREATE_TEAM_DISPLAY_PLAYER: 'createTeamDisplayPlayer',
  CREATE_TEAM_OFFICIAL_PLAYER: 'createTeamOfficialPlayer',
  UPDATE_PLAYER_SEASON_NOTES: 'updatePlayerSeasonNotes',
  UPDATE_PLAYER_SEASON_ROLE: 'updatePlayerSeasonRole',
  UPDATE_PLAYER_SCOUT_REVIEW: 'updatePlayerScoutReview',
  UPDATE_PLAYER_VERIFICATION: 'updatePlayerVerification',
  REMOVE_PLAYER_SCOUT_PROFILE: 'removePlayerScoutProfile',
  UPDATE_PLAYER_SEASON_URL: 'updatePlayerSeasonUrl',
  UPDATE_LEAGUE_SEASON_META: 'updateLeagueSeasonMeta',
  UPDATE_LEAGUE_SEASON_URL: 'updateLeagueSeasonUrl',
  ADD_FAVORITE: 'addFavorite',
  REMOVE_FAVORITE: 'removeFavorite',
  ENSURE_PLAYER_WATCHLIST: 'ensurePlayerWatchlist',
  ENSURE_PLAYER_MANUAL: 'ensurePlayerManual',
  ENSURE_PLAYER_TRANSFER: 'ensurePlayerTransfer',
}

const WRITE_ACTION_RUNNERS = {
  [PLAYERS_DATABASE_WRITE_ACTIONS.ENSURE_LEAGUE_DOC]: payload => (
    ensureLeagueDoc(payload.league || {})
  ),
  [PLAYERS_DATABASE_WRITE_ACTIONS.UPSERT_LEAGUE_SEASON]: createLeagueSeasonFlow,
  [PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_LEAGUE_SEASON_TABLE_RANK]: updateLeagueSeasonTableRank,
  [PLAYERS_DATABASE_WRITE_ACTIONS.PASTE_LEAGUE_TABLE]: pasteLeagueTableFlow,
  [PLAYERS_DATABASE_WRITE_ACTIONS.PASTE_TEAM_PLAYERS]: pasteTeamPlayersFlow,
  [PLAYERS_DATABASE_WRITE_ACTIONS.PASTE_TEAM_PLAYER_STATS]: pasteTeamPlayerStatsFlow,
  [PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_TEAM_URL]: updateTeamUrlFlow,
  [PLAYERS_DATABASE_WRITE_ACTIONS.CLEAR_LEAGUE_SEASON_TEAMS]: clearLeagueSeasonTeamsFlow,
  [PLAYERS_DATABASE_WRITE_ACTIONS.CLEAR_TEAM_SEASON_PLAYERS]: clearTeamSeasonPlayersFlow,
  [PLAYERS_DATABASE_WRITE_ACTIONS.CLEAR_TEAM_SEASON_STATS]: clearTeamSeasonStatsFlow,
  [PLAYERS_DATABASE_WRITE_ACTIONS.DELETE_LEAGUE_SEASON]: deleteLeagueSeasonFlow,
  [PLAYERS_DATABASE_WRITE_ACTIONS.DELETE_TEAM_FROM_SEASON]: deleteTeamFromSeasonFlow,
  [PLAYERS_DATABASE_WRITE_ACTIONS.DELETE_TEAM_PLAYER_FROM_SEASON]: deleteTeamPlayerFromSeasonFlow,
  [PLAYERS_DATABASE_WRITE_ACTIONS.CREATE_TEAM_DISPLAY_PLAYER]: createTeamDisplayPlayerFlow,
  [PLAYERS_DATABASE_WRITE_ACTIONS.CREATE_TEAM_OFFICIAL_PLAYER]: createTeamOfficialPlayerFlow,
  [PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_PLAYER_SEASON_NOTES]: updatePlayerSeasonNotesFlow,
  [PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_PLAYER_SEASON_ROLE]: updatePlayerRoleFlow,
  [PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_PLAYER_SCOUT_REVIEW]: updatePlayerScoutReviewFlow,
  [PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_PLAYER_VERIFICATION]: updatePlayerVerificationFlow,
  [PLAYERS_DATABASE_WRITE_ACTIONS.REMOVE_PLAYER_SCOUT_PROFILE]: removePlayerScoutProfileFlow,
  [PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_PLAYER_SEASON_URL]: updatePlayerSeasonUrlFlow,
  [PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_LEAGUE_SEASON_META]: updateLeagueSeasonMetaFlow,
  [PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_LEAGUE_SEASON_URL]: updateLeagueSeasonUrlFlow,
  [PLAYERS_DATABASE_WRITE_ACTIONS.ADD_FAVORITE]: addFavoriteFlow,
  [PLAYERS_DATABASE_WRITE_ACTIONS.REMOVE_FAVORITE]: removeFavoriteFlow,
  [PLAYERS_DATABASE_WRITE_ACTIONS.ENSURE_PLAYER_WATCHLIST]: ensureWatchlistScoutingPlayerDoc,
  [PLAYERS_DATABASE_WRITE_ACTIONS.ENSURE_PLAYER_MANUAL]: ensureManualScoutingPlayerDoc,
  [PLAYERS_DATABASE_WRITE_ACTIONS.ENSURE_PLAYER_TRANSFER]: ensureTransferredScoutingPlayerDoc,
}

export async function runPlayersDatabaseWriteAction({ actionType = '', payload = {} } = {}) {
  const runAction = WRITE_ACTION_RUNNERS[actionType]

  if (!runAction) {
    throw new Error(`Unknown players database write action: ${actionType}`)
  }

  const result = await runAction(payload)

  invalidatePlayersDatabaseWriteCache({
    actionType,
    payload,
    result,
  })

  const auditScope = rememberLastWriteAuditScopeFromResult(result)

  return auditScope
    ? {
        ...result,
        auditScope,
      }
    : result
}
