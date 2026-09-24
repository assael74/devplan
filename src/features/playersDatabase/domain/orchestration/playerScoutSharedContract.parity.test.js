const test = require('node:test')
const assert = require('node:assert/strict')

const shared = import('@devplan/players-scout-engine/players/index.js')
const clientContract = import('file:///C:/projects/devplan/src/features/playersDatabase/domain/contracts/playerScoutInput.contract.js')
const clientAdapter = import('file:///C:/projects/devplan/src/features/playersDatabase/domain/orchestration/buildDbPlayerScoutResult.js')

const buildInput = overrides => ({
  player: {
    fullName: 'Parity Player',
    birthYear: 2011,
    playerStats: { games: 10, goals: 5, minutes: 600, starts: 8, substituteIn: 1, substitutedOut: 2 },
    ...overrides?.player,
  },
  team: {
    clubId: 'maccabi-tel-aviv',
    clubLevel: 1,
    clubStrengthLevel: 1,
    birthYear: 2010,
    birthTeamSlot: 2,
    teamStats: { teamGamePlayed: 10, goalsFor: 20, goalsAgainst: 10 },
    ...overrides?.team,
  },
  season: {
    ageGroupId: 'u15',
    leagueLevel: 2,
    leagueTotalRound: 30,
    seasonStatus: 'active',
    ...overrides?.season,
  },
})

test('shared Scout input contract preserves client contract outputs', async () => {
  const [sharedModule, clientModule] = await Promise.all([shared, clientContract])
  const cases = [
    buildInput(),
    buildInput({ team: { clubId: 'missing-club', clubLevel: undefined, clubStrengthLevel: undefined }, season: { ageGroupId: 'u14' } }),
    buildInput({ season: { ageGroupId: 'u19' }, player: { playerStats: {} }, team: { teamStats: {} } }),
    buildInput({ player: { rosterStatus: 'youngerAgeGroup', birthYear: null }, season: { ageGroupId: '' } }),
  ]

  cases.forEach(input => {
    assert.deepEqual(
      sharedModule.buildPlayerScoutCalculationContract(input),
      clientModule.buildPlayerScoutCalculationContract(input)
    )
  })
})

test('shared Scout adapter preserves client adapter results for canonical normalized input', async () => {
  const [sharedModule, clientModule, adapterModule] = await Promise.all([shared, clientContract, clientAdapter])
  const contract = sharedModule.buildPlayerScoutCalculationContract(buildInput())
  const input = {
    player: contract.player,
    team: contract.team,
    season: contract.season,
    perspective: 'players_database',
    playerSeasonStints: [],
    previousProfileDistances: [],
    verificationAnswers: [],
    immediacyContext: { isEarlyAgeGroup: false, leagueLevel: 2 },
    manualReview: null,
    manualImmediacyDecision: null,
    futureCompetitionPath: null,
  }

  assert.deepEqual(
    sharedModule.buildDbPlayerScoutResult(input),
    adapterModule.buildDbPlayerScoutResult(input)
  )
  assert.equal(contract.context.gameTime, 80)
})

