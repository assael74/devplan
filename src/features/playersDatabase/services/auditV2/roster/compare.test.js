import { compareRosterAuditV2 } from './compare.js'

const expected = {
  playerSearchIndexes: [{
    id: 'player-1',
    fields: {
      id: 'player-1',
      entityType: 'playerSeason',
      displayName: 'Player One',
      birthTeamId: 'team-1',
      seasonKey: '26_27',
    },
  }],
  teamSearchIndex: {
    id: 'team-index-1',
    fields: {
      teamSeasonDocumentId: 'team-1__26_27',
      playersCount: 1,
      playerSeasonIndexCount: 1,
      sourceTarget: 'current',
    },
  },
  leagueRosterMetadata: {
    leagueId: 'league-1',
    target: {
      sourceTarget: 'current',
      seasonKey: '26_27',
      birthTeamDocumentId: 'team-1',
    },
    fields: {
      playersCount: 1,
      hasPlayers: true,
    },
  },
}

const actual = {
  playerSearchIndexes: [{
    id: 'player-1',
    entityType: 'playerSeason',
    displayName: 'Player One',
    birthTeamId: 'team-1',
    seasonKey: '26_27',
    goals: 99,
    scoutPlayerInterestLevel: 'super_interesting',
  }],
  teamSearchIndex: {
    id: 'team-index-1',
    teamSeasonDocumentId: 'team-1__26_27',
    playersCount: 1,
    playerSeasonIndexCount: 1,
    sourceTarget: 'current',
    goalsFor: 99,
    scoutProfilesSummary: { total: 7 },
  },
  league: {
    current: {
      seasonKey: '26_27',
      tableRank: [{
        birthTeamDocumentId: 'team-1',
        playersCount: 1,
        hasPlayers: true,
        goalsFor: 99,
      }],
    },
  },
}

describe('compareRosterAuditV2', () => {
  test('ignores Stats and Scouting fields outside Roster ownership', () => {
    expect(compareRosterAuditV2({ expected, actual })).toEqual([])
  })

  test('reports a missing expected Player SearchIndex', () => {
    const findings = compareRosterAuditV2({
      expected,
      actual: { ...actual, playerSearchIndexes: [] },
    })
    expect(findings.some(row => (
      row.type === 'missing_projection' &&
      row.target === 'playerSearchIndex'
    ))).toBe(true)
  })

  test('reports a stale Player SearchIndex inside the current team-season scope', () => {
    const findings = compareRosterAuditV2({
      expected,
      actual: {
        ...actual,
        playerSearchIndexes: [
          ...actual.playerSearchIndexes,
          {
            id: 'player-old',
            entityType: 'playerSeason',
            birthTeamId: 'team-1',
            seasonKey: '26_27',
          },
        ],
      },
    })
    expect(findings.some(row => (
      row.type === 'stale_projection' &&
      row.documentId === 'player-old'
    ))).toBe(true)
  })

  test('reports a real Roster-owned Team SearchIndex mismatch', () => {
    const findings = compareRosterAuditV2({
      expected,
      actual: {
        ...actual,
        teamSearchIndex: {
          ...actual.teamSearchIndex,
          playersCount: 2,
        },
      },
    })
    expect(findings.some(row => (
      row.target === 'teamSearchIndex' &&
      row.type === 'projection_mismatch'
    ))).toBe(true)
  })
})
