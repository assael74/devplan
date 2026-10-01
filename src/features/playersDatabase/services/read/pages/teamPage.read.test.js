// src/features/playersDatabase/services/read/pages/teamPage.read.test.js

import { getLeagueById } from '../entities/league.js'
import { getTeamById } from '../entities/team.js'
import { getTeamSeason, listTeamSeasons } from '../entities/teamSeason.js'
import { readLeaguesMasterDocument } from '../masters/leaguesMaster.read.js'
import {
  buildClubSeasonIdentityScopesFromLeaguesMaster,
  readClubSeasonIdentityIndexes,
} from '../masters/clubSeasonIdentityIndex.read.js'
import { clearPlayersDatabaseDocumentCache } from '../../cache/index.js'
import { readTeamPageData } from './teamPage.read.js'

jest.mock('../entities/league.js', () => ({ getLeagueById: jest.fn() }))
jest.mock('../entities/team.js', () => ({ getTeamById: jest.fn() }))
jest.mock('../entities/teamSeason.js', () => ({
  getTeamSeason: jest.fn(),
  listTeamSeasons: jest.fn(),
}))
jest.mock('../masters/leaguesMaster.read.js', () => ({ readLeaguesMasterDocument: jest.fn() }))
jest.mock('../masters/clubSeasonIdentityIndex.read.js', () => ({
  buildClubSeasonIdentityScopesFromLeaguesMaster: jest.fn(() => []),
  readClubSeasonIdentityIndexes: jest.fn(),
}))
jest.mock('../../../model/team/teamIdentity.model.js', () => ({
  resolveTeamBirthYear: jest.fn(() => 2010),
}))
jest.mock('../../../model/team/page/teamPageSeasonSnapshots.model.js', () => ({
  buildTeamPageSeasonSnapshots: jest.fn(() => []),
}))
jest.mock('../../../model/team/page/teamPageData.model.js', () => ({
  buildTeamPageData: jest.fn(() => ({ seasons: [] })),
}))
jest.mock('../../../catalog/seasons.catalog.js', () => ({
  PLAYERS_DATABASE_SEASONS_CATALOG: [],
}))

beforeEach(() => {
  jest.clearAllMocks()
  clearPlayersDatabaseDocumentCache()
  getLeagueById.mockImplementation(async id => ({ id }))
  readLeaguesMasterDocument.mockResolvedValue({ documentExists: true })
  buildClubSeasonIdentityScopesFromLeaguesMaster.mockReturnValue([])
  readClubSeasonIdentityIndexes.mockResolvedValue([])
})

test('uses getTeamSeason only for a Root season missing from the query result', async () => {
  getTeamById.mockResolvedValue({
    id: 'team-root-1',
    seasons: [
      { seasonKey: '26/27' },
      { seasonKey: '25/26' },
    ],
  })
  listTeamSeasons.mockResolvedValue([
    { id: 'season-current', seasonKey: '26/27', leagueId: 'league-1' },
  ])
  getTeamSeason.mockResolvedValue({
    id: 'season-history',
    seasonKey: '25/26',
    leagueId: 'league-2',
  })

  const result = await readTeamPageData({ leagueId: 'league-1', teamId: 'team-root-1' })

  expect(listTeamSeasons).toHaveBeenCalledWith('team-root-1')
  expect(getTeamSeason).toHaveBeenCalledTimes(1)
  expect(getTeamSeason).toHaveBeenCalledWith({
    birthTeamDocumentId: 'team-root-1',
    seasonKey: '25/26',
  })
  expect(result.teamSeasons.map(item => item.seasonKey).sort()).toEqual(['25/26', '26/27'])
})


test('returns the cached Team Page scope on navigation back without rebuilding the graph', async () => {
  getTeamById.mockResolvedValue({
    id: 'team-root-1',
    seasons: [{ seasonKey: '26/27' }],
  })
  listTeamSeasons.mockResolvedValue([
    { id: 'season-current', seasonKey: '26/27', leagueId: 'league-1' },
  ])

  const first = await readTeamPageData({ leagueId: 'league-1', teamId: 'team-root-1' })
  const second = await readTeamPageData({ leagueId: 'league-1', teamId: 'team-root-1' })

  expect(second).toBe(first)
  expect(getTeamById).toHaveBeenCalledTimes(1)
  expect(listTeamSeasons).toHaveBeenCalledTimes(1)
  expect(readLeaguesMasterDocument).toHaveBeenCalledTimes(1)
})
