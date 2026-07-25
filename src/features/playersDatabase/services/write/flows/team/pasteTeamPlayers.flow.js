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
import { normalizeSeasonIdentity } from '../../../../model/season.model.js'
import {
  assertWriteResultClean,
  attachWriteFlowReport,
} from '../writeFlowReport.js'

const clean = value => String(value || '').trim()

const buildSyncError = ({ stage, cause, results = {} }) => (
  attachWriteFlowReport({
    error: cause,
    stage,
    results,
    flow: 'pasteTeamPlayers',
  })
)

const assertTeamSeasonUpdated = result => {
  if (!result?.teamDocumentId || !result?.seasonId) {
    throw new Error('Team season roster was not updated')
  }
}

const normalizeTeamPlayersPayload = payload => {
  const seasonIdentity = normalizeSeasonIdentity({ season: payload.season || {} })
  const leagueId = clean(
    payload.league?.id ||
    payload.league?.leagueId ||
    payload.season?.leagueId ||
    payload.team?.leagueId
  )
  const seasonId = clean(seasonIdentity.seasonId || seasonIdentity.seasonKey)
  const seasonKey = clean(seasonIdentity.seasonKey || seasonIdentity.seasonId)

  return {
    ...payload,
    league: {
      ...(payload.league || {}),
      id: leagueId,
      leagueId,
    },
    season: {
      ...(payload.season || {}),
      leagueId,
      seasonId,
      seasonKey,
    },
    team: {
      ...(payload.team || {}),
      leagueId,
    },
  }
}

export async function pasteTeamPlayersFlow(payload = {}) {
  const normalizedPayload = normalizeTeamPlayersPayload(payload)
  const results = {}
  const players = Array.isArray(normalizedPayload.players) ? normalizedPayload.players : []

  try {
    results.teamDocResult = await ensureTeamDoc(normalizedPayload.team || {})
  } catch (error) {
    throw buildSyncError({
      stage: 'ensureTeamDoc',
      cause: error,
      results,
    })
  }

  const team = {
    ...(normalizedPayload.team || {}),
    birthTeamDocumentId: results.teamDocResult.birthTeamDocumentId,
    teamDocumentId: results.teamDocResult.teamDocumentId,
  }

  try {
    results.teamSeasonResult = await upsertTeamSeasonPlayers({
      ...normalizedPayload,
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

  const indexedPlayers = Array.isArray(results.teamSeasonResult.players)
    ? results.teamSeasonResult.players
    : players

  const teamWithRosterMeta = {
    ...team,
    playersCount: results.teamSeasonResult.playersCount,
  }

  try {
    results.leagueTableRankResult = await updateLeagueSeasonTableRankTeamUrl({
      ...normalizedPayload,
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
      ...normalizedPayload,
      team: teamWithRosterMeta,
      players: indexedPlayers,
    })
    assertWriteResultClean({
      result: results.playerSeasonIndexResult,
      stage: 'playerSeasonIndexes',
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
      ...normalizedPayload,
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
