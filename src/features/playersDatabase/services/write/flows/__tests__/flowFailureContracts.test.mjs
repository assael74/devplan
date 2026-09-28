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

const clubProjectionMock = {
  ensureRequiredClubProjectionCompleted: result => result,
  syncClubProjectionFromTeamSeason: async () => ({ completed: true }),
}

test('remove scout profile reports complete only after required projections finish', async () => {
  const { removePlayerScoutProfileFlow } = await loadFlowModule({
    entryPath: flowPath('player/removePlayerScoutProfile.flow.js'),
    mocks: {
      '../../clubs/index.js': clubProjectionMock,
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
      '../../clubs/index.js': clubProjectionMock,
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

test('remove scout profile canonical failure is not reported as committed', async () => {
  const { removePlayerScoutProfileFlow } = await loadFlowModule({
    entryPath: flowPath('player/removePlayerScoutProfile.flow.js'),
    mocks: {
      '../../clubs/index.js': clubProjectionMock,
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

