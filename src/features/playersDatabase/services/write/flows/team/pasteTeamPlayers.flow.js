// features/playersDatabase/services/write/flows/team/pasteTeamPlayers.flow.js

import { updateLeagueSeasonTableRankTeamUrl } from '../../leagues/index.js'
import {
  updateTeamSeasonSearchIndexRosterMeta,
  upsertPlayerSeasonSearchIndexMany,
} from '../../searchIndex/index.js'
import { resolveTeamPlayerIdentities } from '../../players/index.js'
import {
  reconcileTeamSeasonMovementCounterpartsWithClubRefresh,
  upsertTeamSeasonPlayers,
} from '../../teams/index.js'
import { readTeamSeasonRosterHistory } from '../../../read/entities/teamSeasonRosterHistory.js'
import { getTeamSeason } from '../../../read/entities/teamSeason.js'
import {
  ensureRequiredClubProjectionCompleted,
  syncClubProjectionFromTeamSeason,
} from '../../clubs/index.js'
import { normalizeSeasonIdentity } from '../../../../model/shared/season.model.js'
import { buildTeamLoadStatus } from '../../../../model/team/teamLoadStatus.model.js'
import {
  buildLeagueTeamPerformanceProjection,
  resolveLeagueSeasonStatus,
  resolveLeagueTeamPoints,
} from '../../../../domain/projections/teamPerformance.projection.js'
import {
  assertWriteResultClean,
  attachWriteFlowReport,
} from '../writeFlowReport.js'
import {
  ROSTER_IMPORT_MODE,
  buildRosterSnapshotContentHash,
  buildRosterSnapshotEventKey,
  mergeLocalAndResolvedPlayers,
  normalizeRosterImport,
  reconcileRosterMovement,
  resolveRosterPlayersLocally,
} from '../../../../domain/movement/index.js'
import { resolveTeamLookupKey } from '../../../../model/team/teamIdentity.model.js'
import {
  activateTeamRosterProjectionJob,
  createTeamRosterProjectionRevision,
  queueTeamRosterProjectionJob,
} from '../../teamRosterProjectionJobs/index.js'

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

const assertCurrentRosterProjectionRevision = async ({
  teamId = '', seasonKey = '', sourceRevision = '',
} = {}) => {
  const current = await getTeamSeason({ birthTeamDocumentId: teamId, seasonKey, bypassCache: true })
  if (String(current?.rosterProjectionRevision || '') === String(sourceRevision || '')) return

  const error = new Error('Roster projection was superseded by a newer load')
  error.code = 'ROSTER_PROJECTION_SUPERSEDED'
  error.superseded = true
  throw error
}

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
  const rosterProjectionRevision = createTeamRosterProjectionRevision()
  const normalizedPayload = normalizeTeamPlayersPayload(payload)
  const teamPerformance = buildLeagueTeamPerformanceProjection({
    league: normalizedPayload.league,
    season: normalizedPayload.season,
    target: normalizedPayload.target || 'current',
    team: normalizedPayload.team,
  })
  const teamPoints = resolveLeagueTeamPoints({
    league: normalizedPayload.league,
    season: normalizedPayload.season,
    target: normalizedPayload.target || 'current',
    team: normalizedPayload.team,
  })
  const results = {}
  const rawPlayers = Array.isArray(normalizedPayload.players) ? normalizedPayload.players : []
  const birthTeamDocumentId = resolveTeamLookupKey(normalizedPayload.team || {})
  let rosterHistory = {
    currentSeason: null,
    previousSeason: null,
  }
  let players = rawPlayers

  try {
    rosterHistory = await readTeamSeasonRosterHistory({
      birthTeamDocumentId,
      seasonKey: normalizedPayload.season.seasonKey,
    })
  } catch (error) {
    throw buildSyncError({
      stage: 'readTeamSeasonRosterHistory',
      cause: error,
      results,
    })
  }

  try {
    const currentKnownPlayers = [
      ...(Array.isArray(rosterHistory.currentSeason?.teamPlayers)
        ? rosterHistory.currentSeason.teamPlayers
        : []),
      ...(Array.isArray(rosterHistory.currentSeason?.pendingPlayers)
        ? rosterHistory.currentSeason.pendingPlayers
        : []),
    ]
    const previousPlayers = Array.isArray(rosterHistory.previousSeason?.teamPlayers)
      ? rosterHistory.previousSeason.teamPlayers
      : []
    const localResolution = resolveRosterPlayersLocally({
      players: rawPlayers,
      currentPlayers: currentKnownPlayers,
      previousPlayers,
    })
    const unresolvedPlayers = localResolution.unresolved.map(entry => entry.player)
    const broadResolvedPlayers = unresolvedPlayers.length
      ? await resolveTeamPlayerIdentities({
        players: unresolvedPlayers,
        season: normalizedPayload.season,
      })
      : []

    players = mergeLocalAndResolvedPlayers({
      totalCount: rawPlayers.length,
      localResolved: localResolution.resolved,
      broadResolved: broadResolvedPlayers,
      unresolved: localResolution.unresolved,
    })
  } catch (error) {
    throw buildSyncError({
      stage: 'resolveTeamPlayerIdentities',
      cause: error,
      results,
    })
  }

  const contentHash = normalizedPayload.rosterImport?.contentHash || buildRosterSnapshotContentHash({
    seasonKey: normalizedPayload.season.seasonKey,
    birthTeamDocumentId,
    players,
  })
  const sourceSnapshotKeyExplicit = Boolean(clean(
    normalizedPayload.rosterImport?.sourceSnapshotKey
  )) && normalizedPayload.rosterImport?.sourceSnapshotKeyExplicit !== false
  const incomingRosterImport = normalizeRosterImport({
    mode: normalizedPayload.rosterImport?.mode || ROSTER_IMPORT_MODE.AUTHORITATIVE_SNAPSHOT,
    sourceSnapshotKey: normalizedPayload.rosterImport?.sourceSnapshotKey || buildRosterSnapshotEventKey({ contentHash }),
    contentHash,
    effectiveAt: normalizedPayload.rosterImport?.effectiveAt,
  })

  try {
    results.teamSeasonResult = await upsertTeamSeasonPlayers({
      ...normalizedPayload,
      team: normalizedPayload.team || {},
      teamPerformance,
      players,
      rosterImport: incomingRosterImport,
      sourceSnapshotKeyExplicit,
      rosterProjectionRevision,
      reconcileMovement: ({ currentSeason, previousSeason, rosterImport }) => (
        reconcileRosterMovement({
          seasonKey: normalizedPayload.season.seasonKey,
          team: {
            ...(normalizedPayload.team || {}),
            birthTeamDocumentId,
          },
          incomingPlayers: players,
          missingPlayers: normalizedPayload.missingPlayers,
          currentSeason,
          previousSeason,
          rosterImport,
        })
      ),
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

  const projectionGuard = () => assertCurrentRosterProjectionRevision({
    teamId: results.teamSeasonResult.birthTeamDocumentId,
    seasonKey: results.teamSeasonResult.seasonKey,
    sourceRevision: rosterProjectionRevision,
  })

  try {
    results.projectionJob = await queueTeamRosterProjectionJob({
      league: normalizedPayload.league || {},
      season: normalizedPayload.season || {},
      team: {
        ...(normalizedPayload.team || {}),
        birthTeamDocumentId: results.teamSeasonResult.birthTeamDocumentId,
        teamDocumentId: results.teamSeasonResult.teamDocumentId,
      },
      teamSeasonDocumentId: results.teamSeasonResult.teamSeasonDocumentId,
      sourceRevision: rosterProjectionRevision,
      counterpartRequests: results.teamSeasonResult.movementState?.counterpartRequests,
      writeActionId: normalizedPayload.writeActionId,
    })
  } catch (error) {
    throw buildCommittedSyncError({ stage: 'queueTeamRosterProjectionJob', cause: error, results })
  }

  try {
    await projectionGuard()
    results.counterpartReconciliation = await reconcileTeamSeasonMovementCounterpartsWithClubRefresh({
      requests: results.teamSeasonResult.movementState?.counterpartRequests,
    })
  } catch (error) {
    throw buildCommittedSyncError({
      stage: 'reconcileTeamSeasonMovementCounterparts', cause: error, results,
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
    await projectionGuard()
    results.leagueTableRankResult = await updateLeagueSeasonTableRankTeamUrl({
      ...normalizedPayload,
      team: teamWithRosterMeta,
    })
  } catch (error) {
    throw buildCommittedSyncError({
      stage: 'updateLeagueSeasonTableRankTeamUrl',
      cause: error,
      results,
    })
  }

  try {
    await projectionGuard()
    results.playerSeasonIndexResult = await upsertPlayerSeasonSearchIndexMany({
      ...normalizedPayload,
      team: teamWithRosterMeta,
      players: indexedPlayers,
      replaceScope: incomingRosterImport.mode === ROSTER_IMPORT_MODE.AUTHORITATIVE_SNAPSHOT,
    })
    assertWriteResultClean({
      result: results.playerSeasonIndexResult,
      stage: 'playerSeasonIndexes',
    })
  } catch (error) {
    throw buildCommittedSyncError({
      stage: 'upsertPlayerSeasonSearchIndexMany',
      cause: error,
      results,
    })
  }

  try {
    await projectionGuard()
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
    throw buildCommittedSyncError({
      stage: 'updateTeamSeasonSearchIndexRosterMeta',
      cause: error,
      results,
    })
  }

  try {
    await projectionGuard()
    results.clubProjectionResult = ensureRequiredClubProjectionCompleted(await syncClubProjectionFromTeamSeason({
      league: normalizedPayload.league || {},
      season: normalizedPayload.season || {},
      team: teamWithRosterMeta,
      teamSeason: results.teamSeasonResult.seasonDocument || {},
      performance: teamPerformance,
      points: teamPoints,
      canonicalCommitted: true,
      lastWriteAction: 'PASTE_TEAM_PLAYERS',
    }))
  } catch (error) {
    const syncError = buildCommittedSyncError({
      stage: 'clubProjection',
      cause: error,
      results,
    })
    throw syncError
  }

  try {
    await projectionGuard()
    await activateTeamRosterProjectionJob({
      id: results.projectionJob?.id,
      sourceRevision: rosterProjectionRevision,
    })
  } catch (error) {
    throw buildCommittedSyncError({ stage: 'activateTeamRosterProjectionJob', cause: error, results })
  }

  return {
    ...results,
    rowsCount: results.playerSeasonIndexResult.rowsCount,
    teamCanonicalCommitted: true,
    projectionsCompleted: false,
    completed: false,
    backgroundSyncPending: true,
    sourceRevision: rosterProjectionRevision,
    syncStatus: 'background_sync_pending',
  }
}
