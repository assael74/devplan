// src/features/playersDatabase/services/write/flows/player/removePlayerScoutProfile.flow.js

import { updateLeagueSeasonTableRankScoutProfilesSummary } from '../../leagues/index.js'
import {
  updateTeamSeasonSearchIndexScoutProfilesSummary,
} from '../../searchIndex/index.js'
import { removePlayerScoutProfileCoordinated } from './removePlayerScoutProfile.coordinated.js'
import {
  ensureRequiredClubProjectionCompleted,
  syncClubProjectionFromTeamSeason,
} from '../../clubs/index.js'
import { buildWriteFlowSyncError } from '../writeFlowSyncError.js'

const clean = value => String(value || '').trim()

const buildCommittedProjectionFailure = ({
  stage,
  error,
  teamSeasonResult,
  results = {},
} = {}) => buildWriteFlowSyncError({
  name: 'RemovePlayerScoutProfileProjectionSyncError',
  fallbackMessage: 'Scout profile was removed, but projection synchronization failed',
  stage,
  cause: error,
  results: {
    ...results,
    teamSeasonResult,
    rowsCount: 1,
    teamCanonicalCommitted: true,
    projectionsCompleted: false,
    completed: false,
    syncStatus: 'projection_failed',
    recoveryRequired: true,
    stoppedAt: stage,
    projectionError: clean(error?.message || `Remove profile projection failed at ${stage}`),
  },
})

export async function removePlayerScoutProfileFlow(payload = {}) {
  const profileId = clean(payload.profileId)
  if (!profileId) throw new Error('Missing scout profile id')

  let teamSeasonResult = null
  const projectionResults = {
    playerSeasonResult: null,
    playerSeasonIndexResult: null,
    leagueTableRankScoutProfilesResult: null,
    teamSeasonIndexScoutProfilesResult: null,
  }

  try {
    const coordinatedResult = await removePlayerScoutProfileCoordinated({
      ...payload,
      profileId,
    })
    projectionResults.playerSeasonResult = coordinatedResult.playerSeasonResult || coordinatedResult
    projectionResults.playerSeasonIndexResult = coordinatedResult.playerSeasonIndexResult || null
    teamSeasonResult = coordinatedResult.teamSeasonResult || null
  } catch (error) {
    return {
      ...projectionResults,
      teamSeasonResult: null,
      rowsCount: 0,
      teamCanonicalCommitted: false,
      projectionsCompleted: false,
      completed: false,
      stoppedAt: 'playerDocument',
      error: clean(error?.message || 'Remove profile player update failed'),
    }
  }

  if (!projectionResults.playerSeasonResult.updated) {
    return {
      ...projectionResults,
      teamSeasonResult: null,
      rowsCount: 0,
      teamCanonicalCommitted: false,
      projectionsCompleted: false,
      completed: false,
      stoppedAt: 'playerDocument',
    }
  }

  const nextPayload = {
    ...payload,
    profileId,
    player: teamSeasonResult?.player || projectionResults.playerSeasonResult.player,
    scoutProfiles: Array.isArray(projectionResults.playerSeasonResult.player?.scoutProfiles)
      ? projectionResults.playerSeasonResult.player.scoutProfiles
      : [],
    scoutCombinations: Array.isArray(projectionResults.playerSeasonResult.player?.scoutCombinations)
      ? projectionResults.playerSeasonResult.player.scoutCombinations
      : [],
  }

  if (!teamSeasonResult.updated || !teamSeasonResult.player) {
    if (teamSeasonResult?.reason === 'teamPlayerMissing') {
      return {
        ...projectionResults,
        teamSeasonResult,
        rowsCount: 1,
        teamCanonicalCommitted: true,
        projectionsCompleted: true,
        completed: true,
      }
    }
    throw buildCommittedProjectionFailure({
      stage: 'teamSeasonProjection',
      error: new Error(teamSeasonResult.reason || 'Team season player is missing'),
      teamSeasonResult,
      results: projectionResults,
    })
  }

  if (!projectionResults.playerSeasonIndexResult?.updated) {
    throw buildCommittedProjectionFailure({
      stage: 'playerSearchIndex',
      error: new Error(
        projectionResults.playerSeasonIndexResult?.reason || 'Player season SearchIndex is missing'
      ),
      teamSeasonResult,
      results: projectionResults,
    })
  }

  const summaryPayload = {
    ...nextPayload,
    teamSeasonDocumentId: teamSeasonResult.teamSeasonDocumentId,
    scoutProfilesSummary: teamSeasonResult.scoutProfilesSummary,
  }

  try {
    projectionResults.leagueTableRankScoutProfilesResult =
      await updateLeagueSeasonTableRankScoutProfilesSummary(summaryPayload)
    if (!projectionResults.leagueTableRankScoutProfilesResult?.updated) {
      throw buildCommittedProjectionFailure({
        stage: 'leagueScoutSummary',
        error: new Error(
          projectionResults.leagueTableRankScoutProfilesResult?.reason || 'League scout summary target is missing'
        ),
        teamSeasonResult,
        results: projectionResults,
      })
    }
  } catch (error) {
    throw buildCommittedProjectionFailure({
      stage: 'leagueScoutSummary',
      error,
      teamSeasonResult,
      results: projectionResults,
    })
  }

  try {
    projectionResults.teamSeasonIndexScoutProfilesResult =
      await updateTeamSeasonSearchIndexScoutProfilesSummary(summaryPayload)
    if (!projectionResults.teamSeasonIndexScoutProfilesResult?.updated) {
      throw buildCommittedProjectionFailure({
        stage: 'teamSearchIndexSummary',
        error: new Error(
          projectionResults.teamSeasonIndexScoutProfilesResult?.reason || 'Team season SearchIndex is missing'
        ),
        teamSeasonResult,
        results: projectionResults,
      })
    }
  } catch (error) {
    throw buildCommittedProjectionFailure({
      stage: 'teamSearchIndexSummary',
      error,
      teamSeasonResult,
      results: projectionResults,
    })
  }


  try {
    projectionResults.clubProjectionResult = ensureRequiredClubProjectionCompleted(await syncClubProjectionFromTeamSeason({
      league: nextPayload.league || {},
      season: nextPayload.season || {},
      team: nextPayload.team || {},
      teamSeason: teamSeasonResult.seasonDocument || {},
      canonicalCommitted: true,
      lastWriteAction: 'REMOVE_PLAYER_SCOUT_PROFILE',
    }))
  } catch (error) {
    throw buildCommittedProjectionFailure({
      stage: 'clubProjection',
      error,
      teamSeasonResult,
      results: projectionResults,
    })
  }

  return {
    ...projectionResults,
    teamSeasonResult,
    rowsCount: 1,
    teamCanonicalCommitted: true,
    projectionsCompleted: true,
    completed: true,
  }
}
