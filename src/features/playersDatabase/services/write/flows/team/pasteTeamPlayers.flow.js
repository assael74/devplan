// features/playersDatabase/services/write/flows/team/pasteTeamPlayers.flow.js

import { updateLeagueSeasonTableRankTeamUrl } from '../../leagues/index.js'
import {
  updateTeamSeasonSearchIndexRosterMeta,
  upsertPlayerSeasonSearchIndexMany,
} from '../../searchIndex/index.js'
import { resolveTeamPlayerIdentities } from '../../players/index.js'
import { upsertTeamSeasonPlayers } from '../../teams/index.js'
import { normalizeSeasonIdentity } from '../../../../model/season.model.js'
import { buildTeamLoadStatus } from '../../../../model/teamLoadStatus.model.js'
import {
  buildLeagueTeamPerformanceProjection,
  resolveLeagueSeasonStatus,
} from '../../shared/teamPerformanceProjection.js'
import {
  assertWriteResultClean,
  attachWriteFlowReport,
} from '../writeFlowReport.js'

const clean = value => String(value || '').trim()

const resolveLeagueSeasonLifecycleOrThrow = ({ league, season } = {}) => {
  const seasonStatus = resolveLeagueSeasonStatus({ league, season })

  if (seasonStatus === 'active' || seasonStatus === 'completed') {
    return seasonStatus
  }

  const error = new Error('League season lifecycle could not be resolved')
  error.code = 'LEAGUE_SEASON_LIFECYCLE_UNRESOLVED'
  throw error
}

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
  const leagueLevelSource = payload.season?.leagueLevel !== undefined
    && payload.season?.leagueLevel !== null
    ? payload.season.leagueLevel
    : payload.team?.leagueLevel !== undefined
      && payload.team?.leagueLevel !== null
      ? payload.team.leagueLevel
      : payload.league?.leagueLevel !== undefined
        && payload.league?.leagueLevel !== null
        ? payload.league.leagueLevel
        : payload.league?.level
  const leagueLevel = Number.isFinite(Number(leagueLevelSource))
    ? Number(leagueLevelSource)
    : 0
  const expectedLevelDeltaSource = payload.season?.expectedLevelDelta !== undefined
    && payload.season?.expectedLevelDelta !== null
    ? payload.season.expectedLevelDelta
    : payload.team?.expectedLevelDelta
  const expectedLevelDelta = expectedLevelDeltaSource === null || expectedLevelDeltaSource === undefined || expectedLevelDeltaSource === ''
    ? null
    : Number.isFinite(Number(expectedLevelDeltaSource))
      ? Number(expectedLevelDeltaSource)
      : null

  const normalizedSeason = {
    ...(payload.season || {}),
    leagueId,
    leagueLevel,
    expectedLevelDelta,
    seasonId,
    seasonKey,
  }
  const leagueSeasonStatus = resolveLeagueSeasonLifecycleOrThrow({
    league: payload.league,
    season: normalizedSeason,
  })

  return {
    ...payload,
    league: {
      ...(payload.league || {}),
      id: leagueId,
      leagueId,
    },
    season: {
      ...normalizedSeason,
      seasonStatus: leagueSeasonStatus,
    },
    team: {
      ...(payload.team || {}),
      leagueId,
      leagueLevel,
      expectedLevelDelta,
    },
  }
}

export async function pasteTeamPlayersFlow(payload = {}) {
  const normalizedPayload = normalizeTeamPlayersPayload(payload)
  const teamPerformance = buildLeagueTeamPerformanceProjection({
    league: normalizedPayload.league,
    season: normalizedPayload.season,
    target: normalizedPayload.target || 'current',
    team: normalizedPayload.team,
  })
  const results = {}
  const rawPlayers = Array.isArray(normalizedPayload.players) ? normalizedPayload.players : []
  let players = rawPlayers

  try {
    players = await resolveTeamPlayerIdentities({
      players: rawPlayers,
      season: normalizedPayload.season,
    })
  } catch (error) {
    throw buildSyncError({
      stage: 'resolveTeamPlayerIdentities',
      cause: error,
      results,
    })
  }

  try {
    results.teamSeasonResult = await upsertTeamSeasonPlayers({
      ...normalizedPayload,
      team: normalizedPayload.team || {},
      teamPerformance,
      players,
    })
    assertTeamSeasonUpdated(results.teamSeasonResult)
    results.teamDocResult = {
      birthTeamDocumentId: results.teamSeasonResult.birthTeamDocumentId,
      teamDocumentId: results.teamSeasonResult.teamDocumentId,
      created: Boolean(results.teamSeasonResult.createdTeam),
    }
  } catch (error) {
    throw buildSyncError({
      stage: 'upsertTeamSeasonPlayers',
      cause: error,
      results,
    })
  }

  const team = {
    ...(normalizedPayload.team || {}),
    birthTeamDocumentId: results.teamSeasonResult.birthTeamDocumentId,
    teamDocumentId: results.teamSeasonResult.teamDocumentId,
  }

  const indexedPlayers = Array.isArray(results.teamSeasonResult.players)
    ? results.teamSeasonResult.players
    : players

  const teamLoadStatus = buildTeamLoadStatus(indexedPlayers)
  const teamWithRosterMeta = {
    ...team,
    ...teamLoadStatus,
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
      teamSeasonDocumentId: results.teamSeasonResult.teamSeasonDocumentId,
      playersCount: results.teamSeasonResult.playersCount,
      playerSeasonIndexCount: results.playerSeasonIndexResult.rowsCount,
      teamBalance: results.teamSeasonResult.teamBalance,
      teamPerformance,
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
