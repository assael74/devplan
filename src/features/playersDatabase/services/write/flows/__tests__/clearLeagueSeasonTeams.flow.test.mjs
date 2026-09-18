import assert from 'node:assert/strict'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import {
  attachWriteReport,
  loadFlowModule,
} from './flowModuleHarness.mjs'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const entryPath = path.resolve(testDir, '..', 'league', 'clearLeagueSeasonTeams.flow.js')

const team = {
  birthTeamId: 'hapoel-raanana_2012_1',
  birthTeamSlot: 1,
  hasPlayers: true,
  playersCount: 27,
  hasStats: true,
  statsComplete: true,
}

const loadClearLeagueSeasonTeamsFlow = async ({ getTeamSeason } = {}) => loadFlowModule({
  entryPath,
  mocks: {
    '../../leagues/index.js': {
      clearLeagueSeasonTeams: async () => ({ removedTeamsCount: 1 }),
      getLeagueSeasonTeams: async () => ({ teams: [team] }),
      syncLeaguesMasterDocument: async () => ({ completed: true }),
    },
    '../../players/index.js': {
      removePlayerSeasonDocsMany: async () => ({ deletedCount: 0 }),
    },
    '../../searchIndex/index.js': {
      deleteSearchIndexesForLeagueSeason: async () => ({ rowsCount: 0 }),
      getSearchIndexMetaForLeagueSeason: async () => ({ teams: [] }),
    },
    '../../teams/index.js': {
      removeTeamSeason: async () => ({
        removed: false,
        playerDocumentIds: [],
      }),
    },
    '../../clubs/index.js': {
      removeClubProjectionsForLeagueSeason: async () => ({
        completed: true,
        projectionsCompleted: true,
      }),
      removeLeagueClubSeasonIdentityIndex: async () => ({ completed: true }),
    },
    '../../../read/entities/teamSeason.js': {
      getTeamSeason: getTeamSeason || (async () => null),
    },
    '../writeFlowReport.js': { attachWriteFlowReport: attachWriteReport },
  },
})

const payload = {
  league: { id: 'u14-district-center' },
  season: { seasonKey: '25/26', seasonId: '25/26' },
}

test('league team deletion ignores stale league roster metadata when Team Season is absent', async () => {
  const calls = []
  const { clearLeagueSeasonTeamsFlow } = await loadClearLeagueSeasonTeamsFlow({
    getTeamSeason: async args => {
      calls.push(args)
      return null
    },
  })

  const result = await clearLeagueSeasonTeamsFlow(payload)

  assert.equal(result.completed, true)
  assert.equal(calls.length, 1)
  assert.equal(calls[0].birthTeamDocumentId, 'hapoel-raanana_2012_1')
  assert.equal(calls[0].seasonKey, '25/26')
  assert.equal(calls[0].bypassCache, true)
})

test('league team deletion remains blocked when canonical Team Season has players', async () => {
  const { clearLeagueSeasonTeamsFlow } = await loadClearLeagueSeasonTeamsFlow({
    getTeamSeason: async () => ({ teamPlayers: [{ playerId: 'player-1' }] }),
  })

  await assert.rejects(
    () => clearLeagueSeasonTeamsFlow(payload),
    error => {
      assert.equal(error.code, 'league-season-has-players')
      assert.equal(error.stage, 'validateLeagueSeasonTeamsDelete')
      return true
    }
  )
})
