const test = require('node:test')
const assert = require('node:assert/strict')
const Module = require('node:module')
const path = require('node:path')

const runnerPath = path.join(__dirname, 'teamStatsProjectionJob.runner.js')

const clone = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value))

const createSnapshot = (id, value) => ({
  id,
  exists: value !== undefined,
  data: () => clone(value || {}),
})

const createHarness = ({
  canonicalRevision = 'stats-r1',
  missingMainClub = false,
  counterpartMode = 'success',
  failCounterpartOnce = false,
  mainChanged = true,
} = {}) => {
  const calls = []
  const writeActionStatuses = []
  const stages = []
  const collections = new Map()
  const key = (collection, id) => `${collection}/${id}`
  const get = (collection, id) => collections.get(key(collection, id))
  const set = (collection, id, value) => collections.set(key(collection, id), clone(value))
  const remove = (collection, id) => collections.delete(key(collection, id))

  set('dbBirthTeamSeasons', 'season-doc-1', {
    statsProjectionRevision: canonicalRevision,
    birthTeamDocumentId: 'team-1',
    seasonKey: '2026-27',
    seasonStatus: 'active',
    teamPlayers: [],
    playersCount: 0,
    teamPlayersScout: [],
    scoutProfilesSummary: null,
  })
  set('dbClubs', 'club-main', { clubId: 'club-main', businessValue: 'before' })
  set('dbClubsMaster', 'all', { clubs: [{ clubId: 'club-main', businessValue: 'before' }] })
  set('dbLeagues', 'league-1', { current: { seasonKey: '2026-27' } })
  set('dbLeaguesMaster', 'all', { leagues: [{ leagueId: 'league-1' }] })
  set('dbSearchIndexes', 'team-index-1', { entityType: 'teamSeason', playersCount: 0 })

  const sourceRevision = 'stats-r1'
  const mainClubDocument = {
    clubId: 'club-main',
    businessValue: mainChanged ? 'after' : 'before',
    lastStatsMainClubProjectionOperationId: 'main-club-op',
  }
  const mainMasterDocument = {
    clubs: [{ clubId: 'club-main', businessValue: mainChanged ? 'after' : 'before' }],
    lastStatsMainClubProjectionOperationId: 'main-master-op',
  }
  const manifest = {
    schemaVersion: 9,
    sourceRevision,
    operations: {
      mainClubProjection: missingMainClub ? [] : [{
        operationType: 'mainClubProjection', operationId: 'main-club-op', sourceRevision,
        target: { clubId: 'club-main' }, changed: mainChanged,
        expected: { targetExists: true, targetFingerprint: 'before-club' },
        patch: { document: mainClubDocument },
      }],
      mainClubsMaster: missingMainClub ? [] : [{
        operationType: 'mainClubsMaster', operationId: 'main-master-op', sourceRevision,
        target: { documentId: 'all', clubId: 'club-main' }, changed: mainChanged,
        expected: { targetExists: true, targetFingerprint: 'before-master' },
        patch: { document: mainMasterDocument },
      }],
      counterpartMovement: [{ operationId: 'counterpart-movement-op' }],
      counterpartClubProjection: [{ operationId: 'counterpart-club-op' }],
      counterpartClubsMaster: [{ operationId: 'counterpart-master-op' }],
      playerDocuments: [{
        operationType: 'playerDocument', operationId: 'player-doc-op', sourceRevision,
        playerDocumentId: 'player-1', action: 'create', patch: { playerId: 'player-1' },
      }],
      teamScout: {
        operationType: 'teamScout', operationId: 'team-scout-op', sourceRevision,
        changed: false, patch: { teamPlayers: [], playersCount: 0, scoutProfilesSummary: null },
      },
      playerSeasonIndexes: [],
      leagueMetadata: [{
        operationId: 'league-op', sourceRevision, target: { leagueId: 'league-1' },
        patch: { document: { current: { seasonKey: '2026-27', synced: true } } },
      }],
      leaguesMasterMetadata: [{
        operationId: 'leagues-master-op', sourceRevision,
        patch: { leagues: [{ leagueId: 'league-1', synced: true }] },
      }],
      teamSeasonIndex: {
        operationType: 'teamSeasonIndex', operationId: 'team-index-op', sourceRevision,
        documentId: 'team-index-1', changed: true,
        patch: { entityType: 'teamSeason', playersCount: 0, statsSynced: true },
      },
    },
  }
  const job = {
    id: 'job-1', schemaVersion: 9, projectionManifest: manifest,
    sourceRevision, attemptToken: 'attempt-1', clientProjectionStatus: 'completed',
    teamSeasonDocumentId: 'season-doc-1', teamId: 'team-1', seasonKey: '2026-27',
    writeActionId: 'write-1', jobType: 'teamStatsProjection',
  }

  let counterpartAttempts = 0
  let mainApplied = false
  const repository = {
    claimTeamStatsProjectionJob: async () => ({ ...job }),
    updateStage: async ({ stage, status = 'completed' }) => {
      stages.push({ stage, status })
      return { applied: true }
    },
    complete: async () => {
      calls.push('complete')
      return { applied: true }
    },
    supersede: async ({ partial = false, reason = '' }) => {
      calls.push(partial ? `partial_superseded:${reason}` : `superseded:${reason}`)
      return { applied: true }
    },
    fail: async ({ error }) => {
      calls.push(`failed:${error.code || error.message}`)
      return { applied: true }
    },
    applyMainClubProjectionOperations: async ({ clubOperation, masterOperation }) => {
      calls.push('mainClub')
      if (mainApplied) return { applied: true, alreadyApplied: true }
      mainApplied = true
      set('dbClubs', 'club-main', clubOperation.patch.document)
      set('dbClubsMaster', 'all', masterOperation.patch.document)
      // alreadyApplied is used for a business no-op to characterize that only the
      // approved technical markers may differ while the runner performs no new business calculation.
      return { applied: true, alreadyApplied: mainChanged === false }
    },
    applyCounterpartMovementOperation: async () => {
      calls.push('counterpartMovement')
      counterpartAttempts += 1
      if (failCounterpartOnce && counterpartAttempts === 1) throw new Error('simulated interruption')
      if (counterpartMode === 'partialSuperseded') return { applied: true }
      return { applied: true }
    },
    applyCounterpartClubProjectionOperation: async () => {
      calls.push('counterpartClub')
      if (counterpartMode === 'partialSuperseded') {
        return { applied: false, skipped: true, reason: 'clubSnapshotChanged' }
      }
      return { applied: true }
    },
    applyCounterpartClubsMasterOperation: async () => {
      calls.push('counterpartMaster')
      return { applied: true }
    },
    applyPlayerDocumentOperation: async ({ operation }) => {
      calls.push('playerDocument')
      set('dbPlayers', operation.playerDocumentId, { ...(operation.patch || {}) })
      return { applied: true }
    },
    applyTeamScoutOperation: async ({ operation }) => {
      calls.push('teamScout')
      const current = get('dbBirthTeamSeasons', 'season-doc-1')
      set('dbBirthTeamSeasons', 'season-doc-1', { ...current, ...operation.patch })
      return { applied: true }
    },
    applyPlayerSeasonIndexOperation: async ({ operation }) => {
      calls.push('playerIndex')
      if (operation.action === 'delete') remove('dbSearchIndexes', operation.documentId)
      else set('dbSearchIndexes', operation.documentId, { ...(get('dbSearchIndexes', operation.documentId) || {}), ...(operation.patch || {}) })
      return { applied: true }
    },
    applyLeagueMetadataOperation: async ({ operation }) => {
      calls.push('league')
      set('dbLeagues', operation.target.leagueId, { ...(get('dbLeagues', operation.target.leagueId) || {}), ...operation.patch.document })
      return { applied: true }
    },
    applyLeaguesMasterMetadataOperation: async ({ operation }) => {
      calls.push('leaguesMaster')
      set('dbLeaguesMaster', 'all', { ...(get('dbLeaguesMaster', 'all') || {}), ...operation.patch })
      return { applied: true }
    },
    applyTeamSeasonIndexOperation: async ({ operation }) => {
      calls.push('teamIndex')
      set('dbSearchIndexes', operation.documentId, { ...(get('dbSearchIndexes', operation.documentId) || {}), ...operation.patch })
      return { applied: true }
    },
  }

  const db = {
    collection: collection => ({
      doc: id => ({
        get: async () => createSnapshot(id, get(collection, id)),
      }),
    }),
    getAll: async (...refs) => Promise.all(refs.map(ref => ref.get())),
  }

  const writeActions = {
    updateWriteActionFromProjectionJob: async ({ status }) => {
      writeActionStatuses.push(status)
      return { applied: true }
    },
  }

  return { calls, writeActionStatuses, stages, collections, get, set, db, repository, writeActions, job }
}

const loadRunner = harness => {
  delete require.cache[require.resolve(runnerPath)]
  const originalLoad = Module._load
  Module._load = function(request, parent, isMain) {
    if (parent?.filename === runnerPath && request === '../../../config/admin') return { db: harness.db }
    if (parent?.filename === runnerPath && request === './teamStatsProjectionJob.repository') return harness.repository
    if (parent?.filename === runnerPath && request === '../writeActions/writeAction.repository') return harness.writeActions
    return originalLoad.call(this, request, parent, isMain)
  }
  try {
    return require(runnerPath)
  } finally {
    Module._load = originalLoad
  }
}

test('v9 full success completes only after every projection stage', async () => {
  const harness = createHarness()
  const { runTeamStatsProjectionJob } = loadRunner(harness)
  const result = await runTeamStatsProjectionJob('job-1')

  assert.equal(result.completed, true)
  assert.equal(harness.calls.at(-1), 'complete')
  assert.equal(harness.writeActionStatuses.at(-1), 'completed')
  assert.deepEqual(harness.calls.filter(call => !call.startsWith('complete')), [
    'mainClub', 'counterpartMovement', 'counterpartClub', 'counterpartMaster',
    'playerDocument', 'teamScout', 'league', 'leaguesMaster', 'teamIndex',
  ])
  assert.deepEqual(harness.stages.map(row => row.stage), [
    'canonicalSource',
    'mainClubProjection',
    'counterpartMovement',
    'playerDocuments',
    'teamScout',
    'playerIndexes',
    'teamAndLeagueIndexes',
    'clubProjection',
  ])
})

test('v9 applies Main Club before Counterpart operations', async () => {
  const harness = createHarness()
  const { runTeamStatsProjectionJob } = loadRunner(harness)
  await runTeamStatsProjectionJob('job-1')

  const mainIndex = harness.calls.indexOf('mainClub')
  const movementIndex = harness.calls.indexOf('counterpartMovement')
  const clubIndex = harness.calls.indexOf('counterpartClub')
  const masterIndex = harness.calls.indexOf('counterpartMaster')
  assert.ok(mainIndex >= 0 && mainIndex < movementIndex)
  assert.ok(movementIndex < clubIndex && clubIndex < masterIndex)
})

test('changed:false preserves business state and permits only approved Main Club technical markers', async () => {
  const harness = createHarness({ mainChanged: false })
  const beforeClub = harness.get('dbClubs', 'club-main')
  const beforeMaster = harness.get('dbClubsMaster', 'all')
  const { runTeamStatsProjectionJob } = loadRunner(harness)
  const result = await runTeamStatsProjectionJob('job-1')

  assert.equal(result.completed, true)
  const afterClub = harness.get('dbClubs', 'club-main')
  const afterMaster = harness.get('dbClubsMaster', 'all')
  assert.equal(afterClub.businessValue, beforeClub.businessValue)
  assert.deepEqual(afterMaster.clubs, beforeMaster.clubs)
  assert.equal(afterClub.lastStatsMainClubProjectionOperationId, 'main-club-op')
  assert.equal(afterMaster.lastStatsMainClubProjectionOperationId, 'main-master-op')
})

test('recovery after Main apply resumes without duplicating Main business state', async () => {
  const harness = createHarness({ failCounterpartOnce: true })
  const { runTeamStatsProjectionJob } = loadRunner(harness)

  await assert.rejects(() => runTeamStatsProjectionJob('job-1'), /simulated interruption/)
  const clubAfterFirstAttempt = harness.get('dbClubs', 'club-main')
  const second = await runTeamStatsProjectionJob('job-1')

  assert.equal(second.completed, true)
  assert.equal(harness.calls.filter(call => call === 'mainClub').length, 2)
  assert.deepEqual(harness.get('dbClubs', 'club-main'), clubAfterFirstAttempt)
  assert.equal(harness.calls.filter(call => call === 'complete').length, 1)
})

test('stale canonical revision is superseded before any projection apply', async () => {
  const harness = createHarness({ canonicalRevision: 'stats-r2' })
  const { runTeamStatsProjectionJob } = loadRunner(harness)
  const result = await runTeamStatsProjectionJob('job-1')

  assert.deepEqual(result, { skipped: true, reason: 'staleSource' })
  assert.ok(harness.calls.includes('superseded:'))
  assert.equal(harness.calls.includes('mainClub'), false)
  assert.equal(harness.calls.includes('complete'), false)
})

test('counterpart stale after an earlier counterpart apply becomes partial_superseded and never completes', async () => {
  const harness = createHarness({ counterpartMode: 'partialSuperseded' })
  const { runTeamStatsProjectionJob } = loadRunner(harness)
  const result = await runTeamStatsProjectionJob('job-1')

  assert.equal(result.skipped, true)
  assert.equal(result.partialSuperseded, true)
  assert.equal(result.reason, 'clubSnapshotChanged')
  assert.ok(harness.calls.includes('partial_superseded:clubSnapshotChanged'))
  assert.equal(harness.calls.includes('complete'), false)
  assert.notEqual(harness.writeActionStatuses.at(-1), 'completed')
})

test('missing required Main Club projection fails and is never completed', async () => {
  const harness = createHarness({ missingMainClub: true })
  const { runTeamStatsProjectionJob } = loadRunner(harness)

  await assert.rejects(
    () => runTeamStatsProjectionJob('job-1'),
    error => error?.code === 'STATS_PROJECTION_MAIN_CLUB_OPERATION_REQUIRED'
  )
  assert.ok(harness.calls.includes('failed:STATS_PROJECTION_MAIN_CLUB_OPERATION_REQUIRED'))
  assert.equal(harness.calls.includes('complete'), false)
  assert.equal(harness.writeActionStatuses.includes('completed'), false)
  assert.equal(harness.writeActionStatuses.at(-1), 'failed')
})
