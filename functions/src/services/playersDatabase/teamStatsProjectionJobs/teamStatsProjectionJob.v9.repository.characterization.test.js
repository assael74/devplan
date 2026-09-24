const test = require('node:test')
const assert = require('node:assert/strict')
const Module = require('node:module')
const path = require('node:path')

const repositoryPath = path.join(__dirname, 'teamStatsProjectionJob.repository.js')
const clone = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value))
const normalize = value => {
  if (value === undefined || value === null) return null
  if (Array.isArray(value)) return value.map(normalize)
  if (value && typeof value === 'object') {
    return Object.keys(value).sort().reduce((result, key) => ({ ...result, [key]: normalize(value[key]) }), {})
  }
  return value
}
const fingerprint = value => JSON.stringify(normalize(value))

const createFirestoreHarness = () => {
  const store = new Map()
  const key = (collection, id) => `${collection}/${id}`
  const makeSnapshot = (reference, value) => ({
    id: reference.id,
    ref: reference,
    exists: value !== undefined,
    data: () => clone(value || {}),
  })
  const makeRef = (collection, id) => ({
    collection,
    id,
    path: key(collection, id),
    get: async () => makeSnapshot(makeRef(collection, id), store.get(key(collection, id))),
  })
  const db = {
    collection: collection => ({
      doc: id => makeRef(collection, id),
    }),
    runTransaction: async callback => {
      const writes = []
      const transaction = {
        get: async reference => makeSnapshot(reference, store.get(reference.path)),
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
        fromMillis: millis => ({ toMillis: () => millis }),
        now: () => ({ toMillis: () => Date.now() }),
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

const seed = harness => {
  harness.set('dbBirthTeamSeasons', 'season-doc-1', { statsProjectionRevision: 'stats-r1' })
  harness.set('dbTeamStatsProjectionJobs', 'job-1', {
    status: 'processing',
    sourceRevision: 'stats-r1',
    attemptToken: 'attempt-1',
    attempts: 1,
    leaseExpiresAt: { toMillis: () => Date.now() - 1000 },
  })
  harness.set('dbClubs', 'club-main', { clubId: 'club-main', businessValue: 'same' })
  harness.set('dbClubsMaster', 'all', { clubs: [{ clubId: 'club-main', businessValue: 'same' }] })
}

const operations = harness => {
  const currentClub = harness.get('dbClubs', 'club-main')
  const currentMaster = harness.get('dbClubsMaster', 'all')
  return {
    clubOperation: {
      operationId: 'main-club-op',
      sourceRevision: 'stats-r1',
      target: { clubId: 'club-main' },
      changed: false,
      expected: { targetExists: true, targetFingerprint: fingerprint(currentClub) },
      patch: { document: { ...currentClub, lastStatsMainClubProjectionOperationId: 'main-club-op' } },
    },
    masterOperation: {
      operationId: 'main-master-op',
      sourceRevision: 'stats-r1',
      target: { documentId: 'all', clubId: 'club-main' },
      changed: false,
      expected: { targetExists: true, targetFingerprint: fingerprint(currentMaster) },
      patch: { document: { ...currentMaster, lastStatsMainClubProjectionOperationId: 'main-master-op' } },
    },
  }
}

test('real Main Club applier changed:false preserves business state and writes only approved markers', async () => {
  const harness = createFirestoreHarness()
  seed(harness)
  const repository = loadRepository(harness)
  const beforeClub = harness.get('dbClubs', 'club-main')
  const beforeMaster = harness.get('dbClubsMaster', 'all')
  const { clubOperation, masterOperation } = operations(harness)

  const result = await repository.applyMainClubProjectionOperations({
    jobId: 'job-1', sourceRevision: 'stats-r1', attemptToken: 'attempt-1',
    teamSeasonDocumentId: 'season-doc-1', clubOperation, masterOperation,
  })

  assert.equal(result.applied, true)
  assert.equal(result.businessChanged, false)
  const afterClub = harness.get('dbClubs', 'club-main')
  const afterMaster = harness.get('dbClubsMaster', 'all')
  assert.equal(afterClub.businessValue, beforeClub.businessValue)
  assert.deepEqual(afterMaster.clubs, beforeMaster.clubs)
  assert.equal(afterClub.lastStatsMainClubProjectionOperationId, 'main-club-op')
  assert.equal(afterMaster.lastStatsMainClubProjectionOperationId, 'main-master-op')
})

test('real repository recovery claims a new attempt and treats already-applied Main as idempotent', async () => {
  const harness = createFirestoreHarness()
  seed(harness)
  const repository = loadRepository(harness)
  const { clubOperation, masterOperation } = operations(harness)

  const first = await repository.applyMainClubProjectionOperations({
    jobId: 'job-1', sourceRevision: 'stats-r1', attemptToken: 'attempt-1',
    teamSeasonDocumentId: 'season-doc-1', clubOperation, masterOperation,
  })
  assert.equal(first.applied, true)

  const recovered = await repository.claimTeamStatsProjectionJob('job-1')
  assert.ok(recovered)
  assert.notEqual(recovered.attemptToken, 'attempt-1')
  assert.equal(harness.get('dbTeamStatsProjectionJobs', 'job-1').attempts, 2)

  const second = await repository.applyMainClubProjectionOperations({
    jobId: 'job-1', sourceRevision: 'stats-r1', attemptToken: recovered.attemptToken,
    teamSeasonDocumentId: 'season-doc-1', clubOperation, masterOperation,
  })
  assert.equal(second.applied, true)
  assert.equal(second.alreadyApplied, true)
  assert.equal(harness.get('dbClubs', 'club-main').businessValue, 'same')
})
