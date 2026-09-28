// src/features/playersDatabase/domain/statsV2/statsAbsence.builder.test.js

import {
  STATS_ABSENT_PLAYER_STATS,
  buildStatsAbsentTeamBalance,
  buildStatsAbsentTeamSeasonState,
} from './statsAbsence.builder.js'
import { getTeamSeasonStatsState } from './teamSeasonStatsState.js'

const buildSource = () => ({
  id: 'team-1__26_27',
  seasonKey: '26_27',
  rosterStatus: 'loaded',
  transfersIn: [{ movementId: 'in-1' }],
  transfersOut: [{ movementId: 'out-1' }],
  pendingPlayers: [{ pendingId: 'pending-1' }],
  tableRank: 2,
  tableAttackRank: 1,
  tableDefenseRank: 3,
  goalsForPerGame: 2.1,
  goalsAgainstPerGame: 0.9,
  teamStats: {
    points: 20,
    goalsFor: 21,
    goalsAgainst: 9,
    teamGamePlayed: 1,
  },
  teamPlayers: [
    {
      playerId: 'p1',
      fullName: 'One',
      rosterStatus: 'regular',
      notes: 'keep',
      statsStatus: 'loaded',
      playerStats: { games: 10, goals: 3 },
      primaryScoutProfileId: 'profile-1',
    },
    {
      playerId: 'p2',
      fullName: 'Two',
      rosterStatus: 'left',
      statsStatus: 'loaded',
      playerStats: { games: 5, goals: 1 },
    },
  ],
})

describe('stats absence contract', () => {
  test('canonical absent Team Season is absent and idempotent', () => {
    const absent = buildStatsAbsentTeamSeasonState(buildSource())

    expect(getTeamSeasonStatsState(absent)).toBe('absent')
    expect(buildStatsAbsentTeamSeasonState(absent)).toEqual(absent)
  })

  test('loaded player is present', () => {
    const absent = buildStatsAbsentTeamSeasonState(buildSource())
    absent.teamPlayers[0].statsStatus = 'loaded'

    expect(getTeamSeasonStatsState(absent)).toBe('present')
  })

  test('non-zero Stats are present', () => {
    const absent = buildStatsAbsentTeamSeasonState(buildSource())
    absent.teamPlayers[0].playerStats.games = 1

    expect(getTeamSeasonStatsState(absent)).toBe('present')
  })

  test('stale compact scouting is present', () => {
    const absent = buildStatsAbsentTeamSeasonState(buildSource())
    absent.teamPlayers[0].primaryScoutProfileId = 'old-profile'

    expect(getTeamSeasonStatsState(absent)).toBe('present')
  })


  test('stale rich scouting is present', () => {
    const absent = buildStatsAbsentTeamSeasonState(buildSource())
    absent.teamPlayers[0].scoutCombinations = [{ id: 'old-combination' }]

    expect(getTeamSeasonStatsState(absent)).toBe('present')
  })

  test('semantically equal Stats are not affected by object key order', () => {
    const absent = buildStatsAbsentTeamSeasonState(buildSource())
    const stats = absent.teamPlayers[0].playerStats

    absent.teamPlayers[0].playerStats = Object.fromEntries(
      Object.entries(stats).reverse()
    )

    expect(getTeamSeasonStatsState(absent)).toBe('absent')
  })

  test('absent Team Balance uses a fixed canonical snapshot', () => {
    const absent = buildStatsAbsentTeamSeasonState(buildSource())

    expect(absent.teamBalance).toEqual(buildStatsAbsentTeamBalance())
    expect(absent.teamBalance.balanceAvailability).toEqual({
      availability: 'unavailable',
      availabilityReason: 'stats_not_loaded',
    })
    expect(absent.teamBalance.lineupBenchmark.availabilityReason).toBe('stats_not_loaded')
    expect(absent.teamBalance.classificationCoverageBenchmark.availabilityReason).toBe('stats_not_loaded')
    expect(absent.teamBalance.scoutInterpretation.availabilityReason).toBe('stats_not_loaded')
    expect(absent.teamBalance.dependencyKey).not.toBe('')
    expect(absent.teamBalance.source.inputHash).not.toBe('')
  })

  test('removing roster members does not change Stats absence or Balance', () => {
    const absent = buildStatsAbsentTeamSeasonState(buildSource())
    const balance = absent.teamBalance
    const emptyRoster = { ...absent, teamPlayers: [], playersCount: 0 }

    expect(getTeamSeasonStatsState(emptyRoster)).toBe('absent')
    expect(emptyRoster.teamBalance).toBe(balance)
    expect(buildStatsAbsentTeamSeasonState(emptyRoster).teamBalance).toEqual(balance)
  })

  test('Balance absence is independent of roster, positions and official performance', () => {
    const source = buildSource()
    source.teamPlayers[0].primaryPosition = 'GK'
    source.teamAttackPerformance = { performanceLevel: 'high' }
    source.teamDefensePerformance = { performanceLevel: 'low' }
    const absent = buildStatsAbsentTeamSeasonState(source)
    const empty = buildStatsAbsentTeamSeasonState({ teamPlayers: [] })

    expect(absent.teamBalance).toEqual(empty.teamBalance)
    expect(absent.teamAttackPerformance).toEqual(source.teamAttackPerformance)
    expect(absent.teamDefensePerformance).toEqual(source.teamDefensePerformance)
  })

  test.each([
    ['fingerprint', balance => { balance.source.inputHash = 'old-roster-hash' }],
    ['count', balance => { balance.lineStructure.relevantPlayersCount = 1 }],
    ['scouting', balance => { balance.teamTaskSignals.offense = true }],
    ['unknown field', balance => { balance.unexpectedStats = 1 }],
  ])('rejects residual Balance %s even with an empty roster', (name, mutate) => {
    const absent = buildStatsAbsentTeamSeasonState({ teamPlayers: [] })
    mutate(absent.teamBalance)

    expect(getTeamSeasonStatsState(absent)).toBe('present')
  })

  test('fixed Balance returns independent objects', () => {
    const first = buildStatsAbsentTeamBalance()
    first.lineStructure.relevantPlayersCount = 9

    expect(buildStatsAbsentTeamBalance().lineStructure.relevantPlayersCount).toBe(0)
  })

  test('stale line classification is present', () => {
    const absent = buildStatsAbsentTeamSeasonState(buildSource())
    absent.teamPlayers[0].lineClassification.line = 'ATTACK'

    expect(getTeamSeasonStatsState(absent)).toBe('present')
  })

  test('available Team Balance is present', () => {
    const absent = buildStatsAbsentTeamSeasonState(buildSource())
    absent.teamBalance.balanceAvailability = {
      availability: 'available',
      availabilityReason: null,
    }

    expect(getTeamSeasonStatsState(absent)).toBe('present')
  })

  test('non-empty scout summary is present', () => {
    const absent = buildStatsAbsentTeamSeasonState(buildSource())
    absent.scoutProfilesSummary = {
      total: 1,
      profileCounts: { ATTACK: 1 },
    }

    expect(getTeamSeasonStatsState(absent)).toBe('present')
  })

  test('builder preserves roster order, Movement and League performance', () => {
    const source = buildSource()
    const absent = buildStatsAbsentTeamSeasonState(source)

    expect(absent.teamPlayers.map(player => player.playerId)).toEqual(['p1', 'p2'])
    expect(absent.teamPlayers.map(player => player.rosterStatus)).toEqual(['regular', 'left'])
    expect(absent.teamPlayers[0].notes).toBe('keep')
    expect(absent.transfersIn).toEqual(source.transfersIn)
    expect(absent.transfersOut).toEqual(source.transfersOut)
    expect(absent.pendingPlayers).toEqual(source.pendingPlayers)
    expect(absent.tableRank).toBe(source.tableRank)
    expect(absent.tableAttackRank).toBe(source.tableAttackRank)
    expect(absent.tableDefenseRank).toBe(source.tableDefenseRank)
    expect(absent.goalsForPerGame).toBe(source.goalsForPerGame)
    expect(absent.goalsAgainstPerGame).toBe(source.goalsAgainstPerGame)
    expect(absent.teamStats).toEqual(source.teamStats)
    expect(absent.teamPlayers[0].playerStats).toEqual(STATS_ABSENT_PLAYER_STATS)
  })
})
