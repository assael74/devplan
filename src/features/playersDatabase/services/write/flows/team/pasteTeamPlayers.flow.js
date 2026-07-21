// features/playersDatabase/services/write/flows/team/pasteTeamPlayers.flow.js

import {
  updateLeagueSeasonTableRankTeamUrl,
} from '../../leagues/index.js'
import {
  updateTeamSeasonSearchIndexRosterMeta,
  upsertPlayerSeasonSearchIndexMany,
} from '../../searchIndex/index.js'
import {
  ensureTeamDoc,
  upsertTeamSeasonPlayers,
} from '../../teams/index.js'

const buildSyncError = ({ stage, cause, results = {} }) => {
  const error = new Error(cause?.message || `Team roster sync failed at ${stage}`)

  error.name = 'TeamRosterSyncError'
  error.stage = stage
  error.cause = cause
  error.results = results

  return error
}

const assertTeamSeasonUpdated = result => {
  if (!result?.teamDocumentId || !result?.seasonId) {
    throw new Error('Team season roster was not updated')
  }
}

export async function pasteTeamPlayersFlow(payload = {}) {
  const results = {}
  const players = Array.isArray(payload.players) ? payload.players : []

  try {
    results.teamDocResult = await ensureTeamDoc(payload.team || {})
  } catch (error) {
    throw buildSyncError({
      stage: 'ensureTeamDoc',
      cause: error,
      results,
    })
  }

  const team = {
    ...(payload.team || {}),
    birthTeamDocumentId: results.teamDocResult.birthTeamDocumentId,
    teamDocumentId: results.teamDocResult.teamDocumentId,
  }

  try {
    results.teamSeasonResult = await upsertTeamSeasonPlayers({
      ...payload,
      team,
      players,
    })
    assertTeamSeasonUpdated(results.teamSeasonResult)
  } catch (error) {
    throw buildSyncError({
      stage: 'upsertTeamSeasonPlayers',
      cause: error,
      results,
    })
  }

  const teamWithRosterMeta = {
    ...team,
    playersCount: results.teamSeasonResult.playersCount,
  }

  try {
    results.leagueTableRankResult = await updateLeagueSeasonTableRankTeamUrl({
      ...payload,
      team: teamWithRosterMeta,
    })
  } catch (error) {
    throw buildSyncError({
      stage: 'updateLeagueSeasonTableRankTeamUrl',
      cause: error,
      results,
    })
  }

  try {
    results.playerSeasonIndexResult = await upsertPlayerSeasonSearchIndexMany({
      ...payload,
      team: teamWithRosterMeta,
      players,
    })
  } catch (error) {
    throw buildSyncError({
      stage: 'upsertPlayerSeasonSearchIndexMany',
      cause: error,
      results,
    })
  }

  try {
    results.teamSeasonIndexResult = await updateTeamSeasonSearchIndexRosterMeta({
      ...payload,
      team: teamWithRosterMeta,
      playersCount: results.teamSeasonResult.playersCount,
      playerSeasonIndexCount: results.playerSeasonIndexResult.rowsCount,
    })
  } catch (error) {
    throw buildSyncError({
      stage: 'updateTeamSeasonSearchIndexRosterMeta',
      cause: error,
      results,
    })
  }

  return {
    ...results,
    rowsCount: results.playerSeasonIndexResult.rowsCount,
    syncStatus: 'complete',
  }
}
