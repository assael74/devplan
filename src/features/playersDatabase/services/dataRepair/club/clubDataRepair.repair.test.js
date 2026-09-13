jest.mock('../../write/clubs/index.js', () => ({
  syncClubProjectionFromTeamSeason: jest.fn(),
  syncClubProjectionsFromLeagueTable: jest.fn(),
  rebuildAllClubsMasterDocument: jest.fn(),
  syncClubsMasterDocument: jest.fn(),
  recoverClubProjectionPersistence: jest.fn(),
  removeClubDocumentOrphanedCompetitionPathSeasons: jest.fn(),
}))

jest.mock('../../audit/audit.read.js', () => ({
  readPlayerDatabaseAuditSnapshot: jest.fn(),
}))

import { readPlayerDatabaseAuditSnapshot } from '../../audit/audit.read.js'
import { syncClubProjectionsFromLeagueTable } from '../../write/clubs/index.js'
import {
  rebuildClubProjectionsFromAuditFindings,
  resolveClubProjectionAuditTargets,
} from './clubDataRepair.repair.js'

describe('Club projection audit targets', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('uses explicit leagueId and leaves an unselected target untouched', () => {
    expect(resolveClubProjectionAuditTargets([
      { leagueId: 'league-a', seasonKey: '2025', teamDocumentId: 'team-a' },
    ])).toEqual([{ leagueId: 'league-a', seasonKey: '2025', teamId: 'team-a' }])
  })

  test('deduplicates findings for the same canonical target', () => {
    expect(resolveClubProjectionAuditTargets([
      { leagueId: 'league-a', seasonKey: '2025', teamDocumentId: 'team-a' },
      { leagueId: 'league-a', seasonKey: '2025', teamDocumentId: 'team-a' },
      { leagueId: 'league-b', seasonKey: '2025', teamDocumentId: 'team-b' },
    ])).toHaveLength(2)
  })

  test('does not assign a league meaning to relatedDocumentId', () => {
    expect(resolveClubProjectionAuditTargets([
      { relatedDocumentId: 'league-a', seasonKey: '2025', teamDocumentId: 'team-a' },
    ])).toEqual([{ leagueId: '', seasonKey: '2025', teamId: 'team-a' }])
  })

  test('does not mistake relatedDocumentId for the league when the explicit field exists', () => {
    expect(resolveClubProjectionAuditTargets([
      { leagueId: 'league-a', relatedDocumentId: 'team-a', seasonKey: '2025', teamDocumentId: 'team-a' },
    ])).toEqual([{ leagueId: 'league-a', seasonKey: '2025', teamId: 'team-a' }])
  })

  test('repairs only the selected canonical league, season and team once', async () => {
    readPlayerDatabaseAuditSnapshot.mockResolvedValue({
      rows: {
        teamSeasons: [],
        leagues: [
          { id: 'league-a', data: { leagueId: 'league-a', ageGroupId: 'u15', current: { seasonKey: '2025', tableRank: [{ teamId: 'team-a', clubId: 'club-a' }, { teamId: 'team-b', clubId: 'club-b' }] } } },
          { id: 'league-b', data: { leagueId: 'league-b', ageGroupId: 'u15', current: { seasonKey: '2025', tableRank: [{ teamId: 'team-c', clubId: 'club-c' }] } } },
        ],
      },
    })
    syncClubProjectionsFromLeagueTable.mockResolvedValue({ results: [{ clubId: 'club-a' }], failures: [] })

    await rebuildClubProjectionsFromAuditFindings({
      findings: [
        { leagueId: 'league-a', relatedDocumentId: 'team-a', seasonKey: '2025', teamDocumentId: 'team-a' },
        { leagueId: 'league-a', relatedDocumentId: 'team-a', seasonKey: '2025', teamDocumentId: 'team-a' },
      ],
    })

    expect(syncClubProjectionsFromLeagueTable).toHaveBeenCalledTimes(1)
    expect(syncClubProjectionsFromLeagueTable).toHaveBeenCalledWith(expect.objectContaining({
      league: expect.objectContaining({ leagueId: 'league-a' }),
      rows: [{ teamId: 'team-a', clubId: 'club-a' }],
    }))
  })

  test.each(['league-a', 'team-a'])('resolves a legacy relatedDocumentId of %s through season and team', async relatedDocumentId => {
    readPlayerDatabaseAuditSnapshot.mockResolvedValue({
      rows: {
        teamSeasons: [],
        leagues: [{ id: 'league-a', data: { leagueId: 'league-a', ageGroupId: 'u15', current: { seasonKey: '2025', tableRank: [{ teamId: 'team-a', clubId: 'club-a' }] } } }],
      },
    })
    syncClubProjectionsFromLeagueTable.mockResolvedValue({ results: [{ clubId: 'club-a' }], failures: [] })

    await rebuildClubProjectionsFromAuditFindings({
      findings: [{ relatedDocumentId, seasonKey: '2025', teamDocumentId: 'team-a' }],
    })

    expect(syncClubProjectionsFromLeagueTable).toHaveBeenCalledTimes(1)
  })

  test('does not repair an ambiguous legacy target', async () => {
    readPlayerDatabaseAuditSnapshot.mockResolvedValue({
      rows: {
        teamSeasons: [],
        leagues: ['league-a', 'league-b'].map(leagueId => ({ id: leagueId, data: { leagueId, ageGroupId: 'u15', current: { seasonKey: '2025', tableRank: [{ teamId: 'team-a', clubId: 'club-a' }] } } })),
      },
    })

    const result = await rebuildClubProjectionsFromAuditFindings({
      findings: [{ relatedDocumentId: 'team-a', seasonKey: '2025', teamDocumentId: 'team-a' }],
    })

    expect(syncClubProjectionsFromLeagueTable).not.toHaveBeenCalled()
    expect(result.failures).toEqual([expect.objectContaining({ reason: 'AMBIGUOUS_AUDIT_TARGET' })])
  })
})
