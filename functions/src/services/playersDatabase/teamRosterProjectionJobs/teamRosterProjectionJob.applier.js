const { admin, db } = require('../../../config/admin')

const clean = value => String(value === undefined || value === null ? '' : value).trim()
const normalizeSeason = value => clean(value).replace(/[^0-9a-zA-Z]+/g, '_')

const COLLECTIONS = {
  teamSeasons: 'dbBirthTeamSeasons',
  searchIndexes: 'dbSearchIndexes',
  leagues: 'dbLeagues',
  leaguesMaster: 'dbLeaguesMaster',
  clubs: 'dbClubs',
  clubsMaster: 'dbClubsMaster',
}

const buildTeamSeasonDocumentId = (teamId, seasonKey) => (
  `${clean(teamId)}__${normalizeSeason(seasonKey)}`
)

const sameSeason = (left, right) => normalizeSeason(left) === normalizeSeason(right)

const staleSourceError = () => {
  const error = new Error('Roster sync source revision is stale')
  error.code = 'ROSTER_SYNC_SOURCE_STALE'
  return error
}

const invalidOperationError = (operation, message) => {
  const error = new Error(message)
  error.code = 'ROSTER_SYNC_OPERATION_INVALID'
  error.operationId = clean(operation?.operationId)
  return error
}

const operationList = payload => {
  const families = payload?.operations && typeof payload.operations === 'object'
    ? payload.operations
    : {}
  return [
    'counterpart',
    'playerIndex',
    'teamIndex',
    'leagueTeam',
    'leaguesMaster',
    'clubProjection',
    'clubsMaster',
  ].flatMap(family => (Array.isArray(families[family]) ? families[family] : []).map(operation => ({
    ...operation,
    family: clean(operation?.family || family),
  })))
}

const assertPayload = ({ job = {}, payload = null } = {}) => {
  if (!payload || typeof payload !== 'object') {
    throw invalidOperationError(null, 'Roster projection job is missing approvedSyncPayload')
  }
  if (clean(payload.sourceRevision) !== clean(job.sourceRevision)) {
    throw staleSourceError()
  }
  if (!clean(job.teamSeasonDocumentId)) {
    throw invalidOperationError(null, 'Roster projection job is missing canonical Team Season id')
  }
}

async function runGuardedTransaction({ job, operation, apply }) {
  const canonicalRef = db.collection(COLLECTIONS.teamSeasons).doc(clean(job.teamSeasonDocumentId))
  return db.runTransaction(async transaction => {
    const canonicalSnapshot = await transaction.get(canonicalRef)
    if (!canonicalSnapshot.exists) throw invalidOperationError(operation, 'Canonical Team Season was not found')
    const canonical = canonicalSnapshot.data() || {}
    if (clean(canonical.rosterProjectionRevision) !== clean(operation.sourceRevision || job.sourceRevision)) {
      throw staleSourceError()
    }

    const expected = operation.expected || {}
    if (expected.counterpartGuardRequired) {
      const guard = expected.counterpartGuard || {}
      const counterpartTeamId = clean(guard.birthTeamDocumentId)
      const counterpartSeasonKey = clean(guard.seasonKey)
      const expectedCounterpartRevision = clean(guard.rosterProjectionRevision)
      const expectedCounterpartMovementRevision = clean(guard.movementProjectionRevision)
      if (!counterpartTeamId || !counterpartSeasonKey || !expectedCounterpartRevision) {
        throw invalidOperationError(operation, 'Counterpart-derived operation is missing counterpart revision guard')
      }
      const counterpartRef = db.collection(COLLECTIONS.teamSeasons)
        .doc(buildTeamSeasonDocumentId(counterpartTeamId, counterpartSeasonKey))
      const counterpartSnapshot = await transaction.get(counterpartRef)
      if (!counterpartSnapshot.exists) {
        return { skipped: true, reason: 'counterpartMissing', target: counterpartRef.id }
      }
      const counterpart = counterpartSnapshot.data() || {}
      if (clean(counterpart.rosterProjectionRevision) !== expectedCounterpartRevision) {
        return { skipped: true, reason: 'counterpartRevisionChanged', target: counterpartRef.id }
      }
      if (clean(counterpart.movementProjectionRevision) !== expectedCounterpartMovementRevision) {
        return { skipped: true, reason: 'counterpartMovementRevisionChanged', target: counterpartRef.id }
      }
    }

    return apply({ transaction, canonical })
  })
}


const PLAYER_INDEX_ROSTER_FIELDS = new Set([
  'id', 'entityType', 'entityId', 'displayName', 'normalizedDisplayName',
  'playerId', 'playerDocumentId', 'externalPlayerId', 'identityBirthYear',
  'identityKey', 'rosterStatus', 'isYoungerAgeGroup', 'leagueId', 'seasonId',
  'seasonKey', 'clubId', 'clubLevel', 'clubStrengthLevel', 'birthTeamId',
  'birthTeamDocumentId', 'birthTeamSlot', 'teamId', 'teamDocumentId',
  'seasonUrl', 'ageGroupId', 'ageGroupLabel', 'birthYear', 'leagueLevel',
  'expectedLevelDelta', 'region', 'primaryPosition', 'positionLayer',
  'lineClassificationLine', 'lineClassificationPosition',
  'lineClassificationSource', 'lineClassificationEvidenceLevel',
  'lineClassificationModelVersion', 'numShirt', 'sourceCollection',
  'sourceDocumentId', 'sourceTarget',
])

const assertPlayerIndexRosterFields = (operation, fields = {}) => {
  const forbidden = Object.keys(fields).filter(key => !PLAYER_INDEX_ROSTER_FIELDS.has(key))
  if (forbidden.length) {
    throw invalidOperationError(
      operation,
      `Player SearchIndex patch contains non-roster fields: ${forbidden.join(', ')}`
    )
  }
}

const matchesExpectedScope = ({ data = {}, expected = {} } = {}) => (
  (!clean(expected.entityType) || clean(data.entityType) === clean(expected.entityType)) &&
  (!clean(expected.birthTeamId) || clean(data.birthTeamId) === clean(expected.birthTeamId)) &&
  (!clean(expected.seasonKey) || sameSeason(data.seasonKey, expected.seasonKey)) &&
  (!clean(expected.leagueId) || clean(data.leagueId) === clean(expected.leagueId))
)

async function applyCounterpart({ job, operation }) {
  const teamId = clean(operation.target?.birthTeamDocumentId)
  const seasonKey = clean(operation.target?.seasonKey)
  const side = clean(operation.patch?.side)
  const fact = operation.patch?.fact || null
  if (!teamId || !seasonKey || !['transfersIn', 'transfersOut'].includes(side) || !fact) {
    throw invalidOperationError(operation, 'Invalid counterpart operation')
  }
  const targetRef = db.collection(COLLECTIONS.teamSeasons).doc(buildTeamSeasonDocumentId(teamId, seasonKey))
  return runGuardedTransaction({ job, operation, apply: async ({ transaction }) => {
    const targetSnapshot = await transaction.get(targetRef)
    if (!targetSnapshot.exists) return { skipped: true, reason: 'counterpartMissing' }
    const current = targetSnapshot.data() || {}
    if (Object.prototype.hasOwnProperty.call(operation.expected || {}, 'counterpartRosterProjectionRevision')) {
      const expectedTargetRevision = clean(operation.expected.counterpartRosterProjectionRevision)
      const currentTargetRevision = clean(current.rosterProjectionRevision)
      if (currentTargetRevision !== expectedTargetRevision) {
        return { skipped: true, reason: 'counterpartRevisionChanged', target: targetRef.id }
      }
    }
    if (Object.prototype.hasOwnProperty.call(operation.expected || {}, 'counterpartMovementProjectionRevision')) {
      const expectedMovementRevision = clean(operation.expected.counterpartMovementProjectionRevision)
      const currentMovementRevision = clean(current.movementProjectionRevision)
      if (currentMovementRevision !== expectedMovementRevision) {
        return { skipped: true, reason: 'counterpartMovementRevisionChanged', target: targetRef.id }
      }
    }
    const facts = Array.isArray(current[side]) ? current[side] : []
    const movementId = clean(operation.expected?.movementId || fact.movementId)
    const playerId = clean(operation.patch?.playerId || fact.playerId)
    const index = facts.findIndex(row => (
      clean(row?.movementId) === movementId ||
      (playerId && clean(row?.playerId) === playerId && clean(row?.movementId) === movementId)
    ))
    const nextFacts = index >= 0
      ? facts.map((row, rowIndex) => rowIndex === index ? { ...row, ...fact } : row)
      : [...facts, fact]
    transaction.set(targetRef, {
      [side]: nextFacts,
      movementProjectionRevision: clean(operation.sourceRevision || job.sourceRevision),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true })
    return { applied: true, target: targetRef.id }
  } })
}

async function applyPlayerIndex({ job, operation }) {
  const docId = clean(operation.target?.docId)
  const type = clean(operation.patch?.type || 'upsert')
  if (!docId) throw invalidOperationError(operation, 'Player SearchIndex operation is missing docId')
  const targetRef = db.collection(COLLECTIONS.searchIndexes).doc(docId)
  return runGuardedTransaction({ job, operation, apply: async ({ transaction }) => {
    const snapshot = await transaction.get(targetRef)
    const existing = snapshot.exists ? snapshot.data() || {} : {}
    if (snapshot.exists && !matchesExpectedScope({ data: existing, expected: operation.expected })) {
      throw invalidOperationError(operation, 'Player SearchIndex scope changed before sync')
    }
    if (type === 'delete') {
      if (snapshot.exists) transaction.delete(targetRef)
      return { applied: snapshot.exists, deleted: true, target: docId }
    }
    const fields = operation.patch?.fields || {}
    assertPlayerIndexRosterFields(operation, fields)
    transaction.set(targetRef, {
      ...fields,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true })
    return { applied: true, target: docId }
  } })
}

async function applyTeamIndex({ job, operation }) {
  const docId = clean(operation.target?.docId)
  if (!docId) throw invalidOperationError(operation, 'Team SearchIndex operation is missing docId')
  const targetRef = db.collection(COLLECTIONS.searchIndexes).doc(docId)
  return runGuardedTransaction({ job, operation, apply: async ({ transaction }) => {
    const snapshot = await transaction.get(targetRef)
    if (snapshot.exists && !matchesExpectedScope({ data: snapshot.data() || {}, expected: operation.expected })) {
      throw invalidOperationError(operation, 'Team SearchIndex scope changed before sync')
    }
    transaction.set(targetRef, {
      ...(operation.patch?.fields || {}),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true })
    return { applied: true, target: docId }
  } })
}

const mergeLeagueRow = ({ league = {}, operation }) => {
  const target = operation.target || {}
  const sourceTarget = clean(target.sourceTarget)
  const rowKey = clean(operation.expected?.rowKey || target.birthTeamDocumentId)
  const patch = operation.patch || {}
  const updateSeason = season => {
    const tableRank = Array.isArray(season?.tableRank) ? season.tableRank : []
    const index = tableRank.findIndex(row => clean(
      row?.birthTeamDocumentId || row?.birthTeamId || row?.teamDocumentId || row?.teamId || row?.id
    ) === rowKey)
    if (index < 0) throw invalidOperationError(operation, 'League team row was not found')
    return {
      ...season,
      tableRank: tableRank.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row),
    }
  }
  if (sourceTarget === 'current') {
    if (!sameSeason(league.current?.seasonKey || league.current?.seasonId, target.seasonKey)) {
      throw invalidOperationError(operation, 'League current season target changed before sync')
    }
    return { current: updateSeason(league.current || {}) }
  }
  if (sourceTarget === 'history') {
    const history = Array.isArray(league.history) ? league.history : []
    const index = history.findIndex(row => sameSeason(row?.seasonKey || row?.seasonId, target.seasonKey))
    if (index < 0) throw invalidOperationError(operation, 'League history season target was not found')
    return { history: history.map((row, rowIndex) => rowIndex === index ? updateSeason(row) : row) }
  }
  throw invalidOperationError(operation, 'League operation has no valid sourceTarget')
}

async function applyLeagueTeam({ job, operation }) {
  const leagueId = clean(operation.target?.leagueId)
  if (!leagueId) throw invalidOperationError(operation, 'League operation is missing leagueId')
  const targetRef = db.collection(COLLECTIONS.leagues).doc(leagueId)
  return runGuardedTransaction({ job, operation, apply: async ({ transaction }) => {
    const snapshot = await transaction.get(targetRef)
    if (!snapshot.exists) throw invalidOperationError(operation, 'League document was not found')
    const next = mergeLeagueRow({ league: snapshot.data() || {}, operation })
    transaction.set(targetRef, {
      ...next,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true })
    return { applied: true, target: leagueId }
  } })
}

const upsertByKey = ({ rows = [], key, value }) => {
  const safeRows = Array.isArray(rows) ? rows : []
  const index = safeRows.findIndex(row => key(row))
  return index >= 0
    ? safeRows.map((row, rowIndex) => rowIndex === index ? value(row) : row)
    : [...safeRows, value(null)]
}

async function applyLeaguesMaster({ job, operation }) {
  const leagueId = clean(operation.target?.leagueId)
  const seasonKey = clean(operation.target?.seasonKey)
  const leaguePatch = operation.patch?.league || null
  const seasonEntry = operation.patch?.seasonEntry || null
  const summary = operation.patch?.summary
  if (!leagueId || !leaguePatch || !seasonEntry || summary === undefined) {
    throw invalidOperationError(operation, 'LeaguesMaster operation is not write-ready')
  }
  const targetRef = db.collection(COLLECTIONS.leaguesMaster).doc('all')
  return runGuardedTransaction({ job, operation, apply: async ({ transaction }) => {
    const snapshot = await transaction.get(targetRef)
    const current = snapshot.exists ? snapshot.data() || {} : {}
    const leagues = upsertByKey({
      rows: current.leagues,
      key: row => clean(row?.leagueId) === leagueId,
      value: existing => {
        const base = existing || {}
        const seasons = upsertByKey({
          rows: base.seasons,
          key: row => sameSeason(row?.seasonKey || row?.seasonId, seasonKey),
          value: () => seasonEntry,
        })
        return { ...base, ...leaguePatch, seasons }
      },
    })
    transaction.set(targetRef, {
      id: 'all',
      docType: 'leagues_master',
      leagues,
      summary,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true })
    return { applied: true, target: 'all' }
  } })
}

const mergeClubProjection = ({ current = {}, operation }) => {
  const target = operation.target || {}
  const clubIdentity = operation.patch?.fields?.clubIdentity || operation.patch?.clubIdentity || {}
  const projection = operation.patch?.fields?.ageGroupSeasonProjection || operation.patch?.ageGroupSeasonProjection || null
  if (!projection) throw invalidOperationError(operation, 'Club projection operation is missing projection')
  const ageGroupId = clean(target.ageGroupId || projection.ageGroupId)
  const seasonKey = clean(target.seasonKey || projection.season?.seasonKey)
  const teamId = clean(target.teamId || projection.season?.teamId)
  const ageGroups = upsertByKey({
    rows: current.ageGroups,
    key: row => clean(row?.ageGroupId) === ageGroupId,
    value: existing => {
      const base = existing || { ageGroupId }
      const seasons = upsertByKey({
        rows: base.seasons,
        key: row => sameSeason(row?.seasonKey || row?.seasonId, seasonKey) && clean(row?.teamId) === teamId,
        value: () => projection.season || projection,
      })
      return { ...base, ...projection, seasons }
    },
  })
  return { ...clubIdentity, clubId: clean(target.clubId || clubIdentity.clubId), ageGroups }
}

async function applyClubProjection({ job, operation }) {
  const clubId = clean(operation.target?.clubId)
  if (!clubId) throw invalidOperationError(operation, 'Club projection operation is missing clubId')
  const targetRef = db.collection(COLLECTIONS.clubs).doc(clubId)
  return runGuardedTransaction({ job, operation, apply: async ({ transaction }) => {
    const snapshot = await transaction.get(targetRef)
    const current = snapshot.exists ? snapshot.data() || {} : {}
    const patch = mergeClubProjection({ current, operation })
    transaction.set(targetRef, {
      ...patch,
      projectionVersion: Number(current.projectionVersion || 1),
      createdAt: current.createdAt || admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastWriteAction: 'PASTE_TEAM_PLAYERS',
      lastWriteAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true })
    return { applied: true, target: clubId }
  } })
}

const mergeMasterClub = ({ current = {}, operation }) => {
  const clubId = clean(operation.target?.clubId)
  const fields = operation.patch?.fields || operation.patch || {}
  const clubIdentity = fields.clubIdentity || {}
  const ageGroupEntry = fields.ageGroupEntry || null
  if (!ageGroupEntry) throw invalidOperationError(operation, 'ClubsMaster operation is missing ageGroupEntry')
  return upsertByKey({
    rows: current.clubs,
    key: row => clean(row?.clubId) === clubId,
    value: existing => {
      const base = existing || {}
      const ageGroups = upsertByKey({
        rows: base.ageGroups,
        key: row => clean(row?.ageGroupId) === clean(ageGroupEntry.ageGroupId),
        value: () => ageGroupEntry,
      })
      return { ...base, ...clubIdentity, clubId, ageGroups }
    },
  })
}

async function applyClubsMaster({ job, operation }) {
  const targetRef = db.collection(COLLECTIONS.clubsMaster).doc('all')
  return runGuardedTransaction({ job, operation, apply: async ({ transaction }) => {
    const snapshot = await transaction.get(targetRef)
    const current = snapshot.exists ? snapshot.data() || {} : {}
    const clubs = mergeMasterClub({ current, operation })
    transaction.set(targetRef, {
      clubs,
      projectionVersion: Number(current.projectionVersion || 1),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastWriteAction: 'PASTE_TEAM_PLAYERS',
      lastWriteAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true })
    return { applied: true, target: 'all' }
  } })
}

const APPLIERS = {
  counterpart: applyCounterpart,
  playerIndex: applyPlayerIndex,
  teamIndex: applyTeamIndex,
  leagueTeam: applyLeagueTeam,
  leaguesMaster: applyLeaguesMaster,
  clubProjection: applyClubProjection,
  clubsMaster: applyClubsMaster,
}

async function applyApprovedRosterSyncPayload({ job = {} } = {}) {
  const payload = job.approvedSyncPayload
  assertPayload({ job, payload })
  const operations = operationList(payload)
  const results = []
  for (const operation of operations) {
    const applier = APPLIERS[operation.family]
    if (!applier) throw invalidOperationError(operation, `Unsupported roster sync family: ${operation.family}`)
    if (clean(operation.sourceRevision) !== clean(job.sourceRevision)) throw staleSourceError()
    results.push({
      operationId: clean(operation.operationId),
      family: operation.family,
      result: await applier({ job, operation }),
    })
  }
  return { operationCount: operations.length, results }
}

module.exports = {
  applyApprovedRosterSyncPayload,
  operationList,
  mergeLeagueRow,
  mergeClubProjection,
  mergeMasterClub,
  matchesExpectedScope,
}
