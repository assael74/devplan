// src/features/playersDatabase/services/audit/roster/buildExpected.test.js

import { buildRosterAuditExpected } from './buildExpected.js'

describe('buildRosterAuditExpected', () => {
  test('requires an approved state with target identity', () => {
    expect(buildRosterAuditExpected({ approvedState: null }).complete).toBe(false)
    expect(buildRosterAuditExpected({ approvedState: {} }).reason).toBe('missing_approved_state')
  })

  test('uses only the approved Roster targets as expected state', () => {
    const approvedState = {
      teamId: 'club-a_2010_1',
      teamSeasonDocumentId: 'club-a_2010_1__2025_2026',
      leagueId: 'league-1',
      seasonId: '2025_2026',
      canonical: { teamSeasonOperation: 'DELETE' },
      counterparts: [],
      playerSeasons: [],
      playerSearchIndexes: { upserts: [], deletes: [] },
      leagueProjection: { roster: { playersCount: 0, hasPlayers: false } },
      leaguesCenterProjection: { team: {} },
      clubsCenterProjection: { clubWrites: [] },
    }

    const result = buildRosterAuditExpected({ approvedState })
    expect(result.complete).toBe(true)
    expect(result.expected.canonical).toEqual(approvedState.canonical)
  })
})
