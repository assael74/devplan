import { buildApprovedRosterSyncPayload } from './approvedRosterSyncPayload.js'

const baseInput = {
  sourceRevision: 'rev-1',
  leagueId: 'league-1',
  season: { seasonKey: '2026-27', seasonId: '28' },
  team: { birthTeamDocumentId: 'team-1', teamId: 'team-1', clubId: 'club-1', teamUrl: 'https://example.test/team-1' },
  teamSeason: { birthTeamDocumentId: 'team-1', teamBalance: { status: 'balanced' } },
  players: [{ playerId: 'p1', fullName: 'Player One' }, { playerId: 'p2', fullName: 'Player Two', games: 3 }],
  teamPerformance: { teamGamePlayed: 3 },
  approvedCounterpartRequests: [{
    movementId: 'move-1', playerId: 'p1', counterpartBirthTeamDocumentId: 'team-2', counterpartSeasonKey: '2025-26',
    outgoing: { movementId: 'move-1', playerId: 'p1' },
  }],
  leagueTeamPlan: {
    target: { leagueId: 'league-1', seasonKey: '2026-27', sourceTarget: 'current', birthTeamDocumentId: 'team-1' },
    expected: { rowKey: 'team-1' },
    patch: { playersCount: 2, hasPlayers: true },
  },
  leaguesMasterEntry: { leagueId: 'league-1', seasons: [{ seasonKey: '2026-27', playersCount: 2 }] },
  leaguesMasterSummary: { leaguesCount: 1, seasonsCount: 1, playersCount: 2 },
  playerIndexPlan: { operations: [{ type: 'upsert', docId: 'player-index-1', patch: { rosterStatus: 'regular' }, expected: { entityType: 'playerSeason' } }] },
  teamIndexPlan: { docId: 'team-index-1', patch: { playersCount: 2 }, expected: { entityType: 'birthTeamSeason' } },
  clubProjectionOperations: [{ operationKey: 'club-1::u15::2026-27::team-1', target: { clubId: 'club-1' }, patch: { ageGroupSeasonProjection: { ageGroupId: 'u15' } } }],
  clubsMasterOperations: [{ operationKey: 'club-1', target: { clubId: 'club-1' }, patch: { ageGroupEntry: { ageGroupId: 'u15' } } }],
}

describe('buildApprovedRosterSyncPayload', () => {
  test('builds stable write-ready operation families', () => {
    const first = buildApprovedRosterSyncPayload(baseInput)
    const second = buildApprovedRosterSyncPayload(baseInput)

    expect(second).toEqual(first)
    expect(first.sourceRevision).toBe('rev-1')
    expect(first.operations.counterpart[0].target.seasonKey).toBe('2025-26')
    expect(first.operations.leagueTeam[0].patch).toEqual(expect.objectContaining({ playersCount: 2, hasPlayers: true }))
    expect(first.operations.leaguesMaster[0].patch.seasonEntry).toEqual(expect.objectContaining({ seasonKey: '2026-27' }))
    expect(first.operations.leaguesMaster[0].patch.summary).toEqual(expect.objectContaining({ playersCount: 2 }))
    expect(first.operations.playerIndex[0]).toEqual(expect.objectContaining({ target: { docId: 'player-index-1' } }))
    expect(first.operations.playerIndex[0].patch.fields).toEqual(expect.objectContaining({ rosterStatus: 'regular' }))
    expect(first.operations.teamIndex[0].target.docId).toBe('team-index-1')
    expect(first.operations.clubProjection).toHaveLength(1)
    expect(first.operations.clubsMaster).toHaveLength(1)
  })

  test('requires a source revision', () => {
    expect(() => buildApprovedRosterSyncPayload({ ...baseInput, sourceRevision: '' })).toThrow('Missing roster sync source revision')
  })
})
