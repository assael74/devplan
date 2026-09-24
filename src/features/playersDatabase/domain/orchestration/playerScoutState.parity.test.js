const test = require('node:test')
const assert = require('node:assert/strict')

const shared = import('@devplan/players-scout-engine/players/index.js')
const client = import('file:///C:/projects/devplan/src/features/playersDatabase/domain/orchestration/buildPlayerScoutState.js')

test('shared Scout state builder preserves tracked-player input precedence and immediacy', async () => {
  const [sharedModule, clientModule] = await Promise.all([shared, client])
  const input = {
    player: {
      fullName: 'Tracked Player', birthYear: 2011, playerStats: { games: 10, minutes: 600, goals: 5 },
      playerSeasonStints: [{ seasonKey: '25/26', clubId: 'maccabi-tel-aviv' }],
      verification: { answers: [{ questionId: 'agent', answer: 'unknown' }] },
      manualImmediacyDecision: { actionStatus: 'monitor' },
    },
    team: { clubId: 'maccabi-tel-aviv', clubLevel: 1, birthYear: 2010, birthTeamSlot: 2, teamStats: { teamGamePlayed: 10 } },
    season: { ageGroupId: 'u15', leagueLevel: 2, seasonStatus: 'active' },
  }
  assert.deepEqual(sharedModule.buildPlayerScoutState(input), clientModule.buildPlayerScoutState(input))
})
