// src/features/playersDatabase/services/writeV2/stats/prepare/prepareStatsImportPlanV2.js

import { doc, getDoc } from 'firebase/firestore'

import { trackedGetDocFromServer } from '../../../../../../services/firestore/usage/index.js'

import { getLeagueById } from '../../../read/entities/league.js'
import { resolveRosterCounterpartCandidateV2 } from '../../../read/entities/teamMovementCounterpartV2.js'
import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import { SEARCHINDEX_BIRTH_TEAM_SEASON_GENERIC_OBJECT } from '../../../../catalog/firestoreDocuments/searchIndexBirthTeamSeason.catalog.js'
import { buildPlayerDocumentId } from '../../../../model/player/playerIdentity.model.js'
import { reconcileRosterMovement } from '../../../../domain/movement/index.js'
import {
  buildTeamSeasonDocumentId,
  resolveTeamLookupKey,
} from '../../../../model/team/teamIdentity.model.js'
import {
  buildLeagueTeamSearchIndexProjections,
} from '../../../../domain/projections/teamSeasonSearchIndex.projection.js'
import {
  APPROVED_STATS_STATE_VERSION,
  buildApprovedStatsState,
} from '../../../../domain/statsV2/approvedStatsState.builder.js'
import {
  buildStatsLeagueMetadataFields,
  buildStatsPlayerSearchIndexCandidates,
  buildStatsPlayerSearchIndexStates,
  buildStatsTeamSearchIndexPatch,
} from '../../../../domain/statsV2/statsFinalSync.projection.js'
import {
  buildStatsCounterpartMovementPatch,
} from '../../../../domain/statsV2/counterpartMovementPatches.builder.js'
import {
  shouldProjectStatsPlayerDocument,
} from '../../../../domain/statsV2/playerDocumentStats.projection.js'
import { buildFinalStatsTeamSeasonState } from '../../../../domain/statsV2/teamSeasonStats.builder.js'
import {
  buildStatsCanonicalPlayerDocumentProjection,
} from '../../../../domain/statsV2/playerDocumentCanonical.projection.js'
import { buildStatsReloadDecisionState } from '../../../../domain/statsV2/statsReloadDecision.builder.js'
import {
  buildLeaguesMasterLeagueEntry,
  buildLeaguesMasterSummary,
  sortLeaguesMasterEntries,
} from '../../../../domain/projections/leaguesMaster.projection.js'
import {
  buildClubAgeGroupSeasonProjection,
  buildClubDocumentProjection,
  buildClubsMasterClubProjection,
} from '../../../../domain/projections/club/index.js'
import {
  buildLeagueTeamPerformanceProjection,
  resolveLeagueSeasonStatus,
  resolveLeagueTeamPoints,
} from '../../../../domain/projections/teamPerformance.projection.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()
const clone = value => JSON.parse(JSON.stringify(value))

const readRequired = async (collectionName, id, code) => {
  const snapshot = await getDoc(doc(db, collectionName, id))
  if (!snapshot.exists()) {
    const error = new Error(`Required Stats V2 document not found: ${id}`)
    error.code = code
    throw error
  }
  return { id: snapshot.id, ...snapshot.data() }
}

const readFromServer = async (collectionName, id, action) => {
  const snapshot = await trackedGetDocFromServer(
    doc(db, collectionName, id),
    {
      feature: 'playersDatabase',
      collection: collectionName,
      action,
      operationSubtype: 'stats-reconcile-getDocFromServer',
    }
  )

  return snapshot.exists()
    ? { id: snapshot.id, ...(snapshot.data() || {}) }
    : null
}

const buildApprovedPlayerSearchIndexStates = async ({
  league = {},
  players = [],
  season = {},
  team = {},
  playerDocumentPlans = [],
  capturedAt = '',
} = {}) => {
  const baseCandidates = buildStatsPlayerSearchIndexCandidates({
    league,
    players,
    season,
    team,
    playerDocumentIds: (Array.isArray(playerDocumentPlans) ? playerDocumentPlans : [])
      .map(plan => clean(plan?.playerDocumentId))
      .filter(Boolean),
  })
  const existingById = {}

  await Promise.all(baseCandidates.map(async candidate => {
    const snapshot = await trackedGetDocFromServer(
      doc(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes, candidate.docId),
      {
        feature: 'playersDatabase',
        collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
        action: 'stats-prepare-read-player-index',
        operationSubtype: 'stats-prepare-getDocFromServer',
      }
    )

    if (snapshot.exists()) {
      existingById[candidate.docId] = {
        id: snapshot.id,
        ...(snapshot.data() || {}),
      }
    }
  }))

  const candidates = buildStatsPlayerSearchIndexCandidates({
    league,
    players,
    season,
    team,
    playerDocumentIds: (Array.isArray(playerDocumentPlans) ? playerDocumentPlans : [])
      .map(plan => clean(plan?.playerDocumentId))
      .filter(Boolean),
    existingById,
    capturedAt,
  })

  return buildStatsPlayerSearchIndexStates({
    candidates,
    existingDocumentIds: Object.keys(existingById),
  })
}

const readRequiredFromServer = async (collectionName, id, code, action) => {
  const value = await readFromServer(collectionName, id, action)
  if (value) return value

  const error = new Error(`Required Stats V2 document not found: ${id}`)
  error.code = code
  throw error
}

const buildPlayerDocumentPlans = async ({
  players,
  canonical,
}) => {
  const plans = []

  for (const player of players) {
    const playerDocumentId = clean(
      player.playerDocumentId || buildPlayerDocumentId(player)
    )
    if (!playerDocumentId) continue

    const ref = doc(db, PLAYERS_DATABASE_COLLECTIONS.players, playerDocumentId)
    const snapshot = await getDoc(ref)
    const exists = snapshot.exists()
    const projection = buildStatsCanonicalPlayerDocumentProjection({
      player,
      teamRoot: canonical.teamRoot,
      teamSeason: canonical.teamSeason,
      league: canonical.league,
      club: canonical.club,
      seasonKey: canonical.seasonKey,
      leagueId: canonical.leagueId,
      birthTeamDocumentId: canonical.birthTeamDocumentId,
    })

    if (!shouldProjectStatsPlayerDocument({
      player: projection.player,
      documentExists: exists,
    })) continue

    const seasonRow = projection.seasonRow
    const target = projection.target
    const ownedPatch = {
      current: target === 'current' ? [seasonRow] : [],
      history: target === 'history' ? [seasonRow] : [],
    }

    if (!exists) {
      Object.assign(ownedPatch, {
        id: playerDocumentId,
        externalPlayerId: clean(player.externalPlayerId || player.playerId),
        fullName: clean(player.fullName || player.name),
        normalizedName: clean(
          player.normalizedName || player.fullName || player.name
        ).toLowerCase(),
        birthYear: projection.seasonRow.birthYear,
        primaryPosition: clean(player.primaryPosition),
        positionLayer: clean(player.positionLayer),
        numShirt: player.numShirt ?? null,
      })
    }

    plans.push({
      action: exists ? 'update' : 'create',
      playerDocumentId,
      ownedPatch,
    })
  }

  return plans
}

const buildCounterpartPatches = async requests => {
  const patches = []

  for (const request of Array.isArray(requests) ? requests : []) {
    const birthTeamDocumentId = clean(
      request.counterpartBirthTeamDocumentId ||
      request.sourceBirthTeamDocumentId
    )
    const seasonKey = clean(
      request.counterpartSeasonKey ||
      request.seasonKey
    )

    if (!birthTeamDocumentId || !seasonKey) {
      const error = new Error(
        'Counterpart Movement target must be resolved before approval'
      )
      error.code = 'STATS_COUNTERPART_IDENTITY_INVALID'
      throw error
    }

    const teamSeasonDocumentId = buildTeamSeasonDocumentId(
      birthTeamDocumentId,
      seasonKey
    )
    const snapshot = await getDoc(
      doc(
        db,
        PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
        teamSeasonDocumentId
      )
    )

    patches.push(buildStatsCounterpartMovementPatch({
      request,
      currentTeamSeason: snapshot.exists()
        ? snapshot.data() || {}
        : null,
    }))
  }

  return patches
}

const buildLeagueAndMaster = ({ league, season, team, teamSeason, leaguesMaster }) => {
  const fields = buildStatsLeagueMetadataFields({
    teamSeason: teamSeason.finalTeamSeasonPreview || teamSeason,
  })
  const projectedLeague = clone(league)
  const target = clean(season.seasonStatus) === 'completed' ? 'history' : 'current'
  const seasonRow = target === 'current'
    ? projectedLeague.current
    : (projectedLeague.history || []).find(row => clean(row?.seasonKey) === clean(season.seasonKey))
  if (!seasonRow) {
    const error = new Error('Approved League season was not found during Prepare')
    error.code = 'STATS_LEAGUE_SEASON_NOT_FOUND'
    throw error
  }

  const row = (seasonRow.tableRank || []).find(item => (
    [item.teamId, item.birthTeamId, item.birthTeamDocumentId, item.teamDocumentId]
      .map(clean)
      .some(id => [team.birthTeamDocumentId, team.teamDocumentId, team.id].map(clean).includes(id))
  ))
  if (!row) {
    const error = new Error('Approved League team row was not found during Prepare')
    error.code = 'STATS_LEAGUE_TEAM_ROW_NOT_FOUND'
    throw error
  }
  Object.assign(row, fields)

  const currentEntries = Array.isArray(leaguesMaster.leagues) ? leaguesMaster.leagues : []
  const entry = buildLeaguesMasterLeagueEntry(projectedLeague, currentEntries.find(item => clean(item?.leagueId || item?.id) === clean(league.id)) || {})
  const leagues = sortLeaguesMasterEntries([...currentEntries.filter(item => clean(item?.leagueId || item?.id) !== clean(league.id)), entry])
  return {
    leagueMetadataPatch: {
      seasonKey: season.seasonKey,
      birthTeamDocumentId: team.birthTeamDocumentId,
      fields,
    },
    leaguePatch: target === 'current'
      ? { leagueId: clean(league.id), seasonKey: clean(season.seasonKey), target, tableRank: clone(seasonRow.tableRank || []) }
      : { leagueId: clean(league.id), seasonKey: clean(season.seasonKey), target, history: clone(projectedLeague.history || []) },
    leaguesMasterPatch: { id: clean(leaguesMaster.id) || 'all', docType: clean(leaguesMaster.docType) || 'leagues_master', leagues, summary: buildLeaguesMasterSummary(leagues) },
  }
}

const buildApprovedTeamSearchIndexPatch = async ({
  league,
  season,
  team,
  teamSeason,
} = {}) => {
  const basePatch = buildStatsTeamSearchIndexPatch({
    leagueId: clean(league?.id || league?.leagueId),
    season,
    team,
    teamSeason,
  })
  const existing = await readFromServer(
    PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
    basePatch.docId,
    'stats-prepare-read-team-search-index'
  )

  if (existing) {
    return { ...basePatch, action: 'update' }
  }

  const target = clean(season?.seasonStatus) === 'completed' ? 'history' : 'current'
  const leagueSeason = target === 'current'
    ? league?.current
    : (Array.isArray(league?.history) ? league.history : [])
      .find(row => clean(row?.seasonKey) === clean(season?.seasonKey))
  const projections = buildLeagueTeamSearchIndexProjections({
    league,
    season: { ...(leagueSeason || {}), ...season },
    target,
    rows: Array.isArray(leagueSeason?.tableRank) ? leagueSeason.tableRank : [],
  })
  const projection = projections.find(item => clean(item?.id) === clean(basePatch.docId))
  if (!projection?.document) {
    const error = new Error('Cannot build complete Team SearchIndex create payload')
    error.code = 'STATS_TEAM_INDEX_CREATE_PROJECTION_MISSING'
    throw error
  }

  return {
    docId: basePatch.docId,
    action: 'create',
    fields: {
      ...clone(SEARCHINDEX_BIRTH_TEAM_SEASON_GENERIC_OBJECT),
      ...projection.document,
      ...basePatch.fields,
    },
  }
}

const buildClubProjectionInput = ({ league, season, team, teamSeason, performance, points }) => ({
  season,
  league,
  team,
  teamSeason,
  performance,
  points,
  leagueScoutProfilesSummary:
    teamSeason?.finalTeamSeasonPreview?.scoutProfilesSummary ??
    teamSeason?.scoutProfilesSummary ??
    {},
})

const buildAllClubStates = async ({
  league,
  season,
  team,
  teamSeason,
  performance,
  points,
  clubsMaster,
  localClub,
  counterpartContexts = [],
  readClub = readRequired,
}) => {
  const inputs = [
    clean(team.clubId) && localClub
      ? { league, season, team, teamSeason: teamSeason.finalTeamSeasonPreview, performance, points, existingClub: localClub }
      : null,
    ...counterpartContexts,
  ].filter(Boolean)
  const projectedByClubId = new Map()
  const baselineByClubId = new Map()

  for (const input of inputs) {
    const clubId = clean(input.team?.clubId)
    if (!clubId) continue
    let projectedClub = projectedByClubId.get(clubId)
    if (!projectedClub) {
      const existingClub = input.existingClub || await readClub(
        PLAYERS_DATABASE_COLLECTIONS.clubs,
        clubId,
        'STATS_CLUB_NOT_FOUND'
      )
      projectedClub = existingClub
      baselineByClubId.set(clubId, existingClub)
    }
    const projection = buildClubAgeGroupSeasonProjection(buildClubProjectionInput(input))
    projectedClub = buildClubDocumentProjection({
      existingClub: projectedClub,
      clubIdentity: { clubId, name: clean(input.team?.clubName || input.team?.name) },
      ageGroupSeasonProjection: projection,
      projectionVersion: 1,
      updatedAt: projectedClub.updatedAt || null,
    })
    projectedByClubId.set(clubId, projectedClub)
  }

  const clubProjectionPatches = [...projectedByClubId.entries()].map(([clubId, projectedClub]) => {
    const existingClub = baselineByClubId.get(clubId) || null
    const touchedTargets = inputs
      .filter(input => clean(input?.team?.clubId) === clubId)
      .map(input => ({
        ageGroupId: clean(input?.league?.ageGroupId || input?.teamSeason?.ageGroupId),
        seasonKey: clean(input?.season?.seasonKey || input?.teamSeason?.seasonKey),
        teamId: clean(
          resolveTeamLookupKey(input?.team) ||
          resolveTeamLookupKey(input?.teamSeason)
        ),
      }))
    return {
      clubId,
      baselineFields: {
        ageGroups: existingClub?.ageGroups || [],
        competitionPaths: existingClub?.competitionPaths || [],
      },
      touchedTargets,
      fields: {
        ageGroups: projectedClub.ageGroups || [],
        competitionPaths: projectedClub.competitionPaths || [],
      },
    }
  })
  const existingMasterClubs = Array.isArray(clubsMaster.clubs) ? clubsMaster.clubs : []
  const existingMasterById = new Map(existingMasterClubs.map(entry => [clean(entry?.clubId), entry]))
  const entries = [...projectedByClubId.entries()].map(([clubId, projectedClub]) => {
    const masterProjection = buildClubsMasterClubProjection({ club: projectedClub })
    const existingEntry = existingMasterById.get(clean(clubId))

    return existingEntry
      ? {
          clubId,
          fields: {
            ...existingEntry,
            clubId,
            ageGroups: masterProjection.ageGroups || [],
            competitionPaths: masterProjection.competitionPaths || [],
          },
        }
      : {
          clubId,
          fields: masterProjection,
        }
  })
  const approvedEntryById = new Map(entries.map(entry => [clean(entry.clubId), entry]))
  const finalMasterClubs = existingMasterClubs.map(entry => {
    const clubId = clean(entry?.clubId)
    const approvedEntry = approvedEntryById.get(clubId)
    if (!approvedEntry) return entry
    approvedEntryById.delete(clubId)
    return approvedEntry.fields
  })
  approvedEntryById.forEach(entry => {
    finalMasterClubs.push(entry.fields)
  })
  finalMasterClubs.sort((left, right) => (
    clean(left?.name).localeCompare(clean(right?.name), 'he') ||
    clean(left?.clubId).localeCompare(clean(right?.clubId))
  ))

  return {
    clubProjectionPatches,
    clubsMasterPatch: {
      id: clean(clubsMaster.id) || 'all',
      baselineClubs: existingMasterClubs,
      touchedClubIds: entries.map(entry => clean(entry.clubId)),
      clubs: finalMasterClubs,
    },
  }
}

const buildCounterpartClubContexts = async ({ requests = [], patches = [] } = {}) => {
  const patchByTarget = new Map((Array.isArray(patches) ? patches : []).map(patch => [
    `${clean(patch.birthTeamDocumentId)}::${clean(patch.seasonKey)}`,
    patch,
  ]))
  const contexts = []
  const seen = new Set()

  for (const request of Array.isArray(requests) ? requests : []) {
    const candidate = await resolveRosterCounterpartCandidateV2({ request })
    if (!candidate?.teamRoot || !candidate?.teamSeason) continue
    const birthTeamDocumentId = clean(candidate.birthTeamDocumentId)
    const seasonKey = clean(candidate.seasonKey)
    const key = `${birthTeamDocumentId}::${seasonKey}`
    if (seen.has(key)) continue
    seen.add(key)
    const patch = patchByTarget.get(key)
    if (!patch) continue
    const simulatedTeamSeason = {
      ...candidate.teamSeason,
      transfersIn: clone(patch.transfersIn || []),
      transfersOut: clone(patch.transfersOut || []),
      pendingPlayers: clone(patch.pendingPlayers || []),
    }
    const counterpartTeam = {
      ...candidate.teamRoot,
      birthTeamDocumentId,
    }
    const counterpartLeagueId = clean(simulatedTeamSeason.leagueId || counterpartTeam.leagueId)
    if (!counterpartLeagueId) continue
    const counterpartLeague = await getLeagueById(counterpartLeagueId, { bypassCache: true })
    if (!counterpartLeague) continue
    const counterpartSeason = {
      ...simulatedTeamSeason,
      seasonKey,
      seasonId: clean(simulatedTeamSeason.seasonId || seasonKey),
    }
    const counterpartSeasonStatus = resolveLeagueSeasonStatus({
      league: counterpartLeague,
      season: counterpartSeason,
    })
    const counterpartProjectionTarget = counterpartSeasonStatus === 'completed'
      ? 'history'
      : 'current'
    const effectiveCounterpartSeason = {
      ...counterpartSeason,
      seasonStatus: counterpartSeasonStatus,
    }
    const counterpartPerformance = buildLeagueTeamPerformanceProjection({
      league: counterpartLeague,
      season: effectiveCounterpartSeason,
      target: counterpartProjectionTarget,
      team: counterpartTeam,
    })
    const counterpartPoints = resolveLeagueTeamPoints({
      league: counterpartLeague,
      season: effectiveCounterpartSeason,
      target: counterpartProjectionTarget,
      team: counterpartTeam,
    })
    contexts.push({
      league: counterpartLeague,
      season: effectiveCounterpartSeason,
      team: counterpartTeam,
      teamSeason: simulatedTeamSeason,
      performance: counterpartPerformance,
      points: counterpartPoints,
    })
  }
  return contexts
}

export async function prepareStatsImportPlanV2({ league, season, team, teamRoot, teamSeason, incomingPlayers = [], reloadDecisions = {}, movementState = null, performance = null, points = 0, approvedAt = '' } = {}) {
  const leagueId = clean(league?.id || league?.leagueId || season?.leagueId)
  const teamId = clean(team?.birthTeamDocumentId || teamRoot?.id)
  const seasonKey = clean(season?.seasonKey || teamSeason?.seasonKey)
  if (!leagueId || !teamId || !seasonKey) throw new Error('Missing Stats V2 identity')

  const reloadDecisionState = buildStatsReloadDecisionState({ previousPlayers: teamSeason?.teamPlayers || [], incomingPlayers, decisions: reloadDecisions })
  if (!reloadDecisionState.isComplete) {
    const error = new Error('Missing Stats reload decisions')
    error.code = 'STATS_RELOAD_DECISIONS_REQUIRED'
    error.reloadDecisionState = reloadDecisionState
    throw error
  }

  const resolvedMovementState = movementState || reconcileRosterMovement({
    seasonKey,
    team,
    incomingPlayers,
    missingPlayers: [],
    currentSeason: teamSeason,
    previousSeason: null,
    rosterImport: {},
  })
  const counterpartMovementPatches = await buildCounterpartPatches(resolvedMovementState.counterpartRequests)
  const finalTeamSeason = buildFinalStatsTeamSeasonState({ canonical: { teamRoot, teamSeason, league }, season, team, incomingPlayers, reloadDecisionState, movementState: resolvedMovementState, statsLoadState: { status: 'loaded' } })
  const finalPlayers = finalTeamSeason.finalTeamSeasonPreview.teamPlayers || []
  const localClubId = clean(teamRoot?.clubId || team?.clubId)
  const [leaguesMaster, clubsMaster, club] = await Promise.all([
    readRequired(PLAYERS_DATABASE_COLLECTIONS.leaguesMaster, 'all', 'STATS_LEAGUES_MASTER_NOT_FOUND'),
    readRequired(PLAYERS_DATABASE_COLLECTIONS.clubsMaster, 'all', 'STATS_CLUBS_MASTER_NOT_FOUND'),
    localClubId
      ? readRequired(
          PLAYERS_DATABASE_COLLECTIONS.clubs,
          localClubId,
          'STATS_CLUB_NOT_FOUND'
        )
      : Promise.resolve(null),
  ])
  const effectiveSeason = { ...season, seasonStatus: finalTeamSeason.seasonStatus, leagueId }
  const effectiveTeam = {
    ...team,
    clubId: localClubId,
  }
  const playerDocumentPlans = await buildPlayerDocumentPlans({
    players: finalPlayers,
    canonical: {
      teamRoot,
      teamSeason: finalTeamSeason.finalTeamSeasonPreview,
      league,
      club,
      seasonKey,
      leagueId,
      birthTeamDocumentId: teamId,
    },
  })
  const leagueStates = buildLeagueAndMaster({ league, season: effectiveSeason, team, teamSeason: finalTeamSeason, leaguesMaster })
  const counterpartClubContexts = await buildCounterpartClubContexts({
    requests: resolvedMovementState.counterpartRequests,
    patches: counterpartMovementPatches,
  })
  const clubStates = await buildAllClubStates({
    league,
    season: effectiveSeason,
    team: effectiveTeam,
    teamSeason: finalTeamSeason,
    performance,
    points,
    clubsMaster,
    localClub: club,
    counterpartContexts: counterpartClubContexts,
  })

  return buildApprovedStatsState({
    identity: { birthTeamDocumentId: teamId, seasonKey, leagueId },
    approvedAt: approvedAt || new Date().toISOString(),
    canonical: { teamRoot, teamSeason, league },
    reloadDecisionState,
    teamSeason: finalTeamSeason,
    counterpartMovementPatches,
    playerDocumentPlans,
    playerSearchIndexStates: await buildApprovedPlayerSearchIndexStates({
      league,
      players: finalPlayers,
      season: effectiveSeason,
      team,
      playerDocumentPlans,
      capturedAt: approvedAt || new Date().toISOString(),
    }),
    teamSearchIndexPatch: await buildApprovedTeamSearchIndexPatch({
      league,
      season: effectiveSeason,
      team,
      teamSeason: finalTeamSeason.finalTeamSeasonPreview || finalTeamSeason,
    }),
    ...leagueStates,
    ...clubStates,
  })
}
const upsertCanonicalMovement = (rows, movement) => {
  const current = Array.isArray(rows) ? rows : []
  const movementId = clean(movement?.movementId)
  if (!movementId) return [...current]

  return [
    ...current.filter(row => clean(row?.movementId) !== movementId),
    movement,
  ]
}

const buildCanonicalCounterpartPatches = async ({ canonical = {} } = {}) => {
  const localTeamId = clean(canonical.birthTeamDocumentId)
  const localSeasonKey = clean(canonical.seasonKey)
  const localClubId = clean(canonical.teamRoot?.clubId)
  const teamSeason = canonical.teamSeason || {}
  const expected = []

  const append = (rows, side) => {
    ;(Array.isArray(rows) ? rows : []).forEach(fact => {
      const birthTeamDocumentId = side === 'transfersOut'
        ? clean(fact?.toBirthTeamDocumentId)
        : clean(fact?.fromBirthTeamDocumentId)
      const seasonKey = clean(fact?.counterpartSeasonKey || localSeasonKey)
      const targetSide = side === 'transfersOut'
        ? 'transfersIn'
        : 'transfersOut'

      if (!birthTeamDocumentId || !seasonKey || !clean(fact?.movementId)) return

      expected.push({
        birthTeamDocumentId,
        seasonKey,
        targetSide,
        fact: side === 'transfersOut'
          ? {
              movementId: clean(fact.movementId),
              playerId: clean(fact.playerId),
              fromClubId: clean(fact.fromClubId || localClubId),
              toClubId: clean(fact.toClubId),
              fromClubLevel: Number(fact.fromClubLevel) || 0,
              toClubLevel: Number(fact.toClubLevel) || 0,
              direction: clean(fact.direction),
              fromBirthTeamId: clean(fact.fromBirthTeamId || localTeamId),
              fromBirthTeamDocumentId: clean(fact.fromBirthTeamDocumentId || localTeamId),
              fromBirthTeamSlot: Number(fact.fromBirthTeamSlot) || 1,
              timing: clean(fact.timing),
              targetSnapshotKey: clean(fact.targetSnapshotKey),
              effectiveAt: fact.effectiveAt || null,
            }
          : {
              movementId: clean(fact.movementId),
              playerId: clean(fact.playerId),
              fromClubId: clean(fact.fromClubId),
              toClubId: clean(fact.toClubId || localClubId),
              fromClubLevel: Number(fact.fromClubLevel) || 0,
              toClubLevel: Number(fact.toClubLevel) || 0,
              direction: clean(fact.direction),
              toBirthTeamId: clean(fact.toBirthTeamId || localTeamId),
              toBirthTeamDocumentId: clean(fact.toBirthTeamDocumentId || localTeamId),
              toBirthTeamSlot: Number(fact.toBirthTeamSlot) || 1,
              timing: clean(fact.timing),
              targetSnapshotKey: clean(fact.targetSnapshotKey),
              effectiveAt: fact.effectiveAt || null,
            },
      })
    })
  }

  append(teamSeason.transfersOut, 'transfersOut')
  append(teamSeason.transfersIn, 'transfersIn')

  const grouped = new Map()
  expected.forEach(row => {
    const key = `${row.birthTeamDocumentId}::${row.seasonKey}`
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key).push(row)
  })

  const patches = []
  for (const rows of grouped.values()) {
    const first = rows[0]
    const teamSeasonDocumentId = buildTeamSeasonDocumentId(
      first.birthTeamDocumentId,
      first.seasonKey
    )
    const current = await readFromServer(
      PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
      teamSeasonDocumentId,
      'stats-reconcile-read-counterpart-team-season'
    )

    if (!current) continue

    let transfersIn = clone(current.transfersIn || [])
    let transfersOut = clone(current.transfersOut || [])

    rows.forEach(row => {
      if (row.targetSide === 'transfersIn') {
        transfersIn = upsertCanonicalMovement(transfersIn, row.fact)
      } else {
        transfersOut = upsertCanonicalMovement(transfersOut, row.fact)
      }
    })

    patches.push({
      birthTeamDocumentId: first.birthTeamDocumentId,
      seasonKey: first.seasonKey,
      transfersIn,
      transfersOut,
      pendingPlayers: clone(current.pendingPlayers || []),
    })
  }

  return patches
}

const buildReconcilePlayerDocumentPlans = async ({ players, canonical }) => {
  const plans = []

  for (const player of Array.isArray(players) ? players : []) {
    const playerDocumentId = clean(
      player.playerDocumentId || buildPlayerDocumentId(player)
    )
    if (!playerDocumentId) continue

    const current = await readFromServer(
      PLAYERS_DATABASE_COLLECTIONS.players,
      playerDocumentId,
      'stats-reconcile-read-player-document'
    )
    const exists = Boolean(current)

    const projection = buildStatsCanonicalPlayerDocumentProjection({
      player,
      teamRoot: canonical.teamRoot,
      teamSeason: canonical.teamSeason,
      league: canonical.league,
      club: canonical.club,
      seasonKey: canonical.seasonKey,
      leagueId: canonical.leagueId,
      birthTeamDocumentId: canonical.birthTeamDocumentId,
    })

    if (!shouldProjectStatsPlayerDocument({
      player: projection.player,
      documentExists: exists,
    })) continue
    const seasonRow = projection.seasonRow
    const target = projection.target
    const ownedPatch = {
      current: target === 'current' ? [seasonRow] : [],
      history: target === 'history' ? [seasonRow] : [],
    }

    if (!exists) {
      Object.assign(ownedPatch, {
        id: playerDocumentId,
        externalPlayerId: clean(player.externalPlayerId || player.playerId),
        fullName: clean(player.fullName || player.name),
        normalizedName: clean(
          player.normalizedName || player.fullName || player.name
        ).toLowerCase(),
        birthYear: projection.player.birthYear ?? projection.team.birthYear ?? null,
        primaryPosition: clean(player.primaryPosition),
        positionLayer: clean(player.positionLayer),
        numShirt: player.numShirt ?? null,
      })
    }

    plans.push({
      action: exists ? 'update' : 'create',
      playerDocumentId,
      ownedPatch,
    })
  }

  return plans
}

const buildCanonicalCounterpartClubContexts = async ({
  counterpartMovementPatches = [],
} = {}) => {
  const contexts = []

  for (const patch of counterpartMovementPatches) {
    const counterpartTeam = await readFromServer(
      PLAYERS_DATABASE_COLLECTIONS.teams,
      patch.birthTeamDocumentId,
      'stats-reconcile-read-counterpart-team-root'
    )
    const counterpartTeamSeason = await readFromServer(
      PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
      buildTeamSeasonDocumentId(
        patch.birthTeamDocumentId,
        patch.seasonKey
      ),
      'stats-reconcile-read-counterpart-team-season-for-club'
    )
    if (!counterpartTeam || !counterpartTeamSeason) continue

    const counterpartLeagueId = clean(
      counterpartTeamSeason.leagueId || counterpartTeam.leagueId
    )
    if (!counterpartLeagueId) continue

    const counterpartLeague = await readFromServer(
      PLAYERS_DATABASE_COLLECTIONS.leagues,
      counterpartLeagueId,
      'stats-reconcile-read-counterpart-league'
    )
    if (!counterpartLeague) continue

    const simulatedTeamSeason = {
      ...counterpartTeamSeason,
      transfersIn: clone(patch.transfersIn),
      transfersOut: clone(patch.transfersOut),
      pendingPlayers: clone(patch.pendingPlayers),
    }
    const counterpartSeasonStatus = resolveLeagueSeasonStatus({
      league: counterpartLeague,
      season: {
        ...simulatedTeamSeason,
        seasonKey: patch.seasonKey,
      },
    })
    if (!['active', 'completed'].includes(counterpartSeasonStatus)) continue

    const counterpartSeason = {
      ...simulatedTeamSeason,
      seasonKey: patch.seasonKey,
      seasonId: clean(simulatedTeamSeason.seasonId || patch.seasonKey),
      seasonStatus: counterpartSeasonStatus,
    }
    const counterpartTarget = counterpartSeasonStatus === 'completed'
      ? 'history'
      : 'current'

    contexts.push({
      league: counterpartLeague,
      season: counterpartSeason,
      team: counterpartTeam,
      teamSeason: simulatedTeamSeason,
      performance: buildLeagueTeamPerformanceProjection({
        league: counterpartLeague,
        season: counterpartSeason,
        target: counterpartTarget,
        team: counterpartTeam,
      }),
      points: resolveLeagueTeamPoints({
        league: counterpartLeague,
        season: counterpartSeason,
        target: counterpartTarget,
        team: counterpartTeam,
      }),
    })
  }

  return contexts
}

export async function prepareStatsFinalSyncFromCanonicalV2({
  canonical = {},
  approvedAt = '',
  stage = '',
} = {}) {
  const teamRoot = canonical.teamRoot || {}
  const teamSeason = canonical.teamSeason || {}
  const league = canonical.league || {}
  const seasonKey = clean(canonical.seasonKey || teamSeason.seasonKey)
  const birthTeamDocumentId = clean(
    canonical.birthTeamDocumentId ||
    teamRoot.id ||
    teamRoot.birthTeamDocumentId
  )
  const leagueId = clean(
    canonical.leagueId ||
    teamSeason.leagueId ||
    teamRoot.leagueId
  )

  if (!birthTeamDocumentId || !seasonKey || !leagueId) {
    const error = new Error('Missing Stats V2 reconcile identity')
    error.code = 'STATS_RECONCILE_IDENTITY_INVALID'
    throw error
  }

  const requestedStage = clean(stage)
  const approvedBase = {
    planType: 'approvedStatsState',
    planVersion: APPROVED_STATS_STATE_VERSION,
    approvedAt: approvedAt || new Date().toISOString(),
    identity: {
      birthTeamDocumentId,
      seasonKey,
      leagueId,
    },
  }
  const players = Array.isArray(teamSeason.teamPlayers)
    ? teamSeason.teamPlayers
    : []

  if (requestedStage === 'counterparts') {
    return {
      ...approvedBase,
      counterpartMovementPatches: await buildCanonicalCounterpartPatches({
        canonical,
      }),
    }
  }

  if (requestedStage === 'playerDocuments') {
    return {
      ...approvedBase,
      playerDocumentPlans: await buildReconcilePlayerDocumentPlans({
        players,
        canonical,
      }),
    }
  }

  const seasonStatus = resolveLeagueSeasonStatus({
    league,
    season: {
      ...teamSeason,
      seasonKey,
    },
  })
  if (!['active', 'completed'].includes(seasonStatus)) {
    const error = new Error('Stats V2 reconcile season status is unresolved')
    error.code = 'STATS_RECONCILE_SEASON_STATUS_UNRESOLVED'
    throw error
  }

  const season = {
    ...teamSeason,
    seasonKey,
    seasonId: clean(teamSeason.seasonId || seasonKey),
    seasonStatus,
    leagueId,
  }
  const team = {
    ...teamRoot,
    ...teamSeason,
    birthTeamDocumentId,
    clubId: clean(teamRoot.clubId || teamSeason.clubId),
  }
  const finalTeamSeason = {
    seasonStatus,
    finalTeamSeasonPreview: teamSeason,
  }

  if (requestedStage === 'playerIndexes') {
    const playerDocumentPlans = await buildReconcilePlayerDocumentPlans({
      players,
      canonical,
    })

    return {
      ...approvedBase,
      playerSearchIndexStates: await buildApprovedPlayerSearchIndexStates({
        league,
        players,
        season,
        team,
        playerDocumentPlans,
        capturedAt: approvedBase.approvedAt,
      }),
    }
  }

  if (requestedStage === 'teamLeague') {
    const leaguesMaster = await readRequiredFromServer(
      PLAYERS_DATABASE_COLLECTIONS.leaguesMaster,
      'all',
      'STATS_LEAGUES_MASTER_NOT_FOUND',
      'stats-reconcile-read-leagues-master'
    )

    return {
      ...approvedBase,
      teamSearchIndexPatch: await buildApprovedTeamSearchIndexPatch({
        league,
        season,
        team,
        teamSeason,
      }),
      ...buildLeagueAndMaster({
        league,
        season,
        team,
        teamSeason: finalTeamSeason,
        leaguesMaster,
      }),
    }
  }

  const target = seasonStatus === 'completed' ? 'history' : 'current'
  const performance = buildLeagueTeamPerformanceProjection({
    league,
    season,
    target,
    team,
  })
  const points = resolveLeagueTeamPoints({
    league,
    season,
    target,
    team,
  })

  if (requestedStage === 'clubs') {
    const counterpartMovementPatches = await buildCanonicalCounterpartPatches({
      canonical,
    })
    const [clubsMaster, localClub] = await Promise.all([
      readRequiredFromServer(
        PLAYERS_DATABASE_COLLECTIONS.clubsMaster,
        'all',
        'STATS_CLUBS_MASTER_NOT_FOUND',
        'stats-reconcile-read-clubs-master'
      ),
      clean(team.clubId)
        ? readRequiredFromServer(
            PLAYERS_DATABASE_COLLECTIONS.clubs,
            clean(team.clubId),
            'STATS_CLUB_NOT_FOUND',
            'stats-reconcile-read-local-club'
          )
        : Promise.resolve(null),
    ])
    const counterpartContexts = await buildCanonicalCounterpartClubContexts({
      counterpartMovementPatches,
    })
    const clubStates = await buildAllClubStates({
      league,
      season,
      team,
      teamSeason: finalTeamSeason,
      performance,
      points,
      clubsMaster,
      localClub,
      counterpartContexts,
      readClub: (collectionName, id, code) => readRequiredFromServer(
        collectionName,
        id,
        code,
        'stats-reconcile-read-counterpart-club'
      ),
    })

    return {
      ...approvedBase,
      ...clubStates,
    }
  }

  const [
    counterpartMovementPatches,
    playerDocumentPlans,
    leaguesMaster,
    clubsMaster,
    localClub,
  ] = await Promise.all([
    buildCanonicalCounterpartPatches({ canonical }),
    buildReconcilePlayerDocumentPlans({ players, canonical }),
    readRequiredFromServer(
      PLAYERS_DATABASE_COLLECTIONS.leaguesMaster,
      'all',
      'STATS_LEAGUES_MASTER_NOT_FOUND',
      'stats-reconcile-read-leagues-master'
    ),
    readRequiredFromServer(
      PLAYERS_DATABASE_COLLECTIONS.clubsMaster,
      'all',
      'STATS_CLUBS_MASTER_NOT_FOUND',
      'stats-reconcile-read-clubs-master'
    ),
    clean(team.clubId)
      ? readRequiredFromServer(
          PLAYERS_DATABASE_COLLECTIONS.clubs,
          clean(team.clubId),
          'STATS_CLUB_NOT_FOUND',
          'stats-reconcile-read-local-club'
        )
      : Promise.resolve(null),
  ])

  const leagueStates = buildLeagueAndMaster({
    league,
    season,
    team,
    teamSeason: finalTeamSeason,
    leaguesMaster,
  })

  const counterpartContexts = await buildCanonicalCounterpartClubContexts({
    counterpartMovementPatches,
  })

  const clubStates = await buildAllClubStates({
    league,
    season,
    team,
    teamSeason: finalTeamSeason,
    performance,
    points,
    clubsMaster,
    localClub,
    counterpartContexts,
    readClub: (collectionName, id, code) => readRequiredFromServer(
      collectionName,
      id,
      code,
      'stats-reconcile-read-counterpart-club'
    ),
  })

  return {
    ...approvedBase,
    counterpartMovementPatches,
    playerDocumentPlans,
    playerSearchIndexStates: await buildApprovedPlayerSearchIndexStates({
      league,
      players,
      season,
      team,
      playerDocumentPlans,
      capturedAt: approvedBase.approvedAt,
    }),
    teamSearchIndexPatch: await buildApprovedTeamSearchIndexPatch({
      league,
      season,
      team,
      teamSeason,
    }),
    ...leagueStates,
    ...clubStates,
  }
}
