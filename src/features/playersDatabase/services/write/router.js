// features/playersDatabase/services/write/router.js

import {
  ensureLeagueDoc,
  updateLeagueSeasonUrl,
  updateLeagueSeasonTableRankScoutProfilesSummary,
  updateLeagueSeasonTableRankTeamUrl,
  updateLeagueSeasonTableRank,
  upsertLeagueSeason,
} from './leagues/index.js'
import {
  removePlayerSeasonScoutProfile,
  updatePlayerFavorite,
  updatePlayerSeasonNotes,
  updatePlayerSeasonUrl,
} from './players/index.js'
import {
  clearPlayerSeasonSearchIndexScoutProfile,
  updatePlayerFavoriteSearchIndexes,
  updatePlayerSeasonSearchIndexNotes,
  updatePlayerSeasonSearchIndexPlayerUrl,
  updateSearchIndexesLeagueSeasonUrl,
  updateTeamSeasonSearchIndexScoutProfilesSummary,
  updateTeamSeasonSearchIndexTeamUrl,
} from './searchIndex/index.js'
import {
  updateTeamSeasonPlayerScoutProfiles,
  updateTeamSeasonTeamUrl,
} from './teams/index.js'
import {
  createTeamDisplayPlayerFlow,
  createTeamOfficialPlayerFlow,
  deleteLeagueSeasonFlow,
  deleteTeamFromSeasonFlow,
  deleteTeamPlayerFromSeasonFlow,
  pasteLeagueTableFlow,
  pasteTeamPlayerStatsFlow,
  pasteTeamPlayersFlow,
  updateLeagueSeasonMetaFlow,
  updatePlayerRoleFlow,
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
    const team = {
      ...(payload.team || {}),
    }
    const leagueTableRankResult = await updateLeagueSeasonTableRankTeamUrl({
      ...payload,
      team,
    })
    const teamSeasonResult = await updateTeamSeasonTeamUrl({
      ...payload,
      team,
    })
    const teamSeasonIndexResult = await updateTeamSeasonSearchIndexTeamUrl({
      ...payload,
      team,
    })

    return {
      leagueTableRankResult,
      teamSeasonResult,
      teamSeasonIndexResult,
      teamUrl: team.teamUrl,
    }
  }

  if (actionType === PLAYERS_DATABASE_WRITE_ACTIONS.CREATE_TEAM_DISPLAY_PLAYER) {
    return createTeamDisplayPlayerFlow(payload)
  }

  if (actionType === PLAYERS_DATABASE_WRITE_ACTIONS.CREATE_TEAM_OFFICIAL_PLAYER) {
    return createTeamOfficialPlayerFlow(payload)
  }

  if (actionType === PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_PLAYER_SEASON_NOTES) {
    const playerSeasonResult = await updatePlayerSeasonNotes(payload)
    const playerSeasonIndexResult = await updatePlayerSeasonSearchIndexNotes(payload)

    return {
      playerSeasonResult,
      playerSeasonIndexResult,
      rowsCount: 1,
    }
  }

  if (actionType === PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_PLAYER_SEASON_ROLE) {
    return updatePlayerRoleFlow(payload)
  }

  if (actionType === PLAYERS_DATABASE_WRITE_ACTIONS.REMOVE_PLAYER_SCOUT_PROFILE) {
    const playerSeasonResult = await removePlayerSeasonScoutProfile({
      ...payload,
      player: {
        ...(payload.player || {}),
        scoutProfiles: [],
      },
    })
    const teamSeasonResult = await updateTeamSeasonPlayerScoutProfiles({
      ...payload,
      scoutProfiles: [],
    })
    const playerSeasonIndexResult = await clearPlayerSeasonSearchIndexScoutProfile(payload)
    const leagueTableRankScoutProfilesResult = await updateLeagueSeasonTableRankScoutProfilesSummary({
      ...payload,
      scoutProfilesSummary: teamSeasonResult.scoutProfilesSummary,
    })
    const teamSeasonIndexScoutProfilesResult = await updateTeamSeasonSearchIndexScoutProfilesSummary({
      ...payload,
      scoutProfilesSummary: teamSeasonResult.scoutProfilesSummary,
    })

    return {
      playerSeasonResult,
      teamSeasonResult,
      playerSeasonIndexResult,
      leagueTableRankScoutProfilesResult,
      teamSeasonIndexScoutProfilesResult,
      rowsCount: 1,
    }
  }

  if (actionType === PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_PLAYER_SEASON_URL) {
    const playerSeasonResult = await updatePlayerSeasonUrl(payload)
    const playerSeasonIndexResult = await updatePlayerSeasonSearchIndexPlayerUrl(payload)

    return {
      playerSeasonResult,
      playerSeasonIndexResult,
      rowsCount: 1,
    }
  }

  if (actionType === PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_LEAGUE_SEASON_META) {
    return updateLeagueSeasonMetaFlow(payload)
  }

  if (actionType === PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_LEAGUE_SEASON_URL) {
    const leagueSeasonResult = await updateLeagueSeasonUrl(payload)
    const searchIndexResult = await updateSearchIndexesLeagueSeasonUrl(payload)

    return {
      leagueSeasonResult,
      searchIndexResult,
      rowsCount: searchIndexResult.rowsCount,
    }
  }

  if (actionType === PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_PLAYER_FAVORITE) {
    const playerFavoriteResult = await updatePlayerFavorite(payload)
    const playerSeasonIndexResult = await updatePlayerFavoriteSearchIndexes(payload)

    return {
      playerFavoriteResult,
      playerSeasonIndexResult,
      rowsCount: playerSeasonIndexResult.rowsCount,
    }
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
