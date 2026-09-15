// src/features/playersDatabase/services/write/router.js

import { invalidatePlayersDatabaseWriteCache } from '../cache/index.js'
import {
  buildLastWriteAuditScope,
  rememberLastWriteAuditScopeFromResult,
} from '../audit/audit.lastWrite.js'
import { recordPlayersDatabaseWriteAction } from '../audit/audit.writeJournal.js'
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
  deleteLeagueSeasonFlow,
  deleteTeamPlayerFromSeasonFlow,
  pasteLeagueTableFlow,
  pasteTeamPlayerStatsFlow,
  pasteTeamPlayersFlow,
  removeFavoriteFlow,
  removePlayerScoutProfileFlow,
  updateLeagueSeasonUrlFlow,
  updateLeagueSeasonSettingsFlow,
  updatePlayerRoleFlow,
  updatePlayerScoutReviewFlow,
  updatePlayerAgentFlow,
  updatePlayerSeasonGoalDistributionFlow,
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
  CLEAR_LEAGUE_SEASON_TEAMS: 'clearLeagueSeasonTeams',
  CLEAR_TEAM_SEASON_PLAYERS: 'clearTeamSeasonPlayers',
  CLEAR_TEAM_SEASON_STATS: 'clearTeamSeasonStats',
  DELETE_LEAGUE_SEASON: 'deleteLeagueSeason',
  DELETE_TEAM_PLAYER_FROM_SEASON: 'deleteTeamPlayerFromSeason',
  CREATE_TEAM_DISPLAY_PLAYER: 'createTeamDisplayPlayer',
  UPDATE_PLAYER_SEASON_NOTES: 'updatePlayerSeasonNotes',
  UPDATE_PLAYER_SEASON_ROLE: 'updatePlayerSeasonRole',
  UPDATE_PLAYER_SCOUT_REVIEW: 'updatePlayerScoutReview',
  UPDATE_PLAYER_AGENT: 'updatePlayerAgent',
  UPDATE_PLAYER_SEASON_GOAL_DISTRIBUTION: 'updatePlayerSeasonGoalDistribution',
  REMOVE_PLAYER_SCOUT_PROFILE: 'removePlayerScoutProfile',
  UPDATE_PLAYER_SEASON_URL: 'updatePlayerSeasonUrl',
  UPDATE_LEAGUE_SEASON_URL: 'updateLeagueSeasonUrl',
  UPDATE_LEAGUE_SEASON_SETTINGS: 'updateLeagueSeasonSettings',
  ADD_FAVORITE: 'addFavorite',
  REMOVE_FAVORITE: 'removeFavorite',
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
  [PLAYERS_DATABASE_WRITE_ACTIONS.DELETE_TEAM_PLAYER_FROM_SEASON]: deleteTeamPlayerFromSeasonFlow,
  [PLAYERS_DATABASE_WRITE_ACTIONS.CREATE_TEAM_DISPLAY_PLAYER]: createTeamDisplayPlayerFlow,
  [PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_PLAYER_SEASON_NOTES]: updatePlayerSeasonNotesFlow,
  [PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_PLAYER_SEASON_ROLE]: updatePlayerRoleFlow,
  [PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_PLAYER_SCOUT_REVIEW]: updatePlayerScoutReviewFlow,
  [PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_PLAYER_AGENT]: updatePlayerAgentFlow,
  [PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_PLAYER_SEASON_GOAL_DISTRIBUTION]: updatePlayerSeasonGoalDistributionFlow,
  [PLAYERS_DATABASE_WRITE_ACTIONS.REMOVE_PLAYER_SCOUT_PROFILE]: removePlayerScoutProfileFlow,
  [PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_PLAYER_SEASON_URL]: updatePlayerSeasonUrlFlow,
  [PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_LEAGUE_SEASON_URL]: updateLeagueSeasonUrlFlow,
  [PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_LEAGUE_SEASON_SETTINGS]: updateLeagueSeasonSettingsFlow,
  [PLAYERS_DATABASE_WRITE_ACTIONS.ADD_FAVORITE]: addFavoriteFlow,
  [PLAYERS_DATABASE_WRITE_ACTIONS.REMOVE_FAVORITE]: removeFavoriteFlow,
}

export async function runPlayersDatabaseWriteAction({ actionType = '', payload = {} } = {}) {
  const runAction = WRITE_ACTION_RUNNERS[actionType]

  if (!runAction) {
    throw new Error(`Unknown players database write action: ${actionType}`)
  }

  let result
  try {
    result = await runAction(payload)
  } catch (error) {
    // A coordinated flow may commit its canonical source before a later
    // projection fails.  Do not leave the UI/cache on the pre-write snapshot;
    // invalidate it and attach the narrow audit scope to the error so the
    // caller can present a real recovery path.
    if (
      error?.teamCanonicalCommitted ||
      error?.leagueCanonicalCommitted ||
      error?.results?.teamCanonicalCommitted ||
      error?.results?.leagueCanonicalCommitted
    ) {
      invalidatePlayersDatabaseWriteCache({
        actionType,
        payload,
        result: error.results,
      })
      const auditScope = rememberLastWriteAuditScopeFromResult(error.results)
      if (auditScope) error.auditScope = auditScope

      // The canonical write is already durable. Persist a recovery contract
      // so Audit can expose a safe repair instead of requiring a reload.
      try {
        await recordPlayersDatabaseWriteAction({
          actionType,
          auditScope: auditScope || buildLastWriteAuditScope(error.results),
          status: 'failed_after_canonical_commit',
          failedStage: error?.stage || error?.results?.failedStage || '',
          errorMessage: String(error?.message || 'כתיבה חלקית לאחר שמירת הנתונים הקנוניים'),
          recoveryRequired: true,
        })
      } catch {
        // Diagnostic journaling must never mask the original write failure.
      }
    }
    throw error
  }

  invalidatePlayersDatabaseWriteCache({
    actionType,
    payload,
    result,
  })

  const auditScope = rememberLastWriteAuditScopeFromResult(result)

  // Provenance is diagnostic only: a journal outage must never turn a
  // successful business write into a failed user action.
  try {
    await recordPlayersDatabaseWriteAction({
      actionType,
      auditScope: auditScope || buildLastWriteAuditScope(result),
    })
  } catch {
    // The canonical write has already completed successfully.
  }

  return auditScope
    ? {
        ...result,
        auditScope,
      }
    : result
}
