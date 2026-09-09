import assert from 'node:assert/strict'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import {
  attachWriteReport,
  buildSyncError,
  loadFlowModule,
} from './flowModuleHarness.mjs'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const flowPath = relativePath => path.resolve(testDir, '..', relativePath)

const assertCommittedProjectionFailure = (error, stage) => {
  assert.equal(error.stage, stage)
  assert.equal(error.results.teamCanonicalCommitted, true)
  assert.equal(error.results.projectionsCompleted, false)
  assert.equal(error.results.completed, false)
  assert.equal(error.results.recoveryRequired, true)
  assert.equal(error.results.syncStatus, 'projection_failed')
  assert.equal(error.results.stoppedAt, stage)
}

test('remove scout profile reports complete only after required projections finish', async () => {
  const { removePlayerScoutProfileFlow } = await loadFlowModule({
    entryPath: flowPath('player/removePlayerScoutProfile.flow.js'),
    mocks: {
      '../../leagues/index.js': {
        updateLeagueSeasonTableRankScoutProfilesSummary: async () => ({ updated: true }),
      },
      '../../searchIndex/index.js': {
        updateTeamSeasonSearchIndexScoutProfilesSummary: async () => ({ updated: true }),
      },
      './removePlayerScoutProfile.coordinated.js': {
        removePlayerScoutProfileCoordinated: async () => ({
          playerSeasonResult: {
            updated: true,
            player: { scoutProfiles: [], scoutCombinations: [] },
          },
          playerSeasonIndexResult: { updated: true },
          teamSeasonResult: {
            updated: true,
            player: {},
            teamSeasonDocumentId: 'team-season-1',
            scoutProfilesSummary: { total: 0, profileCounts: {} },
          },
        }),
      },
      '../writeFlowSyncError.js': { buildWriteFlowSyncError: buildSyncError },
    },
  })

  const result = await removePlayerScoutProfileFlow({ profileId: 'profile-1' })
  assert.equal(result.completed, true)
  assert.equal(result.teamCanonicalCommitted, true)
  assert.equal(result.projectionsCompleted, true)
})

test('remove scout profile exposes recovery metadata when league projection fails', async () => {
  const { removePlayerScoutProfileFlow } = await loadFlowModule({
    entryPath: flowPath('player/removePlayerScoutProfile.flow.js'),
    mocks: {
      '../../leagues/index.js': {
        updateLeagueSeasonTableRankScoutProfilesSummary: async () => {
          throw new Error('league projection failed')
        },
      },
      '../../searchIndex/index.js': {
        updateTeamSeasonSearchIndexScoutProfilesSummary: async () => ({ updated: true }),
      },
      './removePlayerScoutProfile.coordinated.js': {
        removePlayerScoutProfileCoordinated: async () => ({
          playerSeasonResult: {
            updated: true,
            player: { scoutProfiles: [], scoutCombinations: [] },
          },
          playerSeasonIndexResult: { updated: true },
          teamSeasonResult: {
            updated: true,
            player: {},
            teamSeasonDocumentId: 'team-season-1',
            scoutProfilesSummary: { total: 0, profileCounts: {} },
          },
        }),
      },
      '../writeFlowSyncError.js': { buildWriteFlowSyncError: buildSyncError },
    },
  })

  await assert.rejects(
    () => removePlayerScoutProfileFlow({ profileId: 'profile-1' }),
    error => {
      assertCommittedProjectionFailure(error, 'leagueScoutSummary')
      return true
    }
  )
})

test('clear roster success requires all projection stages', async () => {
  const { clearTeamSeasonPlayersFlow } = await loadFlowModule({
    entryPath: flowPath('team/clearTeamSeasonPlayers.flow.js'),
    mocks: {
      '../../leagues/index.js': {
        updateLeagueSeasonTableRankTeamSyncMeta: async () => ({ updated: true }),
      },
      '../../players/index.js': {
        removePlayerSeasonDocsMany: async () => ({ deletedCount: 2 }),
      },
      '../../searchIndex/index.js': {
        deleteSearchIndexesForTeamSeason: async () => ({ rowsCount: 2 }),
      },
      '../../teams/index.js': {
        removeTeamSeason: async () => ({
          removedPlayersCount: 2,
          playerDocumentIds: ['p1', 'p2'],
        }),
      },
      '../writeFlowReport.js': { attachWriteFlowReport: attachWriteReport },
      '../writeFlowSyncError.js': { buildWriteFlowSyncError: buildSyncError },
      '../../../../model/teamLoadStatus.model.js': {
        buildTeamLoadStatus: () => ({ rosterLoaded: false, statsLoaded: false }),
      },
    },
  })

  const result = await clearTeamSeasonPlayersFlow({ team: {} })
  assert.equal(result.completed, true)
  assert.equal(result.teamCanonicalCommitted, true)
  assert.equal(result.projectionsCompleted, true)
  assert.equal(result.recoveryRequired, false)
})

test('clear roster exposes recovery metadata after canonical deletion', async () => {
  const { clearTeamSeasonPlayersFlow } = await loadFlowModule({
    entryPath: flowPath('team/clearTeamSeasonPlayers.flow.js'),
    mocks: {
      '../../leagues/index.js': {
        updateLeagueSeasonTableRankTeamSyncMeta: async () => ({ updated: true }),
      },
      '../../players/index.js': {
        removePlayerSeasonDocsMany: async () => ({ deletedCount: 2 }),
      },
      '../../searchIndex/index.js': {
        deleteSearchIndexesForTeamSeason: async () => {
          throw new Error('index delete failed')
        },
      },
      '../../teams/index.js': {
        removeTeamSeason: async () => ({
          removedPlayersCount: 2,
          playerDocumentIds: ['p1', 'p2'],
        }),
      },
      '../writeFlowReport.js': { attachWriteFlowReport: attachWriteReport },
      '../writeFlowSyncError.js': { buildWriteFlowSyncError: buildSyncError },
      '../../../../model/teamLoadStatus.model.js': {
        buildTeamLoadStatus: () => ({ rosterLoaded: false, statsLoaded: false }),
      },
    },
  })

  await assert.rejects(
    () => clearTeamSeasonPlayersFlow({ team: {} }),
    error => {
      assertCommittedProjectionFailure(error, 'deleteSearchIndexesForTeamSeason')
      return true
    }
  )
})

test('clear roster does not report completion when league metadata returns an unsuccessful result', async () => {
  const { clearTeamSeasonPlayersFlow } = await loadFlowModule({
    entryPath: flowPath('team/clearTeamSeasonPlayers.flow.js'),
    mocks: {
      '../../leagues/index.js': {
        updateLeagueSeasonTableRankTeamSyncMeta: async () => ({
          updated: false,
          reason: 'leagueTeamRowMissing',
        }),
      },
      '../../players/index.js': {
        removePlayerSeasonDocsMany: async () => ({ deletedCount: 0 }),
      },
      '../../searchIndex/index.js': {
        deleteSearchIndexesForTeamSeason: async () => ({ rowsCount: 1 }),
      },
      '../../teams/index.js': {
        removeTeamSeason: async () => ({ removedPlayersCount: 0 }),
      },
      '../writeFlowReport.js': { attachWriteFlowReport: attachWriteReport },
      '../writeFlowSyncError.js': { buildWriteFlowSyncError: buildSyncError },
      '../../../../model/teamLoadStatus.model.js': {
        buildTeamLoadStatus: () => ({ rosterLoaded: false, statsLoaded: false }),
      },
    },
  })

  await assert.rejects(
    () => clearTeamSeasonPlayersFlow({ team: {} }),
    error => {
      assertCommittedProjectionFailure(error, 'updateLeagueSeasonTableRankTeamSyncMeta')
      return true
    }
  )
})

test('clear stats reports complete only after all projections finish', async () => {
  const { clearTeamSeasonStatsFlow } = await loadFlowModule({
    entryPath: flowPath('team/clearTeamSeasonStats.flow.js'),
    mocks: {
      '../../leagues/index.js': {
        updateLeagueSeasonTableRankTeamSyncMeta: async () => ({ updated: true }),
      },
      '../../players/index.js': {
        clearExistingPlayerSeasonProfilesMany: async () => ({ deletedPlayerDocumentIds: [] }),
      },
      '../../searchIndex/index.js': {
        updateTeamSeasonSearchIndexRosterMeta: async () => ({ updated: true }),
        upsertPlayerSeasonSearchIndexMany: async () => ({ updated: true }),
      },
      '../../teams/index.js': {
        clearTeamSeasonPlayerDocumentIds: async () => ({ players: [] }),
        clearTeamSeasonStats: async () => ({
          updated: true,
          players: [],
          teamBalance: {},
          target: {},
          seasonId: '26',
          seasonKey: '2025-26',
          teamSeasonDocumentId: 'team-season-1',
          birthTeamDocumentId: 'birth-team-1',
          teamDocumentId: 'team-1',
        }),
      },
      '../writeFlowReport.js': { attachWriteFlowReport: attachWriteReport },
      '../writeFlowSyncError.js': { buildWriteFlowSyncError: buildSyncError },
      '../../../../model/teamLoadStatus.model.js': {
        buildTeamLoadStatus: () => ({ rosterLoaded: true, statsLoaded: false }),
      },
      '../../../../domain/projections/teamPerformance.projection.js': {
        resolveLeagueSeasonStatus: () => 'active',
      },
    },
  })

  const result = await clearTeamSeasonStatsFlow({ league: {}, season: {}, team: {} })
  assert.equal(result.completed, true)
  assert.equal(result.teamCanonicalCommitted, true)
  assert.equal(result.projectionsCompleted, true)
  assert.equal(result.recoveryRequired, false)
})

test('clear stats exposes recovery metadata when a later projection fails', async () => {
  const { clearTeamSeasonStatsFlow } = await loadFlowModule({
    entryPath: flowPath('team/clearTeamSeasonStats.flow.js'),
    mocks: {
      '../../leagues/index.js': {
        updateLeagueSeasonTableRankTeamSyncMeta: async () => ({ updated: true }),
      },
      '../../players/index.js': {
        clearExistingPlayerSeasonProfilesMany: async () => ({ deletedPlayerDocumentIds: [] }),
      },
      '../../searchIndex/index.js': {
        updateTeamSeasonSearchIndexRosterMeta: async () => {
          throw new Error('team index failed')
        },
        upsertPlayerSeasonSearchIndexMany: async () => ({ updated: true }),
      },
      '../../teams/index.js': {
        clearTeamSeasonPlayerDocumentIds: async () => ({ players: [] }),
        clearTeamSeasonStats: async () => ({
          updated: true,
          players: [],
          teamBalance: {},
          target: {},
          seasonId: '26',
          seasonKey: '2025-26',
          teamSeasonDocumentId: 'team-season-1',
          birthTeamDocumentId: 'birth-team-1',
          teamDocumentId: 'team-1',
        }),
      },
      '../writeFlowReport.js': { attachWriteFlowReport: attachWriteReport },
      '../writeFlowSyncError.js': { buildWriteFlowSyncError: buildSyncError },
      '../../../../model/teamLoadStatus.model.js': {
        buildTeamLoadStatus: () => ({ rosterLoaded: true, statsLoaded: false }),
      },
      '../../../../domain/projections/teamPerformance.projection.js': {
        resolveLeagueSeasonStatus: () => 'active',
      },
    },
  })

  await assert.rejects(
    () => clearTeamSeasonStatsFlow({ league: {}, season: {}, team: {} }),
    error => {
      assertCommittedProjectionFailure(error, 'updateTeamSeasonSearchIndexRosterMeta')
      return true
    }
  )
})

test('clear stats does not report completion when player SearchIndex sync reports failed rows', async () => {
  const { clearTeamSeasonStatsFlow } = await loadFlowModule({
    entryPath: flowPath('team/clearTeamSeasonStats.flow.js'),
    mocks: {
      '../../leagues/index.js': {
        updateLeagueSeasonTableRankTeamSyncMeta: async () => ({ updated: true }),
      },
      '../../players/index.js': {
        clearExistingPlayerSeasonProfilesMany: async () => ({ deletedPlayerDocumentIds: [] }),
      },
      '../../searchIndex/index.js': {
        updateTeamSeasonSearchIndexRosterMeta: async () => ({ updated: true }),
        upsertPlayerSeasonSearchIndexMany: async () => ({ failedCount: 1 }),
      },
      '../../teams/index.js': {
        clearTeamSeasonPlayerDocumentIds: async () => ({ players: [] }),
        clearTeamSeasonStats: async () => ({
          updated: true,
          players: [],
          teamBalance: {},
          target: {},
          seasonId: '26',
          seasonKey: '2025-26',
          teamSeasonDocumentId: 'team-season-1',
          birthTeamDocumentId: 'birth-team-1',
          teamDocumentId: 'team-1',
        }),
      },
      '../writeFlowReport.js': { attachWriteFlowReport: attachWriteReport },
      '../writeFlowSyncError.js': { buildWriteFlowSyncError: buildSyncError },
      '../../../../model/teamLoadStatus.model.js': {
        buildTeamLoadStatus: () => ({ rosterLoaded: true, statsLoaded: false }),
      },
      '../../../../domain/projections/teamPerformance.projection.js': {
        resolveLeagueSeasonStatus: () => 'active',
      },
    },
  })

  await assert.rejects(
    () => clearTeamSeasonStatsFlow({ league: {}, season: {}, team: {} }),
    error => {
      assertCommittedProjectionFailure(error, 'upsertPlayerSeasonSearchIndexMany')
      return true
    }
  )
})

test('remove scout profile canonical failure is not reported as committed', async () => {
  const { removePlayerScoutProfileFlow } = await loadFlowModule({
    entryPath: flowPath('player/removePlayerScoutProfile.flow.js'),
    mocks: {
      '../../leagues/index.js': {
        updateLeagueSeasonTableRankScoutProfilesSummary: async () => ({ updated: true }),
      },
      '../../searchIndex/index.js': {
        updateTeamSeasonSearchIndexScoutProfilesSummary: async () => ({ updated: true }),
      },
      './removePlayerScoutProfile.coordinated.js': {
        removePlayerScoutProfileCoordinated: async () => {
          throw new Error('canonical player update failed')
        },
      },
      '../writeFlowSyncError.js': { buildWriteFlowSyncError: buildSyncError },
    },
  })

  const result = await removePlayerScoutProfileFlow({ profileId: 'profile-1' })
  assert.equal(result.completed, false)
  assert.equal(result.teamCanonicalCommitted, false)
  assert.equal(result.projectionsCompleted, false)
  assert.equal(result.recoveryRequired, undefined)
  assert.equal(result.stoppedAt, 'playerDocument')
})

test('clear roster canonical failure keeps recovery contract off', async () => {
  const { clearTeamSeasonPlayersFlow } = await loadFlowModule({
    entryPath: flowPath('team/clearTeamSeasonPlayers.flow.js'),
    mocks: {
      '../../leagues/index.js': {
        updateLeagueSeasonTableRankTeamSyncMeta: async () => ({ updated: true }),
      },
      '../../players/index.js': {
        removePlayerSeasonDocsMany: async () => ({ deletedCount: 0 }),
      },
      '../../searchIndex/index.js': {
        deleteSearchIndexesForTeamSeason: async () => ({ rowsCount: 0 }),
      },
      '../../teams/index.js': {
        removeTeamSeason: async () => {
          throw new Error('canonical team delete failed')
        },
      },
      '../writeFlowReport.js': { attachWriteFlowReport: attachWriteReport },
      '../writeFlowSyncError.js': { buildWriteFlowSyncError: buildSyncError },
      '../../../../model/teamLoadStatus.model.js': {
        buildTeamLoadStatus: () => ({ rosterLoaded: false, statsLoaded: false }),
      },
    },
  })

  await assert.rejects(
    () => clearTeamSeasonPlayersFlow({ team: {} }),
    error => {
      assert.equal(error.stage, 'removeTeamSeason')
      assert.equal(error.results.teamCanonicalCommitted, undefined)
      assert.equal(error.results.recoveryRequired, undefined)
      return true
    }
  )
})

test('clear stats canonical failure keeps recovery contract off', async () => {
  const { clearTeamSeasonStatsFlow } = await loadFlowModule({
    entryPath: flowPath('team/clearTeamSeasonStats.flow.js'),
    mocks: {
      '../../leagues/index.js': {
        updateLeagueSeasonTableRankTeamSyncMeta: async () => ({ updated: true }),
      },
      '../../players/index.js': {
        clearExistingPlayerSeasonProfilesMany: async () => ({ deletedPlayerDocumentIds: [] }),
      },
      '../../searchIndex/index.js': {
        updateTeamSeasonSearchIndexRosterMeta: async () => ({ updated: true }),
        upsertPlayerSeasonSearchIndexMany: async () => ({ updated: true }),
      },
      '../../teams/index.js': {
        clearTeamSeasonPlayerDocumentIds: async () => ({ players: [] }),
        clearTeamSeasonStats: async () => {
          throw new Error('canonical stats clear failed')
        },
      },
      '../writeFlowReport.js': { attachWriteFlowReport: attachWriteReport },
      '../writeFlowSyncError.js': { buildWriteFlowSyncError: buildSyncError },
      '../../../../model/teamLoadStatus.model.js': {
        buildTeamLoadStatus: () => ({ rosterLoaded: true, statsLoaded: false }),
      },
      '../../../../domain/projections/teamPerformance.projection.js': {
        resolveLeagueSeasonStatus: () => 'active',
      },
    },
  })

  await assert.rejects(
    () => clearTeamSeasonStatsFlow({ league: {}, season: {}, team: {} }),
    error => {
      assert.equal(error.stage, 'clearTeamSeasonStats')
      assert.equal(error.results.teamCanonicalCommitted, undefined)
      assert.equal(error.results.recoveryRequired, undefined)
      return true
    }
  )
})
