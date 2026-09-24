const test = require('node:test')
const assert = require('node:assert/strict')

const shared = import('@devplan/players-scout-engine/players/index.js')
const clientStats = import('file:///C:/projects/devplan/src/features/playersDatabase/model/player/playerStats.model.js')
const clientMeasurement = import('file:///C:/projects/devplan/src/features/playersDatabase/model/scout/playerScoutMeasurement.model.js')

test('shared player stats normalization preserves legacy mappings and derived values', async () => {
  const [sharedModule, clientModule] = await Promise.all([shared, clientStats])
  const player = {
    games: 4,
    goals: 2,
    playerStats: { minutes: 180, subIn: 3, subOut: 1, teamRank: 0, teamGoalsFor: 7 },
  }
  const expected = {
    games: 4, goals: 2, yellowCards: 0, minutes: 180, starts: 0,
    substituteIn: 3, substitutedOut: 1, teamMinutes: 0, teamGames: 0,
    teamRank: 0, teamGoalsFor: 7, teamGoalsAgainst: 0,
    teamAttackPerformance: null, teamDefensePerformance: null,
    minutesPerGame: 45, goalsPer90: 1,
  }
  assert.deepEqual(sharedModule.normalizePlayerStats(player), expected)
  assert.deepEqual(clientModule.normalizePlayerStats(player), expected)
})

test('shared previous profile distances preserves measurement normalization', async () => {
  const [sharedModule, clientModule] = await Promise.all([shared, clientMeasurement])
  const measurement = {
    snapshotKey: 'stats__1', engineVersion: 'v1',
    profileStates: [
      { profileId: 'professional', distance: '12.5' },
      { profileId: 'preliminary', distance: null },
      { profileId: '', distance: 4 },
    ],
  }
  const expected = [{ profileId: 'professional', distance: 12.5 }]
  assert.deepEqual(sharedModule.buildPreviousProfileDistancesFromMeasurement(measurement), expected)
  assert.deepEqual(clientModule.buildPreviousProfileDistancesFromMeasurement(measurement), expected)
  assert.deepEqual(sharedModule.buildPreviousProfileDistancesFromMeasurement({}), [])
})
