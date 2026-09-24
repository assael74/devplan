const test = require('node:test')
const assert = require('node:assert/strict')
const Module = require('node:module')
const path = require('node:path')

const repositoryPath = path.join(__dirname, 'teamStatsProjectionJob.repository.js')

const clone = value => {
  if (value === undefined || value === null) return value
  if (Array.isArray(value)) return value.map(clone)
  if (typeof value === 'object') {
    return Object.keys(value).reduce((result, key) => {
      result[key] = clone(value[key])
      return result
    }, {})
  }
  return value
}

const normalize = value => {
  if (value === undefined || value === null) return null
  if (Array.isArray(value)) return value.map(normalize)
  if (value && typeof value.toMillis === 'function') {
    return { __timestampMillis: value.toMillis() }
  }
  if (value && typeof value === 'object') {
    return Object.keys(value).sort().reduce((result, key) => {
      result[key] = normalize(value[key])
      return result
    }, {})
  }
  return value
}

const fingerprint = value => JSON.stringify(normalize(value))
const timestamp = millis => ({ toMillis: () => millis })

const createFirestoreHarness = () => {
  const store = new Map()
  const key = (collection, id) => `${collection}/${id}`

  const makeRef = (collection, id) => ({
    collection,
    id,
    path: key(collection, id),
  })

  const makeSnapshot = reference => {
    const value = store.get(reference.path)
    return {
      id: reference.id,
      ref: reference,
      exists: value !== undefined,
      data: () => clone(value || {}),
    }
  }

  const collectionDocs = collection => Array.from(store.entries())
    .filter(([entryKey]) => entryKey.startsWith(`${collection}/`))
    .map(([entryKey]) => makeSnapshot(makeRef(collection, entryKey.slice(collection.length + 1))))

  const buildQuery = (collection, predicates = [], limitCount = null) => ({
    where: (field, operator, expected) => buildQuery(
      collection,
      [...predicates, { field, operator, expected }],
      limitCount,
    ),
    limit: count => buildQuery(collection, predicates, count),
    get: async () => {
      let docs = collectionDocs(collection).filter(snapshot => predicates.every(predicate => {
        const actual = snapshot.data()[predicate.field]
        if (predicate.operator === '==') return actual === predicate.expected
        if (predicate.operator === '<=') {
          const actualValue = actual && typeof actual.toMillis === 'function' ? actual.toMillis() : actual
          const expectedValue = predicate.expected && typeof predicate.expected.toMillis === 'function'
            ? predicate.expected.toMillis()
            : predicate.expected
          return actualValue <= expectedValue
        }
        throw new Error(`Unsupported test operator: ${predicate.operator}`)
      }))
      if (Number.isInteger(limitCount)) docs = docs.slice(0, limitCount)
      return { docs, size: docs.length }
    },
  })

  const db = {
    collection: collection => ({
      doc: id => makeRef(collection, id),
      ...buildQuery(collection),
    }),
    runTransaction: async callback => {
      const writes = []
      const transaction = {
        get: async reference => makeSnapshot(reference),
        set: (reference, value, options = {}) => writes.push(() => {
          const current = store.get(reference.path) || {}
          store.set(reference.path, clone(options.merge ? { ...current, ...value } : value))
        }),
        update: (reference, value) => writes.push(() => {
          const current = store.get(reference.path) || {}
          store.set(reference.path, clone({ ...current, ...value }))
        }),
      }
      const result = await callback(transaction)
      writes.forEach(write => write())
      return result
    },
  }

  return {
    db,
    set: (collection, id, value) => store.set(key(collection, id), clone(value)),
    get: (collection, id) => clone(store.get(key(collection, id))),
  }
}

const loadRepository = harness => {
  delete require.cache[require.resolve(repositoryPath)]
  const originalLoad = Module._load
  const admin = {
    firestore: {
      FieldValue: { serverTimestamp: () => 'SERVER_TIMESTAMP' },
      Timestamp: {
        fromMillis: millis => timestamp(millis),
        now: () => timestamp(Date.now()),
      },
    },
  }

  Module._load = function(request, parent, isMain) {
    if (parent?.filename === repositoryPath && request === '../../../config/admin') {
      return { admin, db: harness.db }
    }
    return originalLoad.call(this, request, parent, isMain)
  }

  try {
    return require(repositoryPath)
  } finally {
    Module._load = originalLoad
  }
}

const seedBaseState = harness => {
  harness.set('dbBirthTeamSeasons', 'season-doc-1', {
    statsProjectionRevision: 'stats-r1',
  })
  harness.set('dbTeamStatsProjectionJobs', 'job-1', {
    status: 'processing',
    sourceRevision: 'stats-r1',
    attemptToken: 'attempt-1',
    attempts: 1,
    leaseExpiresAt: timestamp(Date.now() + 60_000),
  })
  harness.set('dbClubs', 'club-main', {
    clubId: 'club-main',
    name: 'Main Club',
    businessValue: 'same',
    teams: [{ teamId: 'team-1', points: 12 }],
  })
  harness.set('dbClubsMaster', 'all', {
    clubs: [{ clubId: 'club-main', businessValue: 'same' }],
    summary: { clubsCount: 1 },
  })
}

const buildNoBusinessChangeOperations = harness => {
  const currentClub = harness.get('dbClubs', 'club-main')
  const currentMaster = harness.get('dbClubsMaster', 'all')

  return {
    clubOperation: {
      operationId: 'main-club-op',
      sourceRevision: 'stats-r1',
      target: { clubId: 'club-main' },
      changed: false,
      expected: {
        targetExists: true,
        targetFingerprint: fingerprint(currentClub),
      },
      patch: {
        document: {
          ...currentClub,
          lastStatsMainClubProjectionOperationId: 'main-club-op',
        },
      },
    },
    masterOperation: {
      operationId: 'main-master-op',
      sourceRevision: 'stats-r1',
      target: { documentId: 'all', clubId: 'club-main' },
      changed: false,
      expected: {
        targetExists: true,
        targetFingerprint: fingerprint(currentMaster),
      },
      patch: {
        document: {
          ...currentMaster,
          lastStatsMainClubProjectionOperationId: 'main-master-op',
        },
      },
    },
  }
}

const withoutOperationMarker = document => {
  const result = clone(document)
  delete result.lastStatsMainClubProjectionOperationId
  return result
}

test('changed:false uses the real Main Club repository applier and changes only approved operation markers', async () => {
  const harness = createFirestoreHarness()
  seedBaseState(harness)
  const repository = loadRepository(harness)
  const beforeClub = harness.get('dbClubs', 'club-main')
  const beforeMaster = harness.get('dbClubsMaster', 'all')
  const { clubOperation, masterOperation } = buildNoBusinessChangeOperations(harness)

  const result = await repository.applyMainClubProjectionOperations({
    jobId: 'job-1',
    sourceRevision: 'stats-r1',
    attemptToken: 'attempt-1',
    teamSeasonDocumentId: 'season-doc-1',
    clubOperation,
    masterOperation,
  })

  assert.equal(result.applied, true)
  assert.equal(result.businessChanged, false)

  const afterClub = harness.get('dbClubs', 'club-main')
  const afterMaster = harness.get('dbClubsMaster', 'all')

  assert.deepEqual(withoutOperationMarker(afterClub), beforeClub)
  assert.deepEqual(withoutOperationMarker(afterMaster), beforeMaster)
  assert.equal(afterClub.lastStatsMainClubProjectionOperationId, 'main-club-op')
  assert.equal(afterMaster.lastStatsMainClubProjectionOperationId, 'main-master-op')
})

test('expired processing job is requeued, reclaimed with a new attempt, and an applied Main operation is idempotent', async () => {
  const harness = createFirestoreHarness()
  seedBaseState(harness)
  const repository = loadRepository(harness)
  const { clubOperation, masterOperation } = buildNoBusinessChangeOperations(harness)

  const firstApply = await repository.applyMainClubProjectionOperations({
    jobId: 'job-1',
    sourceRevision: 'stats-r1',
    attemptToken: 'attempt-1',
    teamSeasonDocumentId: 'season-doc-1',
    clubOperation,
    masterOperation,
  })
  assert.equal(firstApply.applied, true)

  const expiredJob = harness.get('dbTeamStatsProjectionJobs', 'job-1')
  harness.set('dbTeamStatsProjectionJobs', 'job-1', {
    ...expiredJob,
    leaseExpiresAt: timestamp(Date.now() - 1_000),
  })

  const recovery = await repository.requeueExpiredTeamStatsProjectionJobs()
  assert.equal(recovery.scannedCount, 1)

  const requeued = harness.get('dbTeamStatsProjectionJobs', 'job-1')
  assert.equal(requeued.status, 'queued')
  assert.equal(requeued.attemptToken, null)
  assert.equal(requeued.leaseExpiresAt, null)
  assert.ok(requeued.recoveryRequestedAt)

  const reclaimed = await repository.claimTeamStatsProjectionJob('job-1')
  assert.ok(reclaimed)
  assert.equal(reclaimed.sourceRevision, 'stats-r1')
  assert.notEqual(reclaimed.attemptToken, 'attempt-1')

  const claimedState = harness.get('dbTeamStatsProjectionJobs', 'job-1')
  assert.equal(claimedState.status, 'processing')
  assert.equal(claimedState.attempts, 2)
  assert.equal(claimedState.attemptToken, reclaimed.attemptToken)

  const beforeRetryClub = harness.get('dbClubs', 'club-main')
  const beforeRetryMaster = harness.get('dbClubsMaster', 'all')

  const retryApply = await repository.applyMainClubProjectionOperations({
    jobId: 'job-1',
    sourceRevision: 'stats-r1',
    attemptToken: reclaimed.attemptToken,
    teamSeasonDocumentId: 'season-doc-1',
    clubOperation,
    masterOperation,
  })

  assert.equal(retryApply.applied, true)
  assert.equal(retryApply.alreadyApplied, true)
  assert.deepEqual(harness.get('dbClubs', 'club-main'), beforeRetryClub)
  assert.deepEqual(harness.get('dbClubsMaster', 'all'), beforeRetryMaster)
})
