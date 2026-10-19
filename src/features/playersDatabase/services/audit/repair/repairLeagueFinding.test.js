// src/features/playersDatabase/services/audit/repair/repairLeagueFinding.test.js

import { repairLeagueFinding } from './repairLeagueFinding.js'
import { buildExpectedLeagueAudit } from '../league/buildExpected.js'
import { compareLeagueAudit } from '../league/compare.js'
import { readClubProfiles } from '../league/readActual.js'
import { readLeagueMutationSources } from '../../write/league/readLeagueWriteSources.js'
import { writeClubsCenter } from '../../write/league/writeClubsCenter.js'
import { writeLeaguesCenter } from '../../write/league/writeLeaguesCenter.js'
import { writeTeamSeasonCompetitionSnapshots } from '../../write/league/writeTeamSeasonCompetitionSnapshots.js'
import { refreshTeamSignalSummaries } from '../../write/signals/refreshTeamSignalSummaries.js'

jest.mock('../league/readActual.js', () => ({ readClubProfiles: jest.fn() }))
jest.mock('../../write/league/readLeagueWriteSources.js', () => ({
  readLeagueMutationSources: jest.fn(),
}))
jest.mock('../../write/league/writeClubsCenter.js', () => ({ writeClubsCenter: jest.fn() }))
jest.mock('../../write/league/writeLeaguesCenter.js', () => ({ writeLeaguesCenter: jest.fn() }))
jest.mock('../../write/league/writeTeamSeasonCompetitionSnapshots.js', () => ({
  writeTeamSeasonCompetitionSnapshots: jest.fn(),
}))
jest.mock('../../write/signals/refreshTeamSignalSummaries.js', () => ({
  refreshTeamSignalSummaries: jest.fn(),
}))

const leagueId = 'league-1'
const seasonId = '2025_2026'
const updatedAt = '2026-10-01T12:00:00.000Z'
const scope = { type: 'league', leagueId, seasonId }
const teamId = 'club-a_2010_1'
const otherTeamId = 'club-b_2010_1'
const documentId = `${teamId}__${seasonId}`
const profiles = {
  'club-a': { clubId: 'club-a', names: { display: 'א', short: 'א' }, clubLevel: 2, clubStrengthLevel: 3 },
  'club-b': { clubId: 'club-b', names: { display: 'ב', short: 'ב' }, clubLevel: 2, clubStrengthLevel: 2 },
}

const teamSeason = (id, clubId) => ({
  id: `${id}__${seasonId}`,
  identity: { teamId: id, clubId, leagueId, seasonId },
  roster: { playersById: {}, pendingById: {} },
  movement: { transfersInById: {}, transfersOutById: {}, updatedAt },
  teamTaskSignals: { offense: true, defense: false, updatedAt },
})

const sourcesFixture = () => ({
  leagueId,
  seasonId,
  existingLeague: {
    leagueId,
    names: { display: 'ליגה' },
    ageGroupId: 'u16',
    ageGroupLabel: 'נערים',
    level: 2,
    timestamps: { updatedAt },
    seasonsById: {
      [seasonId]: {
        seasonKey: '25/26',
        seasonStatus: 'active',
        birthYear: 2010,
        updatedAt,
        table: {
          tableState: 'LOADED',
          teamsById: {
            [teamId]: {
              clubId: 'club-a',
              teamSlot: 1,
              teamUrl: 'https://example.test/a',
              officialTable: { rank: 1, points: 12, goalsFor: 10, goalsAgainst: 2, teamGamePlayed: 4 },
            },
            [otherTeamId]: {
              clubId: 'club-b',
              teamSlot: 1,
              officialTable: { rank: 2, points: 6, goalsFor: 7, goalsAgainst: 8, teamGamePlayed: 4 },
            },
          },
        },
      },
    },
  },
  existingTeamSeasons: [teamSeason(teamId, 'club-a'), teamSeason(otherTeamId, 'club-b')],
  previousClubsCenterTeamLocations: [],
  otherLeagueIdsByTeamId: {},
})

const findingFor = target => ({
  target,
  type: 'projection_mismatch',
  documentId: target === 'teamSeasonCompetitionSnapshots' ? documentId : seasonId,
  field: '',
})

beforeEach(() => {
  jest.clearAllMocks()
  readLeagueMutationSources.mockResolvedValue(sourcesFixture())
  readClubProfiles.mockResolvedValue(profiles)
})

test('rebuilds LeaguesCenter before refreshing canonical club signals and retains the canonical timestamp', async () => {
  await repairLeagueFinding({ scope, finding: findingFor('leaguesCenter') })

  const { approvedState } = writeLeaguesCenter.mock.calls[0][0]
  const projection = approvedState.leaguesCenterProjection
  const sources = sourcesFixture()
  const expected = buildExpectedLeagueAudit({
    league: sources.existingLeague,
    seasonId,
    clubProfilesById: profiles,
    teamSeasons: sources.existingTeamSeasons,
  })
  const findings = compareLeagueAudit({
    expected,
    actual: {
      leaguesCenter: {
        leaguesById: { [leagueId]: { identity: projection.identity, seasonsById: { [seasonId]: projection.season } } },
      },
      teamSeasons: [],
    },
  })

  expect(findings.filter(item => item.target === 'leaguesCenter')).toEqual([])
  expect(projection.season.updatedAt).toBe(updatedAt)
  expect(refreshTeamSignalSummaries).toHaveBeenCalledTimes(1)
  expect(refreshTeamSignalSummaries).toHaveBeenCalledWith({ clubIds: ['club-a', 'club-b'] })
  expect(writeLeaguesCenter.mock.invocationCallOrder[0])
    .toBeLessThan(refreshTeamSignalSummaries.mock.invocationCallOrder[0])
  expect(readClubProfiles).not.toHaveBeenCalled()
  expect(writeClubsCenter).not.toHaveBeenCalled()
  expect(writeTeamSeasonCompetitionSnapshots).not.toHaveBeenCalled()
})

test('deduplicates current canonical clubs without including obsolete projection clubs or changing sources', async () => {
  const sources = sourcesFixture()
  sources.existingLeague.seasonsById[seasonId].table.teamsById[otherTeamId].clubId = 'club-a'
  sources.previousLeaguesCenterTeamsById = { 'old-team': { clubId: 'club-old' } }
  const originalSources = JSON.stringify(sources)
  readLeagueMutationSources.mockResolvedValue(sources)
  const result = { written: true }
  writeLeaguesCenter.mockResolvedValueOnce(result)

  await expect(repairLeagueFinding({ scope, finding: findingFor('leaguesCenter') }))
    .resolves.toBe(result)
  expect(refreshTeamSignalSummaries).toHaveBeenCalledWith({ clubIds: ['club-a'] })
  expect(JSON.stringify(sources)).toBe(originalSources)
})

test('does not refresh signals after a failed Center write', async () => {
  writeLeaguesCenter.mockRejectedValueOnce(new Error('center failed'))
  await expect(repairLeagueFinding({ scope, finding: findingFor('leaguesCenter') }))
    .rejects.toThrow('center failed')
  expect(refreshTeamSignalSummaries).not.toHaveBeenCalled()
})

test('awaits signal refresh and propagates its failure instead of reporting a completed repair', async () => {
  refreshTeamSignalSummaries.mockRejectedValueOnce(new Error('signals failed'))
  await expect(repairLeagueFinding({ scope, finding: findingFor('leaguesCenter') }))
    .rejects.toThrow('signals failed')
  expect(writeLeaguesCenter).toHaveBeenCalledTimes(1)
})

test('does not refresh signals when the canonical season has no teams', async () => {
  const sources = sourcesFixture()
  sources.existingLeague.seasonsById[seasonId].table.teamsById = {}
  readLeagueMutationSources.mockResolvedValue(sources)
  await repairLeagueFinding({ scope, finding: findingFor('leaguesCenter') })
  expect(writeLeaguesCenter).toHaveBeenCalledTimes(1)
  expect(refreshTeamSignalSummaries).not.toHaveBeenCalled()
})

test('rebuilds missing ClubsCenter with canonical profiles and removes obsolete team locations', async () => {
  const sources = sourcesFixture()
  sources.previousClubsCenterTeamLocations = [{
    clubId: 'club-old',
    teamId: 'club-old_2010_1',
    team: { leagueId },
  }]
  readLeagueMutationSources.mockResolvedValue(sources)
  await repairLeagueFinding({ scope, finding: findingFor('clubsCenter') })

  const { clubsCenterProjection } = writeClubsCenter.mock.calls[0][0].approvedState
  expect(clubsCenterProjection.clubWrites).toEqual(expect.arrayContaining([
    expect.objectContaining({ clubId: 'club-old', deleteTeamIds: ['club-old_2010_1'] }),
    expect.objectContaining({
      clubId: 'club-a',
      clubProfile: expect.objectContaining({ displayName: 'א', clubLevel: 2 }),
      upsertTeamsById: expect.objectContaining({
        [teamId]: expect.objectContaining({ updatedAt, transfers: expect.objectContaining({ updatedAt }) }),
      }),
    }),
  ]))
  expect(writeLeaguesCenter).not.toHaveBeenCalled()
  expect(writeTeamSeasonCompetitionSnapshots).not.toHaveBeenCalled()
})

test('repairs only the selected existing competition snapshot using canonical values and time', async () => {
  await repairLeagueFinding({ scope, finding: findingFor('teamSeasonCompetitionSnapshots') })

  expect(writeTeamSeasonCompetitionSnapshots).toHaveBeenCalledWith({
    approvedState: {
      seasonId,
      teamSeasonCompetitionSnapshots: [{
        teamId,
        teamSeasonDocumentId: documentId,
        competitionSnapshot: {
          teamUrl: 'https://example.test/a',
          clubLevel: 2,
          clubStrengthLevel: 3,
          officialTable: { rank: 1, points: 12, goalsFor: 10, goalsAgainst: 2, teamGamePlayed: 4 },
          updatedAt,
        },
      }],
    },
  })
  expect(writeClubsCenter).not.toHaveBeenCalled()
  expect(writeLeaguesCenter).not.toHaveBeenCalled()
})

test('clears a removed team snapshot without changing canonical league or other team snapshots', async () => {
  const sources = sourcesFixture()
  delete sources.existingLeague.seasonsById[seasonId].table.teamsById[teamId]
  const originalLeague = JSON.stringify(sources.existingLeague)
  readLeagueMutationSources.mockResolvedValue(sources)
  await repairLeagueFinding({ scope, finding: findingFor('teamSeasonCompetitionSnapshots') })

  const targets = writeTeamSeasonCompetitionSnapshots.mock.calls[0][0].approvedState.teamSeasonCompetitionSnapshots
  expect(targets).toHaveLength(1)
  expect(targets[0]).toMatchObject({
    teamSeasonDocumentId: documentId,
    competitionSnapshot: { teamUrl: '', clubLevel: null, officialTable: { rank: null }, updatedAt },
  })
  expect(JSON.stringify(sources.existingLeague)).toBe(originalLeague)
  expect(writeClubsCenter).not.toHaveBeenCalled()
  expect(writeLeaguesCenter).not.toHaveBeenCalled()
})

test('removes only the stale season projection when the canonical league still exists', async () => {
  const sources = sourcesFixture()
  delete sources.existingLeague.seasonsById[seasonId]
  readLeagueMutationSources.mockResolvedValue(sources)
  await repairLeagueFinding({ scope, finding: findingFor('leaguesCenter') })

  expect(writeLeaguesCenter.mock.calls[0][0].approvedState.leaguesCenterProjection)
    .toMatchObject({ operation: 'DELETE_SEASON', leagueId, seasonId, identity: { leagueName: 'ליגה' } })
  expect(refreshTeamSignalSummaries).not.toHaveBeenCalled()
  expect(writeClubsCenter).not.toHaveBeenCalled()
  expect(writeTeamSeasonCompetitionSnapshots).not.toHaveBeenCalled()
})

test('removes a stale league projection when the canonical league is missing', async () => {
  const sources = sourcesFixture()
  sources.existingLeague = null
  readLeagueMutationSources.mockResolvedValue(sources)
  await repairLeagueFinding({ scope, finding: findingFor('leaguesCenter') })

  expect(writeLeaguesCenter.mock.calls[0][0].approvedState.leaguesCenterProjection)
    .toMatchObject({ operation: 'DELETE_LEAGUE', identity: null })
  expect(refreshTeamSignalSummaries).not.toHaveBeenCalled()
})

test('blocks missing canonical profiles without creating documents', async () => {
  readClubProfiles.mockResolvedValue({})
  await expect(repairLeagueFinding({ scope, finding: findingFor('clubsCenter') }))
    .rejects.toThrow('חסר פרופיל מועדון קנוני')
  expect(writeClubsCenter).not.toHaveBeenCalled()
  expect(writeLeaguesCenter).not.toHaveBeenCalled()
  expect(writeTeamSeasonCompetitionSnapshots).not.toHaveBeenCalled()
})

test('blocks ambiguous canonical league ownership before a projection write', async () => {
  const sources = sourcesFixture()
  sources.otherLeagueIdsByTeamId = { [teamId]: ['league-2'] }
  readLeagueMutationSources.mockResolvedValue(sources)
  await expect(repairLeagueFinding({ scope, finding: findingFor('clubsCenter') }))
    .rejects.toThrow('בעלות קנונית בליגה נוספת')
  expect(writeClubsCenter).not.toHaveBeenCalled()
})

test('does not create a missing canonical Team Season for a snapshot finding', async () => {
  const sources = sourcesFixture()
  sources.existingTeamSeasons = []
  readLeagueMutationSources.mockResolvedValue(sources)
  await expect(repairLeagueFinding({ scope, finding: findingFor('teamSeasonCompetitionSnapshots') }))
    .rejects.toThrow('עונת הקבוצה הקנונית חסרה')
  expect(writeTeamSeasonCompetitionSnapshots).not.toHaveBeenCalled()
})
