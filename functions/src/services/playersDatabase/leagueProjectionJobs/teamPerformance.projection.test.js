const test = require('node:test')
const assert = require('node:assert/strict')

const {
  buildTeamPerformanceRows,
} = require('./teamPerformance.projection')
const {
  buildTeamSeasonDocumentId,
} = require('./teamSeasonPerformance.write')

test('Team Season document ids normalize season separators', () => {
  assert.equal(
    buildTeamSeasonDocumentId({ teamId: 'team-1', seasonKey: '26/27' }),
    'team-1__26_27'
  )
})

test('Team Season performance keeps canonical zero values and one-decimal rates', () => {
  const [row] = buildTeamPerformanceRows([{
    teamId: 'team-1',
    rank: 1,
    games: 3,
    goalsFor: 5,
    goalsAgainst: 1,
    points: 0,
  }])

  assert.equal(row.performance.points, 0)
  assert.equal(row.performance.goalsForPerGame, 1.7)
  assert.equal(row.performance.goalsAgainstPerGame, 0.3)
})

test('Team Season performance preserves explicit zero instead of falling back', () => {
  const [row] = buildTeamPerformanceRows([{
    teamId: 'team-1',
    rank: 1,
    games: 0,
    teamGamePlayed: 12,
    goalsFor: 0,
    teamStats: { goalsFor: 99, points: 9 },
    points: 0,
  }])

  assert.equal(row.performance.teamGamePlayed, 0)
  assert.equal(row.performance.goalsFor, 0)
  assert.equal(row.performance.points, 0)
  assert.equal(row.performance.goalsForPerGame, 0)
})

test('Team Season performance resolves rank ties by official table rank', () => {
  const rows = buildTeamPerformanceRows([
    { teamId: 'team-2', rank: 2, games: 1, goalsFor: 3, goalsAgainst: 1 },
    { teamId: 'team-1', rank: 1, games: 1, goalsFor: 3, goalsAgainst: 1 },
  ])
  const byTeamId = Object.fromEntries(rows.map(row => [row.teamId, row.performance]))

  assert.equal(byTeamId['team-1'].tableAttackRank, 1)
  assert.equal(byTeamId['team-2'].tableAttackRank, 2)
  assert.equal(byTeamId['team-1'].tableDefenseRank, 1)
})
