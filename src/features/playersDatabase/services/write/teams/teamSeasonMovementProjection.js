// Counterpart projection planning is CLIENT business logic and must finish
// before the canonical Stats commit. After commit this module only applies
// already approved counterpart and Club projection plans.

import { getLeagueById } from '../../read/entities/league.js'
import { readClubsMasterDocument } from '../../read/masters/clubsMaster.read.js'
import { buildRosterSourceFingerprint } from './rosterSourceFingerprint.js'
import {
  buildLeagueTeamPerformanceProjection,
  resolveLeagueTeamPoints,
} from '../../../domain/projections/teamPerformance.projection.js'
import {
  buildClubIdentityFromTeam,
  ensureRequiredClubProjectionCompleted,
  resolveClubTransferCoverageStatus,
  syncClubProjectionPersistence,
  readClubDocument,
} from '../clubs/index.js'
import {
  buildClubAgeGroupSeasonProjection,
  buildClubDocumentProjection,
  buildClubsMasterClubProjection,
} from '../../../domain/projections/club/index.js'
import { teamSeasonDocRef } from './teamSeasonDoc.js'
import {
  applyApprovedTeamSeasonMovementCounterpartPlans,
  reconcileTeamSeasonMovementCounterparts,
} from './teamSeasonMovement.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const withoutDocumentMetadata = value => {
  if (!value || typeof value !== 'object') return value || null
  const { id, exists, ...rest } = value
  return rest
}

const upsertMasterClub = ({ clubs = [], club = {} } = {}) => {
  const clubId = clean(club?.clubId)
  if (!clubId) return Array.isArray(clubs) ? [...clubs] : []

  const rows = Array.isArray(clubs) ? [...clubs] : []
  const index = rows.findIndex(row => clean(row?.clubId) === clubId)
  if (index >= 0) rows[index] = club
  else rows.push(club)
  return rows
}

const buildCounterpartClubProjectionPlan = async ({ operation, existingClub = {} } = {}) => {
  if (!operation?.changed || !operation?.projectedTeamSeason) {
    return { skipped: true, reason: 'counterpartUnchanged' }
  }

  const teamSeason = operation.projectedTeamSeason
  const leagueId = clean(teamSeason.leagueId)
  const seasonKey = clean(teamSeason.seasonKey || teamSeason.seasonId)
  if (!leagueId || !seasonKey) return { skipped: true, reason: 'counterpartContextMissing' }

  const league = await getLeagueById(leagueId)
  if (!league) return { skipped: true, reason: 'counterpartLeagueMissing' }

  const season = {
    seasonId: clean(teamSeason.seasonId || seasonKey),
    seasonKey,
    seasonStatus: clean(teamSeason.seasonStatus),
    leagueId,
    ageGroupId: clean(teamSeason.ageGroupId),
    birthYear: Number(teamSeason.birthYear) || 0,
    leagueTotalRound: Number(teamSeason.leagueTotalRound) || 0,
  }
  const team = {
    ...teamSeason,
    teamId: clean(teamSeason.birthTeamId || teamSeason.teamId || teamSeason.birthTeamDocumentId),
    birthTeamDocumentId: clean(teamSeason.birthTeamDocumentId || teamSeason.teamDocumentId),
  }
  const target = season.seasonStatus === 'completed' ? 'history' : 'current'
  const performance = buildLeagueTeamPerformanceProjection({ league, season, target, team })
  const points = resolveLeagueTeamPoints({ league, season, target, team })
  const clubIdentity = buildClubIdentityFromTeam(team)
  if (!clubIdentity?.clubId) return { skipped: true, reason: 'counterpartClubIdMissing' }

  const ageGroupSeasonProjection = buildClubAgeGroupSeasonProjection({
    season,
    league,
    team,
    teamSeason,
    performance,
    points,
    transferCoverageStatus: resolveClubTransferCoverageStatus(teamSeason),
  })
  const projectedClub = buildClubDocumentProjection({
    existingClub,
    clubIdentity,
    ageGroupSeasonProjection,
    projectionVersion: 1,
    updatedAt: existingClub?.updatedAt || null,
  })

  return {
    skipped: false,
    clubIdentity,
    ageGroupSeasonProjection,
    projectedClub,
  }
}


const refreshLegacyChangedCounterpartClubProjection = async result => {
  if (!result?.changed || !result?.teamSeason) return { skipped: true, reason: 'counterpartUnchanged' }

  const teamSeason = result.teamSeason
  const leagueId = clean(teamSeason.leagueId)
  const seasonKey = clean(teamSeason.seasonKey || teamSeason.seasonId)
  if (!leagueId || !seasonKey) return { skipped: true, reason: 'counterpartContextMissing' }

  const league = await getLeagueById(leagueId)
  if (!league) return { skipped: true, reason: 'counterpartLeagueMissing' }

  const season = {
    seasonId: clean(teamSeason.seasonId || seasonKey),
    seasonKey,
    seasonStatus: clean(teamSeason.seasonStatus),
    leagueId,
    ageGroupId: clean(teamSeason.ageGroupId),
    birthYear: Number(teamSeason.birthYear) || 0,
    leagueTotalRound: Number(teamSeason.leagueTotalRound) || 0,
  }
  const team = {
    ...teamSeason,
    teamId: clean(teamSeason.birthTeamId || teamSeason.teamId || teamSeason.birthTeamDocumentId),
    birthTeamDocumentId: clean(teamSeason.birthTeamDocumentId || teamSeason.teamDocumentId),
  }
  const target = season.seasonStatus === 'completed' ? 'history' : 'current'
  const performance = buildLeagueTeamPerformanceProjection({ league, season, target, team })
  const points = resolveLeagueTeamPoints({ league, season, target, team })
  const clubIdentity = buildClubIdentityFromTeam(team)
  if (!clubIdentity?.clubId) return { skipped: true, reason: 'counterpartClubIdMissing' }

  return ensureRequiredClubProjectionCompleted(await syncClubProjectionPersistence({
    canonicalCommitted: true,
    clubIdentity,
    ageGroupSeasonProjection: buildClubAgeGroupSeasonProjection({
      season,
      league,
      team,
      teamSeason,
      performance,
      points,
      transferCoverageStatus: resolveClubTransferCoverageStatus(teamSeason),
    }),
    lastWriteAction: 'RECONCILE_MOVEMENT_COUNTERPART',
  }))
}

export async function prepareTeamSeasonMovementCounterpartProjectionPlans({
  counterpartPlan = null,
  baseClubStates = [],
  baseClubsMaster = null,
} = {}) {
  const sourceOperations = Array.isArray(counterpartPlan?.operations) ? counterpartPlan.operations : []
  const currentMaster = baseClubsMaster?.document
    ? {
        exists: baseClubsMaster.exists === true,
        ...baseClubsMaster.document,
      }
    : await readClubsMasterDocument({ fresh: true })
  if (currentMaster?.exists !== true) {
    const error = new Error('Clubs Master must exist before planning Stats counterpart projections')
    error.code = 'STATS_COUNTERPART_CLUBS_MASTER_MISSING'
    throw error
  }

  const initialMaster = withoutDocumentMetadata(currentMaster)
  const initialMasterFingerprint = buildRosterSourceFingerprint(initialMaster)
  const seededClubStates = new Map(
    (Array.isArray(baseClubStates) ? baseClubStates : [])
      .map(state => [clean(state?.clubId), state])
      .filter(([clubId]) => clubId)
  )
  const clubStates = new Map()
  const clubPlans = new Map()
  let projectedMasterClubs = Array.isArray(currentMaster.clubs) ? [...currentMaster.clubs] : []
  const masterGuards = []

  for (const operation of sourceOperations) {
    if (!operation?.changed || !operation?.projectedTeamSeason) continue

    const teamSeason = operation.projectedTeamSeason
    const clubIdentity = buildClubIdentityFromTeam({
      ...teamSeason,
      teamId: clean(teamSeason.birthTeamId || teamSeason.teamId || teamSeason.birthTeamDocumentId),
      birthTeamDocumentId: clean(teamSeason.birthTeamDocumentId || teamSeason.teamDocumentId),
    })
    const clubId = clean(clubIdentity?.clubId)
    if (!clubId) continue

    if (!clubStates.has(clubId)) {
      const seededClub = seededClubStates.get(clubId)
      const currentClub = seededClub?.document
        ? {
            exists: seededClub.exists === true,
            club: seededClub.document,
          }
        : await readClubDocument({ clubId })
      clubStates.set(clubId, {
        exists: currentClub.exists === true,
        initial: currentClub.club || {},
        current: currentClub.club || {},
        fingerprint: buildRosterSourceFingerprint(withoutDocumentMetadata(currentClub.club)),
      })
    }

    const state = clubStates.get(clubId)
    const projection = await buildCounterpartClubProjectionPlan({
      operation,
      existingClub: state.current,
    })
    if (!projection || projection.skipped) continue

    state.current = projection.projectedClub
    const masterEntry = buildClubsMasterClubProjection({ club: state.current })
    projectedMasterClubs = upsertMasterClub({ clubs: projectedMasterClubs, club: masterEntry })

    const guard = {
      birthTeamDocumentId: clean(operation.birthTeamDocumentId),
      seasonKey: clean(operation.seasonKey),
      rosterProjectionRevision: clean(operation.counterpartRosterProjectionRevision),
      movementProjectionRevision: clean(operation.patch?.movementProjectionRevision),
    }
    masterGuards.push(guard)

    const existingPlan = clubPlans.get(clubId)
    clubPlans.set(clubId, {
      clubId,
      clubExists: state.exists,
      clubFingerprint: state.fingerprint,
      projectedClub: state.current,
      counterpartGuards: [...(existingPlan?.counterpartGuards || []), guard],
    })
  }

  return {
    operations: [...clubPlans.values()],
    masterProjection: {
      skipped: clubPlans.size === 0,
      clubsMasterFingerprint: initialMasterFingerprint,
      projectedMasterClubs,
      counterpartGuards: masterGuards,
    },
  }
}

const applyApprovedCounterpartClubProjection = async ({ operation = {}, counterpartResult = {} } = {}) => {
  if (!counterpartResult?.changed) {
    return {
      skipped: true,
      reason: counterpartResult?.superseded ? 'counterpartSuperseded' : 'counterpartUnchanged',
    }
  }

  const projection = operation?.projection
  if (!projection || projection.skipped) {
    return projection || { skipped: true, reason: 'counterpartProjectionMissing' }
  }

  const expectedMovementProjectionRevision = clean(
    operation?.counterpartMovementProjectionRevision
  )
  if (!expectedMovementProjectionRevision) {
    return { skipped: true, reason: 'counterpartMovementRevisionMissing' }
  }

  const counterpartGuard = {
    ref: teamSeasonDocRef({
      birthTeamDocumentId: operation.birthTeamDocumentId,
      seasonKey: operation.seasonKey,
    }),
    field: 'movementProjectionRevision',
    expected: expectedMovementProjectionRevision,
  }

  const syncResult = await syncClubProjectionPersistence({
    canonicalCommitted: true,
    clubIdentity: projection.clubIdentity,
    ageGroupSeasonProjection: projection.ageGroupSeasonProjection,
    lastWriteAction: 'RECONCILE_MOVEMENT_COUNTERPART',
    transactionGuard: counterpartGuard,
  })

  if (syncResult?.guardSuperseded) {
    return {
      skipped: true,
      reason: 'counterpartSuperseded',
      guardSuperseded: true,
    }
  }

  return ensureRequiredClubProjectionCompleted(syncResult)
}

export async function reconcileTeamSeasonMovementCounterpartsWithClubRefresh({
  requests = [],
  approvedPlan = null,
  approvedProjectionPlan = null,
} = {}) {
  const reconciliation = approvedPlan
    ? await applyApprovedTeamSeasonMovementCounterpartPlans({ approvedPlan })
    : await reconcileTeamSeasonMovementCounterparts({ requests })
  const projectionResults = []

  if (!approvedPlan) {
    // Compatibility path for non-Stats consumers. The approved Stats flow must
    // always provide both plans and never reaches this legacy calculation path.
    for (const result of reconciliation.results || []) {
      if (!result?.changed) continue
      try {
        projectionResults.push({
          teamSeasonDocumentId: result.teamSeasonDocumentId,
          result: await refreshLegacyChangedCounterpartClubProjection(result),
        })
      } catch (error) {
        projectionResults.push({
          teamSeasonDocumentId: result.teamSeasonDocumentId,
          error: String(error?.message || 'Counterpart Club projection failed'),
        })
      }
    }
    return { ...reconciliation, projectionResults }
  }

  const projectionLookup = new Map(
    (Array.isArray(approvedProjectionPlan?.operations) ? approvedProjectionPlan.operations : [])
      .map(operation => [
        `${clean(operation?.birthTeamDocumentId)}::${clean(operation?.seasonKey)}`,
        operation,
      ])
  )

  for (const result of reconciliation.results || []) {
    const key = `${clean(result?.birthTeamDocumentId)}::${clean(result?.seasonKey)}`
    const operation = projectionLookup.get(key)
    if (!operation && !result?.changed) continue

    try {
      projectionResults.push({
        teamSeasonDocumentId: result.teamSeasonDocumentId,
        result: await applyApprovedCounterpartClubProjection({ operation, counterpartResult: result }),
      })
    } catch (error) {
      projectionResults.push({
        teamSeasonDocumentId: result.teamSeasonDocumentId,
        error: String(error?.message || 'Counterpart Club projection failed'),
      })
    }
  }

  return { ...reconciliation, projectionResults }
}
