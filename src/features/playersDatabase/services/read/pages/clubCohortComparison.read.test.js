// src/features/playersDatabase/services/read/pages/clubCohortComparison.read.test.js

import { readClubCohortComparisonSources } from './clubCohortComparison.read.js'
import { readClubsCenterSeasonDocument } from './clubs.read.js'
import { getLeagueById } from '../entities/league.js'
import { getTeamSeasonByDocumentId } from '../entities/teamSeason.js'

jest.mock('./clubs.read.js', () => ({ readClubsCenterSeasonDocument: jest.fn() }))
jest.mock('../entities/league.js', () => ({ getLeagueById: jest.fn() }))
jest.mock('../entities/teamSeason.js', () => ({ getTeamSeasonByDocumentId: jest.fn() }))

beforeEach(() => {
  jest.resetAllMocks()
  readClubsCenterSeasonDocument.mockImplementation(async ({ seasonId }) => ({
    seasonId, documentExists: true, clubsById: { club: { teamsById: {
      club_2012_1: { teamSlot: 1, leagueId: 'league', teamSeasonDocumentId: 'stale-pointer' },
      club_2012_2: { teamSlot: 2, leagueId: 'league' },
    } } },
  }))
  getLeagueById.mockResolvedValue({ id: 'league' })
  getTeamSeasonByDocumentId.mockImplementation(async id => ({ id }))
})

test('reads prior known seasons once and resolves canonical seasonal documents instead of stale pointers', async () => {
  const result = await readClubCohortComparisonSources({
    clubId: 'club', seasonId: '2025_2026', seasonIds: ['2023_2024', '2024_2025', '2027_2028'],
  })
  expect(readClubsCenterSeasonDocument.mock.calls.map(([args]) => args.seasonId).sort())
    .toEqual(['2023_2024', '2024_2025', '2025_2026'])
  expect(getLeagueById).toHaveBeenCalledTimes(1)
  expect(getTeamSeasonByDocumentId.mock.calls.map(([id]) => id).sort()).toEqual([
    'club_2012_1__2023_2024', 'club_2012_1__2024_2025', 'club_2012_1__2025_2026',
  ])
  expect(result.current.seasonId).toBe('2025_2026')
  expect(result.history).toHaveLength(2)
})

test('keeps successful seasons and distinguishes a missing historical center from a failed read', async () => {
  const original = readClubsCenterSeasonDocument.getMockImplementation()
  readClubsCenterSeasonDocument.mockImplementation(args => {
    if (args.seasonId === '2024_2025') return Promise.resolve({ documentExists: false })
    if (args.seasonId === '2023_2024') return Promise.reject(new Error('offline'))
    return original(args)
  })
  const result = await readClubCohortComparisonSources({ clubId: 'club', seasonId: '2026_2027', seasonIds: ['2023_2024'] })
  expect(result.history.map(source => source.seasonId)).toEqual(['2025_2026'])
  expect(result.unavailableSeasonIds).toEqual(['2023_2024'])
})

test('reports partial document failures and does not replace missing profiles with another season', async () => {
  getTeamSeasonByDocumentId.mockImplementation(async id => {
    if (id.endsWith('2025_2026')) throw new Error('offline')
    return { id }
  })
  const result = await readClubCohortComparisonSources({ clubId: 'club', seasonId: '2026_2027' })
  expect(result.history.find(source => source.seasonId === '2025_2026').teamSeasonsById.club_2012_1).toBeNull()
  expect(result.current.teamSeasonsById.club_2012_1.id).toBe('club_2012_1__2026_2027')
  expect(result.unavailableSeasonIds).toEqual(['2025_2026'])
})
