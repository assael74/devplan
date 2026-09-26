import { getLeagueById } from '../../../read/entities/league.js'
import { readPlayerSeasonIndexScopeRows } from '../../../read/indexes/teamRosterSyncSources.read.js'
import { readLeaguesMasterDocument } from '../../../read/masters/leaguesMaster.read.js'
import { readClubsMasterDocument } from '../../../read/masters/clubsMaster.read.js'
import { readClubDocumentV2 as readClubDocument } from '../../../read/entities/clubV2.js'
import { buildRosterClubIdentity as buildClubIdentityFromTeam, resolveRosterClubTransferCoverageStatus as resolveClubTransferCoverageStatus } from '../../../../domain/rosterV2/clubRosterProjection.helpers.js'
import { buildPlayerSeasonIndexSyncPlan } from '../../../../domain/rosterV2/support/searchIndex/player/playerSeasonIndex.plan.js'
import { buildTeamSeasonRosterMetaSyncPlan } from '../../../../domain/rosterV2/support/searchIndex/team/teamSeasonRosterMeta.plan.js'
import {
  buildLeaguesMasterLeagueEntry,
  buildLeaguesMasterSummary,
  sortLeaguesMasterEntries,
} from '../../../../domain/projections/leaguesMaster.projection.js'
import { buildLeagueTeamRosterSyncPlan } from '../../../../domain/rosterV2/support/leagues/leagueTeamRoster.plan.js'
import { buildClubAgeGroupSeasonProjection, buildClubDocumentProjection, buildClubsMasterClubProjection } from '../../../../domain/projections/club/index.js'
import { readTeamSeasonRosterHistory } from '../../../read/entities/teamSeasonRosterHistory.js'
import { resolveTeamPlayerIdentitiesWithSources } from '../../../read/identity/playerIdentityPreview.read.js'
import { buildPreparedTeamSeasonRoster, resolvePersistedRosterImport } from '../../../../domain/rosterV2/approvedRosterCanonical.builder.js'
import { buildApprovedCounterpartTeamSeason as buildReconciledCounterpartTeamSeason } from '../../../../domain/rosterV2/counterpartRoster.builder.js'
import { resolveRosterCounterpartCandidateV2 as resolveTeamSeasonMovementCounterpartCandidate } from '../../../read/entities/teamMovementCounterpartV2.js'
import { normalizeSeasonIdentity } from '../../../../model/shared/season.model.js'
import { buildTeamSeasonDocumentId, resolveTeamLookupKey } from '../../../../model/team/teamIdentity.model.js'
import { buildTeamLoadStatus } from '../../../../model/team/teamLoadStatus.model.js'
import {
  buildLeagueTeamPerformanceProjection,
  resolveLeagueTeamPoints,
  resolveLeagueSeasonStatus,
} from '../../../../domain/projections/teamPerformance.projection.js'
import {
  ROSTER_IMPORT_MODE,
  buildRosterSnapshotContentHash,
  buildRosterSnapshotEventKey,
  mergeLocalAndResolvedPlayers,
  normalizeRosterImport,
  reconcileRosterMovement,
  resolveRosterPlayersLocally,
} from '../../../../domain/movement/index.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()


export const normalizeTeamPlayersPayload = payload => {
  const seasonIdentity = normalizeSeasonIdentity({ season: payload.season || {} })
  const leagueId = clean(
    payload.league?.id ||
    payload.league?.leagueId ||
    payload.season?.leagueId ||
    payload.team?.leagueId
  )
  const seasonId = clean(seasonIdentity.seasonId || seasonIdentity.seasonKey)
  const seasonKey = clean(seasonIdentity.seasonKey || seasonIdentity.seasonId)
  const leagueLevelSource = payload.season?.leagueLevel !== undefined && payload.season?.leagueLevel !== null
    ? payload.season.leagueLevel
    : payload.team?.leagueLevel !== undefined && payload.team?.leagueLevel !== null
      ? payload.team.leagueLevel
      : payload.league?.leagueLevel !== undefined && payload.league?.leagueLevel !== null
        ? payload.league.leagueLevel
        : payload.league?.level
  const leagueLevel = Number.isFinite(Number(leagueLevelSource))
    ? Number(leagueLevelSource)
    : 0
  const expectedLevelDeltaSource = payload.season?.expectedLevelDelta !== undefined && payload.season?.expectedLevelDelta !== null
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
  const seasonStatus = resolveLeagueSeasonStatus({
    league: payload.league,
    season: normalizedSeason,
  })

  if (seasonStatus !== 'active' && seasonStatus !== 'completed') {
    const error = new Error('League season lifecycle could not be resolved')
    error.code = 'LEAGUE_SEASON_LIFECYCLE_UNRESOLVED'
    throw error
  }

  return {
    ...payload,
    league: {
      ...(payload.league || {}),
      id: leagueId,
      leagueId,
    },
    season: {
      ...normalizedSeason,
      seasonStatus,
    },
    team: {
      ...(payload.team || {}),
      leagueId,
      leagueLevel,
      expectedLevelDelta,
    },
  }
}

const resolvePlayers = async ({ rawPlayers, rosterHistory, season }) => {
  // Pending belongs to Movement state, not the canonical roster. Only an
  // existing Team Season player may be automatically confirmed in roster.
  const currentRosterPlayers = Array.isArray(rosterHistory.currentSeason?.teamPlayers)
    ? rosterHistory.currentSeason.teamPlayers
    : []
  const previousPlayers = Array.isArray(rosterHistory.previousSeason?.teamPlayers)
    ? rosterHistory.previousSeason.teamPlayers
    : []
  const localResolution = resolveRosterPlayersLocally({
    players: rawPlayers,
    currentPlayers: currentRosterPlayers,
    previousPlayers,
  })
  const unresolvedPlayers = localResolution.unresolved.map(entry => entry.player)
  const broadResolution = unresolvedPlayers.length
    ? await resolveTeamPlayerIdentitiesWithSources({
      players: unresolvedPlayers,
      season,
    })
    : { players: [], sourceDocuments: [], queryManifest: [] }

  return {
    players: mergeLocalAndResolvedPlayers({
      totalCount: rawPlayers.length,
      localResolved: localResolution.resolved,
      broadResolved: broadResolution.players,
      unresolved: localResolution.unresolved,
    }),
    identitySourceDocuments: broadResolution.sourceDocuments,
    identityQueryManifest: broadResolution.queryManifest || [],
  }
}

const readCounterpartState = async ({ request = {} } = {}) => {
  const candidate = await resolveTeamSeasonMovementCounterpartCandidate({ request })
  if (!candidate) return null

  const teamRoot = candidate.teamRoot
  const teamSeason = candidate.teamSeason

  return {
    movementId: clean(request.movementId),
    playerId: clean(request.playerId),
    birthTeamDocumentId: clean(candidate.birthTeamDocumentId),
    seasonKey: clean(candidate.seasonKey),
    exists: Boolean(teamRoot && teamSeason),
    teamName: clean(teamRoot?.teamName || teamRoot?.name || teamRoot?.displayName),
    direction: request.outgoing ? 'incoming' : 'outgoing',
    teamRoot,
    teamSeason,
    checkedSeasons: (candidate.checkedSeasons || []).map(row => ({
      seasonKey: clean(row.seasonKey),
    })),
  }
}

const buildClubSyncOperations = async ({
  league = {}, season = {}, team = {}, teamSeason = {}, performance = null, points = 0,
  operationSuffix = 'local',
} = {}) => {
  const clubIdentity = buildClubIdentityFromTeam(team)
  if (!clubIdentity?.clubId) return { clubProjectionOperations: [], clubsMasterOperations: [] }

  const ageGroupSeasonProjection = buildClubAgeGroupSeasonProjection({
    season, league, team, teamSeason, performance, points,
    transferCoverageStatus: resolveClubTransferCoverageStatus(teamSeason),
  })
  const currentClub = await readClubDocument({ clubId: clubIdentity.clubId })
  const projectedClub = buildClubDocumentProjection({
    existingClub: currentClub.club || {}, clubIdentity, ageGroupSeasonProjection, projectionVersion: 1,
    updatedAt: currentClub.club?.updatedAt || null,
  })
  const masterEntry = buildClubsMasterClubProjection({ club: projectedClub })
  const masterAgeGroupEntry = (Array.isArray(masterEntry?.ageGroups) ? masterEntry.ageGroups : [])
    .find(row => clean(row?.ageGroupId) === clean(ageGroupSeasonProjection?.ageGroupId)) || null
  const key = [clubIdentity.clubId, ageGroupSeasonProjection?.ageGroupId,
    ageGroupSeasonProjection?.season?.seasonKey, ageGroupSeasonProjection?.season?.teamId, operationSuffix]
    .map(clean).filter(Boolean).join('::')

  return {
    clubProjectionOperations: [{
      operationKey: key,
      target: {
        clubId: clubIdentity.clubId,
        ageGroupId: clean(ageGroupSeasonProjection?.ageGroupId),
        seasonKey: clean(ageGroupSeasonProjection?.season?.seasonKey),
        teamId: clean(ageGroupSeasonProjection?.season?.teamId),
      },
      patch: { clubIdentity, ageGroupSeasonProjection },
    }],
    clubsMasterOperations: [{
      operationKey: clean(clubIdentity.clubId),
      target: { clubId: clean(clubIdentity.clubId) },
      patch: {
        clubIdentity: {
          clubId: masterEntry.clubId, externalClubId: masterEntry.externalClubId, clubUrl: masterEntry.clubUrl,
          name: masterEntry.name, shortName: masterEntry.shortName, clubLevel: masterEntry.clubLevel,
          clubStrengthLevel: masterEntry.clubStrengthLevel,
        },
        ageGroupEntry: masterAgeGroupEntry,
      },
    }],
  }
}

export async function prepareRosterImportPlan(payload = {}) {
  const normalizedPayload = normalizeTeamPlayersPayload(payload)
  const birthTeamDocumentId = resolveTeamLookupKey(normalizedPayload.team || {})
  if (!birthTeamDocumentId) throw new Error('Missing birth team id')

  const canonicalLeague = await getLeagueById(normalizedPayload.league?.id, { bypassCache: true })
  if (!canonicalLeague) {
    const error = new Error('Canonical League document was not found')
    error.code = 'CANONICAL_LEAGUE_NOT_FOUND'
    throw error
  }

  const effectivePayload = normalizeTeamPlayersPayload({
    ...normalizedPayload,
    league: canonicalLeague,
  })
  const rosterHistory = await readTeamSeasonRosterHistory({
    birthTeamDocumentId,
    seasonKey: effectivePayload.season.seasonKey,
    bypassCache: true,
  })
  const rawPlayers = Array.isArray(normalizedPayload.players) ? normalizedPayload.players : []
  const playerResolution = await resolvePlayers({
    rawPlayers,
    rosterHistory,
    season: effectivePayload.season,
  })
  const players = playerResolution.players
  const contentHash = buildRosterSnapshotContentHash({
    seasonKey: effectivePayload.season.seasonKey,
    birthTeamDocumentId,
    players,
  })
  const sourceSnapshotKeyExplicit = Boolean(clean(
    effectivePayload.rosterImport?.sourceSnapshotKey
  )) && effectivePayload.rosterImport?.sourceSnapshotKeyExplicit !== false
  const incomingRosterImport = normalizeRosterImport({
    mode: effectivePayload.rosterImport?.mode || ROSTER_IMPORT_MODE.AUTHORITATIVE_SNAPSHOT,
    sourceSnapshotKey: effectivePayload.rosterImport?.sourceSnapshotKey || buildRosterSnapshotEventKey({ contentHash }),
    contentHash,
    effectiveAt: effectivePayload.rosterImport?.effectiveAt,
  })
  const persistedRosterImport = resolvePersistedRosterImport({
    rosterImport: incomingRosterImport,
    existingSeason: rosterHistory.currentSeason,
    sourceSnapshotKeyExplicit,
  })
  const movementState = reconcileRosterMovement({
    seasonKey: effectivePayload.season.seasonKey,
    team: {
      ...(effectivePayload.team || {}),
      birthTeamDocumentId,
    },
    incomingPlayers: players,
    missingPlayers: effectivePayload.missingPlayers,
    currentSeason: rosterHistory.currentSeason,
    previousSeason: rosterHistory.previousSeason,
    rosterImport: persistedRosterImport,
  })
  const teamPerformance = buildLeagueTeamPerformanceProjection({
    league: effectivePayload.league,
    season: effectivePayload.season,
    target: effectivePayload.target || 'current',
    team: effectivePayload.team,
  })
  const teamPoints = resolveLeagueTeamPoints({
    league: effectivePayload.league,
    season: effectivePayload.season,
    target: effectivePayload.target || 'current',
    team: effectivePayload.team,
  })
  const prepared = buildPreparedTeamSeasonRoster({
    season: effectivePayload.season,
    team: effectivePayload.team,
    players,
    teamPerformance,
    rosterImport: persistedRosterImport,
    movementState,
    sourceSnapshotKeyExplicit,
    existingSeason: rosterHistory.currentSeason,
  })
  const playerNames = new Map(players.map(player => [
    clean(player.playerId),
    clean(player.fullName || player.displayName || player.name),
  ]))
  const counterpartStates = (await Promise.all(
    (movementState.counterpartRequests || []).map(request => readCounterpartState({ request }))
  )).filter(Boolean).map(row => ({
    ...row,
    playerName: playerNames.get(clean(row.playerId)) || '',
  }))
  const counterpartByMovementId = new Map(counterpartStates.map(row => [clean(row.movementId), row]))
  const approvedCounterpartRequests = (movementState.counterpartRequests || []).map(request => {
    const state = counterpartByMovementId.get(clean(request.movementId))
    return {
      ...request,
      counterpartSeasonKey: clean(state?.seasonKey || request.counterpartSeasonKey),
    }
  })

  const playerIndexRows = await readPlayerSeasonIndexScopeRows({
    birthTeamId: birthTeamDocumentId,
    seasonKey: effectivePayload.season.seasonKey,
  })
  const playerIndexPlan = buildPlayerSeasonIndexSyncPlan({
    league: effectivePayload.league,
    season: effectivePayload.season,
    team: { ...(effectivePayload.team || {}), birthTeamDocumentId },
    target: effectivePayload.target || 'current',
    players: prepared.persistedSeason.teamPlayers || players,
    replaceScope: true,
    existingRows: playerIndexRows,
  })
  const approvedPlayerIndexState = {
    upserts: playerIndexPlan.operations
      .filter(operation => operation.type === 'upsert')
      .map(operation => ({ docId: operation.docId, fields: operation.patch })),
    deletes: playerIndexPlan.operations
      .filter(operation => operation.type === 'delete')
      .map(operation => operation.docId),
  }

  const teamIndexPlan = buildTeamSeasonRosterMetaSyncPlan({
    league: effectivePayload.league,
    season: effectivePayload.season,
    team: { ...(effectivePayload.team || {}), birthTeamDocumentId },
    target: effectivePayload.target || 'current',
    playersCount: prepared.persistedSeason.teamPlayers?.length || 0,
    playerSeasonIndexCount: playerIndexPlan.operations.filter(operation => operation.type !== 'delete').length,
    teamBalance: prepared.persistedSeason.teamBalance || null,
    teamPerformance,
    points: teamPoints,
    teamSeasonDocumentId: buildTeamSeasonDocumentId(birthTeamDocumentId, effectivePayload.season.seasonKey),
  })
  const leagueTeamPlan = buildLeagueTeamRosterSyncPlan({
    league: canonicalLeague,
    season: effectivePayload.season,
    team: {
      ...(effectivePayload.team || {}),
      birthTeamDocumentId,
      playersCount: prepared.persistedSeason.teamPlayers?.length || 0,
      ...buildTeamLoadStatus(prepared.persistedSeason.teamPlayers || []),
    },
  })
  if (!leagueTeamPlan.patch || !clean(leagueTeamPlan.target?.sourceTarget)) {
    const error = new Error('Team row was not found in the canonical League season')
    error.code = 'LEAGUE_TEAM_ROW_NOT_FOUND'
    throw error
  }

  const leaguesMaster = await readLeaguesMasterDocument({ fresh: true })
  const existingLeagueMasterEntry = (Array.isArray(leaguesMaster?.leagues) ? leaguesMaster.leagues : [])
    .find(entry => clean(entry?.leagueId) === clean(effectivePayload.league?.id || effectivePayload.league?.leagueId)) || {}
  const leaguesMasterEntry = buildLeaguesMasterLeagueEntry(leagueTeamPlan.projectedLeague, existingLeagueMasterEntry)
  const nextLeaguesMasterEntries = sortLeaguesMasterEntries([
    ...(Array.isArray(leaguesMaster?.leagues) ? leaguesMaster.leagues : [])
      .filter(entry => clean(entry?.leagueId) !== clean(leaguesMasterEntry?.leagueId)),
    leaguesMasterEntry,
  ])
  const leaguesMasterSummary = buildLeaguesMasterSummary(nextLeaguesMasterEntries)
  const approvedTeamProjectionState = {
    searchIndex: {
      docId: teamIndexPlan.docId,
      fields: teamIndexPlan.patch,
    },
    league: {
      leagueId: clean(effectivePayload.league?.id || effectivePayload.league?.leagueId),
      target: { ...(leagueTeamPlan.target || {}) },
      patch: { ...(leagueTeamPlan.patch || {}) },
    },
  }
  const approvedLeaguesMasterState = {
    id: 'all',
    docType: 'leagues_master',
    summary: leaguesMasterSummary,
    leagues: nextLeaguesMasterEntries,
  }
  const localClubOps = await buildClubSyncOperations({
    league: effectivePayload.league, season: effectivePayload.season,
    team: { ...(effectivePayload.team || {}), birthTeamDocumentId },
    teamSeason: prepared.persistedSeason, performance: teamPerformance, points: teamPoints,
    operationSuffix: 'local',
  })
  const counterpartClubOps = { clubProjectionOperations: [], clubsMasterOperations: [] }
  const approvedCounterpartStates = []
  const counterpartGroups = new Map()

  counterpartStates.filter(row => row.exists && row.teamSeason).forEach(state => {
    const key = [clean(state.birthTeamDocumentId), clean(state.seasonKey)].join('::')
    if (!counterpartGroups.has(key)) counterpartGroups.set(key, [])
    counterpartGroups.get(key).push(state)
  })

  for (const states of counterpartGroups.values()) {
    const firstState = states[0]
    let simulatedTeamSeason = firstState.teamSeason
    let changed = false
    let conflict = false

    for (const state of states) {
      const request = approvedCounterpartRequests.find(row => clean(row.movementId) === clean(state.movementId))
      const fact = request?.outgoing || request?.incoming || null
      const side = request?.outgoing ? 'transfersOut' : request?.incoming ? 'transfersIn' : ''
      const simulated = buildReconciledCounterpartTeamSeason({
        current: simulatedTeamSeason,
        fact,
        side,
      })
      if (simulated.conflict) {
        conflict = true
        break
      }
      if (simulated.changed) {
        changed = true
        simulatedTeamSeason = simulated.teamSeason
      }
    }

    if (!changed || conflict) continue
    approvedCounterpartStates.push({
      birthTeamDocumentId: clean(firstState.birthTeamDocumentId),
      seasonKey: clean(firstState.seasonKey),
      transfersIn: Array.isArray(simulatedTeamSeason.transfersIn) ? simulatedTeamSeason.transfersIn : [],
      transfersOut: Array.isArray(simulatedTeamSeason.transfersOut) ? simulatedTeamSeason.transfersOut : [],
      pendingPlayers: Array.isArray(simulatedTeamSeason.pendingPlayers) ? simulatedTeamSeason.pendingPlayers : [],
    })
    const counterpartTeam = {
      ...(firstState.teamRoot || {}),
      birthTeamDocumentId: firstState.birthTeamDocumentId,
    }
    const counterpartLeagueId = clean(simulatedTeamSeason?.leagueId || counterpartTeam?.leagueId)
    if (!counterpartLeagueId) continue
    const counterpartLeague = await getLeagueById(counterpartLeagueId, { bypassCache: true })
    if (!counterpartLeague) continue
    const counterpartSeason = {
      ...(simulatedTeamSeason || {}),
      seasonKey: firstState.seasonKey,
      seasonId: clean(simulatedTeamSeason?.seasonId || firstState.seasonKey),
    }
    const counterpartPerformance = buildLeagueTeamPerformanceProjection({
      league: counterpartLeague,
      season: counterpartSeason,
      target: 'current',
      team: counterpartTeam,
    })
    const counterpartPoints = resolveLeagueTeamPoints({
      league: counterpartLeague,
      season: counterpartSeason,
      target: 'current',
      team: counterpartTeam,
    })
    const ops = await buildClubSyncOperations({
      league: counterpartLeague,
      season: counterpartSeason,
      team: counterpartTeam,
      teamSeason: simulatedTeamSeason,
      performance: counterpartPerformance,
      points: counterpartPoints,
      operationSuffix: [firstState.birthTeamDocumentId, firstState.seasonKey].map(clean).join('::'),
    })
    counterpartClubOps.clubProjectionOperations.push(...ops.clubProjectionOperations)
    counterpartClubOps.clubsMasterOperations.push(...ops.clubsMasterOperations)
  }

  const approvedClubPatches = [
    ...localClubOps.clubProjectionOperations,
    ...counterpartClubOps.clubProjectionOperations,
  ].map(operation => ({
    target: { ...(operation.target || {}) },
    clubIdentity: { ...(operation.patch?.clubIdentity || {}) },
    ageGroupSeasonProjection: operation.patch?.ageGroupSeasonProjection || null,
  })).filter(operation => (
    clean(operation.target?.clubId) && operation.ageGroupSeasonProjection
  ))
  const approvedClubIds = [...new Set(approvedClubPatches
    .map(operation => clean(operation.target?.clubId))
    .filter(Boolean))]
  const approvedClubDocuments = []

  for (const clubId of approvedClubIds) {
    const currentClub = await readClubDocument({ clubId })
    let projectedClub = currentClub.club || {}

    approvedClubPatches
      .filter(operation => clean(operation.target?.clubId) === clubId)
      .forEach(operation => {
        projectedClub = buildClubDocumentProjection({
          existingClub: projectedClub,
          clubIdentity: operation.clubIdentity,
          ageGroupSeasonProjection: operation.ageGroupSeasonProjection,
          projectionVersion: 1,
          updatedAt: projectedClub?.updatedAt || null,
        })
      })

    approvedClubDocuments.push({
      clubId,
      document: projectedClub,
    })
  }

  const currentClubsMaster = await readClubsMasterDocument({ fresh: true })
  const projectedMasterByClubId = new Map(
    (Array.isArray(currentClubsMaster?.clubs) ? currentClubsMaster.clubs : [])
      .map(club => [clean(club?.clubId), club])
      .filter(([clubId]) => clubId)
  )
  approvedClubDocuments.forEach(({ clubId, document }) => {
    projectedMasterByClubId.set(
      clubId,
      buildClubsMasterClubProjection({ club: document })
    )
  })
  const approvedClubProjectionState = {
    documents: approvedClubDocuments,
  }
  const approvedClubsMasterState = {
    id: clean(currentClubsMaster?.id) || 'all',
    projectionVersion: 1,
    clubs: [...projectedMasterByClubId.values()].sort((left, right) => (
      clean(left?.name).localeCompare(clean(right?.name), 'he') ||
      clean(left?.clubId).localeCompare(clean(right?.clubId))
    )),
  }


  return {
    version: 2,
    birthTeamDocumentId,
    seasonKey: effectivePayload.season.seasonKey,
    previousSeasonKey: clean(rosterHistory.previousSeasonKey),
    leagueId: clean(effectivePayload.league?.id || effectivePayload.league?.leagueId),
    players,
    movementState: {
      ...movementState,
      counterpartRequests: approvedCounterpartRequests,
    },
    counterpartStates: counterpartStates.map(({ teamRoot, teamSeason, ...state }) => state),
    approvedCounterpartRequests,
    approvedCounterpartStates,
    approvedPlayerIndexState,
    approvedTeamProjectionState,
    approvedLeaguesMasterState,
    approvedClubProjectionState,
    approvedClubsMasterState,
    persistedSeason: prepared.persistedSeason,
    rosterImport: prepared.persistedRosterImport,
    teamPerformance,
    teamPoints,
    preview: {
      playersCount: Array.isArray(prepared.persistedSeason.teamPlayers)
        ? prepared.persistedSeason.teamPlayers.length
        : 0,
      transfersInCount: movementState.transfersIn?.length || 0,
      transfersOutCount: movementState.transfersOut?.length || 0,
      pendingPlayersCount: movementState.pendingPlayers?.length || 0,
      counterpartUpdatesCount: counterpartStates.filter(row => row.exists).length,
      counterpartMissingCount: counterpartStates.filter(row => !row.exists).length,
      teamBalance: prepared.persistedSeason.teamBalance || null,
    },
  }
}
