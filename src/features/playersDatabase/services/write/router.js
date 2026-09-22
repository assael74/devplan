// src/features/playersDatabase/services/write/router.js

import { invalidatePlayersDatabaseWriteCache } from '../cache/index.js'
import {
  buildLastWriteAuditScope,
  rememberLastWriteAuditScope,
} from '../audit/audit.lastWrite.js'
import { buildAuditLeagueSeasonScope } from '../audit/audit.scope.js'
import {
  beginPlayersDatabaseWriteAction,
  recordPlayersDatabaseWriteAction,
  updatePlayersDatabaseWriteAction,
} from '../audit/audit.writeJournal.js'
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
  retryLeagueProjectionSyncFlow,
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
  RETRY_LEAGUE_PROJECTION_SYNC: 'retryLeagueProjectionSync',
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
  [PLAYERS_DATABASE_WRITE_ACTIONS.RETRY_LEAGUE_PROJECTION_SYNC]: retryLeagueProjectionSyncFlow,
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

const resolveCompletionResult = value => value?.results || value || {}

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const buildWriteActionIdentity = ({ payload = {}, result = {} } = {}) => {
  const resolved = resolveCompletionResult(result)
  const job = resolved?.projectionJob || resolved?.results?.projectionJob || {}
  const teamSeason = resolved?.teamSeasonResult || resolved?.results?.teamSeasonResult || {}
  const leagueResult = resolved?.leagueResult || resolved?.results?.leagueResult || resolved
  const season = payload.season || resolved?.season || {}
  const team = payload.team || resolved?.team || {}
  const league = payload.league || resolved?.league || {}

  return {
    leagueId: clean(leagueResult?.leagueId || league?.id || league?.leagueId || season?.leagueId),
    seasonKey: clean(teamSeason?.seasonKey || leagueResult?.seasonKey || season?.seasonKey || season?.seasonId),
    teamId: clean(teamSeason?.birthTeamDocumentId || teamSeason?.teamDocumentId || team?.birthTeamDocumentId || team?.teamDocumentId || team?.teamId),
    teamSeasonDocumentId: clean(teamSeason?.teamSeasonDocumentId),
    sourceRevision: clean(job?.sourceRevision || resolved?.sourceRevision),
    projectionJobId: clean(job?.id),
    projectionJobType: clean(job?.id ? job?.jobType : '') || (job?.id ? clean(job?.jobType || 'projection') : ''),
  }
}

const buildActionAuditScope = ({ actionType = '', payload = {}, result = {} } = {}) => {
  if ([
    PLAYERS_DATABASE_WRITE_ACTIONS.PASTE_LEAGUE_TABLE,
    PLAYERS_DATABASE_WRITE_ACTIONS.RETRY_LEAGUE_PROJECTION_SYNC,
  ].includes(actionType)) {
    const identity = buildWriteActionIdentity({ payload, result })
    return buildAuditLeagueSeasonScope({
      leagueId: identity.leagueId,
      seasonKey: identity.seasonKey,
    })
  }
  return buildLastWriteAuditScope(result)
}

const buildWriteActionResult = result => {
  const resolved = resolveCompletionResult(result)
  return {
    projectionJob: resolved?.projectionJob || resolved?.results?.projectionJob || null,
    backgroundSyncPending: Boolean(resolved?.backgroundSyncPending),
    rowsCount: Number(resolved?.rowsCount || 0),
    syncedPlayersCount: Number(resolved?.syncedPlayersCount || 0),
    failedStage: clean(resolved?.failedStage || resolved?.stoppedAt),
    syncStatus: clean(resolved?.syncStatus),
  }
}

const hasCanonicalCommit = value => {
  const result = resolveCompletionResult(value)

  return Boolean(
    value?.teamCanonicalCommitted ||
    value?.leagueCanonicalCommitted ||
    value?.playerCanonicalCommitted ||
    result?.teamCanonicalCommitted ||
    result?.leagueCanonicalCommitted ||
    result?.playerCanonicalCommitted
  )
}

const isPostCanonicalPartialResult = result => (
  hasCanonicalCommit(result) && (
    result?.completed === false ||
    result?.recoveryRequired === true
  ) && !result?.backgroundSyncPending
)

const recordPostCanonicalFailure = async ({ actionType, payload, result, error = null, writeActionId = '' }) => {
  invalidatePlayersDatabaseWriteCache({
    actionType,
    payload,
    result,
  })

  const auditScope = buildActionAuditScope({ actionType, payload, result })
  if (auditScope) rememberLastWriteAuditScope(auditScope)
  if (auditScope && error) error.auditScope = auditScope

  try {
    const superseded = Boolean(
      error?.superseded ||
      ['STATS_PROJECTION_SUPERSEDED', 'ROSTER_PROJECTION_SUPERSEDED'].includes(error?.code)
    )
    const journalEntry = {
      auditScope: auditScope || buildLastWriteAuditScope(result),
      status: superseded ? 'superseded' : 'failed_after_canonical_commit',
      failedStage: error?.stage || result?.failedStage || result?.stoppedAt || '',
      errorMessage: String(
        error?.message ||
        result?.projectionError ||
        'כתיבה חלקית לאחר שמירת הנתונים הקנוניים'
      ),
      recoveryRequired: !superseded,
      result: buildWriteActionResult(result),
    }
    if (writeActionId) {
      await updatePlayersDatabaseWriteAction({ writeActionId, ...journalEntry })
    } else {
      await recordPlayersDatabaseWriteAction({ actionType, ...journalEntry })
    }
  } catch {
    // Diagnostic journaling must never mask the write result or error.
  }

  return auditScope
}

export async function runPlayersDatabaseWriteAction({ actionType = '', payload = {} } = {}) {
  const runAction = WRITE_ACTION_RUNNERS[actionType]

  if (!runAction) {
    throw new Error(`Unknown players database write action: ${actionType}`)
  }

  const continuationWriteActionId = actionType === PLAYERS_DATABASE_WRITE_ACTIONS.RETRY_LEAGUE_PROJECTION_SYNC
    ? clean(payload.continuationWriteActionId)
    : ''
  // A recovery keeps the original business receipt. Other actions receive a
  // new receipt before they begin their business writes.
  const writeActionId = continuationWriteActionId || await beginPlayersDatabaseWriteAction({ actionType })

  if (continuationWriteActionId) {
    await updatePlayersDatabaseWriteAction({
      writeActionId,
      status: 'in_progress',
      recoveryRequired: false,
    })
  }

  const actionPayload = writeActionId
    ? { ...payload, writeActionId }
    : payload

  let result
  try {
    result = await runAction(actionPayload)
  } catch (error) {
    // A coordinated flow may commit its canonical source before a later
    // projection fails.  Do not leave the UI/cache on the pre-write snapshot;
    // invalidate it and attach the narrow audit scope to the error so the
    // caller can present a real recovery path.
    if (hasCanonicalCommit(error)) {
      await recordPostCanonicalFailure({
        actionType,
        payload: actionPayload,
        result: resolveCompletionResult(error),
        error,
        writeActionId,
      })
    } else {
      try {
        const isRecovery = actionType === PLAYERS_DATABASE_WRITE_ACTIONS.RETRY_LEAGUE_PROJECTION_SYNC &&
          Boolean(continuationWriteActionId)
        await updatePlayersDatabaseWriteAction({
          writeActionId,
          status: isRecovery ? 'failed_after_canonical_commit' : 'failed',
          failedStage: error?.stage || 'retryLeagueProjectionSync',
          errorMessage: String(error?.message || 'כתיבה נכשלה'),
          recoveryRequired: isRecovery,
        })
      } catch {
        // The original write error remains the source of truth.
      }
    }
    throw error
  }

  if (isPostCanonicalPartialResult(result)) {
    const auditScope = await recordPostCanonicalFailure({
      actionType,
      payload: actionPayload,
      result,
      writeActionId,
    })

    return auditScope
      ? { ...result, auditScope, writeActionId }
      : { ...result, writeActionId }
  }

  if (result?.backgroundSyncPending) {
    const auditScope = buildActionAuditScope({ actionType, payload: actionPayload, result })
    if (auditScope) rememberLastWriteAuditScope(auditScope)
    if (!result?.writeActionLinkedInCanonicalCommit) {
      await updatePlayersDatabaseWriteAction({
        writeActionId,
        auditScope,
        identity: buildWriteActionIdentity({ payload: actionPayload, result }),
        result: {
          ...buildWriteActionResult(result),
          backgroundSyncPending: true,
        },
      })
    }
    return auditScope
      ? { ...result, auditScope, writeActionId }
      : { ...result, writeActionId }
  }

  invalidatePlayersDatabaseWriteCache({
    actionType,
    payload: actionPayload,
    result,
  })

  const auditScope = buildActionAuditScope({ actionType, payload, result })
  if (auditScope) rememberLastWriteAuditScope(auditScope)

  try {
    await updatePlayersDatabaseWriteAction({
      writeActionId,
      auditScope: auditScope || buildActionAuditScope({ actionType, payload, result }),
      status: 'completed',
      identity: buildWriteActionIdentity({ payload: actionPayload, result }),
      result: buildWriteActionResult(result),
    })
  } catch {
    // The canonical write has already completed successfully.
  }

  return auditScope
    ? {
        ...result,
        auditScope,
        writeActionId,
      }
    : { ...result, writeActionId }
}