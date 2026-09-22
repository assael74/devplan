const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { evaluatePlayerSeasonIndexes } = require('./teamRosterProjectionJob.indexes')

const source = players => ({
  teamId: 'team-root-1',
  birthTeamId: 'team-1',
  birthTeamSlot: 1,
  seasonId: '2025-26',
  seasonKey: '2025-26',
  canonicalRosterPlayers: players,
})

const index = ({ id, playerId, seasonId = '2025-26', birthTeamId = 'team-1', birthTeamSlot = 1, playerDocumentId = '' }) => ({
  id,
  entityType: 'playerSeason',
  playerId,
  seasonId,
  birthTeamId,
  birthTeamSlot,
  playerDocumentId,
})

test('roster-only player without dbPlayers is a valid indexed roster participant', () => {
  const result = evaluatePlayerSeasonIndexes({
    source: source([{ playerId: 'player-roster-only', playerDocumentId: 'external__123' }]),
    indexRows: [index({ id: 'index-roster-only', playerId: 'player-roster-only' })],
  })
  assert.equal(result.valid, true)
  assert.equal(result.expectedCount, 1)
})

test('tracked player is valid without changing the Player Document contract', () => {
  const result = evaluatePlayerSeasonIndexes({
    source: source([{ playerId: 'player-tracked', playerDocumentId: 'tracked-doc-1' }]),
    indexRows: [index({ id: 'index-tracked', playerId: 'player-tracked', playerDocumentId: 'tracked-doc-1' })],
  })
  assert.equal(result.valid, true)
})

test('mixed roster-only and tracked players each require one Player Season Index', () => {
  const result = evaluatePlayerSeasonIndexes({
    source: source([
      { playerId: 'player-roster-only', playerDocumentId: 'external__123' },
      { playerId: 'player-tracked', playerDocumentId: 'tracked-doc-1' },
    ]),
    indexRows: [
      index({ id: 'index-roster-only', playerId: 'player-roster-only' }),
      index({ id: 'index-tracked', playerId: 'player-tracked', playerDocumentId: 'tracked-doc-1' }),
    ],
  })
  assert.equal(result.valid, true)
  assert.equal(result.expectedCount, 2)
})

test('missing Player Season Index is invalid', () => {
  const result = evaluatePlayerSeasonIndexes({
    source: source([{ playerId: 'player-1' }]),
    indexRows: [],
  })
  assert.equal(result.valid, false)
  assert.deepEqual(result.missingIdentityKeys, ['player-1::2025-26::team-1::1'])
})

test('duplicate Player Season Index is invalid', () => {
  const result = evaluatePlayerSeasonIndexes({
    source: source([{ playerId: 'player-1' }]),
    indexRows: [index({ id: 'index-1', playerId: 'player-1' }), index({ id: 'index-2', playerId: 'player-1' })],
  })
  assert.equal(result.valid, false)
  assert.deepEqual(result.duplicateIdentityKeys, ['player-1::2025-26::team-1::1'])
})

test('foreign Player Season Index in the Team Season scope is invalid', () => {
  const result = evaluatePlayerSeasonIndexes({
    source: source([{ playerId: 'player-1' }]),
    indexRows: [index({ id: 'index-1', playerId: 'player-1' }), index({ id: 'foreign-index', playerId: 'player-foreign' })],
  })
  assert.equal(result.valid, false)
  assert.deepEqual(result.foreignIdentityKeys, ['player-foreign::2025-26::team-1::1'])
})

test('index without canonical identity is invalid and playerDocumentId is irrelevant', () => {
  const result = evaluatePlayerSeasonIndexes({
    source: source([{ playerId: 'player-1', playerDocumentId: 'external__123' }]),
    indexRows: [{ id: 'broken-index', entityType: 'playerSeason', playerId: '', seasonId: '2025-26', birthTeamId: 'team-1', birthTeamSlot: 1 }],
  })
  assert.equal(result.valid, false)
  assert.deepEqual(result.indexesWithIncompleteIdentity, ['broken-index'])
})
test('Roster Job has no Player Document dependency or write path', () => {
  const runnerPath = path.join(__dirname, 'teamRosterProjectionJob.runner.js')
  const runnerSource = fs.readFileSync(runnerPath, 'utf8')
  assert.doesNotMatch(runnerSource, /inspectPlayerDocuments/)
  assert.doesNotMatch(runnerSource, /dbPlayers/)
  assert.doesNotMatch(runnerSource, /playerDocumentIds/)
})
