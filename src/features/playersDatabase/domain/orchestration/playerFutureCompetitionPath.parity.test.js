const test = require('node:test')
const assert = require('node:assert/strict')

const shared = import('@devplan/players-scout-engine/players/index.js')
const client = import('file:///C:/projects/devplan/src/features/playersDatabase/domain/orchestration/playerFutureCompetitionPath.js')

const input = {
  player: {},
  team: { birthYear: 2011, leagueLevel: 3, birthTeamSlot: 2 },
  season: { seasonKey: '26/27', seasonStatus: 'active' },
  clubBirthTeams: [
    { birthYear: 2010, birthTeamSlot: 2, leagueLevel: 2 },
    { birthYear: 2009, birthTeamSlot: 2, leagueLevel: 1 },
  ],
}

test('shared future competition resolver preserves the client resolver result', async () => {
  const [sharedModule, clientModule] = await Promise.all([shared, client])
  const expected = {
    current: { birthYear: 2011, seasonKey: '26/27', leagueLevel: 3, birthTeamSlot: 2 },
    steps: [
      { offset: 1, seasonKey: '27/28', sourceBirthYear: 2010, sourceLeagueLevel: 2, leagueLevel: 2 },
      { offset: 2, seasonKey: '28/29', sourceBirthYear: 2009, sourceLeagueLevel: 1, leagueLevel: 1 },
    ],
  }
  const result = sharedModule.resolvePlayerFutureCompetitionPath(input)

  assert.deepEqual(result, clientModule.resolvePlayerFutureCompetitionPath(input))
  assert.deepEqual(result.current, expected.current)
  assert.deepEqual(
    result.steps.map(({ offset, seasonKey, sourceBirthYear, sourceLeagueLevel, leagueLevel }) => (
      { offset, seasonKey, sourceBirthYear, sourceLeagueLevel, leagueLevel }
    )),
    expected.steps
  )
})

test('completed seasons preserve the null future competition path', async () => {
  const sharedModule = await shared
  assert.equal(sharedModule.resolvePlayerFutureCompetitionPath({
    ...input,
    season: { ...input.season, seasonStatus: 'completed' },
  }), null)
})
