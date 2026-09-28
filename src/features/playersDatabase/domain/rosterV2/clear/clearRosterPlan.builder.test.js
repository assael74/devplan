// src/features/playersDatabase/domain/rosterV2/clear/clearRosterPlan.builder.test.js

import { buildStatsAbsentTeamSeasonState } from '../../statsV2/statsAbsence.builder.js'
import { getTeamSeasonStatsState } from '../../statsV2/teamSeasonStatsState.js'
import { buildRosterAbsentState, getTeamSeasonRosterState } from './rosterAbsent.builder.js'
import { buildClearRosterIds } from './clearRosterIdentity.js'
import { buildClearRosterPlan, applyClearRosterChanges } from './clearRosterPlan.builder.js'
import { freezeClearRosterProposal, buildClearRosterApprovedState, assertClearRosterApprovedState } from './clearRosterApprovedState.builder.js'

const sources = () => {
  const identity = { birthTeamDocumentId: 'team-1', seasonKey: '26/27', leagueId: 'league-1' }
  const ids = buildClearRosterIds(identity)
  const teamRoot = { id: 'team-1', clubId: 'club-1', birthTeamId: 'team-1', birthTeamSlot: 1 }
  const teamSeason = buildStatsAbsentTeamSeasonState({
    id: ids.teamSeasonDocumentId, ...identity, ageGroupId: 'u15', playersCount: 1,
    teamPlayers: [{ playerId: 'p1', rosterStatus: 'regular' }],
    transfersIn: [{ playerId: 'p1', fromClubId: 'club-2' }], transfersOut: [],
    pendingPlayers: [{ playerId: 'p2' }],
    rosterImport: { mode: 'PATCH', sourceSnapshotKey: 'old', contentHash: 'old', effectiveAt: null },
    teamStats: { points: 20, teamGamePlayed: 10 },
  })
  const row = { teamId: 'team-1', teamSlot: 1, clubId: 'club-1', playersCount: 1, hasPlayers: true, rank: 2 }
  const league = { id: 'league-1', current: { seasonKey: '26/27', tableRank: [row] }, history: [] }
  const clubSeason = { seasonKey: '26/27', teamId: 'team-1', teamSlot: 1, playersCount: 1, performance: { tableRank: 2 } }
  return {
    identity, teamRoot, teamSeason, league, leagues: [league],
    teamSearchIndex: {
      id: ids.teamSearchIndexId, ...identity, clubId: 'club-1',
      teamSeasonDocumentId: ids.teamSeasonDocumentId,
      sourceCollection: 'leagues', sourceDocumentId: 'league-1', sourceTarget: 'current', playersCount: 1,
    },
    club: { id: 'club-1', ageGroups: [{ ageGroupId: 'u15', seasons: [clubSeason] }] },
    clubsMaster: { id: 'all', clubs: [{ clubId: 'club-1', ageGroups: [{ ageGroupId: 'u15', current: [clubSeason], previous: [] }] }] },
    leaguesMaster: { id: 'all', summary: { playersCount: 1 }, leagues: [{ leagueId: 'league-1', seasons: [{ seasonKey: '26/27', playersCount: 1 }] }] },
    playerIndexes: [{ id: 'player-index-1', ...identity, entityType: 'playerSeason' }],
  }
}

describe('Clear Roster V2 domain', () => {
  test('an imported empty roster is not a cleared roster', () => {
    const season = sources().teamSeason
    season.teamPlayers = []
    season.playersCount = 0
    season.pendingPlayers = []
    expect(getTeamSeasonRosterState(season)).toBe('present')
    expect(getTeamSeasonRosterState(buildRosterAbsentState(season))).toBe('absent')
    const movementResidue = buildRosterAbsentState(season)
    movementResidue.transfersOut = [{ playerId: 'p1', toClubId: 'club-2' }]
    expect(getTeamSeasonRosterState(movementResidue)).toBe('present')
  })

  test.each(['26/27', '26_27', '26-27', '2026/2027'])('includes equivalent player-index season %s', seasonKey => {
    const input = sources()
    input.playerIndexes[0].seasonKey = seasonKey
    const approved = buildClearRosterApprovedState(freezeClearRosterProposal(buildClearRosterPlan(input)))
    expect(approved.deletions).toHaveLength(1)
  })

  test.each(['teamSeason', 'teamSearchIndex', 'league', 'club', 'clubsMaster', 'leaguesMaster'])(
    'rejects a nested wrong path for %s even when the final field is owned', kind => {
      const plan = buildClearRosterPlan(sources())
      const operation = plan.operations.find(item => item.kind === kind)
      const first = operation.changes[0]
      first.path = ['foreign', ...first.path]
      expect(() => buildClearRosterApprovedState(freezeClearRosterProposal(plan))).toThrow()
    }
  )

  test('rejects duplicate paths and omitted owned paths', () => {
    const plan = buildClearRosterPlan(sources())
    plan.operations[0].changes[1] = plan.operations[0].changes[0]
    expect(() => buildClearRosterApprovedState(freezeClearRosterProposal(plan))).toThrow()
  })

  test('clears only Roster-owned state and preserves Stats absence', () => {
    const source = sources().teamSeason
    const next = buildRosterAbsentState(source)
    expect(getTeamSeasonRosterState(next)).toBe('absent')
    expect(getTeamSeasonStatsState(next)).toBe('absent')
    expect(next.teamBalance).toBe(source.teamBalance)
    expect(next.transfersIn).toEqual([])
    expect(next.transfersOut).toEqual([])
    expect(next.pendingPlayers).toEqual([])
    expect(next.teamStats).toBe(source.teamStats)
    expect(buildRosterAbsentState(next)).toEqual(next)
  })

  test('blocks Stats residues before producing a plan', () => {
    const input = sources()
    input.teamSeason.teamPlayers[0].playerStats.goals = 1
    expect(() => buildClearRosterPlan(input)).toThrow()
  })

  test('produces safe local ids without changing the business season key', () => {
    const input = sources()
    expect(input.teamSeason.id).toBe('team-1__26_27')
    expect(input.teamSeason.seasonKey).toBe('26/27')
    expect(input.teamSearchIndex.id).not.toContain('/')
  })

  test('preserves official League facts and source references', () => {
    const plan = buildClearRosterPlan(sources())
    const operation = plan.operations.find(item => item.kind === 'league')
    const next = applyClearRosterChanges(operation.source, operation.changes)
    expect(next.current.tableRank[0]).toEqual({ ...operation.source.current.tableRank[0], playersCount: 0, hasPlayers: false })
    const index = plan.operations.find(item => item.kind === 'teamSearchIndex')
    expect(applyClearRosterChanges(index.source, index.changes)).toEqual({ ...index.source, playersCount: 0, playerSeasonIndexCount: 0 })
  })

  test('clears only this team season movement and resets its club summaries', () => {
    const plan = buildClearRosterPlan(sources())
    const teamSeason = plan.operations.find(item => item.kind === 'teamSeason')
    const club = plan.operations.find(item => item.kind === 'club')
    const nextSeason = applyClearRosterChanges(teamSeason.source, teamSeason.changes)
    const nextClub = applyClearRosterChanges(club.source, club.changes)

    expect(nextSeason.transfersIn).toEqual([])
    expect(nextSeason.transfersOut).toEqual([])
    expect(nextClub.ageGroups[0].seasons[0].transfers).toEqual(expect.objectContaining({
      coverageStatus: 'NOT_LOADED',
      in: expect.objectContaining({ total: 0 }),
      out: expect.objectContaining({ total: 0 }),
      pending: { total: 0 },
    }))
  })

  test('keeps projection cleanup on an already absent canonical roster', () => {
    const input = sources()
    input.teamSeason = buildRosterAbsentState(input.teamSeason)
    const plan = buildClearRosterPlan(input)
    expect(plan.deletions).toHaveLength(1)
    expect(plan.operations).toHaveLength(6)
  })

  test('rejects foreign player indexes and ambiguous targets', () => {
    const foreign = sources()
    foreign.playerIndexes[0].leagueId = 'other'
    expect(() => buildClearRosterPlan(foreign)).toThrow()
    const duplicate = sources()
    duplicate.league.current.tableRank.push({ ...duplicate.league.current.tableRank[0] })
    expect(() => buildClearRosterPlan(duplicate)).toThrow()
  })

  test('approval detaches and freezes values without accepting arbitrary states', () => {
    const plan = buildClearRosterPlan(sources())
    const proposed = freezeClearRosterProposal(plan)
    plan.operations[0].source.teamStats.points = 99
    const approved = buildClearRosterApprovedState(proposed)
    expect(approved.operations[0].source.teamStats.points).toBe(20)
    expect(Object.isFrozen(approved.operations[0].source.teamStats)).toBe(true)
    expect(() => assertClearRosterApprovedState(approved)).not.toThrow()
    expect(() => assertClearRosterApprovedState({ ...approved })).toThrow()
  })
})
