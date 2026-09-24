const { admin, db } = require('../../../config/admin')
const { randomUUID } = require('crypto')
const normalizeFingerprintValue = value => {
  if (value === undefined || value === null) return null
  if (Array.isArray(value)) return value.map(normalizeFingerprintValue)
  if (value && typeof value.toMillis === 'function') {
    return { __timestampMillis: value.toMillis() }
  }
  if (value && typeof value === 'object') {
    return Object.keys(value).sort().reduce((result, key) => ({
      ...result,
      [key]: normalizeFingerprintValue(value[key]),
    }), {})
  }
  return value
}

const buildSourceFingerprint = value => JSON.stringify(normalizeFingerprintValue(value))

const patchMatches = (current = {}, patch = {}) => Object.keys(patch).every(key => (
  buildSourceFingerprint(current[key]) === buildSourceFingerprint(patch[key])
))

const COLLECTION = 'dbTeamStatsProjectionJobs'
const LEASE_MS = 10 * 60 * 1000
const ref = id => db.collection(COLLECTION).doc(id)

const isCurrentAttempt = ({ job = {}, sourceRevision, attemptToken }) => (
  job.status === 'processing' &&
  String(job.sourceRevision || '') === String(sourceRevision || '') &&
  String(job.attemptToken || '') === String(attemptToken || '')
)

const clean = value => String(value === undefined || value === null ? '' : value).trim()
const normalizeSeason = value => clean(value).replace(/[^0-9a-zA-Z]+/g, '_')
const buildTeamSeasonDocumentId = (teamId, seasonKey) => `${clean(teamId)}__${normalizeSeason(seasonKey)}`

async function runStatsProjectionOperationTransaction({
  jobId,
  sourceRevision,
  attemptToken,
  teamSeasonDocumentId,
  operation,
  requireCounterpartGuard = false,
  apply,
}) {
  return db.runTransaction(async transaction => {
    const jobSnapshot = await transaction.get(ref(jobId))
    const job = jobSnapshot.exists ? jobSnapshot.data() || {} : null
    if (!isCurrentAttempt({ job, sourceRevision, attemptToken })) {
      return { applied: false, reason: 'staleAttempt' }
    }

    const canonicalRef = db.collection('dbBirthTeamSeasons').doc(clean(teamSeasonDocumentId))
    const canonicalSnapshot = await transaction.get(canonicalRef)
    if (!canonicalSnapshot.exists) {
      const error = new Error('Canonical Team Season was not found while applying Stats projection')
      error.code = 'STATS_PROJECTION_CANONICAL_SOURCE_MISSING'
      throw error
    }
    if (clean(canonicalSnapshot.data()?.statsProjectionRevision) !== clean(sourceRevision)) {
      return { applied: false, reason: 'staleSource' }
    }

    if (requireCounterpartGuard || operation?.expected?.counterpartGuardRequired ||
        operation?.expected?.counterpartGuardsRequired) {
      const guards = Array.isArray(operation?.expected?.counterpartGuards)
        ? operation.expected.counterpartGuards
        : [operation?.expected?.counterpartGuard || {}]
      if (guards.length === 0) {
        const error = new Error('Counterpart-derived Stats operation is missing revision guards')
        error.code = 'STATS_PROJECTION_COUNTERPART_GUARD_INVALID'
        throw error
      }
      for (const guard of guards) {
        const counterpartTeamId = clean(guard.birthTeamDocumentId)
        const counterpartSeasonKey = clean(guard.seasonKey)
        const expectedRosterRevision = clean(guard.rosterProjectionRevision)
        const expectedMovementRevision = clean(guard.movementProjectionRevision)
        if (!counterpartTeamId || !counterpartSeasonKey || !expectedRosterRevision || !expectedMovementRevision) {
          const error = new Error('Counterpart-derived Stats operation is missing revision guard')
          error.code = 'STATS_PROJECTION_COUNTERPART_GUARD_INVALID'
          throw error
        }
        const counterpartRef = db.collection('dbBirthTeamSeasons')
          .doc(buildTeamSeasonDocumentId(counterpartTeamId, counterpartSeasonKey))
        const counterpartSnapshot = await transaction.get(counterpartRef)
        if (!counterpartSnapshot.exists) return { applied: false, skipped: true, reason: 'counterpartMissing' }
        const counterpart = counterpartSnapshot.data() || {}
        if (clean(counterpart.rosterProjectionRevision) !== expectedRosterRevision) {
          return { applied: false, skipped: true, reason: 'counterpartRevisionChanged' }
        }
        if (clean(counterpart.movementProjectionRevision) !== expectedMovementRevision) {
          return { applied: false, skipped: true, reason: 'counterpartMovementRevisionChanged' }
        }
      }
    }

    return apply({ transaction })
  })
}

async function claimTeamStatsProjectionJob(jobId) {
  return db.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref(jobId))
    const job = snapshot.exists ? snapshot.data() || {} : null
    if (!job) return null
    const expired = (job.leaseExpiresAt?.toMillis?.() || 0) <= Date.now()
    if (job.status !== 'queued' && !(job.status === 'processing' && expired)) return null
    const sourceRevision = String(job.sourceRevision || randomUUID())
    const attemptToken = randomUUID()
    transaction.update(ref(jobId), {
      status: 'processing', sourceRevision, attemptToken,
      attempts: Number(job.attempts || 0) + 1,
      startedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      leaseExpiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + LEASE_MS),
      error: null,
    })
    return { id: jobId, ...job, sourceRevision, attemptToken }
  })
}

async function withCurrentAttempt({ jobId, sourceRevision, attemptToken, callback }) {
  return db.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref(jobId))
    const job = snapshot.exists ? snapshot.data() || {} : null
    if (!isCurrentAttempt({ job, sourceRevision, attemptToken })) return { applied: false, reason: 'staleAttempt' }
    return callback({ transaction, job, reference: ref(jobId) })
  })
}

async function updateStage({ jobId, sourceRevision, attemptToken, stage, result, status = 'completed' }) {
  return withCurrentAttempt({ jobId, sourceRevision, attemptToken, callback: ({ transaction, reference }) => {
    transaction.update(reference, {
      [`stages.${stage}`]: String(status || 'completed'),
      [`stageResults.${stage}`]: result,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    return { applied: true }
  } })
}

async function complete({ jobId, sourceRevision, attemptToken }) {
  return withCurrentAttempt({ jobId, sourceRevision, attemptToken, callback: ({ transaction, reference }) => {
    transaction.update(reference, {
      status: 'completed', completedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(), leaseExpiresAt: null, error: null,
    })
    return { applied: true }
  } })
}

async function supersede({ jobId, sourceRevision, attemptToken, partial = false, reason = '' }) {
  return withCurrentAttempt({ jobId, sourceRevision, attemptToken, callback: ({ transaction, reference }) => {
    transaction.update(reference, {
      status: partial ? 'partial_superseded' : 'superseded',
      supersededAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      leaseExpiresAt: null,
      supersededReason: clean(reason),
    })
    return { applied: true }
  } })
}

async function fail({ jobId, sourceRevision, attemptToken, error }) {
  return withCurrentAttempt({ jobId, sourceRevision, attemptToken, callback: ({ transaction, reference }) => {
    transaction.update(reference, {
      status: 'failed', failedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(), leaseExpiresAt: null,
      error: { message: String(error?.message || 'Team stats projection job failed'), code: String(error?.code || '') },
    })
    return { applied: true }
  } })
}

async function applyPlayerDocumentOperation({
  jobId, sourceRevision, attemptToken, teamSeasonDocumentId, operation,
}) {
  return db.runTransaction(async transaction => {
    const jobSnapshot = await transaction.get(ref(jobId))
    const job = jobSnapshot.exists ? jobSnapshot.data() || {} : null
    if (!isCurrentAttempt({ job, sourceRevision, attemptToken })) {
      return { applied: false, reason: 'staleAttempt' }
    }

    const teamSeasonRef = db.collection('dbBirthTeamSeasons').doc(String(teamSeasonDocumentId || ''))
    const teamSeasonSnapshot = await transaction.get(teamSeasonRef)
    if (!teamSeasonSnapshot.exists) {
      const error = new Error('Canonical Team Season was not found while applying Player Document projection')
      error.code = 'STATS_PROJECTION_CANONICAL_SOURCE_MISSING'
      throw error
    }
    const teamSeason = teamSeasonSnapshot.data() || {}
    if (String(teamSeason.statsProjectionRevision || '') !== String(sourceRevision || '')) {
      return { applied: false, reason: 'staleSource' }
    }

    const playerDocumentId = String(operation?.playerDocumentId || '').trim()
    const action = String(operation?.action || '').trim()
    const patch = operation?.patch
    if (!playerDocumentId || !['create', 'update'].includes(action) || !patch || typeof patch !== 'object') {
      const error = new Error('Invalid approved Player Document projection operation')
      error.code = 'STATS_PROJECTION_PLAYER_DOCUMENT_OPERATION_INVALID'
      throw error
    }

    const playerRef = db.collection('dbPlayers').doc(playerDocumentId)
    transaction.set(playerRef, {
      ...patch,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true })

    return {
      applied: true,
      operationId: String(operation?.operationId || ''),
      playerDocumentId,
      action,
    }
  })
}

async function applyCounterpartMovementOperation({
  jobId, sourceRevision, attemptToken, teamSeasonDocumentId, operation,
}) {
  const target = operation?.target || {}
  const birthTeamDocumentId = clean(target.birthTeamDocumentId)
  const seasonKey = clean(target.seasonKey)
  const patch = operation?.patch
  if (!birthTeamDocumentId || !seasonKey || !patch || typeof patch !== 'object') {
    const error = new Error('Invalid approved Counterpart Movement projection operation')
    error.code = 'STATS_PROJECTION_COUNTERPART_MOVEMENT_INVALID'
    throw error
  }
  const targetRef = db.collection('dbBirthTeamSeasons')
    .doc(buildTeamSeasonDocumentId(birthTeamDocumentId, seasonKey))

  return runStatsProjectionOperationTransaction({
    jobId, sourceRevision, attemptToken, teamSeasonDocumentId, operation,
    apply: async ({ transaction }) => {
      const snapshot = await transaction.get(targetRef)
      if (!snapshot.exists) return { applied: false, skipped: true, reason: 'counterpartMissing' }
      const current = snapshot.data() || {}
      const expectedRosterRevision = clean(operation?.expected?.counterpartRosterProjectionRevision)
      const expectedMovementRevision = clean(operation?.expected?.counterpartMovementProjectionRevision)
      const currentMovementRevision = clean(current.movementProjectionRevision)
      const approvedMovementRevision = clean(patch.movementProjectionRevision)
      if (approvedMovementRevision && currentMovementRevision === approvedMovementRevision) {
        return {
          applied: true,
          alreadyApplied: true,
          target: targetRef.id,
          operationId: clean(operation.operationId),
        }
      }
      if (expectedRosterRevision && clean(current.rosterProjectionRevision) !== expectedRosterRevision) {
        return { applied: false, skipped: true, reason: 'counterpartRevisionChanged' }
      }
      if (currentMovementRevision !== expectedMovementRevision) {
        return { applied: false, skipped: true, reason: 'counterpartMovementRevisionChanged' }
      }
      transaction.set(targetRef, patch, { merge: true })
      return { applied: true, target: targetRef.id, operationId: clean(operation.operationId) }
    },
  })
}

async function applyCounterpartClubProjectionOperation({
  jobId, sourceRevision, attemptToken, teamSeasonDocumentId, operation,
}) {
  const clubId = clean(operation?.target?.clubId)
  if (!clubId) {
    const error = new Error('Counterpart Club projection operation is missing clubId')
    error.code = 'STATS_PROJECTION_COUNTERPART_CLUB_INVALID'
    throw error
  }
  const targetRef = db.collection('dbClubs').doc(clubId)
  return runStatsProjectionOperationTransaction({
    jobId, sourceRevision, attemptToken, teamSeasonDocumentId, operation,
    requireCounterpartGuard: true,
    apply: async ({ transaction }) => {
      const snapshot = await transaction.get(targetRef)
      const current = snapshot.exists ? snapshot.data() || {} : {}
      const operationId = clean(operation.operationId)
      if (operationId && clean(current.lastStatsProjectionOperationId) === operationId) {
        return { applied: true, alreadyApplied: true, target: clubId, operationId }
      }
      const expectedFingerprint = clean(operation?.expected?.targetFingerprint)
      const expectedExists = operation?.expected?.targetExists === true
      const fingerprintSource = snapshot.exists ? current : null
      if (snapshot.exists !== expectedExists || !expectedFingerprint ||
          buildSourceFingerprint(fingerprintSource) !== expectedFingerprint) {
        return { applied: false, skipped: true, reason: 'clubSnapshotChanged' }
      }
      const document = operation?.patch?.document
      if (!document || typeof document !== 'object') {
        const error = new Error('Counterpart Club projection is missing the approved document state')
        error.code = 'STATS_PROJECTION_COUNTERPART_CLUB_DOCUMENT_REQUIRED'
        throw error
      }
      transaction.set(targetRef, {
        ...document,
        projectionVersion: Number(document.projectionVersion || current.projectionVersion || 1),
        createdAt: current.createdAt || admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastWriteAction: 'PASTE_TEAM_STATS',
        lastWriteAt: admin.firestore.FieldValue.serverTimestamp(),
        lastStatsProjectionOperationId: clean(operation.operationId),
      })
      return { applied: true, target: clubId, operationId: clean(operation.operationId) }
    },
  })
}

async function applyCounterpartClubsMasterOperation({
  jobId, sourceRevision, attemptToken, teamSeasonDocumentId, operation,
}) {
  const targetRef = db.collection('dbClubsMaster').doc('all')
  return runStatsProjectionOperationTransaction({
    jobId, sourceRevision, attemptToken, teamSeasonDocumentId, operation,
    requireCounterpartGuard: true,
    apply: async ({ transaction }) => {
      const snapshot = await transaction.get(targetRef)
      const current = snapshot.exists ? snapshot.data() || {} : {}
      const operationId = clean(operation.operationId)
      if (operationId && clean(current.lastStatsProjectionOperationId) === operationId) {
        return { applied: true, alreadyApplied: true, target: 'all', operationId }
      }
      const expectedFingerprint = clean(operation?.expected?.targetFingerprint)
      if (!expectedFingerprint || buildSourceFingerprint(current) !== expectedFingerprint) {
        return { applied: false, skipped: true, reason: 'clubsMasterSnapshotChanged' }
      }
      const clubs = operation?.patch?.clubs
      if (!Array.isArray(clubs)) {
        const error = new Error('Counterpart ClubsMaster projection is missing the approved clubs state')
        error.code = 'STATS_PROJECTION_COUNTERPART_CLUBS_MASTER_DOCUMENT_REQUIRED'
        throw error
      }
      transaction.set(targetRef, {
        ...current,
        clubs,
        projectionVersion: Number(current.projectionVersion || 1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastWriteAction: 'PASTE_TEAM_STATS',
        lastWriteAt: admin.firestore.FieldValue.serverTimestamp(),
        lastStatsProjectionOperationId: clean(operation.operationId),
      })
      return { applied: true, target: 'all', operationId: clean(operation.operationId) }
    },
  })
}

async function applyTeamScoutOperation({
  jobId, sourceRevision, attemptToken, teamSeasonDocumentId, operation,
}) {
  const targetId = clean(operation?.teamSeasonDocumentId || teamSeasonDocumentId)
  const patch = operation?.patch
  if (!targetId || targetId !== clean(teamSeasonDocumentId)) {
    const error = new Error('Invalid approved Team Scout projection target')
    error.code = 'STATS_PROJECTION_TEAM_SCOUT_TARGET_INVALID'
    throw error
  }
  if (!patch || typeof patch !== 'object') {
    const error = new Error('Invalid approved Team Scout projection patch')
    error.code = 'STATS_PROJECTION_TEAM_SCOUT_PATCH_INVALID'
    throw error
  }

  return runStatsProjectionOperationTransaction({
    jobId, sourceRevision, attemptToken, teamSeasonDocumentId, operation,
    apply: async ({ transaction }) => {
      const targetRef = db.collection('dbBirthTeamSeasons').doc(targetId)
      const snapshot = await transaction.get(targetRef)
      if (!snapshot.exists) {
        const error = new Error('Canonical Team Season was not found while applying Team Scout projection')
        error.code = 'STATS_PROJECTION_CANONICAL_SOURCE_MISSING'
        throw error
      }
      const current = snapshot.data() || {}
      const operationId = clean(operation?.operationId)
      if (operationId && clean(current.lastStatsTeamScoutProjectionOperationId) === operationId) {
        return { applied: true, alreadyApplied: true, target: targetId, operationId }
      }

      if (operation?.changed !== true) {
        return { applied: true, unchanged: true, target: targetId, operationId }
      }

      transaction.set(targetRef, {
        teamPlayers: Array.isArray(patch.teamPlayers) ? patch.teamPlayers : [],
        playersCount: Number.isFinite(Number(patch.playersCount)) ? Number(patch.playersCount) : 0,
        scoutProfilesSummary: patch.scoutProfilesSummary || null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastStatsTeamScoutProjectionOperationId: operationId,
      }, { merge: true })

      return { applied: true, target: targetId, operationId }
    },
  })
}

async function applyPlayerSeasonIndexOperation({
  jobId, sourceRevision, attemptToken, teamSeasonDocumentId, operation,
}) {
  const documentId = clean(operation?.documentId)
  const action = clean(operation?.action)
  const operationRevision = clean(operation?.sourceRevision)
  const patch = operation?.patch

  if (!documentId || !['set', 'delete'].includes(action) || operationRevision !== clean(sourceRevision)) {
    const error = new Error('Invalid approved Player Season SearchIndex projection operation')
    error.code = 'STATS_PROJECTION_PLAYER_INDEX_OPERATION_INVALID'
    throw error
  }
  if (action === 'set' && (!patch || typeof patch !== 'object' || Array.isArray(patch))) {
    const error = new Error('Invalid approved Player Season SearchIndex projection patch')
    error.code = 'STATS_PROJECTION_PLAYER_INDEX_PATCH_INVALID'
    throw error
  }
  const protectedFields = new Set(['aliases', 'notes', 'playerUrl', 'updatedAt'])
  const protectedPatchField = action === 'set'
    ? Object.keys(patch).find(key => protectedFields.has(key))
    : ''
  if (protectedPatchField) {
    const error = new Error(`Player Season SearchIndex Stats patch cannot own ${protectedPatchField}`)
    error.code = 'STATS_PROJECTION_PLAYER_INDEX_FIELD_OWNERSHIP_INVALID'
    throw error
  }

  const targetRef = db.collection('dbSearchIndexes').doc(documentId)
  return runStatsProjectionOperationTransaction({
    jobId, sourceRevision, attemptToken, teamSeasonDocumentId, operation,
    apply: async ({ transaction }) => {
      const snapshot = await transaction.get(targetRef)
      const operationId = clean(operation?.operationId)

      if (action === 'delete') {
        if (!snapshot.exists) {
          return { applied: true, alreadyApplied: true, action, documentId, operationId }
        }
        transaction.delete(targetRef)
        return { applied: true, action, documentId, operationId }
      }

      const current = snapshot.exists ? snapshot.data() || {} : {}
      if (operationId && clean(current.lastStatsPlayerSeasonIndexProjectionOperationId) === operationId) {
        return { applied: true, alreadyApplied: true, action, documentId, operationId }
      }
      if (operation?.changed !== true) {
        return { applied: true, unchanged: true, action, documentId, operationId }
      }

      transaction.set(targetRef, {
        ...patch,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastStatsPlayerSeasonIndexProjectionOperationId: operationId,
      }, { merge: true })

      return { applied: true, action, documentId, operationId }
    },
  })
}


async function applyTeamSeasonIndexOperation({
  jobId, sourceRevision, attemptToken, teamSeasonDocumentId, operation,
}) {
  const documentId = clean(operation?.documentId)
  const operationId = clean(operation?.operationId)
  const operationRevision = clean(operation?.sourceRevision)
  const action = clean(operation?.action)
  const patch = operation?.patch

  if (!documentId || !operationId || action !== 'set' || operationRevision !== clean(sourceRevision) ||
      !patch || typeof patch !== 'object' || Array.isArray(patch)) {
    const error = new Error('Invalid approved Team Season SearchIndex projection operation')
    error.code = 'STATS_PROJECTION_TEAM_INDEX_OPERATION_INVALID'
    throw error
  }
  if (Object.prototype.hasOwnProperty.call(patch, 'updatedAt')) {
    const error = new Error('Team Season SearchIndex Stats patch cannot own updatedAt')
    error.code = 'STATS_PROJECTION_TEAM_INDEX_FIELD_OWNERSHIP_INVALID'
    throw error
  }

  const targetRef = db.collection('dbSearchIndexes').doc(documentId)
  return runStatsProjectionOperationTransaction({
    jobId, sourceRevision, attemptToken, teamSeasonDocumentId, operation,
    apply: async ({ transaction }) => {
      const snapshot = await transaction.get(targetRef)
      const current = snapshot.exists ? snapshot.data() || {} : {}

      if (clean(current.lastStatsTeamSeasonIndexProjectionOperationId) === operationId) {
        return patchMatches(current, patch)
          ? { applied: true, alreadyApplied: true, documentId, operationId }
          : { applied: false, skipped: true, reason: 'teamSeasonIndexSnapshotChanged' }
      }

      const expected = operation?.expected || {}
      const expectedExists = expected.documentExists === true
      if (snapshot.exists !== expectedExists) {
        return { applied: false, skipped: true, reason: 'teamSeasonIndexSnapshotChanged' }
      }

      if (snapshot.exists) {
        const fields = Array.isArray(expected.fields) ? expected.fields : []
        const expectedFingerprint = clean(expected.fingerprint)
        const snapshotState = fields.reduce((result, field) => {
          result[field] = current[field] === undefined ? null : current[field]
          return result
        }, {})
        if (!expectedFingerprint || buildSourceFingerprint(snapshotState) !== expectedFingerprint) {
          return { applied: false, skipped: true, reason: 'teamSeasonIndexSnapshotChanged' }
        }
      }

      if (operation?.changed !== true) {
        return { applied: true, unchanged: true, documentId, operationId }
      }

      transaction.set(targetRef, {
        ...patch,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastStatsTeamSeasonIndexProjectionOperationId: operationId,
      }, { merge: true })

      return { applied: true, documentId, operationId }
    },
  })
}


async function applyLeagueMetadataOperation({
  jobId, sourceRevision, attemptToken, teamSeasonDocumentId, operation,
}) {
  const leagueId = clean(operation?.target?.leagueId)
  const operationId = clean(operation?.operationId)
  const operationRevision = clean(operation?.sourceRevision)
  const documentPatch = operation?.patch?.document

  if (!leagueId || !operationId || operationRevision !== clean(sourceRevision) ||
      !documentPatch || typeof documentPatch !== 'object' || Array.isArray(documentPatch)) {
    const error = new Error('Invalid approved League metadata projection operation')
    error.code = 'STATS_PROJECTION_LEAGUE_METADATA_OPERATION_INVALID'
    throw error
  }

  const targetRef = db.collection('dbLeagues').doc(leagueId)
  return runStatsProjectionOperationTransaction({
    jobId, sourceRevision, attemptToken, teamSeasonDocumentId, operation,
    apply: async ({ transaction }) => {
      const snapshot = await transaction.get(targetRef)
      const current = snapshot.exists ? snapshot.data() || {} : {}

      if (clean(current.lastStatsLeagueMetadataProjectionOperationId) === operationId) {
        return patchMatches(current, documentPatch)
          ? { applied: true, alreadyApplied: true, target: leagueId, operationId }
          : { applied: false, skipped: true, reason: 'leagueSnapshotChanged' }
      }

      const expectedExists = operation?.expected?.targetExists === true
      const expectedFingerprint = clean(operation?.expected?.targetFingerprint)
      const fingerprintSource = snapshot.exists ? current : null
      if (snapshot.exists !== expectedExists || !expectedFingerprint ||
          buildSourceFingerprint(fingerprintSource) !== expectedFingerprint) {
        return { applied: false, skipped: true, reason: 'leagueSnapshotChanged' }
      }

      if (operation?.changed !== true) {
        return { applied: true, unchanged: true, target: leagueId, operationId }
      }

      transaction.set(targetRef, {
        ...documentPatch,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastStatsLeagueMetadataProjectionOperationId: operationId,
      }, { merge: true })

      return { applied: true, target: leagueId, operationId }
    },
  })
}

async function applyLeaguesMasterMetadataOperation({
  jobId, sourceRevision, attemptToken, teamSeasonDocumentId, operation,
}) {
  const documentId = clean(operation?.target?.documentId || 'all')
  const operationId = clean(operation?.operationId)
  const operationRevision = clean(operation?.sourceRevision)
  const patch = operation?.patch

  if (documentId !== 'all' || !operationId || operationRevision !== clean(sourceRevision) ||
      !patch || typeof patch !== 'object' || Array.isArray(patch) || !Array.isArray(patch.leagues)) {
    const error = new Error('Invalid approved LeaguesMaster metadata projection operation')
    error.code = 'STATS_PROJECTION_LEAGUES_MASTER_METADATA_OPERATION_INVALID'
    throw error
  }

  const targetRef = db.collection('dbLeaguesMaster').doc('all')
  return runStatsProjectionOperationTransaction({
    jobId, sourceRevision, attemptToken, teamSeasonDocumentId, operation,
    apply: async ({ transaction }) => {
      const snapshot = await transaction.get(targetRef)
      const current = snapshot.exists ? snapshot.data() || {} : {}

      if (clean(current.lastStatsLeaguesMasterProjectionOperationId) === operationId) {
        return patchMatches(current, patch)
          ? { applied: true, alreadyApplied: true, target: 'all', operationId }
          : { applied: false, skipped: true, reason: 'leaguesMasterSnapshotChanged' }
      }

      const expectedExists = operation?.expected?.targetExists === true
      const expectedFingerprint = clean(operation?.expected?.targetFingerprint)
      const fingerprintSource = snapshot.exists ? current : null
      if (snapshot.exists !== expectedExists || !expectedFingerprint ||
          buildSourceFingerprint(fingerprintSource) !== expectedFingerprint) {
        return { applied: false, skipped: true, reason: 'leaguesMasterSnapshotChanged' }
      }

      transaction.set(targetRef, {
        ...patch,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastStatsLeaguesMasterProjectionOperationId: operationId,
      }, { merge: true })

      return { applied: true, target: 'all', operationId }
    },
  })
}


async function applyMainClubProjectionOperations({
  jobId,
  sourceRevision,
  attemptToken,
  teamSeasonDocumentId,
  clubOperation,
  masterOperation,
}) {
  const clubId = clean(clubOperation?.target?.clubId)
  const masterDocumentId = clean(masterOperation?.target?.documentId || 'all')
  const clubOperationId = clean(clubOperation?.operationId)
  const masterOperationId = clean(masterOperation?.operationId)
  const clubRevision = clean(clubOperation?.sourceRevision)
  const masterRevision = clean(masterOperation?.sourceRevision)
  const clubDocument = clubOperation?.patch?.document
  const masterDocument = masterOperation?.patch?.document

  if (!clubId || masterDocumentId !== 'all' || !clubOperationId || !masterOperationId ||
      clubRevision !== clean(sourceRevision) || masterRevision !== clean(sourceRevision) ||
      !clubDocument || typeof clubDocument !== 'object' || Array.isArray(clubDocument) ||
      !masterDocument || typeof masterDocument !== 'object' || Array.isArray(masterDocument) ||
      clean(clubDocument.lastStatsMainClubProjectionOperationId) !== clubOperationId ||
      clean(masterDocument.lastStatsMainClubProjectionOperationId) !== masterOperationId) {
    const error = new Error('Invalid approved Main Club projection operations')
    error.code = 'STATS_PROJECTION_MAIN_CLUB_OPERATION_INVALID'
    throw error
  }

  return runStatsProjectionOperationTransaction({
    jobId,
    sourceRevision,
    attemptToken,
    teamSeasonDocumentId,
    operation: clubOperation,
    apply: async ({ transaction }) => {
      const clubRef = db.collection('dbClubs').doc(clubId)
      const masterRef = db.collection('dbClubsMaster').doc('all')
      const [clubSnapshot, masterSnapshot] = await Promise.all([
        transaction.get(clubRef),
        transaction.get(masterRef),
      ])
      const currentClub = clubSnapshot.exists ? clubSnapshot.data() || {} : {}
      const currentMaster = masterSnapshot.exists ? masterSnapshot.data() || {} : {}
      const clubAlreadyApplied = clean(currentClub.lastStatsMainClubProjectionOperationId) === clubOperationId
      const masterAlreadyApplied = clean(currentMaster.lastStatsMainClubProjectionOperationId) === masterOperationId

      if (clubAlreadyApplied || masterAlreadyApplied) {
        if (!clubAlreadyApplied || !masterAlreadyApplied) {
          return { applied: false, skipped: true, reason: 'mainClubProjectionStateChanged' }
        }
        return {
          applied: true,
          alreadyApplied: true,
          target: clubId,
          clubOperationId,
          masterOperationId,
        }
      }

      const expectedClubExists = clubOperation?.expected?.targetExists === true
      const expectedMasterExists = masterOperation?.expected?.targetExists === true
      const expectedClubFingerprint = clean(clubOperation?.expected?.targetFingerprint)
      const expectedMasterFingerprint = clean(masterOperation?.expected?.targetFingerprint)
      const clubFingerprintSource = clubSnapshot.exists ? currentClub : null
      const masterFingerprintSource = masterSnapshot.exists ? currentMaster : null

      if (clubSnapshot.exists !== expectedClubExists || !expectedClubFingerprint ||
          buildSourceFingerprint(clubFingerprintSource) !== expectedClubFingerprint) {
        return { applied: false, skipped: true, reason: 'mainClubSnapshotChanged' }
      }
      if (masterSnapshot.exists !== expectedMasterExists || !expectedMasterFingerprint ||
          buildSourceFingerprint(masterFingerprintSource) !== expectedMasterFingerprint) {
        return { applied: false, skipped: true, reason: 'mainClubsMasterSnapshotChanged' }
      }

      // Both documents are written from the approved CLIENT state, even for a business no-op,
      // so the technical operation markers become part of the composed base consumed by
      // the already-planned Counterpart operations that run next.
      transaction.set(clubRef, clubDocument)
      transaction.set(masterRef, masterDocument)

      return {
        applied: true,
        target: clubId,
        businessChanged: clubOperation?.changed === true || masterOperation?.changed === true,
        clubOperationId,
        masterOperationId,
      }
    },
  })
}

async function requeueExpiredTeamStatsProjectionJobs() {
  const snapshot = await db.collection(COLLECTION)
    .where('status', '==', 'processing')
    .where('leaseExpiresAt', '<=', admin.firestore.Timestamp.now())
    .limit(25)
    .get()
  await Promise.all(snapshot.docs.map(item => db.runTransaction(async transaction => {
    const current = await transaction.get(item.ref)
    const job = current.exists ? current.data() || {} : null
    if (job?.status !== 'processing' || (job.leaseExpiresAt?.toMillis?.() || 0) > Date.now()) return false
    transaction.update(item.ref, {
      status: 'queued', attemptToken: null, leaseExpiresAt: null,
      recoveryRequestedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    return true
  })))
  return { scannedCount: snapshot.size }
}

module.exports = {
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
  requeueExpiredTeamStatsProjectionJobs,
}
