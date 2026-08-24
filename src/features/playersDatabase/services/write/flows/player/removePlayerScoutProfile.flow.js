// src/features/playersDatabase/services/write/flows/player/removePlayerScoutProfile.flow.js

import { updateLeagueSeasonTableRankScoutProfilesSummary } from '../../leagues/index.js'
import { removePlayerSeasonScoutProfile } from '../../players/index.js'
import {
  updatePlayerSeasonSearchIndexScoutProfiles,
  updateTeamSeasonSearchIndexScoutProfilesSummary,
} from '../../searchIndex/index.js'
import { removeTeamSeasonPlayerScoutProfile } from '../../teams/index.js'

const clean = value => String(value || '').trim()

const buildCommittedProjectionFailure = ({
  stage,
  error,
  teamSeasonResult,
  results = {},
} = {}) => ({
  ...results,
  teamSeasonResult,
  rowsCount: 1,
  teamCanonicalCommitted: true,
  projectionsCompleted: false,
  completed: true,
  stoppedAt: stage,
  projectionError: clean(error?.message || `Remove profile projection failed at ${stage}`),
})

export async function removePlayerScoutProfileFlow(payload = {}) {
  const profileId = clean(payload.profileId)
  if (!profileId) throw new Error('Missing scout profile id')

  let teamSeasonResult = null

  try {
    teamSeasonResult = await removeTeamSeasonPlayerScoutProfile({
      ...payload,
      profileId,
    })
  } catch (error) {
    return {
      playerSeasonResult: null,
      teamSeasonResult: null,
      playerSeasonIndexResult: null,
      leagueTableRankScoutProfilesResult: null,
      teamSeasonIndexScoutProfilesResult: null,
      rowsCount: 0,
      teamCanonicalCommitted: false,
      projectionsCompleted: false,
      completed: false,
      stoppedAt: 'teamSeason',
      error: clean(error?.message || 'Remove profile team update failed'),
    }
  }

  if (!teamSeasonResult.updated || !teamSeasonResult.player) {
    return {
      playerSeasonResult: null,
      teamSeasonResult,
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

  const nextPayload = {
    ...payload,
    profileId,
    player: teamSeasonResult.player,
    scoutProfiles: Array.isArray(teamSeasonResult.player.scoutProfiles)
      ? teamSeasonResult.player.scoutProfiles
      : [],
    scoutCombinations: Array.isArray(teamSeasonResult.player.scoutCombinations)
      ? teamSeasonResult.player.scoutCombinations
      : [],
  }
  const projectionResults = {
    playerSeasonResult: null,
    playerSeasonIndexResult: null,
    leagueTableRankScoutProfilesResult: null,
    teamSeasonIndexScoutProfilesResult: null,
  }

  try {
    projectionResults.playerSeasonResult = await removePlayerSeasonScoutProfile(nextPayload)
  } catch (error) {
    return buildCommittedProjectionFailure({
      stage: 'playerDocument',
      error,
      teamSeasonResult,
      results: projectionResults,
    })
  }

  try {
    projectionResults.playerSeasonIndexResult =
      await updatePlayerSeasonSearchIndexScoutProfiles(nextPayload)

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

  const summaryPayload = {
    ...nextPayload,
    scoutProfilesSummary: teamSeasonResult.scoutProfilesSummary,
  }

  try {
    projectionResults.leagueTableRankScoutProfilesResult =
      await updateLeagueSeasonTableRankScoutProfilesSummary(summaryPayload)
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
      await updateTeamSeasonSearchIndexScoutProfilesSummary(summaryPayload)
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
    rowsCount: 1,
    teamCanonicalCommitted: true,
    projectionsCompleted: true,
    completed: true,
  }
}
