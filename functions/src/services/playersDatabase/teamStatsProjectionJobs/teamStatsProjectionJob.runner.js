const { db } = require('../../../config/admin')
const {
  claimTeamStatsProjectionJob,
  updateStage,
  complete,
  supersede,
  fail,
  applyPlayerDocumentOperation,
  applyCounterpartMovementOperation,
  applyCounterpartClubProjectionOperation,
  applyCounterpartClubsMasterOperation,
  applyTeamScoutOperation,
  applyPlayerSeasonIndexOperation,
  applyTeamSeasonIndexOperation,
  applyLeagueMetadataOperation,
  applyLeaguesMasterMetadataOperation,
  applyMainClubProjectionOperations,
} = require('./teamStatsProjectionJob.repository')
const { updateWriteActionFromProjectionJob } = require('../writeActions/writeAction.repository')

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const SUPERSEDED_OPERATION_REASONS = new Set([
  'counterpartRevisionChanged',
  'counterpartMovementRevisionChanged',
  'clubSnapshotChanged',
  'clubsMasterSnapshotChanged',
  'leagueSnapshotChanged',
  'leaguesMasterSnapshotChanged',
  'teamSeasonIndexSnapshotChanged',
  'mainClubSnapshotChanged',
  'mainClubsMasterSnapshotChanged',
  'mainClubProjectionStateChanged',
])

const findSupersededOperation = result => {
  const rows = [
    ...(Array.isArray(result?.movementResults) ? result.movementResults : []),
    ...(Array.isArray(result?.clubResults) ? result.clubResults : []),
    ...(Array.isArray(result?.masterResults) ? result.masterResults : []),
    ...(Array.isArray(result?.leagueResults) ? result.leagueResults : []),
    ...(Array.isArray(result?.leaguesMasterResults) ? result.leaguesMasterResults : []),
  ]
  return rows.find(row => SUPERSEDED_OPERATION_REASONS.has(clean(row?.reason))) || null
}

async function readCanonicalTeamSeason(job) {
  const id = clean(job.teamSeasonDocumentId)
  const snapshot = await db.collection('dbBirthTeamSeasons').doc(id).get()
  if (!snapshot.exists) throw new Error('Canonical Team Season was not found')
  const season = snapshot.data() || {}
  if (clean(season.statsProjectionRevision) !== clean(job.sourceRevision)) {
    return { stale: true, teamSeasonDocumentId: id }
  }
  return {
    teamSeasonDocumentId: id,
    teamId: clean(season.birthTeamDocumentId || season.teamDocumentId || job.teamId),
    seasonKey: clean(season.seasonKey || job.seasonKey),
    seasonStatus: clean(season.seasonStatus),
    playerDocumentIds: [...new Set((Array.isArray(season.teamPlayers) ? season.teamPlayers : [])
      .map(player => clean(player.playerDocumentId)).filter(Boolean))],
    playersCount: Array.isArray(season.teamPlayers) ? season.teamPlayers.length : 0,
  }
}

const resolveProjectionContract = job => {
  const schemaVersion = Number(job.schemaVersion || 1)
  const manifest = job.projectionManifest || null

  if (schemaVersion < 2) {
    return { legacy: true, manifest: null }
  }
  if (!manifest || ![1, 2, 3, 4, 5, 6, 7, 8, 9].includes(Number(manifest.schemaVersion || 0))) {
    const error = new Error('Stats projection job is missing the approved projection manifest')
    error.code = 'STATS_PROJECTION_MANIFEST_REQUIRED'
    throw error
  }
  if (clean(manifest.sourceRevision) !== clean(job.sourceRevision)) {
    const error = new Error('Stats projection manifest revision does not match the job revision')
    error.code = 'STATS_PROJECTION_MANIFEST_STALE'
    throw error
  }
  if (clean(job.clientProjectionStatus) !== 'completed') {
    const error = new Error('Client projection handoff is not complete')
    error.code = 'STATS_PROJECTION_CLIENT_HANDOFF_REQUIRED'
    throw error
  }
  return {
    legacy: false,
    clientAppliedPlayerDocuments: Number(manifest.schemaVersion || 0) === 1,
    functionsAppliedCounterparts: Number(manifest.schemaVersion || 0) >= 3,
    functionsAppliedTeamScout: Number(manifest.schemaVersion || 0) >= 5,
    functionsAppliedPlayerIndexes: Number(manifest.schemaVersion || 0) >= 6,
    functionsAppliedLeagueMetadata: Number(manifest.schemaVersion || 0) >= 7,
    functionsAppliedTeamSeasonIndex: Number(manifest.schemaVersion || 0) >= 8,
    functionsAppliedMainClub: Number(manifest.schemaVersion || 0) >= 9,
    manifest,
  }
}

async function applyCounterpartOperations({ manifest, identity, teamSeasonDocumentId }) {
  const movementOperations = Array.isArray(manifest?.operations?.counterpartMovement)
    ? manifest.operations.counterpartMovement
    : []
  const clubOperations = Array.isArray(manifest?.operations?.counterpartClubProjection)
    ? manifest.operations.counterpartClubProjection
    : []
  const masterOperations = Array.isArray(manifest?.operations?.counterpartClubsMaster)
    ? manifest.operations.counterpartClubsMaster
    : []
  const movementResults = []
  const clubResults = []
  const masterResults = []

  for (const operation of movementOperations) {
    const result = await applyCounterpartMovementOperation({
      ...identity,
      teamSeasonDocumentId,
      operation,
    })
    if (result?.reason === 'staleAttempt' || result?.reason === 'staleSource') return result
    movementResults.push(result)
  }

  // Match the proven Roster apply order: Movement first, then its already-planned
  // Club and ClubsMaster projections. FUNCTIONS does not calculate any of them.
  for (const operation of clubOperations) {
    const result = await applyCounterpartClubProjectionOperation({
      ...identity,
      teamSeasonDocumentId,
      operation,
    })
    if (result?.reason === 'staleAttempt' || result?.reason === 'staleSource') return result
    clubResults.push(result)
  }
  for (const operation of masterOperations) {
    const result = await applyCounterpartClubsMasterOperation({
      ...identity,
      teamSeasonDocumentId,
      operation,
    })
    if (result?.reason === 'staleAttempt' || result?.reason === 'staleSource') return result
    masterResults.push(result)
  }

  return {
    applied: true,
    owner: 'functions',
    movementOperationsCount: movementOperations.length,
    clubOperationsCount: clubOperations.length,
    clubsMasterOperationsCount: masterOperations.length,
    movementResults,
    clubResults,
    masterResults,
  }
}

async function applyAndVerifyPlayerDocuments({ manifest, identity, teamSeasonDocumentId }) {
  const operations = Array.isArray(manifest?.operations?.playerDocuments)
    ? manifest.operations.playerDocuments
    : []
  const appliedOperations = []

  for (const operation of operations) {
    const result = await applyPlayerDocumentOperation({
      ...identity,
      teamSeasonDocumentId,
      operation,
    })
    if (!result?.applied) return { applied: false, reason: result?.reason || 'operationNotApplied' }
    appliedOperations.push(result)
  }

  const ids = [...new Set(operations.map(operation => clean(operation?.playerDocumentId)).filter(Boolean))]
  const snapshots = ids.length
    ? await db.getAll(...ids.map(id => db.collection('dbPlayers').doc(id)))
    : []
  const missingPlayerDocumentIds = snapshots.filter(snapshot => !snapshot.exists).map(snapshot => snapshot.id)

  return {
    applied: true,
    owner: 'functions',
    operationsCount: operations.length,
    appliedCount: appliedOperations.length,
    expectedExistingCount: ids.length,
    existingCount: ids.length - missingPlayerDocumentIds.length,
    missingPlayerDocumentIds,
    verified: missingPlayerDocumentIds.length === 0,
  }
}


async function applyAndVerifyTeamScout({ manifest, identity, teamSeasonDocumentId }) {
  const operation = manifest?.operations?.teamScout
  if (!operation || operation.operationType !== 'teamScout') {
    const error = new Error('Stats projection manifest is missing Team Scout operation')
    error.code = 'STATS_PROJECTION_TEAM_SCOUT_OPERATION_REQUIRED'
    throw error
  }

  const result = await applyTeamScoutOperation({
    ...identity,
    teamSeasonDocumentId,
    operation,
  })
  if (!result?.applied) return result

  const snapshot = await db.collection('dbBirthTeamSeasons').doc(teamSeasonDocumentId).get()
  if (!snapshot.exists) {
    return { applied: true, verified: false, reason: 'canonicalSourceMissing' }
  }
  const current = snapshot.data() || {}
  const patch = operation.patch || {}
  const same = JSON.stringify({
    teamPlayers: Array.isArray(current.teamPlayers) ? current.teamPlayers : [],
    playersCount: Number(current.playersCount || 0),
    scoutProfilesSummary: current.scoutProfilesSummary || null,
  }) === JSON.stringify({
    teamPlayers: Array.isArray(patch.teamPlayers) ? patch.teamPlayers : [],
    playersCount: Number(patch.playersCount || 0),
    scoutProfilesSummary: patch.scoutProfilesSummary || null,
  })

  return {
    ...result,
    owner: 'functions',
    changed: operation.changed === true,
    verified: same,
  }
}

const normalizeVerifiedValue = value => {
  if (value === undefined || value === null) return null
  if (Array.isArray(value)) return value.map(normalizeVerifiedValue)
  if (value && typeof value.toMillis === 'function') return { __timestampMillis: value.toMillis() }
  if (value && typeof value === 'object') {
    return Object.keys(value).sort().reduce((result, key) => ({
      ...result,
      [key]: normalizeVerifiedValue(value[key]),
    }), {})
  }
  return value
}

const patchMatches = (current = {}, patch = {}) => Object.keys(patch).every(key => (
  JSON.stringify(normalizeVerifiedValue(current[key])) ===
  JSON.stringify(normalizeVerifiedValue(patch[key]))
))

const buildVerifiedFingerprint = value => JSON.stringify(normalizeVerifiedValue(value))

async function applyAndVerifyPlayerSeasonIndexes({ manifest, identity, teamSeasonDocumentId }) {
  const operations = Array.isArray(manifest?.operations?.playerSeasonIndexes)
    ? manifest.operations.playerSeasonIndexes
    : []
  const appliedOperations = []

  for (const operation of operations) {
    const result = await applyPlayerSeasonIndexOperation({
      ...identity,
      teamSeasonDocumentId,
      operation,
    })
    if (!result?.applied) return result
    appliedOperations.push(result)
  }

  const ids = [...new Set(operations.map(operation => clean(operation?.documentId)).filter(Boolean))]
  const snapshots = ids.length
    ? await db.getAll(...ids.map(documentId => db.collection('dbSearchIndexes').doc(documentId)))
    : []
  const byId = new Map(snapshots.map(snapshot => [snapshot.id, snapshot]))
  const mismatches = []

  operations.forEach(operation => {
    const documentId = clean(operation?.documentId)
    const snapshot = byId.get(documentId)
    if (clean(operation?.action) === 'delete') {
      if (snapshot?.exists) mismatches.push({ documentId, reason: 'expectedDeleted' })
      return
    }
    if (!snapshot?.exists) {
      mismatches.push({ documentId, reason: 'missing' })
      return
    }
    if (!patchMatches(snapshot.data() || {}, operation?.patch || {})) {
      mismatches.push({ documentId, reason: 'patchMismatch' })
    }
  })

  return {
    applied: true,
    owner: 'functions',
    operationsCount: operations.length,
    appliedCount: appliedOperations.length,
    verified: mismatches.length === 0,
    mismatches,
  }
}


async function applyAndVerifyTeamSeasonIndex({ manifest, identity, teamSeasonDocumentId }) {
  const operation = manifest?.operations?.teamSeasonIndex
  if (!operation || operation.operationType !== 'teamSeasonIndex') {
    const error = new Error('Stats projection manifest is missing Team Season SearchIndex operation')
    error.code = 'STATS_PROJECTION_TEAM_INDEX_OPERATION_REQUIRED'
    throw error
  }

  const result = await applyTeamSeasonIndexOperation({
    ...identity,
    teamSeasonDocumentId,
    operation,
  })
  if (!result?.applied) return result

  const documentId = clean(operation?.documentId)
  const snapshot = await db.collection('dbSearchIndexes').doc(documentId).get()
  let verified = false

  if (operation.changed === true) {
    verified = snapshot.exists && patchMatches(snapshot.data() || {}, operation?.patch || {})
  } else {
    const expected = operation?.expected || {}
    const expectedExists = expected.documentExists === true

    if (snapshot.exists === expectedExists) {
      if (!snapshot.exists) {
        verified = true
      } else {
        const current = snapshot.data() || {}
        const fields = Array.isArray(expected.fields) ? expected.fields : []
        const expectedFingerprint = clean(expected.fingerprint)
        const snapshotState = fields.reduce((state, field) => {
          state[field] = current[field] === undefined ? null : current[field]
          return state
        }, {})
        verified = Boolean(expectedFingerprint) && (
          JSON.stringify(normalizeVerifiedValue(snapshotState)) === expectedFingerprint
        )
      }
    }
  }

  return {
    ...result,
    owner: 'functions',
    changed: operation.changed === true,
    verified,
  }
}


async function applyAndVerifyLeagueMetadata({ manifest, identity, teamSeasonDocumentId }) {
  const leagueOperations = Array.isArray(manifest?.operations?.leagueMetadata)
    ? manifest.operations.leagueMetadata
    : []
  const leaguesMasterOperations = Array.isArray(manifest?.operations?.leaguesMasterMetadata)
    ? manifest.operations.leaguesMasterMetadata
    : []
  const leagueResults = []
  const leaguesMasterResults = []

  for (const operation of leagueOperations) {
    const result = await applyLeagueMetadataOperation({
      ...identity,
      teamSeasonDocumentId,
      operation,
    })
    if (!result?.applied) {
      return { ...result, leagueResults, leaguesMasterResults }
    }
    leagueResults.push(result)
  }

  for (const operation of leaguesMasterOperations) {
    const result = await applyLeaguesMasterMetadataOperation({
      ...identity,
      teamSeasonDocumentId,
      operation,
    })
    if (!result?.applied) {
      return { ...result, leagueResults, leaguesMasterResults }
    }
    leaguesMasterResults.push(result)
  }

  const mismatches = []

  for (const operation of leagueOperations) {
    const leagueId = clean(operation?.target?.leagueId)
    const snapshot = await db.collection('dbLeagues').doc(leagueId).get()
    if (!snapshot.exists) {
      mismatches.push({ operationId: clean(operation?.operationId), target: leagueId, reason: 'missing' })
      continue
    }
    if (!patchMatches(snapshot.data() || {}, operation?.patch?.document || {})) {
      mismatches.push({ operationId: clean(operation?.operationId), target: leagueId, reason: 'patchMismatch' })
    }
  }

  for (const operation of leaguesMasterOperations) {
    const snapshot = await db.collection('dbLeaguesMaster').doc('all').get()
    if (!snapshot.exists) {
      mismatches.push({ operationId: clean(operation?.operationId), target: 'all', reason: 'missing' })
      continue
    }
    if (!patchMatches(snapshot.data() || {}, operation?.patch || {})) {
      mismatches.push({ operationId: clean(operation?.operationId), target: 'all', reason: 'patchMismatch' })
    }
  }

  return {
    applied: true,
    owner: 'functions',
    leagueOperationsCount: leagueOperations.length,
    leaguesMasterOperationsCount: leaguesMasterOperations.length,
    leagueResults,
    leaguesMasterResults,
    verified: mismatches.length === 0,
    mismatches,
  }
}


async function applyAndVerifyMainClub({ manifest, identity, teamSeasonDocumentId }) {
  const clubOperations = Array.isArray(manifest?.operations?.mainClubProjection)
    ? manifest.operations.mainClubProjection
    : []
  const masterOperations = Array.isArray(manifest?.operations?.mainClubsMaster)
    ? manifest.operations.mainClubsMaster
    : []

  if (clubOperations.length !== 1 || masterOperations.length !== 1) {
    const error = new Error('Stats projection manifest is missing Main Club projection operations')
    error.code = 'STATS_PROJECTION_MAIN_CLUB_OPERATION_REQUIRED'
    throw error
  }

  const clubOperation = clubOperations[0]
  const masterOperation = masterOperations[0]
  const result = await applyMainClubProjectionOperations({
    ...identity,
    teamSeasonDocumentId,
    clubOperation,
    masterOperation,
  })
  if (!result?.applied) return result
  if (result?.alreadyApplied) {
    return {
      ...result,
      owner: 'functions',
      clubVerified: true,
      clubsMasterVerified: true,
      verified: true,
    }
  }

  const clubId = clean(clubOperation?.target?.clubId)
  const [clubSnapshot, masterSnapshot] = await Promise.all([
    db.collection('dbClubs').doc(clubId).get(),
    db.collection('dbClubsMaster').doc('all').get(),
  ])
  let clubVerified = false
  let masterVerified = false

  if (clubOperation.changed === true) {
    clubVerified = clubSnapshot.exists && patchMatches(
      clubSnapshot.data() || {},
      clubOperation?.patch?.document || {}
    )
  } else {
    const expected = clubOperation?.expected || {}
    clubVerified = clubSnapshot.exists === (expected.targetExists === true) && (
      !clubSnapshot.exists || buildVerifiedFingerprint(clubSnapshot.data() || {}) === clean(expected.targetFingerprint)
    )
  }

  if (masterOperation.changed === true) {
    masterVerified = masterSnapshot.exists && patchMatches(
      masterSnapshot.data() || {},
      masterOperation?.patch?.document || {}
    )
  } else {
    const expected = masterOperation?.expected || {}
    masterVerified = masterSnapshot.exists === (expected.targetExists === true) && (
      !masterSnapshot.exists || buildVerifiedFingerprint(masterSnapshot.data() || {}) === clean(expected.targetFingerprint)
    )
  }

  return {
    ...result,
    owner: 'functions',
    clubVerified,
    clubsMasterVerified: masterVerified,
    verified: clubVerified && masterVerified,
  }
}

async function inspectClientAppliedPlayerDocuments(manifest) {
  const operations = Array.isArray(manifest?.operations?.playerDocuments)
    ? manifest.operations.playerDocuments
    : []
  const expectedExistingIds = [...new Set(operations
    .filter(operation => ['create', 'update', 'retain'].includes(clean(operation?.action)))
    .map(operation => clean(operation?.playerDocumentId))
    .filter(Boolean))]
  const expectedDeletedIds = [...new Set(operations
    .filter(operation => clean(operation?.action) === 'delete')
    .map(operation => clean(operation?.playerDocumentId))
    .filter(Boolean))]
  const ids = [...new Set([...expectedExistingIds, ...expectedDeletedIds])]
  const snapshots = ids.length
    ? await db.getAll(...ids.map(id => db.collection('dbPlayers').doc(id)))
    : []
  const byId = new Map(snapshots.map(snapshot => [snapshot.id, snapshot.exists]))
  const missingPlayerDocumentIds = expectedExistingIds.filter(id => byId.get(id) !== true)
  const undeletedPlayerDocumentIds = expectedDeletedIds.filter(id => byId.get(id) === true)

  return {
    compatibilityMode: 'manifest_v1_client_applied',
    expectedExistingCount: expectedExistingIds.length,
    existingCount: expectedExistingIds.length - missingPlayerDocumentIds.length,
    expectedDeletedCount: expectedDeletedIds.length,
    missingPlayerDocumentIds,
    undeletedPlayerDocumentIds,
    verified: missingPlayerDocumentIds.length === 0 && undeletedPlayerDocumentIds.length === 0,
  }
}

async function inspectLegacyPlayerDocuments(source) {
  const ids = Array.isArray(source?.playerDocumentIds) ? source.playerDocumentIds : []
  const snapshots = ids.length
    ? await db.getAll(...ids.map(id => db.collection('dbPlayers').doc(id)))
    : []
  const missingPlayerDocumentIds = snapshots.filter(snapshot => !snapshot.exists).map(snapshot => snapshot.id)
  return {
    compatibilityMode: 'schema_v1',
    expectedExistingCount: ids.length,
    existingCount: ids.length - missingPlayerDocumentIds.length,
    missingPlayerDocumentIds,
    verified: missingPlayerDocumentIds.length === 0,
  }
}

async function inspectIndexes(source) {
  const playerIndexes = await db.collection('dbSearchIndexes')
    .where('birthTeamId', '==', source.teamId)
    .where('seasonKey', '==', source.seasonKey)
    .where('entityType', '==', 'playerSeason').get()
  return { playerIndexCount: playerIndexes.size, playerIndexDocumentIds: playerIndexes.docs.map(snapshot => snapshot.id) }
}

async function inspectExpectedPlayerIndexes(expectedDocumentIds) {
  const ids = [...new Set((Array.isArray(expectedDocumentIds) ? expectedDocumentIds : [])
    .map(documentId => clean(documentId))
    .filter(Boolean))]
  const snapshots = ids.length
    ? await db.getAll(...ids.map(documentId => db.collection('dbSearchIndexes').doc(documentId)))
    : []
  const missingPlayerIndexDocumentIds = snapshots
    .filter(snapshot => !snapshot.exists)
    .map(snapshot => snapshot.id)

  return {
    expectedDocumentIds: ids,
    expectedPlayerIndexCount: ids.length,
    existingPlayerIndexCount: ids.length - missingPlayerIndexDocumentIds.length,
    missingPlayerIndexDocumentIds,
    verified: missingPlayerIndexDocumentIds.length === 0,
  }
}

async function runTeamStatsProjectionJob(jobId) {
  const job = await claimTeamStatsProjectionJob(jobId)
  if (!job) return { skipped: true, reason: 'jobNotClaimed' }
  const identity = { jobId, sourceRevision: job.sourceRevision, attemptToken: job.attemptToken }
  try {
    await updateWriteActionFromProjectionJob({
      writeActionId: job.writeActionId, jobId, jobType: job.jobType,
      sourceRevision: job.sourceRevision, attemptToken: job.attemptToken, status: 'processing',
    })
    const contract = resolveProjectionContract(job)
    const manifest = contract.manifest
    const canonicalSource = await readCanonicalTeamSeason(job)
    if (canonicalSource.stale) {
      const transition = await supersede(identity)
      if (transition?.applied) await updateWriteActionFromProjectionJob({
        writeActionId: job.writeActionId, jobId, jobType: job.jobType,
        sourceRevision: job.sourceRevision, attemptToken: job.attemptToken, status: 'superseded',
      })
      return { skipped: true, reason: 'staleSource' }
    }
    await updateStage({ ...identity, stage: 'canonicalSource', result: canonicalSource })
    let mainClubProjection
    if (contract.functionsAppliedMainClub) {
      mainClubProjection = await applyAndVerifyMainClub({
        manifest,
        identity,
        teamSeasonDocumentId: canonicalSource.teamSeasonDocumentId,
      })
      if (!mainClubProjection?.applied) {
        if (mainClubProjection?.reason === 'staleSource') {
          const transition = await supersede(identity)
          if (transition?.applied) await updateWriteActionFromProjectionJob({
            writeActionId: job.writeActionId, jobId, jobType: job.jobType,
            sourceRevision: job.sourceRevision, attemptToken: job.attemptToken, status: 'superseded',
          })
          return { skipped: true, reason: 'staleSource' }
        }
        if (SUPERSEDED_OPERATION_REASONS.has(clean(mainClubProjection?.reason))) {
          const transition = await supersede({ ...identity, reason: clean(mainClubProjection.reason) })
          if (transition?.applied) await updateWriteActionFromProjectionJob({
            writeActionId: job.writeActionId, jobId, jobType: job.jobType,
            sourceRevision: job.sourceRevision, attemptToken: job.attemptToken, status: 'superseded',
          })
          return { skipped: true, reason: clean(mainClubProjection.reason) }
        }
        return { skipped: true, reason: mainClubProjection?.reason || 'staleAttempt' }
      }
      if (!mainClubProjection.verified) {
        const error = new Error('Main Club projection verification failed')
        error.code = 'STATS_PROJECTION_MAIN_CLUB_INCOMPLETE'
        error.details = mainClubProjection
        throw error
      }
    } else {
      mainClubProjection = {
        applied: true,
        verified: true,
        owner: 'client',
        compatibilityMode: contract.legacy ? 'schema_v1' : 'manifest_v8_client_applied',
      }
    }
    await updateStage({
      ...identity,
      stage: 'mainClubProjection',
      status: contract.functionsAppliedMainClub ? 'completed' : 'client_applied',
      result: mainClubProjection,
    })

    const counterpartProjection = contract.functionsAppliedCounterparts
      ? await applyCounterpartOperations({
          manifest,
          identity,
          teamSeasonDocumentId: canonicalSource.teamSeasonDocumentId,
        })
      : {
          applied: true,
          owner: 'client',
          compatibilityMode: contract.legacy ? 'schema_v1' : 'manifest_v2_client_applied',
          movementOperationsCount: Array.isArray(manifest?.operations?.counterpartMovement)
            ? manifest.operations.counterpartMovement.length
            : 0,
        }
    if (!counterpartProjection?.applied) {
      if (counterpartProjection?.reason === 'staleSource') {
        const transition = await supersede(identity)
        if (transition?.applied) await updateWriteActionFromProjectionJob({
          writeActionId: job.writeActionId, jobId, jobType: job.jobType,
          sourceRevision: job.sourceRevision, attemptToken: job.attemptToken, status: 'superseded',
        })
        return { skipped: true, reason: 'staleSource' }
      }
      return { skipped: true, reason: counterpartProjection?.reason || 'staleAttempt' }
    }
    const supersededCounterpartOperation = findSupersededOperation(counterpartProjection)
    if (supersededCounterpartOperation) {
      const hasAppliedCounterpartOperation = [
        ...(counterpartProjection.movementResults || []),
        ...(counterpartProjection.clubResults || []),
        ...(counterpartProjection.masterResults || []),
      ].some(result => result?.applied === true)
      const transition = await supersede({
        ...identity,
        partial: hasAppliedCounterpartOperation,
        reason: supersededCounterpartOperation.reason,
      })
      if (transition?.applied) await updateWriteActionFromProjectionJob({
        writeActionId: job.writeActionId,
        jobId,
        jobType: job.jobType,
        sourceRevision: job.sourceRevision,
        attemptToken: job.attemptToken,
        status: 'superseded',
      })
      return {
        skipped: true,
        partialSuperseded: hasAppliedCounterpartOperation,
        reason: supersededCounterpartOperation.reason,
      }
    }

    await updateStage({
      ...identity,
      stage: 'counterpartMovement',
      status: contract.functionsAppliedCounterparts ? 'completed' : 'client_applied',
      result: counterpartProjection,
    })

    const playerDocuments = contract.legacy
      ? await inspectLegacyPlayerDocuments(canonicalSource)
      : contract.clientAppliedPlayerDocuments
        ? await inspectClientAppliedPlayerDocuments(manifest)
        : await applyAndVerifyPlayerDocuments({
            manifest,
            identity,
            teamSeasonDocumentId: canonicalSource.teamSeasonDocumentId,
          })
    if (!contract.legacy && !contract.clientAppliedPlayerDocuments && !playerDocuments.applied) {
      if (playerDocuments.reason === 'staleSource') {
        const transition = await supersede(identity)
        if (transition?.applied) await updateWriteActionFromProjectionJob({
          writeActionId: job.writeActionId, jobId, jobType: job.jobType,
          sourceRevision: job.sourceRevision, attemptToken: job.attemptToken, status: 'superseded',
        })
        return { skipped: true, reason: 'staleSource' }
      }
      return { skipped: true, reason: playerDocuments.reason || 'staleAttempt' }
    }
    if (!playerDocuments.verified) {
      const error = new Error('Player Document projection verification failed')
      error.code = 'STATS_PROJECTION_PLAYER_DOCUMENTS_INCOMPLETE'
      error.details = playerDocuments
      throw error
    }
    await updateStage({ ...identity, stage: 'playerDocuments', result: playerDocuments })

    const teamScout = contract.functionsAppliedTeamScout
      ? await applyAndVerifyTeamScout({
          manifest,
          identity,
          teamSeasonDocumentId: canonicalSource.teamSeasonDocumentId,
        })
      : {
          applied: true,
          verified: true,
          owner: 'client',
          compatibilityMode: contract.legacy ? 'schema_v1' : 'manifest_v4_client_applied',
          changed: manifest?.operations?.teamScout?.changed === true,
        }
    if (!teamScout?.applied) {
      if (teamScout?.reason === 'staleSource') {
        const transition = await supersede(identity)
        if (transition?.applied) await updateWriteActionFromProjectionJob({
          writeActionId: job.writeActionId, jobId, jobType: job.jobType,
          sourceRevision: job.sourceRevision, attemptToken: job.attemptToken, status: 'superseded',
        })
        return { skipped: true, reason: 'staleSource' }
      }
      return { skipped: true, reason: teamScout?.reason || 'staleAttempt' }
    }
    if (!teamScout.verified) {
      const error = new Error('Team Scout projection verification failed')
      error.code = 'STATS_PROJECTION_TEAM_SCOUT_INCOMPLETE'
      error.details = teamScout
      throw error
    }
    await updateStage({
      ...identity,
      stage: 'teamScout',
      status: contract.functionsAppliedTeamScout ? 'completed' : 'client_applied',
      result: teamScout,
    })

    let playerIndexes

    if (contract.functionsAppliedPlayerIndexes) {
      playerIndexes = await applyAndVerifyPlayerSeasonIndexes({
        manifest,
        identity,
        teamSeasonDocumentId: canonicalSource.teamSeasonDocumentId,
      })
      if (!playerIndexes?.applied) {
        if (playerIndexes?.reason === 'staleSource') {
          const transition = await supersede(identity)
          if (transition?.applied) await updateWriteActionFromProjectionJob({
            writeActionId: job.writeActionId, jobId, jobType: job.jobType,
            sourceRevision: job.sourceRevision, attemptToken: job.attemptToken, status: 'superseded',
          })
          return { skipped: true, reason: 'staleSource' }
        }
        return { skipped: true, reason: playerIndexes?.reason || 'staleAttempt' }
      }
      if (!playerIndexes.verified) {
        const error = new Error('Player Season SearchIndex projection verification failed')
        error.code = 'STATS_PROJECTION_PLAYER_INDEXES_INCOMPLETE'
        error.details = playerIndexes
        throw error
      }
    } else {
      const expectedPlayerIndexDocumentIds = Array.isArray(
        manifest?.deferred?.playerSeasonIndexes?.expectedDocumentIds
      )
        ? manifest.deferred.playerSeasonIndexes.expectedDocumentIds
        : null

      if (!contract.legacy && expectedPlayerIndexDocumentIds) {
        playerIndexes = await inspectExpectedPlayerIndexes(expectedPlayerIndexDocumentIds)
        if (!playerIndexes.verified) {
          const error = new Error('Player Season SearchIndex projection verification failed')
          error.code = 'STATS_PROJECTION_PLAYER_INDEXES_INCOMPLETE'
          error.details = playerIndexes
          throw error
        }
      } else {
        const inspectedIndexes = await inspectIndexes(canonicalSource)
        const expectedPlayerIndexCount = contract.legacy
          ? null
          : Number(manifest?.deferred?.playerSeasonIndexes?.expectedCount || 0)
        if (!contract.legacy && inspectedIndexes.playerIndexCount !== expectedPlayerIndexCount) {
          const error = new Error('Player Season SearchIndex projection verification failed')
          error.code = 'STATS_PROJECTION_PLAYER_INDEXES_INCOMPLETE'
          error.details = { ...inspectedIndexes, expectedPlayerIndexCount }
          throw error
        }
        playerIndexes = {
          ...inspectedIndexes,
          expectedPlayerIndexCount,
          compatibilityMode: contract.legacy ? 'schema_v1' : 'count_fallback',
          verified: contract.legacy || inspectedIndexes.playerIndexCount === expectedPlayerIndexCount,
        }
      }
    }

    await updateStage({
      ...identity,
      stage: 'playerIndexes',
      status: contract.functionsAppliedPlayerIndexes ? 'completed' : 'client_applied',
      result: playerIndexes,
    })
    let leagueMetadata

    if (contract.functionsAppliedLeagueMetadata) {
      leagueMetadata = await applyAndVerifyLeagueMetadata({
        manifest,
        identity,
        teamSeasonDocumentId: canonicalSource.teamSeasonDocumentId,
      })

      if (!leagueMetadata?.applied) {
        if (leagueMetadata?.reason === 'staleSource') {
          const transition = await supersede(identity)
          if (transition?.applied) await updateWriteActionFromProjectionJob({
            writeActionId: job.writeActionId, jobId, jobType: job.jobType,
            sourceRevision: job.sourceRevision, attemptToken: job.attemptToken, status: 'superseded',
          })
          return { skipped: true, reason: 'staleSource' }
        }

        const supersededLeagueOperation = findSupersededOperation(leagueMetadata)
        if (supersededLeagueOperation || SUPERSEDED_OPERATION_REASONS.has(clean(leagueMetadata?.reason))) {
          const hasAppliedLeagueOperation = [
            ...(leagueMetadata.leagueResults || []),
            ...(leagueMetadata.leaguesMasterResults || []),
          ].some(result => result?.applied === true && result?.unchanged !== true)
          const reason = clean(supersededLeagueOperation?.reason || leagueMetadata?.reason)
          const transition = await supersede({
            ...identity,
            partial: hasAppliedLeagueOperation,
            reason,
          })
          if (transition?.applied) await updateWriteActionFromProjectionJob({
            writeActionId: job.writeActionId, jobId, jobType: job.jobType,
            sourceRevision: job.sourceRevision, attemptToken: job.attemptToken, status: 'superseded',
          })
          return { skipped: true, partialSuperseded: hasAppliedLeagueOperation, reason }
        }

        return { skipped: true, reason: leagueMetadata?.reason || 'staleAttempt' }
      }

      if (!leagueMetadata.verified) {
        const error = new Error('League metadata projection verification failed')
        error.code = 'STATS_PROJECTION_LEAGUE_METADATA_INCOMPLETE'
        error.details = leagueMetadata
        throw error
      }
    } else {
      leagueMetadata = {
        applied: true,
        verified: true,
        owner: 'client',
        compatibilityMode: contract.legacy ? 'schema_v1' : 'manifest_v6_client_applied',
      }
    }

    let teamSeasonIndex

    if (contract.functionsAppliedTeamSeasonIndex) {
      teamSeasonIndex = await applyAndVerifyTeamSeasonIndex({
        manifest,
        identity,
        teamSeasonDocumentId: canonicalSource.teamSeasonDocumentId,
      })

      if (!teamSeasonIndex?.applied) {
        if (teamSeasonIndex?.reason === 'staleSource') {
          const transition = await supersede(identity)
          if (transition?.applied) await updateWriteActionFromProjectionJob({
            writeActionId: job.writeActionId, jobId, jobType: job.jobType,
            sourceRevision: job.sourceRevision, attemptToken: job.attemptToken, status: 'superseded',
          })
          return { skipped: true, reason: 'staleSource' }
        }
        if (SUPERSEDED_OPERATION_REASONS.has(clean(teamSeasonIndex?.reason))) {
          const transition = await supersede({
            ...identity,
            reason: clean(teamSeasonIndex.reason),
          })
          if (transition?.applied) await updateWriteActionFromProjectionJob({
            writeActionId: job.writeActionId, jobId, jobType: job.jobType,
            sourceRevision: job.sourceRevision, attemptToken: job.attemptToken, status: 'superseded',
          })
          return { skipped: true, reason: clean(teamSeasonIndex.reason) }
        }
        return { skipped: true, reason: teamSeasonIndex?.reason || 'staleAttempt' }
      }

      if (!teamSeasonIndex.verified) {
        const error = new Error('Team Season SearchIndex projection verification failed')
        error.code = 'STATS_PROJECTION_TEAM_INDEX_INCOMPLETE'
        error.details = teamSeasonIndex
        throw error
      }
    } else {
      teamSeasonIndex = {
        applied: true,
        verified: true,
        owner: 'client',
        compatibilityMode: contract.legacy ? 'schema_v1' : 'manifest_v7_client_applied',
      }
    }

    await updateStage({
      ...identity,
      stage: 'teamAndLeagueIndexes',
      status: contract.functionsAppliedTeamSeasonIndex ? 'completed' :
        (contract.functionsAppliedLeagueMetadata ? 'partially_completed' : 'client_applied'),
      result: {
        owner: contract.functionsAppliedTeamSeasonIndex ? 'functions' :
          (contract.functionsAppliedLeagueMetadata ? 'mixed' : 'client'),
        leagueMetadataOwner: contract.functionsAppliedLeagueMetadata ? 'functions' : 'client',
        teamSeasonIndexOwner: contract.functionsAppliedTeamSeasonIndex ? 'functions' : 'client',
        leagueMetadata,
        teamSeasonIndex,
        planningRequired: !contract.functionsAppliedTeamSeasonIndex,
      },
    })
    await updateStage({
      ...identity,
      stage: 'clubProjection',
      status: contract.functionsAppliedMainClub && contract.functionsAppliedCounterparts
        ? 'completed'
        : 'partially_completed',
      result: {
        owner: contract.functionsAppliedMainClub && contract.functionsAppliedCounterparts
          ? 'functions'
          : 'mixed',
        mainClubOwner: contract.functionsAppliedMainClub ? 'functions' : 'client',
        counterpartOwner: contract.functionsAppliedCounterparts ? 'functions' : 'client',
        mainClubProjection,
        counterpartClubOperationsCount: counterpartProjection.clubOperationsCount || 0,
        counterpartClubsMasterOperationsCount: counterpartProjection.clubsMasterOperationsCount || 0,
        planningRequired: !contract.functionsAppliedMainClub,
      },
    })
    const completion = await complete(identity)
    if (!completion?.applied) return { skipped: true, reason: 'staleAttempt' }
    await updateWriteActionFromProjectionJob({
      writeActionId: job.writeActionId, jobId, jobType: job.jobType,
      sourceRevision: job.sourceRevision, attemptToken: job.attemptToken, status: 'completed',
    })
    return { completed: true, canonicalSource, mainClubProjection, counterpartProjection, playerDocuments, playerIndexes, leagueMetadata, teamSeasonIndex }
  } catch (error) {
    const transition = await fail({ ...identity, error })
    if (transition?.applied) await updateWriteActionFromProjectionJob({
      writeActionId: job.writeActionId, jobId, jobType: job.jobType,
      sourceRevision: job.sourceRevision, attemptToken: job.attemptToken, status: 'failed', error,
    })
    throw error
  }
}

module.exports = { runTeamStatsProjectionJob }
