// src/features/playersDatabase/services/audit/roster/compare.test.js

import { buildRosterAuditExpected } from './buildExpected.js'
import { compareRosterAudit } from './compare.js'
import { buildTeamSignalSummary } from '../../../domain/signals/teamSignalSummary.js'

const approvedState = {
  teamId: 'team-1',
  teamSeasonDocumentId: 'team-1__2025_2026',
  leagueId: 'league-1',
  clubId: 'club-1',
  seasonId: '2025_2026',
  canonical: { teamRootOperation: 'DELETE', teamSeasonOperation: 'DELETE' },
  counterparts: [],
  playerSeasons: [],
  playerSearchIndexes: { upserts: [], deletes: [] },
  leagueProjection: { roster: { playersCount: 0, hasPlayers: false } },
  leaguesCenterProjection: { team: { documentationState: 'NO_ROSTER' } },
  clubsCenterProjection: {
    clubWrites: [{ upsertTeamsById: { 'team-1': { documentationState: 'NO_ROSTER' } } }],
  },
}

const cleanActual = () => ({
  teamRoot: null,
  teamSeason: null,
  counterparts: {},
  playerSeasons: {},
  playerSearchIndexes: {},
  league: {
    seasonsById: {
      '2025_2026': {
        table: { teamsById: { 'team-1': { teamSignalSummary: buildTeamSignalSummary(), roster: { playersCount: 0, hasPlayers: false } } } },
      },
    },
  },
  leaguesCenter: {
    leaguesById: {
      'league-1': {
        seasonsById: {
          '2025_2026': { teamsById: { 'team-1': { teamSignalSummary: buildTeamSignalSummary(), documentationState: 'NO_ROSTER' } } },
        },
      },
    },
  },
  clubsCenter: {
    clubsById: {
      'club-1': { teamsById: { 'team-1': { teamSignalSummary: buildTeamSignalSummary(), documentationState: 'NO_ROSTER' } } },
    },
  },
})

describe('compareRosterAudit', () => {
  test.each([
    { seasonUrl: 'https://legacy-season.test' },
    { teamUrl: 'https://legacy-team.test' },
    { seasonUrl: 'https://legacy-season.test', teamUrl: 'https://legacy-team.test' },
  ])('ignores legacy URLs %j without mutating the index or hiding active differences', legacyUrls => {
    const document = { team: { teamId: 'team-1' } }
    const loadState = {
      ...approvedState,
      playerSearchIndexes: { upserts: [{ documentId: 'index-1', document }], deletes: [] },
    }
    const expectedState = buildRosterAuditExpected({ approvedState: loadState })
    const actual = cleanActual()
    actual.playerSearchIndexes['index-1'] = {
      ...document,
      team: { ...document.team, ...legacyUrls },
    }
    expect(compareRosterAudit({ actual, expectedState, approvedState: loadState })).toEqual([])
    expect(actual.playerSearchIndexes['index-1'].team).toEqual({ ...document.team, ...legacyUrls })
    actual.playerSearchIndexes['index-1'].team.teamId = 'wrong-team'
    expect(compareRosterAudit({ actual, expectedState, approvedState: loadState }))
      .toEqual(expect.arrayContaining([expect.objectContaining({ target: 'playerSearchIndex' })]))
  })

  test('accepts a clean Roster Clear state', () => {
    const expectedState = buildRosterAuditExpected({ approvedState })
    expect(compareRosterAudit({ actual: cleanActual(), expectedState, approvedState })).toEqual([])
  })

  test('reports an undeleted Team Season', () => {
    const expectedState = buildRosterAuditExpected({ approvedState })
    const actual = cleanActual()
    actual.teamSeason = { identity: { teamSeasonDocumentId: approvedState.teamSeasonDocumentId } }
    expect(compareRosterAudit({ actual, expectedState, approvedState }))
      .toEqual(expect.arrayContaining([expect.objectContaining({ target: 'teamSeason', type: 'unexpected_document' })]))
  })

  test('normalizes object key order and Firestore timestamp representations', () => {
    const loadState = {
      ...approvedState,
      canonical: {
        teamRootOperation: 'SET',
        teamRoot: {
          timestamps: { updatedAt: { _seconds: 100, _nanoseconds: 500000000 } },
          identity: { teamId: 'team-1' },
        },
        teamSeasonOperation: 'DELETE',
      },
    }
    const actual = cleanActual()
    actual.teamRoot = {
      id: 'team-1',
      identity: { teamId: 'team-1' },
      timestamps: { updatedAt: { seconds: 100, nanoseconds: 500000000 } },
    }
    expect(compareRosterAudit({
      actual,
      expectedState: buildRosterAuditExpected({ approvedState: loadState }),
      approvedState: loadState,
    })).toEqual([])
  })
})
