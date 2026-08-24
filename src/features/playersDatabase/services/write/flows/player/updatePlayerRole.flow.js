// src/features/playersDatabase/services/write/flows/player/updatePlayerRole.flow.js

import { updateLeagueSeasonTableRankScoutProfilesSummary } from '../../leagues/index.js'
import { syncPlayerRoleAndScoutProfileDoc } from '../../players/index.js'
import {
  updatePlayerSeasonSearchIndexRole,
  updateTeamSeasonSearchIndexScoutProfilesSummary,
} from '../../searchIndex/index.js'
import { updateTeamSeasonPlayerRoleAndScoutProfiles } from '../../teams/index.js'

const buildPlayerSyncResult = result => ({
  rowsCount: result && !result.skipped ? 1 : 0,
  createdCount: result && result.created ? 1 : 0,
  clearedCount: result && result.updated && result.scoutProfilesCount === 0 ? 1 : 0,
  skippedCount: result && result.skipped ? 1 : 0,
  playerDocumentIds: result && result.playerDocumentId
    ? [result.playerDocumentId]
    : [],
  result,
})

const buildCommittedProjectionFailure = ({
  stage,
  error,
  teamSeasonResult,
  results = {},
} = {}) => ({
  ...results,
  teamSeasonResult,
  teamSeasonScoutProfilesResult: teamSeasonResult,
  rowsCount: 1,
  teamCanonicalCommitted: true,
  projectionsCompleted: false,
  completed: true,
  stoppedAt: stage,
  projectionError: String(error?.message || `Role projection failed at ${stage}`).trim(),
})

export async function updatePlayerRoleFlow(payload = {}) {
  // Team season is the operational source of truth for the player in the squad.
  // Resolve the canonical player there before recalculating role-dependent scout state.
  let teamSeasonResult = null

  try {
    teamSeasonResult = await updateTeamSeasonPlayerRoleAndScoutProfiles(payload)
  } catch (error) {
    return {
      playerSeasonResult: null,
      playerScoutProfileDocsResult: null,
      teamSeasonResult: null,
      teamSeasonScoutProfilesResult: null,
      playerSeasonIndexResult: null,
      leagueTableRankScoutProfilesResult: null,
      teamSeasonIndexScoutProfilesResult: null,
      rowsCount: 0,
      teamCanonicalCommitted: false,
      projectionsCompleted: false,
      completed: false,
      stoppedAt: 'teamSeason',
      error: String(error?.message || 'Role team update failed').trim(),
    }
  }

  if (!teamSeasonResult.updated) {
    return {
      playerSeasonResult: null,
      playerScoutProfileDocsResult: null,
      teamSeasonResult,
      teamSeasonScoutProfilesResult: teamSeasonResult,
      playerSeasonIndexResult: null,
      leagueTableRankScoutProfilesResult: null,
      teamSeasonIndexScoutProfilesResult: null,
      rowsCount: 0,
      teamCanonicalCommitted: false,
      projectionsCompleted: false,
      completed: false,
      stoppedAt: 'teamSeason',
    }
  }

  const player = teamSeasonResult.player || payload.player || {}
  const rolePayload = {
    ...payload,
    player,
    primaryPosition: player.primaryPosition || '',
    positionLayer: player.positionLayer || '',
    numShirt: player.numShirt || '',
  }

  const projectionResults = {
    playerSeasonResult: null,
    playerScoutProfileDocsResult: null,
    playerSeasonIndexResult: null,
    leagueTableRankScoutProfilesResult: null,
    teamSeasonIndexScoutProfilesResult: null,
  }

  // Reuse the team document already read and updated in the team transaction.
  // The player sync falls back to its own read only when no team document exists.
  try {
    projectionResults.playerSeasonResult = await syncPlayerRoleAndScoutProfileDoc({
      ...rolePayload,
      teamDocument: teamSeasonResult.teamDocument || null,
    })
    projectionResults.playerScoutProfileDocsResult = buildPlayerSyncResult(
      projectionResults.playerSeasonResult
    )
  } catch (error) {
    return buildCommittedProjectionFailure({
      stage: 'playerDocument',
      error,
      teamSeasonResult,
      results: projectionResults,
    })
  }

  try {
    projectionResults.playerSeasonIndexResult = await updatePlayerSeasonSearchIndexRole(rolePayload)

    if (!projectionResults.playerSeasonIndexResult?.updated) {
      return buildCommittedProjectionFailure({
        stage: 'playerSearchIndex',
        error: new Error(
          projectionResults.playerSeasonIndexResult?.reason || 'Player season SearchIndex is missing'
        ),
        teamSeasonResult,
        results: projectionResults,
      })
    }
  } catch (error) {
    return buildCommittedProjectionFailure({
      stage: 'playerSearchIndex',
      error,
      teamSeasonResult,
      results: projectionResults,
    })
  }

  try {
    projectionResults.leagueTableRankScoutProfilesResult =
      await updateLeagueSeasonTableRankScoutProfilesSummary({
        ...rolePayload,
        scoutProfilesSummary: teamSeasonResult.scoutProfilesSummary,
      })
    if (!projectionResults.leagueTableRankScoutProfilesResult?.updated) {
      return buildCommittedProjectionFailure({
        stage: 'leagueScoutSummary',
        error: new Error(
          projectionResults.leagueTableRankScoutProfilesResult?.reason || 'League scout summary target is missing'
        ),
        teamSeasonResult,
        results: projectionResults,
      })
    }
  } catch (error) {
    return buildCommittedProjectionFailure({
      stage: 'leagueScoutSummary',
      error,
      teamSeasonResult,
      results: projectionResults,
    })
  }

  try {
    projectionResults.teamSeasonIndexScoutProfilesResult =
      await updateTeamSeasonSearchIndexScoutProfilesSummary({
        ...rolePayload,
        scoutProfilesSummary: teamSeasonResult.scoutProfilesSummary,
      })
    if (!projectionResults.teamSeasonIndexScoutProfilesResult?.updated) {
      return buildCommittedProjectionFailure({
        stage: 'teamSearchIndexSummary',
        error: new Error(
          projectionResults.teamSeasonIndexScoutProfilesResult?.reason || 'Team season SearchIndex is missing'
        ),
        teamSeasonResult,
        results: projectionResults,
      })
    }
  } catch (error) {
    return buildCommittedProjectionFailure({
      stage: 'teamSearchIndexSummary',
      error,
      teamSeasonResult,
      results: projectionResults,
    })
  }

  return {
    ...projectionResults,
    teamSeasonResult,
    teamSeasonScoutProfilesResult: teamSeasonResult,
    rowsCount: 1,
    teamCanonicalCommitted: true,
    projectionsCompleted: true,
    completed: true,
  }
}
