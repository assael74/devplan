// src/features/playersDatabase/services/audit/league/index.test.js

import { auditLeague } from './index.js'
import { readExpectedTeamSignals } from '../signals/readExpectedTeamSignals.js'
import { buildTeamSignalSummary } from '../../../domain/signals/teamSignalSummary.js'
import {
  readActualLeagueAudit,
  readClubProfiles,
  readLeagueCanonical,
} from './readActual.js'

jest.mock('./readActual.js', () => ({
  readActualLeagueAudit: jest.fn(),
  readClubProfiles: jest.fn(),
  readLeagueCanonical: jest.fn(),
}))
jest.mock('../signals/readExpectedTeamSignals.js', () => ({ readExpectedTeamSignals: jest.fn() }))

const emptyActual = {
  leaguesCenter: { leaguesById: {} },
  clubsCenter: { leaguesById: {}, clubsById: {} },
  teamSeasons: [],
}

beforeEach(() => {
  jest.clearAllMocks()
  readClubProfiles.mockResolvedValue({})
  readExpectedTeamSignals.mockResolvedValue(new Map())
})

test('returns CLEAN when League canonical and all matching projections are absent', async () => {
  readLeagueCanonical.mockResolvedValue(null)
  readActualLeagueAudit.mockResolvedValue(emptyActual)

  await expect(auditLeague({
    leagueId: 'league-1',
    seasonId: '2026_2027',
  })).resolves.toMatchObject({
    result: 'clean',
    coverage: { complete: true },
    findings: [],
    summary: { leagueExists: false },
  })
})

test('returns stale findings when League canonical is absent but projections remain', async () => {
  readLeagueCanonical.mockResolvedValue(null)
  readActualLeagueAudit.mockResolvedValue({
    leaguesCenter: {
      leaguesById: { 'league-1': { identity: { leagueName: 'stale' } } },
    },
    clubsCenter: { leaguesById: {}, clubsById: {} },
    teamSeasons: [],
  })

  await expect(auditLeague({
    leagueId: 'league-1',
    seasonId: '2026_2027',
  })).resolves.toMatchObject({
    result: 'findings',
    findings: [expect.objectContaining({ type: 'stale_projection' })],
  })
})

test('missing ClubProfile is a canonical dependency finding and incomplete coverage', async () => {
  readLeagueCanonical.mockResolvedValue({
    leagueId: 'league-1',
    names: { display: 'League' },
    ageGroupId: 'u15',
    ageGroupLabel: 'U15',
    seasonsById: {
      '2026_2027': {
        seasonKey: '26/27',
        seasonStatus: 'active',
        birthYear: 2012,
        table: {
          tableState: 'LOADED',
          teamsById: {
            team_1: {
              clubId: 'missing-club',
              teamSlot: 1,
              teamUrl: 'team-url',
              officialTable: {},
            },
          },
        },
      },
    },
  })
  readClubProfiles.mockResolvedValue({})
  readActualLeagueAudit.mockResolvedValue(emptyActual)

  const result = await auditLeague({
    leagueId: 'league-1',
    seasonId: '2026_2027',
  })

  expect(result.result).toBe('partial')
  expect(result.coverage.complete).toBe(false)
  expect(result.findings).toEqual(expect.arrayContaining([
    expect.objectContaining({
      type: 'missing_canonical_dependency',
      target: 'clubProfile',
      documentId: 'missing-club',
    }),
  ]))
})

test('detects a stale canonical summary in a focused league audit even when all saved copies match', async () => {
  const seasonId = '2026_2027'
  const teamId = 'club_2012_1'
  const summary = buildTeamSignalSummary({ computedAt: 'saved time' })
  const team = { clubId: 'club', teamSlot: 1, teamSignalSummary: summary }
  readLeagueCanonical.mockResolvedValue({ leagueId: 'league', seasonsById: {
    [seasonId]: { seasonKey: '26/27', seasonStatus: 'active', birthYear: 2012, table: { teamsById: { [teamId]: team } } },
  } })
  readClubProfiles.mockResolvedValue({ club: { clubId: 'club' } })
  readActualLeagueAudit.mockResolvedValue({
    teamSeasons: [{ identity: { teamId }, teamSignalSummary: summary }],
    leaguesCenter: { leaguesById: { league: { seasonsById: { [seasonId]: { teamsById: { [teamId]: team } } } } } },
    clubsCenter: { clubsById: { club: { teamsById: { [teamId]: team } } } },
  })
  readExpectedTeamSignals.mockResolvedValue(new Map([[`${teamId}__${seasonId}`, buildTeamSignalSummary({ familiesById: {
    'club-gap': { level: 1, availability: 'partial' },
  } })]]))
  const audit = await auditLeague({ leagueId: 'league', seasonId })
  expect(readExpectedTeamSignals).toHaveBeenCalledWith({ clubIds: ['club'] })
  expect(audit.findings).toEqual(expect.arrayContaining([
    expect.objectContaining({ target: 'teamSignals', field: 'teamSignalSummary.canonical' }),
  ]))
})
