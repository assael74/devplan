jest.mock('firebase/firestore', () => ({
  doc: jest.fn((db, collection, id) => ({ collection, id })),
  getDoc: jest.fn(),
  serverTimestamp: jest.fn(() => 'SERVER_TS'),
  writeBatch: jest.fn(),
}))
jest.mock('../../../read/entities/league.js', () => ({ getLeagueById: jest.fn() }))
jest.mock('../../../read/entities/teamMovementCounterpartV2.js', () => ({ resolveRosterCounterpartCandidateV2: jest.fn() }))
jest.mock('../../../../../../services/firebase/firebase.js', () => ({ db: {} }))
jest.mock('../../../cache/index.js', () => ({ invalidateClubsMasterDocumentCache: jest.fn() }))
jest.mock('../../../../domain/movement/index.js', () => ({ reconcileRosterMovement: jest.fn() }))
jest.mock('../../../../domain/statsV2/teamSeasonStats.builder.js', () => ({ buildFinalStatsTeamSeasonState: jest.fn() }))
jest.mock('../../../../domain/statsV2/statsReloadDecision.builder.js', () => ({ buildStatsReloadDecisionState: jest.fn() }))
jest.mock('../../../../domain/statsV2/approvedStatsState.builder.js', () => ({
  APPROVED_STATS_STATE_VERSION: 1,
  buildApprovedStatsState: jest.fn(input => ({ ...input, planType: 'approvedStatsState', planVersion: 1 })),
}))
jest.mock('../../../../domain/projections/teamBalanceSearchIndex.projection.js', () => ({ buildTeamBalanceSearchIndexProjection: jest.fn(() => ({})) }))
jest.mock('../../../../domain/projections/leaguesMaster.projection.js', () => ({
  buildLeaguesMasterLeagueEntry: jest.fn(() => ({ leagueId: 'l1' })),
  buildLeaguesMasterSummary: jest.fn(() => ({})),
  sortLeaguesMasterEntries: jest.fn(rows => rows),
}))
jest.mock('../../../../domain/projections/club/index.js', () => ({
  buildClubAgeGroupSeasonProjection: jest.fn(() => ({ ageGroupId: 'u15' })),
  buildClubDocumentProjection: jest.fn(({ club }) => ({ ...club, ageGroups: [], competitionPaths: [] })),
  buildClubsMasterClubProjection: jest.fn(({ club }) => ({ name: club.name || '', ageGroups: [], competitionPaths: [] })),
}))
jest.mock('../../../../domain/projections/teamPerformance.projection.js', () => ({
  buildLeagueTeamPerformanceProjection: jest.fn(() => ({ tableRank: 3 })),
  resolveLeagueSeasonStatus: jest.fn(),
  resolveLeagueTeamPoints: jest.fn(() => 12),
}))

import { getDoc, writeBatch } from 'firebase/firestore'
import { getLeagueById } from '../../../read/entities/league.js'
import { resolveRosterCounterpartCandidateV2 } from '../../../read/entities/teamMovementCounterpartV2.js'
import { reconcileRosterMovement } from '../../../../domain/movement/index.js'
import { buildFinalStatsTeamSeasonState } from '../../../../domain/statsV2/teamSeasonStats.builder.js'
import { buildStatsReloadDecisionState } from '../../../../domain/statsV2/statsReloadDecision.builder.js'
import {
  buildLeagueTeamPerformanceProjection,
  resolveLeagueSeasonStatus,
  resolveLeagueTeamPoints,
} from '../../../../domain/projections/teamPerformance.projection.js'
import { prepareStatsImportPlanV2 } from './prepareStatsImportPlanV2.js'
import { syncStatsClubsV2 } from '../flows/syncStatsClubs.flow.js'

const snapshot = (id, data) => ({ exists: () => true, id, data: () => data })

describe('prepareStatsImportPlanV2 counterpart clubs', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    buildStatsReloadDecisionState.mockReturnValue({ isComplete: true, missingPlayers: [], resolved: [] })
    reconcileRosterMovement.mockReturnValue({
      counterpartRequests: [{ counterpartBirthTeamDocumentId: 'bt2', counterpartSeasonKey: '2025-26' }],
    })
    buildFinalStatsTeamSeasonState.mockReturnValue({
      seasonStatus: 'completed',
      playersCount: 1,
      scoutProfilesSummary: {},
      teamBalance: {},
      finalTeamSeasonPreview: { teamPlayers: [] },
    })
    resolveRosterCounterpartCandidateV2.mockResolvedValue({
      birthTeamDocumentId: 'bt2',
      seasonKey: '2025-26',
      teamRoot: { id: 'bt2', clubId: 'c2', leagueId: 'l2', name: 'Counterpart' },
      teamSeason: { id: 'bt2__2025-26', seasonKey: '2025-26', seasonId: 's-old', leagueId: 'l2' },
    })
    getLeagueById.mockResolvedValue({ id: 'l2', current: { seasonKey: '2026-27' }, history: [{ seasonKey: '2025-26' }] })
    resolveLeagueSeasonStatus.mockReturnValue('completed')
    getDoc
      .mockResolvedValueOnce(snapshot('bt2__2025-26', { transfersIn: [], transfersOut: [], pendingPlayers: [] }))
      .mockResolvedValueOnce(snapshot('all', { id: 'all', leagues: [] }))
      .mockResolvedValueOnce(snapshot('all', { id: 'all', clubs: [{ clubId: 'c1' }, { clubId: 'c2' }] }))
      .mockResolvedValueOnce(snapshot('c1', { id: 'c1', clubId: 'c1', name: 'Local' }))
      .mockResolvedValueOnce(snapshot('c2', { id: 'c2', clubId: 'c2', name: 'Counterpart Club' }))
  })

  test('uses history performance and points for a completed counterpart season', async () => {
    await prepareStatsImportPlanV2({
      league: { id: 'l1', history: [{ seasonKey: '2025-26', tableRank: [] }] },
      season: { seasonKey: '2025-26', seasonId: 's-old', seasonStatus: 'completed', leagueId: 'l1' },
      team: { birthTeamDocumentId: 'bt1', clubId: 'c1', ageGroupId: 'u15', name: 'Local Team' },
      teamRoot: { id: 'bt1' },
      teamSeason: { id: 'bt1__2025-26', seasonKey: '2025-26', teamPlayers: [] },
      incomingPlayers: [],
    })

    expect(buildLeagueTeamPerformanceProjection).toHaveBeenCalledWith(expect.objectContaining({
      target: 'history',
      season: expect.objectContaining({ seasonKey: '2025-26', seasonStatus: 'completed' }),
      team: expect.objectContaining({ birthTeamDocumentId: 'bt2' }),
    }))
    expect(resolveLeagueTeamPoints).toHaveBeenCalledWith(expect.objectContaining({ target: 'history' }))
  })
})


describe('prepareStatsImportPlanV2 -> syncStatsClubsV2 integration', () => {
  test('carries local and counterpart Club projections through Approved State into the clubs writer', async () => {
    jest.clearAllMocks()
    buildStatsReloadDecisionState.mockReturnValue({ isComplete: true, missingPlayers: [], resolved: [] })
    reconcileRosterMovement.mockReturnValue({
      counterpartRequests: [{ counterpartBirthTeamDocumentId: 'bt2', counterpartSeasonKey: '2025-26' }],
    })
    buildFinalStatsTeamSeasonState.mockReturnValue({
      seasonStatus: 'completed',
      playersCount: 1,
      scoutProfilesSummary: {},
      teamBalance: {},
      finalTeamSeasonPreview: { teamPlayers: [] },
    })
    resolveRosterCounterpartCandidateV2.mockResolvedValue({
      birthTeamDocumentId: 'bt2',
      seasonKey: '2025-26',
      teamRoot: { id: 'bt2', clubId: 'c2', leagueId: 'l2', name: 'Counterpart' },
      teamSeason: { id: 'bt2__2025-26', seasonKey: '2025-26', seasonId: 's-old', leagueId: 'l2' },
    })
    getLeagueById.mockResolvedValue({ id: 'l2', current: { seasonKey: '2026-27' }, history: [{ seasonKey: '2025-26' }] })
    resolveLeagueSeasonStatus.mockReturnValue('completed')

    const docs = {
      'teamSeasons/bt2__2025-26': { transfersIn: [], transfersOut: [], pendingPlayers: [] },
      'leaguesMaster/all': { id: 'all', leagues: [] },
      'clubsMaster/all': { id: 'all', clubs: [{ clubId: 'c1', name: 'Local' }, { clubId: 'c2', name: 'Counterpart Club' }] },
      'clubs/c1': { id: 'c1', clubId: 'c1', name: 'Local', ageGroups: [], competitionPaths: [] },
      'clubs/c2': { id: 'c2', clubId: 'c2', name: 'Counterpart Club', ageGroups: [], competitionPaths: [] },
    }
    getDoc.mockImplementation(async ref => {
      const value = docs[`${ref.collection}/${ref.id}`]
      return value
        ? { exists: () => true, id: ref.id, data: () => value }
        : { exists: () => false, id: ref.id, data: () => ({}) }
    })

    const approvedState = await prepareStatsImportPlanV2({
      league: { id: 'l1', history: [{ seasonKey: '2025-26', tableRank: [] }] },
      season: { seasonKey: '2025-26', seasonId: 's-old', seasonStatus: 'completed', leagueId: 'l1' },
      team: { birthTeamDocumentId: 'bt1', clubId: 'c1', ageGroupId: 'u15', name: 'Local Team' },
      teamRoot: { id: 'bt1' },
      teamSeason: { id: 'bt1__2025-26', seasonKey: '2025-26', teamPlayers: [] },
      incomingPlayers: [],
    })

    expect(approvedState.clubProjectionPatches.map(row => row.clubId).sort()).toEqual(['c1', 'c2'])
    expect(approvedState.clubsMasterPatch.entries.map(row => row.clubId).sort()).toEqual(['c1', 'c2'])

    const set = jest.fn()
    const commit = jest.fn().mockResolvedValue()
    writeBatch.mockReturnValue({ set, commit })
    const result = await syncStatsClubsV2({ approvedState })

    expect(result.updatedClubs).toBe(2)
    expect(set).toHaveBeenCalledTimes(3)
    expect(commit).toHaveBeenCalledTimes(1)
  })
})
