// features/playersDatabase/services/write/flows/team/pasteTeamPlayers.flow.js

import {
  commitApprovedTeamSeasonRoster,
} from '../../teams/index.js'
import {
  activateTeamRosterProjectionJob,
  queueTeamRosterProjectionJob,
} from '../../teamRosterProjectionJobs/index.js'
import {
  attachWriteFlowReport,
} from '../writeFlowReport.js'

const buildSyncError = ({ stage, cause, results = {} }) => (
  attachWriteFlowReport({
    error: cause,
    stage,
    results,
    flow: 'pasteTeamPlayers',
  })
)

const buildCommittedSyncError = ({ stage, cause, results = {} }) => {
  const error = buildSyncError({ stage, cause, results })
  error.superseded = Boolean(cause?.superseded || cause?.code === 'ROSTER_PROJECTION_SUPERSEDED')
  error.teamCanonicalCommitted = true
  error.projectionsCompleted = false
  error.completed = false
  error.recoveryRequired = !error.superseded
  error.syncStatus = error.superseded ? 'superseded' : 'projection_failed'
  return error
}

const assertTeamSeasonUpdated = result => {
  if (!result?.teamDocumentId || !result?.seasonId) {
    throw new Error('Team season roster was not updated')
  }
}

export async function pasteTeamPlayersFlow(payload = {}) {
  const approvedPlan = payload.rosterImportPlan
  const results = {}

  if (!approvedPlan?.persistedSeason || !approvedPlan?.rosterProjectionRevision) {
    const error = new Error('Roster import requires an approved preview plan')
    error.code = 'ROSTER_IMPORT_PLAN_REQUIRED'
    throw error
  }

  const approvedTeam = {
    ...(payload.team || {}),
    birthTeamDocumentId: approvedPlan.birthTeamDocumentId,
  }
  const rosterProjectionRevision = approvedPlan.rosterProjectionRevision

  try {
    results.teamSeasonResult = await commitApprovedTeamSeasonRoster({
      plan: approvedPlan,
      team: approvedTeam,
    })
    assertTeamSeasonUpdated(results.teamSeasonResult)
    results.teamDocResult = {
      birthTeamDocumentId: results.teamSeasonResult.birthTeamDocumentId,
      teamDocumentId: results.teamSeasonResult.teamDocumentId,
      created: Boolean(results.teamSeasonResult.createdTeam),
    }
  } catch (error) {
    throw buildSyncError({
      stage: 'commitApprovedTeamSeasonRoster',
      cause: error,
      results,
    })
  }

  const approvedSyncPayload = approvedPlan.approvedSyncPayload
  if (!approvedSyncPayload?.sourceRevision) {
    const error = new Error('Roster import requires an approved sync payload')
    error.code = 'ROSTER_SYNC_PAYLOAD_REQUIRED'
    throw buildCommittedSyncError({ stage: 'queueTeamRosterProjectionJob', cause: error, results })
  }

  const leagueTeamOperation = approvedSyncPayload.operations?.leagueTeam?.[0] || {}
  const sourceTarget = String(leagueTeamOperation.target?.sourceTarget || '').trim()
  const playerIndexOperations = Array.isArray(approvedSyncPayload.operations?.playerIndex)
    ? approvedSyncPayload.operations.playerIndex
    : []
  const playerSeasonIndexCount = playerIndexOperations
    .filter(operation => operation?.patch?.type !== 'delete')
    .length

  try {
    results.projectionJob = await queueTeamRosterProjectionJob({
      league: {
        id: approvedPlan.leagueId,
        leagueId: approvedPlan.leagueId,
      },
      season: {
        seasonId: approvedPlan.persistedSeason?.seasonId,
        seasonKey: approvedPlan.seasonKey,
        seasonStatus: sourceTarget === 'history' ? 'completed' : 'active',
      },
      team: {
        ...approvedTeam,
        birthTeamDocumentId: results.teamSeasonResult.birthTeamDocumentId,
        teamDocumentId: results.teamSeasonResult.teamDocumentId,
      },
      teamSeasonDocumentId: results.teamSeasonResult.teamSeasonDocumentId,
      sourceRevision: rosterProjectionRevision,
      counterpartRequests: approvedPlan.approvedCounterpartRequests
        || results.teamSeasonResult.movementState?.counterpartRequests,
      approvedSyncPayload,
      writeActionId: payload.writeActionId,
    })
  } catch (error) {
    throw buildCommittedSyncError({ stage: 'queueTeamRosterProjectionJob', cause: error, results })
  }

  try {
    await activateTeamRosterProjectionJob({
      id: results.projectionJob?.id,
      sourceRevision: rosterProjectionRevision,
    })
  } catch (error) {
    throw buildCommittedSyncError({ stage: 'activateTeamRosterProjectionJob', cause: error, results })
  }

  return {
    ...results,
    rowsCount: playerSeasonIndexCount,
    teamCanonicalCommitted: true,
    projectionsCompleted: false,
    completed: false,
    backgroundSyncPending: true,
    sourceRevision: rosterProjectionRevision,
    syncStatus: 'background_sync_pending',
  }
}
