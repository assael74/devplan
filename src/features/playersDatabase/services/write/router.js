// features/playersDatabase/services/write/router.js

import {
  ensureLeagueDoc,
  updateLeagueSeasonTableRank,
  upsertLeagueSeason,
} from './leagues/index.js'
import {
  createTeamDisplayPlayerFlow,
  createTeamOfficialPlayerFlow,
  deleteLeagueSeasonFlow,
  deleteTeamFromSeasonFlow,
  deleteTeamPlayerFromSeasonFlow,
  pasteLeagueTableFlow,
  pasteTeamPlayerStatsFlow,
  pasteTeamPlayersFlow,
  removePlayerScoutProfileFlow,
  updateLeagueSeasonMetaFlow,
  updateLeagueSeasonUrlFlow,
  updatePlayerFavoriteFlow,
  updatePlayerRoleFlow,
  updatePlayerSeasonNotesFlow,
  updatePlayerSeasonUrlFlow,
  updateTeamUrlFlow,
} from './flows/index.js'

export const PLAYERS_DATABASE_WRITE_ACTIONS = {
  ENSURE_LEAGUE_DOC: 'ensureLeagueDoc',
  UPSERT_LEAGUE_SEASON: 'upsertLeagueSeason',
  UPDATE_LEAGUE_SEASON_TABLE_RANK: 'updateLeagueSeasonTableRank',
  PASTE_LEAGUE_TABLE: 'pasteLeagueTable',
  PASTE_TEAM_PLAYERS: 'pasteTeamPlayers',
  PASTE_TEAM_PLAYER_STATS: 'pasteTeamPlayerStats',
  UPDATE_TEAM_URL: 'updateTeamUrl',
  DELETE_LEAGUE_SEASON: 'deleteLeagueSeason',
  DELETE_TEAM_FROM_SEASON: 'deleteTeamFromSeason',
  DELETE_TEAM_PLAYER_FROM_SEASON: 'deleteTeamPlayerFromSeason',
  CREATE_TEAM_DISPLAY_PLAYER: 'createTeamDisplayPlayer',
  CREATE_TEAM_OFFICIAL_PLAYER: 'createTeamOfficialPlayer',
  UPDATE_PLAYER_SEASON_NOTES: 'updatePlayerSeasonNotes',
  UPDATE_PLAYER_SEASON_ROLE: 'updatePlayerSeasonRole',
  REMOVE_PLAYER_SCOUT_PROFILE: 'removePlayerScoutProfile',
  UPDATE_PLAYER_SEASON_URL: 'updatePlayerSeasonUrl',
  UPDATE_LEAGUE_SEASON_META: 'updateLeagueSeasonMeta',
  UPDATE_LEAGUE_SEASON_URL: 'updateLeagueSeasonUrl',
  UPDATE_PLAYER_FAVORITE: 'updatePlayerFavorite',
}

export async function runPlayersDatabaseWriteAction({
  actionType = '',
  payload = {},
} = {}) {
  if (actionType === PLAYERS_DATABASE_WRITE_ACTIONS.ENSURE_LEAGUE_DOC) {
    return ensureLeagueDoc(payload.league || {})
  }

  if (actionType === PLAYERS_DATABASE_WRITE_ACTIONS.UPSERT_LEAGUE_SEASON) {
    return upsertLeagueSeason(payload)
  }

  if (actionType === PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_LEAGUE_SEASON_TABLE_RANK) {
    return updateLeagueSeasonTableRank(payload)
  }

  if (actionType === PLAYERS_DATABASE_WRITE_ACTIONS.PASTE_LEAGUE_TABLE) {
    return pasteLeagueTableFlow(payload)
  }

  if (actionType === PLAYERS_DATABASE_WRITE_ACTIONS.PASTE_TEAM_PLAYERS) {
    return pasteTeamPlayersFlow(payload)
  }

  if (actionType === PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_TEAM_URL) {
    return updateTeamUrlFlow(payload)
  }

  if (actionType === PLAYERS_DATABASE_WRITE_ACTIONS.CREATE_TEAM_DISPLAY_PLAYER) {
    return createTeamDisplayPlayerFlow(payload)
  }

  if (actionType === PLAYERS_DATABASE_WRITE_ACTIONS.CREATE_TEAM_OFFICIAL_PLAYER) {
    return createTeamOfficialPlayerFlow(payload)
  }

  if (actionType === PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_PLAYER_SEASON_NOTES) {
    return updatePlayerSeasonNotesFlow(payload)
  }

  if (actionType === PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_PLAYER_SEASON_ROLE) {
    return updatePlayerRoleFlow(payload)
  }

  if (actionType === PLAYERS_DATABASE_WRITE_ACTIONS.REMOVE_PLAYER_SCOUT_PROFILE) {
    return removePlayerScoutProfileFlow(payload)
  }

  if (actionType === PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_PLAYER_SEASON_URL) {
    return updatePlayerSeasonUrlFlow(payload)
  }

  if (actionType === PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_LEAGUE_SEASON_META) {
    return updateLeagueSeasonMetaFlow(payload)
  }

  if (actionType === PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_LEAGUE_SEASON_URL) {
    return updateLeagueSeasonUrlFlow(payload)
  }

  if (actionType === PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_PLAYER_FAVORITE) {
    return updatePlayerFavoriteFlow(payload)
  }

  if (actionType === PLAYERS_DATABASE_WRITE_ACTIONS.PASTE_TEAM_PLAYER_STATS) {
    return pasteTeamPlayerStatsFlow(payload)
  }

  if (actionType === PLAYERS_DATABASE_WRITE_ACTIONS.DELETE_LEAGUE_SEASON) {
    return deleteLeagueSeasonFlow(payload)
  }

  if (actionType === PLAYERS_DATABASE_WRITE_ACTIONS.DELETE_TEAM_FROM_SEASON) {
    return deleteTeamFromSeasonFlow(payload)
  }

  if (actionType === PLAYERS_DATABASE_WRITE_ACTIONS.DELETE_TEAM_PLAYER_FROM_SEASON) {
    return deleteTeamPlayerFromSeasonFlow(payload)
  }

  throw new Error(`Unknown players database write action: ${actionType}`)
}
